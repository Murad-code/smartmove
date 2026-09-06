# Running the site day to day

For the developer or whoever looks after the server. The business owner's guide
is [cms-guide.md](cms-guide.md).

## Health

```bash
curl https://smartmove4u.co.uk/healthz
```

`{"status":"ok"}` means the app is up and can reach the database. Docker uses
the same endpoint, so `docker compose ps` reflects it.

## Logs

Application logs are JSON, one object per line:

```json
{
  "level": "error",
  "time": "2026-09-06T11:04:12.331Z",
  "message": "Failed to send enquiry notification",
  "subject": "Website enquiry from Jane Fletcher",
  "provider": "resend",
  "errorName": "Error",
  "errorMessage": "Resend responded 422"
}
```

```bash
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs app | grep '"level":"error"'
```

Only operational failures are logged: database errors, email failures,
unexpected server errors, and the fact that a submission was rejected by the
spam checks. Passwords, tokens and the contents of enquiries never are. Stack
traces are included in development only.

## Things that will need attention

| Symptom                                  | Where to look                                                                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Enquiries stop arriving by email         | `grep 'Failed to send enquiry notification'`. The enquiries are still in the CMS.                                                          |
| Spam getting through                     | Enable Turnstile: set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` and rebuild.                                        |
| A real person is blocked from submitting | `You have sent several messages already` means the rate limit tripped: five submissions per form type per client per ten minutes.          |
| Disk filling up                          | `docker system df`, then `docker image prune -f`. Property photographs also accumulate; check `docker compose exec app du -sh /app/media`. |
| Certificate expiry warnings              | The `certbot` service renews twice a day. Check `docker compose logs certbot`.                                                             |

## Scaling notes

The application is written for a single container, which is the right shape for
this business. Two things assume that and would need changing before running
more than one instance:

1. **Rate limiting is in memory** (`src/lib/forms/spam.ts`). Each instance
   would keep its own counts, so the effective limit multiplies. Moving the
   counters to Redis or Postgres would fix it.
2. **Media is on a local volume.** Two instances would need shared storage. The
   media layer is already abstracted behind Payload's upload adapter, so this
   is a storage-adapter plugin plus an S3 bucket, not an application rewrite.

Neither is worth doing until there is a reason.

## Routine maintenance

Monthly:

```bash
# Host packages
sudo apt update && sudo apt upgrade -y

# Base images
cd /opt/smartmove
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f

# Confirm backups are still running
tail -20 /var/log/smartmove-backup.log
```

Quarterly:

```bash
pnpm outdated
pnpm audit
```

Update dependencies on a branch, let CI run, then deploy. Payload and Next
should be updated together because their versions are coupled.

## Data protection requests

Under UK GDPR someone can ask for a copy of the data you hold about them, or
ask you to delete it. For website enquiries:

- **Find it:** admin panel → Enquiries → search their name or email.
- **Provide a copy:** the enquiry record shows everything stored, which is only
  what they typed plus the time they agreed to the privacy policy.
- **Delete it:** open the enquiry and use Delete. That is a hard delete.

Enquiries are not retained automatically. Decide a retention period, write it
into the privacy policy, and delete older enquiries periodically.
