interface MoneyDisplayProps {
  amount: number
  className?: string
}

export function MoneyDisplay({ amount, className }: MoneyDisplayProps): React.JSX.Element {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)

  return <span className={className}>{formatted}</span>
}
