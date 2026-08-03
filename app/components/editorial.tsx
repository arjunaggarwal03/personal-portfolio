import type { ReactNode } from 'react'
import { typeStyles } from 'lib/typography'

export function PageIntroduction({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow?: string
  children?: ReactNode
}) {
  return (
    <header className="page-introduction">
      {eyebrow ? (
        <p className={`${typeStyles.editorialAnnotation} text-subtle`}>
          {eyebrow}
        </p>
      ) : null}
      <h1 className={typeStyles.indexTitle}>{title}</h1>
      {children ? (
        <div className={`${typeStyles.uiBody} mt-3 max-w-prose text-muted`}>
          {children}
        </div>
      ) : null}
    </header>
  )
}

export function EditorialSection({
  label,
  title,
  children,
  prominent = false,
}: {
  label: string
  title?: string
  children: ReactNode
  prominent?: boolean
}) {
  return (
    <section
      className={`editorial-section ${prominent ? 'editorial-section-prominent' : ''}`}
    >
      <div>
        <p className={`${typeStyles.editorialAnnotation} text-subtle`}>
          {label}
        </p>
        {title ? (
          <h2 className={`${typeStyles.sectionTitle} mt-1`}>{title}</h2>
        ) : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function MetadataLine({ children }: { children: ReactNode }) {
  return <p className={`${typeStyles.metadata} text-subtle`}>{children}</p>
}

export function RevisionMark({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="border-l-2 border-accent pl-4">
      <p className={`${typeStyles.metadata} text-accent`}>{label}</p>
      <div className={`${typeStyles.smallBody} mt-2`}>{children}</div>
    </div>
  )
}

export function CuratorialAnnotation({ children }: { children: ReactNode }) {
  return (
    <p
      className={`${typeStyles.smallBody} mt-2 border-l border-accent/50 pl-3 text-muted`}
    >
      {children}
    </p>
  )
}
