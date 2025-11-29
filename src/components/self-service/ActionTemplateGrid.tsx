import { ActionCategory, ActionTemplate } from '@/types/self-service'
import { ActionTemplateCard } from './ActionTemplateCard'

interface ActionTemplateGridProps {
  category: ActionCategory | 'all'
}

// Mock templates
const mockTemplates: ActionTemplate[] = [
  {
    id: '1',
    name: 'Deploy Microservice',
    description: 'Deploy a new microservice to Kubernetes cluster',
    category: 'deployment',
    icon: '🚀',
    approvalRequired: true,
    estimatedTime: '5-10 minutes',
    inputs: [
      { name: 'serviceName', label: 'Service Name', type: 'text', required: true, placeholder: 'my-service' },
      { name: 'environment', label: 'Environment', type: 'select', required: true, options: ['dev', 'staging', 'production'] },
      { name: 'replicas', label: 'Replicas', type: 'number', required: true, defaultValue: 2 },
    ],
  },
  {
    id: '2',
    name: 'Create Environment',
    description: 'Provision a new environment with all required infrastructure',
    category: 'environment',
    icon: '🌍',
    approvalRequired: true,
    estimatedTime: '15-20 minutes',
    inputs: [
      { name: 'envName', label: 'Environment Name', type: 'text', required: true },
      { name: 'region', label: 'Cloud Region', type: 'select', required: true, options: ['us-east-1', 'us-west-2', 'eu-west-1'] },
      { name: 'size', label: 'Environment Size', type: 'select', required: true, options: ['small', 'medium', 'large'] },
    ],
  },
  {
    id: '3',
    name: 'Create Database',
    description: 'Provision a new PostgreSQL or MySQL database instance',
    category: 'database',
    icon: '🗄️',
    approvalRequired: true,
    estimatedTime: '10-15 minutes',
    inputs: [
      { name: 'dbName', label: 'Database Name', type: 'text', required: true },
      { name: 'dbType', label: 'Database Type', type: 'select', required: true, options: ['postgresql', 'mysql', 'mongodb'] },
      { name: 'storage', label: 'Storage (GB)', type: 'number', required: true, defaultValue: 20 },
    ],
  },
  {
    id: '4',
    name: 'Scale Service',
    description: 'Scale an existing service up or down',
    category: 'infrastructure',
    icon: '📈',
    approvalRequired: false,
    estimatedTime: '2-5 minutes',
    inputs: [
      { name: 'service', label: 'Service', type: 'select', required: true, options: ['user-service', 'payment-api', 'analytics'] },
      { name: 'replicas', label: 'New Replica Count', type: 'number', required: true, defaultValue: 3 },
    ],
  },
  {
    id: '5',
    name: 'Run Migration',
    description: 'Execute database migration scripts',
    category: 'database',
    icon: '⚡',
    approvalRequired: true,
    estimatedTime: '5-10 minutes',
    inputs: [
      { name: 'database', label: 'Database', type: 'select', required: true, options: ['users-db', 'orders-db', 'analytics-db'] },
      { name: 'direction', label: 'Direction', type: 'select', required: true, options: ['up', 'down'] },
      { name: 'version', label: 'Target Version', type: 'text', required: false, placeholder: 'latest' },
    ],
  },
  {
    id: '6',
    name: 'Rollback Deployment',
    description: 'Rollback a service to a previous version',
    category: 'deployment',
    icon: '↩️',
    approvalRequired: false,
    estimatedTime: '3-5 minutes',
    inputs: [
      { name: 'service', label: 'Service', type: 'select', required: true, options: ['user-service', 'payment-api'] },
      { name: 'version', label: 'Version', type: 'text', required: true, placeholder: 'v1.2.3' },
    ],
  },
]

export function ActionTemplateGrid({ category }: ActionTemplateGridProps) {
  const filteredTemplates = category === 'all'
    ? mockTemplates
    : mockTemplates.filter((t) => t.category === category)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTemplates.map((template) => (
        <ActionTemplateCard key={template.id} template={template} />
      ))}
      {filteredTemplates.length === 0 && (
        <div className="col-span-full text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No actions available in this category</p>
        </div>
      )}
    </div>
  )
}
