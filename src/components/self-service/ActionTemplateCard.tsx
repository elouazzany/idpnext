import { ActionTemplate } from '@/types/self-service'
import { Clock, ShieldCheck, Play } from 'lucide-react'
import { useState } from 'react'
import { IconDisplay } from '../IconDisplay'

interface ActionTemplateCardProps {
  template: ActionTemplate
}

export function ActionTemplateCard({ template }: ActionTemplateCardProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg border hover:shadow-lg transition-all p-5 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <IconDisplay name={template.icon} className="w-10 h-10 text-gray-700" />
          {template.approvalRequired && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <ShieldCheck className="h-3 w-3" />
              Approval Required
            </div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{template.estimatedTime}</span>
          </div>
          <span className="capitalize px-2 py-1 bg-gray-100 rounded">{template.category}</span>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors group-hover:shadow-md"
        >
          <Play className="h-4 w-4" />
          Execute Action
        </button>
      </div>

      {showModal && (
        <ActionModal template={template} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

function ActionModal({ template, onClose }: { template: ActionTemplate; onClose: () => void }) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Executing action:', template.id, formData)
    alert('Action execution started! (This is a demo)')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-gray-600 mt-1">{template.description}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {template.inputs.map((input) => (
            <div key={input.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {input.label}
                {input.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {input.description && (
                <p className="text-xs text-gray-500 mb-2">{input.description}</p>
              )}
              {input.type === 'select' ? (
                <select
                  required={input.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                >
                  <option value="">Select {input.label}</option>
                  {input.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : input.type === 'textarea' ? (
                <textarea
                  required={input.required}
                  placeholder={input.placeholder}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                />
              ) : input.type === 'boolean' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    onChange={(e) => setFormData({ ...formData, [input.name]: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">{input.description || `Enable ${input.label}`}</span>
                </label>
              ) : (
                <input
                  type={input.type}
                  required={input.required}
                  placeholder={input.placeholder}
                  defaultValue={input.defaultValue as string | number}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onChange={(e) => setFormData({ ...formData, [input.name]: e.target.value })}
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Execute Action
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
