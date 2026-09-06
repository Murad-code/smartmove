# Deploying to a VPS

Written for a fresh Ubuntu 24.04 server. Every command can be pasted as-is;
replace `smartmove4u.co.uk` with the real domain and `deploy` with whatever
user you create.

Two TLS options are described. **Nginx with Certbot is the recommended path**
and is what the shipped configuration is set up for. Cloudflare is covered at
the end for the case where the domain is already behind it.

---

## 1. Server preparation

Connect as root for the first few steps.

```bash
ssh root@YOUR_SERVER_IP
```

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg ufw fail2ban rclone git
timedatectl set-timezone Europe/London
```

Create a non-root user to run the deployment.

```bash
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys
```

## 2. SSH security

```bash
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
```

**Open a second terminal and confirm `ssh deploy@YOUR_SERVER_IP` works before
closing this one.** Locking yourself out of a fresh VPS is a bad afternoon.

## 3. Firewall

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status verbose
```

Postgres is never published to the host, so port 5432 stays closed. Nothing
else needs to be open.

## 4. Docker

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker deploy
systemctl enable --now docker
```

Log out and back in as `deploy` so the group membership takes effect.

```bash
docker --version && docker compose version
```

## 5. DNS

Before requesting a certificate, point the domain at the server and wait for it
to propagate.

| Type | Name  | Value                                     |
| ---- | ----- | ----------------------------------------- |
| A    | `@`   | your server's IPv4 address                |
| A    | `www` | your server's IPv4 address                |
| AAAA | `@`   | your server's IPv6 address, if it has one |

```bash
dig +short smartmove4u.co.uk
```

Do not continue until that returns the server's address.

## 6. Get the code

```bash
sudo mkdir -p /opt/smartmove
sudo chown deploy:deploy /opt/smartmove
git clone YOUR_REPOSITORY_URL /opt/smartmove
cd /opt/smartmove
```

## 7. Environment variables

```bash
cp .env.example .env
nano .env
```

Fill in at least:

```bash
POSTGRES_USER=smartmove
POSTGRES_PASSWORD=          # openssl rand -base64 32
POSTGRES_DB=smartmove
DATABASE_URL=               # leave blank; Compose builds it from the three above
PAYLOAD_SECRET=             # openssl rand -hex 32
NEXT_PUBLIC_SITE_URL=https://smartmove4u.co.uk
EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=Smart Move Website <website@smartmove4u.co.uk>
EMAIL_TO=sales@smartmove4u.co.uk
SEED_ADMIN_EMAIL=admin@smartmove4u.co.uk
SEED_ADMIN_PASSWORD=        # change it after the first sign-in
```

Generate the two secrets:

```bash
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -hex 32      # PAYLOAD_SECRET
```

Lock the file down:

```bash
chmod 600 .env
```

`.env` is in `.gitignore` and must never be committed.

Full reference: [environment-variables.md](environment-variables.md).

## 8. Set the domain in the Nginx configuration

```bash
sed -i 's/smartmove4u\.co\.uk/YOUR_DOMAIN/g' docker/nginx/conf.d/smartmove.conf
```

## 9. First certificate

Nginx will not start without a certificate, and Certbot needs Nginx to answer
the challenge, so break the cycle by starting Nginx with the HTTPS block
commented out.

```bash
# Comment out the 443 server block temporarily
sed -i '/^server {$/,$ s/^/#/' docker/nginx/conf.d/smartmove.conf.tmp 2>/dev/null || true
cp docker/nginx/conf.d/smartmove.conf /tmp/smartmove.conf.full
awk '/^server \{$/{n++} n<2 || /acme-challenge/ {print}' /tmp/smartmove.conf.full \
  > docker/nginx/conf.d/smartmove.conf

docker compose -f docker-compose.prod.yml up -d nginx

docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d smartmove4u.co.uk -d www.smartmove4u.co.uk \
  --email YOUR_EMAIL --agree-tos --no-eff-email

# Put the full configuration back
cp /tmp/smartmove.conf.full docker/nginx/conf.d/smartmove.conf
```

## 10. Start everything

```bash
cd /opt/smartmove
docker compose -f docker-compose.prod.yml up -d --build
```

The first build takes a few minutes. Compose starts things in order: Postgres,
then the `migrate` service which applies database migrations and exits, then
the app, then Nginx and the certificate renewer.

```bash
docker compose -f docker-compose.prod.yml ps
```

Every service should be `running` or, for `migrate`, `exited (0)`.

## 11. Create the first admin account and content

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint sh migrate -c "pnpm seed"
```

