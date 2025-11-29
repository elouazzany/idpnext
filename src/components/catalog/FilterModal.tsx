import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { EntityType, EntityStatus } from '@/types/catalog'

interface FilterCondition {
  id: string
  logic: 'And' | 'Or'
  field: string
  operator: string
  value: string | string[]
}

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (conditions: FilterCondition[]) => void
}

const fields = [
  { value: 'name', label: 'Name', type: 'text' },
  { value: 'type', label: 'Type', type: 'select' },
  { value: 'status', label: 'Status', type: 'select' },
  { value: 'owner', label: 'Owner', type: 'text' },
  { value: 'team', label: 'Team', type: 'select' },
  { value: 'tags', label: 'Tags', type: 'multiselect' },
  { value: 'language', label: 'Language', type: 'text' },
]

const operators = {
  text: [
    { value: 'equals', label: 'equals' },
    { value: 'contains', label: 'contains' },
    { value: 'startsWith', label: 'starts with' },
    { value: 'endsWith', label: 'ends with' },
  ],
  select: [
    { value: 'is', label: 'is' },
    { value: 'isNot', label: 'is not' },
  ],
  multiselect: [
    { value: 'hasAnyOf', label: 'has any of' },
    { value: 'hasAllOf', label: 'has all of' },
    { value: 'hasNoneOf', label: 'has none of' },
  ],
}

const typeOptions: EntityType[] = ['service', 'api', 'library', 'website', 'database']
const statusOptions: EntityStatus[] = ['healthy', 'degraded', 'down', 'unknown']
const teamOptions = ['Platform Team', 'Payments Team', 'Data Team', 'Security Team']
const tagOptions = ['production', 'critical', 'auth', 'payment', 'analytics', 'internal', 'pci-compliant']

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([
    {
      id: '1',
      logic: 'And',
      field: 'type',
      operator: 'is',
      value: '',
    },
  ])

  if (!isOpen) return null

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Date.now().toString(),
        logic: 'And',
        field: 'name',
        operator: 'contains',
        value: '',
      },
    ])
  }

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((c) => c.id !== id))
    }
  }

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(
      conditions.map((c) => {
        if (c.id === id) {
          const newCondition = { ...c, ...updates }
          // Reset operator and value when field changes
          if (updates.field) {
            const field = fields.find((f) => f.value === updates.field)
            const defaultOperator = field ? operators[field.type as keyof typeof operators][0].value : 'equals'
            newCondition.operator = defaultOperator
            newCondition.value = field?.type === 'multiselect' ? [] : ''
          }
          return newCondition
        }
        return c
      })
    )
  }

  const handleApply = () => {
    onApply(conditions)
    onClose()
  }

  const getFieldOptions = (fieldValue: string) => {
    switch (fieldValue) {
      case 'type':
        return typeOptions
      case 'status':
        return statusOptions
      case 'team':
        return teamOptions
      case 'tags':
        return tagOptions
      default:
        return []
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[70vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Filter</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {conditions.map((condition, index) => {
              const field = fields.find((f) => f.value === condition.field)
              const fieldType = field?.type || 'text'
              const availableOperators = operators[fieldType as keyof typeof operators]

              return (
                <div key={condition.id} className="flex items-center gap-2">
                  {/* Logic Selector (And/Or) - Only show for second condition onwards */}
                  {index > 0 ? (
                    <select
                      value={condition.logic}
                      onChange={(e) =>
                        updateCondition(condition.id, { logic: e.target.value as 'And' | 'Or' })
                      }
                      className="px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 w-16 bg-white"
                    >
                      <option value="And">And</option>
                      <option value="Or">Or</option>
                    </select>
                  ) : (
                    <div className="px-2 py-1.5 text-[11px] text-gray-500 w-16 font-medium">Where</div>
                  )}

                  {/* Field Selector */}
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                  >
                    {fields.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator Selector */}
                  <select
                    value={condition.operator}
                    onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                    className="flex-1 px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                  >
                    {availableOperators.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  {/* Value Input */}
                  {fieldType === 'text' ? (
                    <input
                      type="text"
                      placeholder="Enter a value"
                      value={condition.value as string}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      className="flex-1 px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  ) : fieldType === 'select' ? (
                    <select
                      value={condition.value as string}
                      onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                      className="flex-1 px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                    >
                      <option value="">Select</option>
                      {getFieldOptions(condition.field).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      multiple
                      value={condition.value as string[]}
                      onChange={(e) =>
                        updateCondition(condition.id, {
                          value: Array.from(e.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="flex-1 px-2 py-1.5 text-[11px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 min-h-[30px] bg-white"
                    >
                      {getFieldOptions(condition.field).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeCondition(condition.id)}
                    disabled={conditions.length === 1}
                    className={`p-1 rounded transition-colors ${
                      conditions.length === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add Filter Button */}
          <button
            onClick={addCondition}
            className="mt-3 flex items-center gap-1 px-2 py-1 text-[11px] text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-3 w-3" />
            Add new filter
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex items-center justify-end gap-2 bg-gray-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] border border-gray-300 text-gray-700 rounded hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-[11px] bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}
