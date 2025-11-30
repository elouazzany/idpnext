import { useState } from 'react'
import {
    Search,
    Play,
    History,
    Copy,
    Plus,
    Settings,
    MoreHorizontal,
    ArrowRight
} from 'lucide-react'

interface Automation {
    id: string
    title: string
    description: string
    descriptionLink?: string
    sourceIcon: string
    sourceColor: string
    targetIcon: string
    targetColor: string
    entityType: string
    entityIcon: string
    entityColor: string
}

const mockAutomations: Automation[] = [
    {
        id: '1',
        title: 'Send a message when TTL expires',
        description: 'When the timer property of a developer environment expires, send a Slack message. For more information, refer to the guide: ',
        descriptionLink: 'Send a Slack/Teams message when a TTL expires',
        sourceIcon: '📦',
        sourceColor: '#f87171',
        targetIcon: '⚙️',
        targetColor: '#ec4899',
        entityType: 'Developer Env',
        entityIcon: '📦',
        entityColor: '#f87171'
    },
    {
        id: '2',
        title: 'Handle new PagerDuty incident',
        description: 'When a new PagerDuty incident is created, create a Slack channel and GitHub issue. For more information, refer to the guide: ',
        descriptionLink: 'Automating incident management',
        sourceIcon: 'P',
        sourceColor: '#10b981',
        targetIcon: 'P',
        targetColor: '#10b981',
        entityType: 'PagerDuty Incident',
        entityIcon: 'P',
        entityColor: '#10b981'
    },
    {
        id: '3',
        title: 'Service Health Changed',
        description: 'Send a Slack Message when a Service becomes Unhealthy. For more information, refer to the guide: ',
        descriptionLink: 'Send a slack message when a service health changes',
        sourceIcon: '📦',
        sourceColor: '#ec4899',
        targetIcon: '⚙️',
        targetColor: '#ec4899',
        entityType: 'Service',
        entityIcon: '⚙️',
        entityColor: '#ec4899'
    },
    {
        id: '4',
        title: 'Terminate ephemeral environment',
        description: 'Terminate an ephemeral environment when its TTL expires. For more information, refer to the full guide: ',
        descriptionLink: 'Terminate Ephemeral Environment',
        sourceIcon: '📦',
        sourceColor: '#f87171',
        targetIcon: '⚙️',
        targetColor: '#ec4899',
        entityType: 'Developer Env',
        entityIcon: '📦',
        entityColor: '#f87171'
    },
    {
        id: '5',
        title: 'Alert when MTTR going above a certain level',
        description: 'Automatically triggers an alert when the Mean Time to Restore (MTTR) exceeds the set threshold, ensuring prompt incident response and minimizing downtime',
        sourceIcon: '📦',
        sourceColor: '#ec4899',
        targetIcon: '⚙️',
        targetColor: '#ec4899',
        entityType: 'Service',
        entityIcon: '📦',
        entityColor: '#ec4899'
    },
    {
        id: '6',
        title: 'Rollback on incident',
        description: 'An Automation Rollback on Incident is a fail-safe mechanism designed to revert automated changes when an incident is detected. This ensures system stability and minimizes downtim...',
        sourceIcon: 'P',
        sourceColor: '#10b981',
        targetIcon: '⚡',
        targetColor: '#1f2937',
        entityType: 'PagerDuty Service',
        entityIcon: 'P',
        entityColor: '#10b981'
    }
]

export function AutomationsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex-shrink-0">
                {/* Title Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Play className="h-5 w-5 text-gray-900" fill="currentColor" />
                        <h1 className="text-xl font-semibold text-gray-900">Automations</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <History className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <Copy className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-md hover:bg-gray-50">
                            <Plus className="h-4 w-4" />
                            Automation
                        </button>
                    </div>
                </div>

                {/* Search Row */}
                <div className="relative w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {/* Content - Card Grid */}
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl">
                    {mockAutomations.map((automation) => (
                        <div
                            key={automation.id}
                            className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow relative group"
                        >
                            {/* Three-dot menu */}
                            <button className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {/* Icon Flow Visualization */}
                            <div className="p-6 pb-4">
                                <div className="flex items-center justify-center gap-4 mb-4 bg-gray-50 rounded-lg py-8">
                                    {/* Source Icon */}
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm"
                                        style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                                    >
                                        <span style={{ color: automation.sourceColor }}>
                                            {automation.sourceIcon}
                                        </span>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="h-5 w-5 text-gray-400" />

                                    {/* Target Icon */}
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm"
                                        style={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                                    >
                                        <span style={{ color: automation.targetColor }}>
                                            {automation.targetIcon}
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    {automation.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                    {automation.description}
                                    {automation.descriptionLink && (
                                        <a href="#" className="text-blue-600 hover:underline">
                                            {automation.descriptionLink}
                                        </a>
                                    )}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                    {/* Entity Badge */}
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-xs font-semibold"
                                            style={{
                                                backgroundColor: automation.entityColor + '20',
                                                color: automation.entityColor
                                            }}
                                        >
                                            {automation.entityIcon}
                                        </div>
                                        <span className="text-xs text-gray-600">
                                            {automation.entityType}
                                        </span>
                                    </div>

                                    {/* Manage Button */}
                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md border border-gray-200">
                                        <Settings className="h-3.5 w-3.5" />
                                        Manage
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
