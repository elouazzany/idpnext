import { clsx } from 'clsx'

interface BadgeCellProps {
  value: string
  variant?: 'lifecycle' | 'tier' | 'type' | 'default'
}

const lifecycleColors = {
  Production: 'bg-green-100 text-green-700',
  Experimental: 'bg-orange-100 text-orange-700',
  Deprecated: 'bg-red-100 text-red-700',
  Sunset: 'bg-gray-100 text-gray-700',
}

const tierColors = {
  'Customer Facing': 'bg-blue-100 text-blue-700',
  'Mission Critical': 'bg-purple-100 text-purple-700',
  Internal: 'bg-gray-100 text-gray-700',
  Foundation: 'bg-indigo-100 text-indigo-700',
}

const typeColors = {
  service: 'bg-blue-100 text-blue-700',
  api: 'bg-purple-100 text-purple-700',
  library: 'bg-green-100 text-green-700',
  website: 'bg-orange-100 text-orange-700',
  database: 'bg-red-100 text-red-700',
}

export function BadgeCell({ value, variant = 'default' }: BadgeCellProps) {
  if (!value) return <span className="text-xs text-gray-400">-</span>

  let colorClass = 'bg-gray-100 text-gray-700'

  if (variant === 'lifecycle' && value in lifecycleColors) {
    colorClass = lifecycleColors[value as keyof typeof lifecycleColors]
  } else if (variant === 'tier' && value in tierColors) {
    colorClass = tierColors[value as keyof typeof tierColors]
  } else if (variant === 'type' && value in typeColors) {
    colorClass = typeColors[value as keyof typeof typeColors]
  }

  return (
    <span className={clsx('inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium', colorClass)}>
      {value}
    </span>
  )
}
