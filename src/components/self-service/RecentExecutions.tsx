import { ActionExecution } from '@/types/self-service'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { clsx } from 'clsx'

const mockExecutions: ActionExecution[] = [
  {
    id: '1',
    templateId: '1',
    templateName: 'Deploy Microservice',
    status: 'success',
    initiatedBy: 'john.doe',
    inputs: { serviceName: 'user-service', environment: 'production', replicas: 3 },
    startedAt: '2024-11-29T10:30:00Z',
    completedAt: '2024-11-29T10:37:00Z',
  },
  {
    id: '2',
    templateId: '4',
    templateName: 'Scale Service',
    status: 'running',
    initiatedBy: 'jane.smith',
    inputs: { service: 'payment-api', replicas: 5 },
    startedAt: '2024-11-29T11:15:00Z',
  },
  {
    id: '3',
    templateId: '2',
    templateName: 'Create Environment',
    status: 'failed',
    initiatedBy: 'bob.wilson',
    inputs: { envName: 'staging-2', region: 'us-west-2', size: 'medium' },
    startedAt: '2024-11-29T09:00:00Z',
    completedAt: '2024-11-29T09:12:00Z',
    error: 'Insufficient quota in selected region',
  },
]

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
  running: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Running' },
  pending: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Pending' },
  cancelled: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Cancelled' },
}

export function RecentExecutions() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initiated By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Started
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockExecutions.map((execution) => {
              const config = statusConfig[execution.status]
              const Icon = config.icon
              const duration = execution.completedAt
                ? Math.round((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000 / 60)
                : null

              return (
                <tr key={execution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{execution.templateName}</div>
                    <div className="text-xs text-gray-500">
                      {Object.entries(execution.inputs).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={clsx('inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
                      <Icon className={clsx('h-3.5 w-3.5', execution.status === 'running' && 'animate-spin')} />
                      {config.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {execution.initiatedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duration !== null ? `${duration} min` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
