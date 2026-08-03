import type { ReactNode } from 'react'
import { typeStyles } from 'lib/typography'

export function PageIntroduction({
  title,
  meta,
  children,
}: {
  title: string
  meta?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="page-introduction">
      <h1 className={typeStyles.indexTitle}>{title}</h1>
      {children ? (
        <div className={`${typeStyles.uiBody} mt-3 max-w-prose text-muted`}>
          {children}
        </div>
      ) : null}
      {meta ? (
        <p className={`${typeStyles.caption} mt-2 text-subtle`}>{meta}</p>
      ) : null}
    </header>
  )
}

export function MetadataLine({ children }: { children: ReactNode }) {
  return <p className={`${typeStyles.caption} text-subtle`}>{children}</p>
}
