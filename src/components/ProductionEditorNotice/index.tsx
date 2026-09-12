'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'

const statusSchema = z.object({
  phase: z.string().optional(),
  pending: z.boolean().optional(),
  matching: z.boolean().optional(),
})

export default function ProductionEditorNotice() {
  const [message, setMessage] = useState('Production content — saves publish automatically.')
  const enabled = process.env.NEXT_PUBLIC_PRODUCTION_EDITOR === '1'
  useEffect(() => {
    if (!enabled) return
    let active = true
    const refresh = async () => {
      try {
        const status = statusSchema.parse(
          await (await fetch('/api/static-publishing-status', { cache: 'no-store' })).json(),
        )
        if (!active) return
        setMessage(
          status.phase === 'failed'
            ? 'Release failed. Edits are paused; check the publisher terminal.'
            : status.phase === 'building' || status.phase === 'built'
              ? 'Publishing… Edits are temporarily paused. Retry saving when this finishes.'
              : !status.matching
                ? 'Updating the production editor. Please wait before saving.'
                : status.pending
                  ? 'Changes saved. Waiting to publish…'
                  : 'Production content — saves publish automatically.',
        )
      } catch {
        if (active)
          setMessage('Publisher unavailable. Check the publisher terminal before editing.')
      }
    }
    void refresh()
    const timer = setInterval(() => void refresh(), 5000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [enabled])
  return enabled ? (
    <div
      role="status"
      style={{ padding: '12px 24px', borderBottom: '1px solid var(--theme-elevation-200)' }}
    >
      {message}
    </div>
  ) : null
}
