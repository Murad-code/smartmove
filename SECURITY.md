# Security

Operational guidance for whoever runs this site. Not a compliance document.

## Reporting a problem

If you find a security issue, email the address in Business Details rather than
opening a public issue.

## What protects what

### Secrets

Everything sensitive comes from environment variables and is read through
`src/lib/env.ts`. Nothing is committed: `.env` is in `.gitignore` and
`.dockerignore`, and only `.env.example` is in the repository.

`PAYLOAD_SECRET` signs admin sessions. Generate it with `openssl rand -hex 32`.
Changing it signs everybody out, which is the fastest way to revoke every
session if an account is compromised.

Variables named `NEXT_PUBLIC_*` are compiled into the browser bundle. Never put
a secret in one. `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` deliberately have
no `NEXT_PUBLIC_` prefix.

### Authentication

Payload hashes passwords; the plaintext is never stored or logged. Sessions
last eight hours. Cookies are `HttpOnly` and `SameSite=Lax`, and `Secure` in
production.

Two roles. `editor` manages properties, pages, services, media and enquiries.
`admin` also manages accounts. The `role` field has admin-only field access, so
an editor cannot promote themselves by editing their own record.

### Access control

Every collection declares explicit access. The important ones:

- **Properties** — public reads are constrained to `available` and `let-agreed`,
  enforced at the collection, so no route can leak a hidden property.
- **Enquiries** — `create` is `() => false`. The only way one is created is the
  server actions, which pass `overrideAccess: true`. Reads are staff-only.
- **Users** — admins manage all accounts; everyone else can only see their own.

Every website query passes `overrideAccess: false`, so the same rules apply to
the website as to an anonymous API request.

### Forms

Server actions rather than route handlers, so Next verifies its own action
token on every submission. That is the CSRF protection.

Four layers of spam defence, cheapest first: a honeypot field, a check that the
form was on screen for at least two seconds, a rate limit of five submissions
per form type per client per ten minutes, and optionally Cloudflare Turnstile
when both keys are set. Rejections all return the same message, so a bot cannot
learn which check caught it.

All input is validated server-side with Zod. Nothing is trusted from the
browser, including the property ID on a property enquiry.

### Injection

Payload builds queries through Drizzle with bound parameters; no SQL is
concatenated anywhere in this codebase. React escapes everything it renders.
The two `dangerouslySetInnerHTML` uses are the JSON-LD blocks, where `<` is
escaped before serialising so CMS copy cannot close the script tag.

Rich text from the CMS is rendered through Payload's Lexical renderer, which
produces React elements rather than raw HTML, and the editor is restricted to
paragraphs, headings, bold, italic, lists and links.

### Headers

Set in both `next.config.ts` and the Nginx config, so the app is safe even if
run without the proxy: `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` from
Nginx. `poweredByHeader` is off and `server_tokens` is off.

There is no Content-Security-Policy yet. Adding one would be worthwhile; it
needs a nonce strategy for Next's inline scripts, which is why it was not done
blind.

### Network

Nginx is the only container with published ports. Postgres is on an internal
Docker network with no host mapping, so it is not reachable from the internet
even if the firewall were misconfigured. The firewall allows only SSH, 80 and 443.

The application runs as a non-root user inside the container.

### Admin panel

`/admin` is disallowed in `robots.txt` and served with `X-Robots-Tag: noindex`,
and rate limited by Nginx. It is not hidden behind a secret path, because
obscurity is not access control and it would make life harder for the owner.

If you want a second layer, put the admin behind Cloudflare Access or an Nginx
IP allowlist for the office address.

### Logging

Logs are JSON and carry operational errors only. Passwords, tokens and the
contents of enquiries are never logged. Stack traces are included in
development but stripped in production. The error page shows a digest, never a
message.

Client IP addresses are used for rate limiting and are never stored or logged.

## Before going live

- [ ] `PAYLOAD_SECRET` generated with `openssl rand -hex 32`
- [ ] `POSTGRES_PASSWORD` is long and random
- [ ] `.env` is `chmod 600`
- [ ] The seeded admin password has been changed
- [ ] SSH password authentication and root login are disabled
- [ ] `ufw` allows only SSH, 80 and 443
- [ ] HTTPS works and HTTP redirects to it
- [ ] `https://yourdomain/admin` is reachable only over HTTPS
- [ ] Backups are scheduled and a restore has been tested
- [ ] Turnstile keys set, if spam becomes a problem

## Keeping it patched

```bash
pnpm audit
pnpm outdated
```

Quarterly at minimum, and whenever an advisory lands for Next, Payload or
sharp. Update on a branch, let CI run, then deploy. Payload and Next versions
are coupled and should be updated together.

The dependency list is deliberately short — no UI library, no icon package, no
date library, no email SDK — precisely so this is a small job.

## If an account is compromised

1. Change `PAYLOAD_SECRET` and restart. Every session is invalidated.
2. Reset the affected password in the admin panel.
3. Review Enquiries and Properties for unexpected changes; pages and services
   keep version history you can compare against.
4. Check `docker compose logs app` for anything unusual around the time.
