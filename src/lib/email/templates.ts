import { env } from '@/lib/env'

import type { EmailMessage } from './types'

/**
 * Notification emails.
 *
 * Plain and functional: this goes to the office inbox, so the priority is that
 * the phone number and the property are readable at a glance on a phone.
 */

export interface NotificationRow {
  label: string
  value: string | number | undefined | null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildNotification({
  to,
  heading,
  rows,
  message,
  replyTo,
  adminUrl,
}: {
  to: string[]
  heading: string
  rows: NotificationRow[]
  message?: string
  replyTo?: string
  adminUrl?: string
}): EmailMessage {
  const filled = rows.filter(
    (row) => row.value !== undefined && row.value !== null && String(row.value).trim() !== '',
  )

  const textLines = [
    heading,
    '',
    ...filled.map((row) => `${row.label}: ${row.value}`),
    ...(message ? ['', 'Message:', message] : []),
    ...(adminUrl ? ['', `View in the website admin: ${adminUrl}`] : []),
  ]

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;background:#f7f8f9;padding:24px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#333a44">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d9dde3;border-radius:8px">
    <tr><td style="background:#003d7e;color:#ffffff;padding:18px 22px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:18px;font-weight:600">${escapeHtml(heading)}</h1>
    </td></tr>
    <tr><td style="padding:20px 22px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6">
        ${filled
          .map(
            (row) => `<tr>
          <th align="left" style="padding:6px 12px 6px 0;color:#6b7687;font-weight:600;vertical-align:top;white-space:nowrap">${escapeHtml(row.label)}</th>
          <td style="padding:6px 0">${escapeHtml(String(row.value))}</td>
        </tr>`,
          )
          .join('')}
      </table>
      ${
        message
          ? `<div style="margin-top:18px;padding-top:16px;border-top:1px solid #eceef1">
        <p style="margin:0 0 6px;color:#6b7687;font-size:13px;font-weight:600">Message</p>
        <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>`
          : ''
      }
      ${
        adminUrl
          ? `<p style="margin:22px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#003d7e;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:14px;font-weight:600">View in the website admin</a></p>`
          : ''
      }
    </td></tr>
  </table>
</body></html>`

  return {
    to,
    subject: heading,
    text: textLines.join('\n'),
    html,
    replyTo,
  }
}

export function adminEnquiryUrl(id: string | number): string {
  return `${env.siteUrl}/admin/collections/enquiries/${id}`
}
