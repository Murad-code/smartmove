'use client'

import React, { useEffect } from 'react'

import { ButtonLink, Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

/**
 * Client-side error boundary.
 *
 * Shows the digest only, never the message or stack, so nothing internal
 * reaches a visitor's browser. The full error is already in the server log.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page failed to render', error.digest)
  }, [error])

  return (
    <Container className="py-20 text-center sm:py-28">
      <h1 className="text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-600">
        Sorry, this page could not be loaded. Please try again, or call us and we will help.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="large" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" size="large" variant="secondary">
          Back to the home page
        </ButtonLink>
      </div>
      {error.digest ? (
        <p className="mt-8 text-xs text-ink-400">Reference: {error.digest}</p>
      ) : null}
    </Container>
  )
}
