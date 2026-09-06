export interface EmailMessage {
  to: string[]
  subject: string
  text: string
  html: string
  /** Set so a member of staff can hit reply and reach the enquirer. */
  replyTo?: string
}

export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage): Promise<void>
}
