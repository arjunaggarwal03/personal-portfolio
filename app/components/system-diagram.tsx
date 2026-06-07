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
              <span className="px-1.5 text-subtle">→</span>
            ) : null}
          </span>
        ))}
      </div>
    )
  }
  return <div className="my-4 font-mono text-sm text-muted">{children}</div>
}
