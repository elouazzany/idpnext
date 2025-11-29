export type ActionCategory = 'deployment' | 'infrastructure' | 'environment' | 'database' | 'custom'

export interface ActionTemplate {
  id: string
  name: string
  description: string
  category: ActionCategory
  icon: string
  inputs: ActionInput[]
  approvalRequired: boolean
  estimatedTime: string
}

export interface ActionInput {
  name: string
  label: string
  type: 'text' | 'select' | 'number' | 'boolean' | 'textarea'
  required: boolean
  options?: string[]
  defaultValue?: string | number | boolean
  placeholder?: string
  description?: string
}

export interface ActionExecution {
  id: string
  templateId: string
  templateName: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  initiatedBy: string
  inputs: Record<string, any>
  startedAt: string
  completedAt?: string
  logs?: string[]
  error?: string
}
