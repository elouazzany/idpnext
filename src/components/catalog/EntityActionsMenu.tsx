import { useState, useRef, useEffect } from 'react'
import {
  Zap,
  MoreHorizontal,
  GitPullRequest,
  Key,
  GitBranch,
  AlertCircle,
  Unlock,
  Lock,
  Image,
  MessageSquare,
  RotateCcw
} from 'lucide-react'

interface EntityActionsMenuProps {
  entityId: string
  entityName: string
}

interface Action {
  id: string
  label: string
  icon: React.ReactNode
  color?: string
}

const quickActions: Action[] = [
  {
    id: 'pr-s3',
    label: 'Open a PR for creating an S3 Bucket',
    icon: <GitPullRequest className="h-4 w-4 text-red-600" />,
  },
  {
    id: 'create-secret',
    label: 'Create Secret',
    icon: <Key className="h-4 w-4 text-gray-700" />,
  },
  {
    id: 'enrich-gitops',
    label: 'Enrich service using GitOps',
    icon: <GitBranch className="h-4 w-4 text-orange-600" />,
  },
  {
    id: 'trigger-incident',
    label: 'Trigger Incident',
    icon: <AlertCircle className="h-4 w-4 text-green-600" />,
  },
  {
    id: 'unlock-service',
    label: 'Unlock Service',
    icon: <Unlock className="h-4 w-4 text-gray-600" />,
  },
  {
    id: 'lock-service',
    label: 'Lock Service',
    icon: <Lock className="h-4 w-4 text-gray-600" />,
  },
  {
    id: 'deploy-image',
    label: 'Deploy an Image',
    icon: <Image className="h-4 w-4 text-blue-600" />,
  },
  {
    id: 'slack-channel',
    label: 'Open Slack Channel',
    icon: <MessageSquare className="h-4 w-4 text-teal-600" />,
  },
  {
    id: 'rollback',
    label: 'Rollback Deployment',
    icon: <RotateCcw className="h-4 w-4 text-orange-600" />,
  },
]

export function EntityActionsMenu({ entityId, entityName }: EntityActionsMenuProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const quickActionsRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleActionClick = (actionId: string) => {
    console.log(`Action ${actionId} clicked for entity ${entityId}`)
    setShowQuickActions(false)
    // Handle action execution here
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Quick Actions Button */}
      <div className="relative" ref={quickActionsRef}>
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="p-1 text-yellow-500 hover:bg-yellow-50 rounded transition-colors"
          title="Quick actions"
        >
          <Zap className="h-3.5 w-3.5" />
        </button>

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Day-2 operations
              </h3>
            </div>

            {/* Actions List */}
            <div className="py-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex-shrink-0">
                    {action.icon}
                  </div>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {action.label}
                  </span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* More Options Button */}
      <div className="relative" ref={moreMenuRef}>
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
          title="More options"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>

        {/* More Options Dropdown */}
        {showMoreMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              View Details
            </button>
            <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Edit Entity
            </button>
            <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              View Dependencies
            </button>
            <div className="border-t border-gray-100 my-1" />
            <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors">
              Delete Entity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
