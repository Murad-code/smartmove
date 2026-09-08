'use client'

import Link from 'next/link'
import React, { useState } from 'react'

type Status = 'idle' | 'confirm' | 'working' | 'done' | 'error'

export function DashboardToolsClient() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function loadDemo() {
    setStatus('working')
    setError('')
    try {
      const response = await fetch('/api/seed-demo', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      const body = (await response.json().catch(() => ({}))) as {
        message?: string
        errors?: { message?: string }[]
      }
      if (!response.ok) {
        setError(
          body.message || body.errors?.[0]?.message || 'The demo listings could not be loaded.',
        )
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setError('The demo listings could not be loaded.')
      setStatus('error')
    }
  }

  return (
    <div className="dashboard-tools">
      <section className="dashboard-tools__card">
        <h2 className="dashboard-tools__heading">Demo listings</h2>
        <p>
          Load six example properties, including photographs taken from another agency&apos;s
          website. Use this only on a private preview. Delete them and replace them with Smart
          Move&apos;s own stock before launch.
        </p>
        {status === 'idle' ? (
          <button
            className="dashboard-tools__button"
            type="button"
            onClick={() => setStatus('confirm')}
          >
            Load demo properties
          </button>
        ) : null}
        {status === 'confirm' ? (
          <div className="dashboard-tools__confirm">
            <p>
              This will add or update the demo listings. The photographs and particulars are not
              Smart Move&apos;s to publish on a live site.
            </p>
            <button
              className="dashboard-tools__button"
              type="button"
              onClick={() => void loadDemo()}
            >
              Yes, load demo properties
            </button>
            <button
              className="dashboard-tools__button dashboard-tools__button--quiet"
              type="button"
              onClick={() => setStatus('idle')}
            >
              Cancel
            </button>
          </div>
        ) : null}
        {status === 'working' ? <p>Loading demo properties. This can take a minute.</p> : null}
        {status === 'done' ? (
          <p>
            Demo properties loaded.{' '}
            <Link href="/admin/collections/properties" prefetch={false}>
              View properties
            </Link>
          </p>
        ) : null}
        {status === 'error' ? <p className="dashboard-tools__error">{error}</p> : null}
      </section>
    </div>
  )
}
