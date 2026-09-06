import React from 'react'

/**
 * Explains, inside the block itself, where the contact details come from.
 * Without this the block looks empty and an editor is left wondering what it
 * will actually render.
 */
export function ContactDetailsNote() {
  return (
    <p
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-100)',
        borderRadius: '4px',
        padding: '0.75rem 1rem',
        fontSize: '0.85rem',
        lineHeight: 1.5,
        margin: 0,
      }}
    >
      Your address, phone number, email and opening hours are pulled in
      automatically from <strong>Settings → Business Details</strong>. Change them
      there and every page updates.
    </p>
  )
}
