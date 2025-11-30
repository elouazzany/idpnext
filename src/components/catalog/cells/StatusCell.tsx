import { Activity, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface StatusCellProps {
  monitoring?: boolean
  status?: 'healthy' | 'degraded' | 'down' | 'unknown'
  type?: 'monitoring' | 'health'
}

export function StatusCell({ monitoring, status, type = 'monitoring' }: StatusCellProps) {
  if (type === 'monitoring') {
    if (monitoring === undefined) return <span className="text-xs text-gray-400">-</span>

    return (
      <div className="flex items-center gap-1.5">
        {monitoring ? (
          <>
            <Activity className="h-3 w-3 text-green-600" />
            <span className="text-xs text-gray-700">Active</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Inactive</span>
          </>
        )}
      </div>
    )
  }

  // Health status
  const statusConfig = {
    healthy: { color: 'bg-green-500', label: 'Healthy' },
    degraded: { color: 'bg-yellow-500', label: 'Degraded' },
    down: { color: 'bg-red-500', label: 'Down' },
    unknown: { color: 'bg-gray-400', label: 'Unknown' },
  }

  const config = status ? statusConfig[status] : null

  if (!config) return <span className="text-xs text-gray-400">-</span>

  return (
    <div className="flex items-center gap-1.5">
      <span className={clsx('h-1.5 w-1.5 rounded-full', config.color)} />
      <span className="text-xs text-gray-700 capitalize">{config.label}</span>
    </div>
  )
}
