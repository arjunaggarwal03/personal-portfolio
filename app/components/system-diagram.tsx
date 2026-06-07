export function SystemDiagram({
  steps,
  children,
}: {
  steps?: string[]
  children?: React.ReactNode
}) {
  if (steps && steps.length > 0) {
    return (
      <div className="my-4 font-mono text-sm text-muted">
        {steps.map((step, i) => (
          <span key={step}>
            {step}
            {i < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="inline-flex items-center px-1.5 text-subtle"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-[0.9em]"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </span>
            ) : null}
          </span>
        ))}
      </div>
    )
  }
  return <div className="my-4 font-mono text-sm text-muted">{children}</div>
}
