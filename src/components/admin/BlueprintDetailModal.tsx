import { X, ChevronRight } from 'lucide-react'

interface BlueprintDetailModalProps {
    isOpen: boolean
    onClose: () => void
    blueprint: {
        name: string
        icon: any
        iconColor: string
    } | null
}

export function BlueprintDetailModal({ isOpen, onClose, blueprint }: BlueprintDetailModalProps) {
    if (!isOpen || !blueprint) return null

    const IconComponent = blueprint.icon

    const properties = [
        { name: 'PFI Data Source', type: 'Boolean', icon: '📊', color: 'text-blue-500' },
        { name: 'Documentation', type: 'Calculation', icon: '📄', color: 'text-orange-500' },
        { name: 'Health Check URL', type: 'Calculation', icon: '🔗', color: 'text-orange-500' },
        { name: 'Deprecation Date', type: 'Date-Time', icon: '📅', color: 'text-blue-500' },
        { name: 'Release Date', type: 'Date-Time', icon: '📅', color: 'text-blue-500' },
        { name: 'API Type', type: 'Enum', icon: '🏷️', color: 'text-red-500' },
        { name: 'Compliance Status', type: 'Enum', icon: '🏷️', color: 'text-red-500' },
        { name: 'Status', type: 'Enum', icon: '🏷️', color: 'text-red-500' },
    ]

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="absolute inset-y-0 right-0 max-w-3xl w-full bg-white shadow-xl flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                        <span className="text-sm text-gray-500">Blueprint schema</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-md">
                            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                            </svg>
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-md">
                            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="1.5" />
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="12" cy="19" r="1.5" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-md"
                        >
                            <X className="h-4 w-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Blueprint Title */}
                <div className="px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: blueprint.iconColor + '15' }}
                        >
                            <IconComponent
                                className="w-6 h-6"
                                style={{ color: blueprint.iconColor }}
                            />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{blueprint.name}</h2>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b flex gap-6 flex-shrink-0">
                    <button className="px-1 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                        Properties
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Actions
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Automations
                    </button>
                    <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Scorecards
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Properties List */}
                    <div className="space-y-2">
                        {properties.map((prop, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md group"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-lg">{prop.icon}</span>
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{prop.name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-medium ${prop.color}`}>
                                        {prop.type}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <svg className="h-4 w-4 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="5" r="1.5" />
                                                <circle cx="12" cy="12" r="1.5" />
                                                <circle cx="12" cy="19" r="1.5" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Environments Section */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">🌍</span>
                            <h3 className="text-sm font-semibold text-gray-900">Environments (1)</h3>
                        </div>
                        <div className="text-sm text-gray-500 italic">- New team property</div>
                    </div>

                    {/* Owner Teams Section */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">👥</span>
                            <h3 className="text-sm font-semibold text-gray-900">Owning Teams</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Array</span>
                            <span className="text-sm text-blue-600 font-medium">Team</span>
                            <button className="ml-auto p-1 hover:bg-gray-100 rounded">
                                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="5" r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="19" r="1.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* New Relation Button */}
                    <div className="mt-6">
                        <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-700">
                            <span className="text-lg">+</span>
                            New relation
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-xs text-gray-500 text-center">
                            Blueprint updated a month ago
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
