interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 bg-primary rounded-full" />
          <h1 className="text-2xl font-black tracking-tight uppercase">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 ml-4 text-sm">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
