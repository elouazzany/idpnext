import { Entity } from '@/types/catalog'
import { ExternalLink, GitBranch, Users, Tag } from 'lucide-react'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'

interface EntityCardProps {
  entity: Entity
}

const statusColors = {
  healthy: 'bg-green-100 text-green-800',
  degraded: 'bg-yellow-100 text-yellow-800',
  down: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-800',
}

const typeIcons = {
  service: '🔧',
  library: '📚',
  website: '🌐',
  database: '🗄️',
  api: '🔌',
}

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-3xl">{typeIcons[entity.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{entity.name}</h3>
              <span className={clsx('px-2 py-1 text-xs font-medium rounded-full', statusColors[entity.status])}>
                {entity.status}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize">
                {entity.type}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{entity.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{entity.owner}</span>
              </div>
              {entity.metadata.language && (
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  <span>{entity.metadata.language}</span>
                </div>
              )}
              {entity.metadata.lastDeployed && (
                <div>
                  Deployed {formatDistanceToNow(new Date(entity.metadata.lastDeployed), { addSuffix: true })}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {entity.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {entity.metadata.repository && (
            <a
              href={`https://${entity.metadata.repository}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      {(entity.relations.dependsOn.length > 0 || entity.relations.usedBy.length > 0) && (
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-xs">
          {entity.relations.dependsOn.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Depends on:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {entity.relations.dependsOn.map((dep) => (
                  <span key={dep} className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
          {entity.relations.usedBy.length > 0 && (
            <div>
              <span className="font-medium text-gray-700">Used by:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {entity.relations.usedBy.map((user) => (
                  <span key={user} className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {user}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
