import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import React from 'react'

import { cn } from '@/lib/cn'

/**
 * Renders Lexical content from the CMS. Styling comes from the `.prose-site`
 * rules in globals.css so editors never see or need a class name.
 */
export function RichText({ data, className }: { data: unknown; className?: string }) {
  if (!data || typeof data !== 'object') return null

  return (
    <div className={cn('prose-site', className)}>
      <LexicalRichText data={data as SerializedEditorState} />
    </div>
  )
}
