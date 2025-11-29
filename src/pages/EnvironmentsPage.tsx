import { Globe, Plus } from 'lucide-react'

export function EnvironmentsPage() {
  const environments = [
    { name: 'Production', status: 'healthy', services: 45, region: 'us-east-1' },
    { name: 'Staging', status: 'healthy', services: 38, region: 'us-west-2' },
    { name: 'Development', status: 'healthy', services: 42, region: 'eu-west-1' },
    { name: 'QA', status: 'degraded', services: 35, region: 'us-east-1' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Environments</h1>
          <p className="mt-2 text-gray-600">Manage your deployment environments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="h-4 w-4" />
          Create Environment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {environments.map((env) => (
          <div key={env.name} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{env.name}</h3>
                  <p className="text-sm text-gray-500">{env.region}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                env.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {env.status}
              </span>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Services</span>
                <span className="font-medium text-gray-900">{env.services}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