This creates the admin user from `.env` and writes the starter pages, services
and business details. It does **not** create demo properties unless
`SEED_DEMO_PROPERTIES=true`, which you do not want on a real site.

It is safe to re-run: existing documents are updated, not duplicated.

## 12. Check it

```bash
curl -I https://smartmove4u.co.uk
curl https://smartmove4u.co.uk/healthz
```

Then in a browser:

- `https://smartmove4u.co.uk` — the home page
- `https://smartmove4u.co.uk/admin` — sign in with `SEED_ADMIN_EMAIL`

**Change the admin password immediately** in the admin panel under People.

## 13. Backups

Not optional. See [backups.md](backups.md), which covers configuring off-site
storage and the cron entry.

---

## Routine operations

### Deploy a change

```bash
cd /opt/smartmove
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations run automatically before the new app container starts. There is a
few seconds of downtime while the container is replaced, which is acceptable
for a site of this size.

### Restart

```bash
docker compose -f docker-compose.prod.yml restart app
```

### Roll back

Every deployment is a git commit, so rolling back is checking out the previous
one and rebuilding:

```bash
cd /opt/smartmove
git log --oneline -10
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml up -d --build
```

If the bad deployment included a database migration, roll that back **first**,
while the old code is still running:

```bash
docker compose -f docker-compose.prod.yml run --rm migrate pnpm payload migrate:down
```

If the schema change was destructive, restore from a backup instead. See
[backups.md](backups.md).

### Logs

```bash
# Everything, live
docker compose -f docker-compose.prod.yml logs -f

# Just the application
docker compose -f docker-compose.prod.yml logs -f app

# Errors only
docker compose -f docker-compose.prod.yml logs app | grep '"level":"error"'
```

Logs rotate at 10 MB with five files kept per service.

### Update the base images

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

Worth doing monthly, along with `apt update && apt upgrade` on the host.

---

## Option B: Cloudflare in front of the VPS

If Cloudflare is already proxying the domain, you can let it terminate TLS
instead of running Certbot.

1. Set Cloudflare's SSL/TLS mode to **Full (strict)**.
2. Generate a Cloudflare Origin Certificate and save it on the server as
   `/opt/smartmove/certs/fullchain.pem` and `privkey.pem`.
3. In `docker-compose.prod.yml`, remove the `certbot` service and mount
   `./certs:/etc/letsencrypt/live/smartmove4u.co.uk:ro` on nginx instead of the
   `certbot_conf` volume.
4. Restrict the firewall to Cloudflare's published address ranges so nobody can
   reach the origin directly:

```bash
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do ufw allow from "$ip" to any port 443; done
ufw delete allow 443/tcp
```

The certificate then never expires within Cloudflare's lifetime and there is
nothing to renew. The trade-off is that Cloudflare can see your traffic in
plaintext at their edge, and the site stops working if Cloudflare is
misconfigured. For a small business site either option is fine; Certbot keeps
you independent, which is why it is the default here.

---

## Troubleshooting

**`docker compose ps` shows the app restarting.**
Check the logs: `docker compose -f docker-compose.prod.yml logs app`. The usual
causes are a missing `PAYLOAD_SECRET` or a `DATABASE_URL` that does not match
the Postgres credentials.

**The migrate service asks a question and hangs.**
It has detected that the database schema was pushed by a development-mode run.
That should never happen in production. It means a command was run against this
database with `NODE_ENV` set to something other than `production`. Restore from
a backup rather than answering yes, which would cause data loss.

**Certbot fails with "challenge failed".**
DNS is not pointing at the server yet, or port 80 is blocked. Check
`dig +short YOUR_DOMAIN` and `ufw status`.

**Nginx will not start: "cannot load certificate".**
The certificate has not been issued yet. Follow step 9.

**Property photographs return 500 or do not appear.**
The media volume is not mounted or is empty:

```bash
docker compose -f docker-compose.prod.yml exec app ls /app/media | head
```

If it is empty but the CMS lists images, restore the media archive from a
backup.

**Enquiries arrive in the CMS but no email is sent.**
The enquiry is saved first, on purpose, so nothing is lost. Check the log for
`Failed to send enquiry notification` and verify `RESEND_API_KEY`, `EMAIL_FROM`
(the domain must be verified with the provider) and `EMAIL_TO`.

**The site is slow.**
Check `docker stats`. If Postgres is using all the memory on a small VPS, the
usual fix is adding swap:

```bash
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

**Everything is broken and you need to start over.**
The database and media are in named Docker volumes, so they survive
`docker compose down`. Only `down -v` destroys them. Take a backup first.
