interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-4">
          {/* Gradient accent bar — red to transparent */}
          <div
            className="h-8 w-0.5 rounded-full shrink-0"
            style={{
              background: 'linear-gradient(to bottom, oklch(0.65 0.30 22), oklch(0.65 0.30 22 / 0))',
            }}
          />
          <h1
            className="text-2xl font-black tracking-tight uppercase"
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1.5 ml-[22px] text-sm tracking-wide">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
