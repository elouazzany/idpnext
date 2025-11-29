import { Zap } from 'lucide-react'

export function ActionsPage() {
  const workflows = [
    { id: 1, name: 'CI/CD Pipeline', trigger: 'Git Push', status: 'active', runs: 234 },
    { id: 2, name: 'Daily Backup', trigger: 'Schedule', status: 'active', runs: 89 },
    { id: 3, name: 'Auto Scale', trigger: 'Metric Threshold', status: 'active', runs: 156 },
    { id: 4, name: 'Security Scan', trigger: 'Manual', status: 'paused', runs: 45 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Actions & Workflows</h1>
        <p className="mt-2 text-gray-600">Automate tasks with custom workflows</p>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Workflow
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trigger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total Runs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {workflows.map((workflow) => (
              <tr key={workflow.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">{workflow.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{workflow.trigger}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    workflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {workflow.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{workflow.runs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
