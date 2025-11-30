import { Search, Zap, Clock, BookOpen, Plus } from 'lucide-react'

// Action card data
const actions = [
  {
    id: 1,
    title: 'Scaffold new Service',
    description: 'To complete setting up this action, please refer to the following guide:',
    link: 'Setup scaffold service',
    linkUrl: '#',
    icon: (
      <svg className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    iconBg: 'bg-gray-100',
    tags: [
      { label: 'Service', icon: '🔵' },
      { label: 'Create', icon: '⚡' },
    ],
  },
  {
    id: 2,
    title: 'Provision an RDS',
    description: 'Provision an AWS RDS instance. For more information, refer to the guide:',
    link: 'Deploy AWS resources using AWS CloudFormation',
    linkUrl: '#',
    icon: (
      <svg className="h-12 w-12" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="8" width="24" height="24" rx="3" stroke="#6366F1" strokeWidth="2" />
        <circle cx="16" cy="16" r="2" fill="#6366F1" />
        <circle cx="24" cy="16" r="2" fill="#6366F1" />
        <circle cx="16" cy="24" r="2" fill="#6366F1" />
        <circle cx="24" cy="24" r="2" fill="#6366F1" />
      </svg>
    ),
    iconBg: 'bg-purple-50',
    tags: [
      { label: 'Cloud Resource', icon: '☁️' },
      { label: 'Provision RDS', icon: '⚡' },
    ],
  },
  {
    id: 3,
    title: 'Create a PagerDuty Service',
    description: 'Create a PagerDuty Service from Port. For more information, refer to the guide:',
    link: 'Create PagerDuty Service action',
    linkUrl: '#',
    icon: (
      <svg className="h-12 w-12" viewBox="0 0 40 40" fill="none">
        <path d="M10 8h14c4 0 6 3 6 6s-2 6-6 6H10V8z" fill="#10B981" stroke="#10B981" strokeWidth="2" />
        <path d="M10 8v24" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    iconBg: 'bg-green-50',
    tags: [
      { label: 'PagerDuty Service', icon: '📟' },
      { label: 'Create', icon: '⚡' },
    ],
  },
  {
    id: 4,
    title: 'Report a bug',
    description: 'Create a Jira bug ticket. For more information, refer to the guide:',
    link: 'Report a bug action',
    linkUrl: '#',
    icon: (
      <svg className="h-12 w-12" viewBox="0 0 40 40" fill="none">
        <path d="M20 8L28 16L20 24L12 16L20 8Z" fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" />
        <path d="M20 16L24 20L20 24L16 20L20 16Z" fill="#60A5FA" />
      </svg>
    ),
    iconBg: 'bg-blue-50',
    tags: [
      { label: 'Jira Issue', icon: '💎' },
      { label: 'Report a bug', icon: '⚡' },
    ],
  },
]

export function SelfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-6">
      {/* Header with Search */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-fit">
          <Zap className="h-6 w-6 text-yellow-500" fill="currentColor" />
          <h1 className="text-2xl font-semibold text-gray-900">Self-Service Hub</h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md flex-1 mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        <div className="flex items-center gap-3 min-w-fit">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <Clock className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <BookOpen className="h-5 w-5" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" />
            Action
          </button>
        </div>
      </div>

      {/* Create Actions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Create Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Icon Section - Gray Background */}
              <div className="bg-gray-100 h-32 flex items-center justify-center p-4">
                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm">
                  <div className="flex items-center justify-center scale-75">
                    {action.icon}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col flex-1">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{action.title}</h3>

                {/* Description */}
                <p className="text-xs text-gray-600 mb-1">
                  {action.description}{' '}
                  <a href={action.linkUrl} className="text-blue-600 hover:underline">
                    {action.link} →
                  </a>
                </p>

                {/* Tags */}
                <div className="mt-auto pt-3 flex items-center justify-between">
                  {action.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] font-medium rounded border whitespace-nowrap ${tag.label === 'Service' || tag.label === 'PagerDuty Service' || tag.label === 'Jira Issue' || tag.label === 'Cloud Resource'
                        ? 'bg-pink-50 text-pink-700 border-pink-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                    >
                      <span className="text-[10px]">{tag.icon}</span>
                      <span>{tag.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
