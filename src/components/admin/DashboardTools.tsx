import React from 'react'

import { env } from '@/lib/env'

import { DashboardToolsClient } from './DashboardToolsClient'

type Props = {
  user?: { role?: string } | null
}

/** Demo-seed control. Hidden from editors and from indexed production sites. */
export function DashboardTools({ user }: Props) {
  if (user?.role !== 'admin') return null
  const allowDemoSeed = env.noindex || !env.isProduction
  if (!allowDemoSeed) return null
  return <DashboardToolsClient />
}
