import { useState } from 'react'
import { ActionTemplateGrid } from '@/components/self-service/ActionTemplateGrid'
import { RecentExecutions } from '@/components/self-service/RecentExecutions'
import { Filter } from 'lucide-react'
import { ActionCategory } from '@/types/self-service'

export function SelfServicePage() {
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | 'all'>('all')

  const categories: { value: ActionCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Actions' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'environment', label: 'Environment' },
    { value: 'database', label: 'Database' },
    { value: 'custom', label: 'Custom' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Self-Service Portal</h1>
        <p className="mt-2 text-gray-600">
          Deploy applications, create environments, and provision resources with one click
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filter by:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <ActionTemplateGrid category={selectedCategory} />

      <div className="pt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Executions</h2>
        <RecentExecutions />
      </div>
    </div>
  )
}
