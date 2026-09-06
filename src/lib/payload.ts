import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'

/**
 * Shared accessor for the Payload local API.
 *
 * `getPayload` caches the instance internally, so this is safe to call per
 * request and keeps the `@payload-config` import in one place.
 */
export function getPayloadClient(): Promise<Payload> {
  return getPayload({ config: configPromise })
}
