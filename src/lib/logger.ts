/**
 * Minimal structured logger.
 *
 * Deliberately thin: the app only needs operational errors and a handful of
 * lifecycle events, and a logging library would be another dependency to keep
 * patched. Enquiry payloads contain personal data, so callers must pass
 * identifiers rather than form contents.
 */

type Level = 'info' | 'warn' | 'error'
type Context = Record<string, unknown>

function emit(level: Level, message: string, context?: Context) {
  const line = {
    level,
    time: new Date().toISOString(),
    message,
    ...(context ?? {}),
  }

  const serialised = JSON.stringify(line)
  if (level === 'error') console.error(serialised)
  else if (level === 'warn') console.warn(serialised)
  else console.info(serialised)
}

/** Reduces an unknown throwable to something safe to serialise. */
function describeError(error: unknown): Context {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: error.message,
      // Stacks are useful in server logs but never reach the browser.
      ...(process.env.NODE_ENV === 'production' ? {} : { stack: error.stack }),
    }
  }
  return { errorMessage: String(error) }
}

export const logger = {
  info: (message: string, context?: Context) => emit('info', message, context),
  warn: (message: string, context?: Context) => emit('warn', message, context),
  error: (message: string, error?: unknown, context?: Context) =>
    emit('error', message, { ...(context ?? {}), ...(error ? describeError(error) : {}) }),
}
