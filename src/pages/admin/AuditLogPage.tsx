import { useState } from 'react'
import {
    Search,
    SlidersHorizontal,
    ChevronRight,
    Clock
} from 'lucide-react'
import { clsx } from 'clsx'

type TabType = 'Entities' | 'Blueprints' | 'Actions' | 'Automations' | 'Scorecards' | 'Runs'

interface AuditLogEntry {
    id: string
    blueprint: string
    blueprintIcon: string
    blueprintIconColor: string
    entity: string
    entityColor: string
    date: string
    source: string
    sourceIcon: string
    sourceIconColor: string
    operation: string
    operationColor: string
    type: string
}

const mockAuditData: AuditLogEntry[] = [
    {
        id: '1',
        blueprint: 'Cloud Resource',
        blueprintIcon: '☁️',
        blueprintIconColor: '#6b7280',
        entity: 'dfghjkl',
        entityColor: '#3b82f6',
        date: '2 days ago',
        source: 'Application',
        sourceIcon: 'A',
        sourceIconColor: '#f97316',
        operation: 'Create',
        operationColor: '#06b6d4',
        type: 'PORT AUTOMATION'
    },
    {
        id: '2',
        blueprint: 'Cloud Resource',
        blueprintIcon: '☁️',
        blueprintIconColor: '#6b7280',
        entity: 'aaaaaa',
        entityColor: '#3b82f6',
        date: '2 days ago',
        source: 'Application',
        sourceIcon: 'A',
        sourceIconColor: '#f97316',
        operation: 'Create',
        operationColor: '#06b6d4',
        type: 'PORT AUTOMATION'
    },
    {
        id: '3',
        blueprint: 'Organization',
        blueprintIcon: '🏢',
        blueprintIconColor: '#ec4899',
        entity: 'port',
        entityColor: '#3b82f6',
        date: '3 days ago',
        source: 'Aggregation Property',
        sourceIcon: '⬇️',
        sourceIconColor: '#1f2937',
        operation: 'Update',
        operationColor: '#fb923c',
        type: 'AGGREGATION PROPER...'
    },
    {
        id: '4',
        blueprint: 'Service',
        blueprintIcon: '⚙️',
        blueprintIconColor: '#ec4899',
        entity: 'argocd-test-route',
        entityColor: '#3b82f6',
        date: '3 days ago',
        source: 'Aggregation Property',
        sourceIcon: '⬇️',
        sourceIconColor: '#1f2937',
        operation: 'Update',
        operationColor: '#fb923c',
        type: 'AGGREGATION PROPER...'
    },
    {
        id: '5',
        blueprint: 'Service',
        blueprintIcon: '⚙️',
        blueprintIconColor: '#ec4899',
        entity: 'argocd-test-route',
        entityColor: '#3b82f6',
        date: '3 days ago',
        source: 'Application',
        sourceIcon: 'A',
        sourceIconColor: '#f97316',
        operation: 'Create',
        operationColor: '#06b6d4',
        type: 'PORT AUTOMATION'
    },
    {
        id: '6',
        blueprint: 'Developer Env',
        blueprintIcon: '📦',
        blueprintIconColor: '#f87171',
        entity: 'systemswayacademy',
        entityColor: '#3b82f6',
        date: '3 days ago',
        source: 'Rest API',
        sourceIcon: '🔵',
        sourceIconColor: '#8b5cf6',
        operation: 'Timer Expi...',
        operationColor: '#f87171',
        type: 'API'
    },
    {
        id: '7',
        blueprint: 'Organization',
        blueprintIcon: '🏢',
        blueprintIconColor: '#ec4899',
        entity: 'port',
        entityColor: '#3b82f6',
        date: '3 days ago',
        source: 'Aggregation Property',
        sourceIcon: '⬇️',
        sourceIconColor: '#1f2937',
        operation: 'Update',
        operationColor: '#fb923c',
        type: 'AGGREGATION PROPER...'
    }
]

export function AuditLogPage() {
    const [activeTab, setActiveTab] = useState<TabType>('Entities')
    const [searchTerm, setSearchTerm] = useState('')

    const tabs: TabType[] = ['Entities', 'Blueprints', 'Actions', 'Automations', 'Scorecards', 'Runs']

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex-shrink-0">
                {/* Title Row */}
                <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-5 w-5 text-gray-900" />
                    <h1 className="text-xl font-semibold text-gray-900">Audit Log</h1>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mb-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                                activeTab === tab
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search and Controls Row */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search columns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                            </svg>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-white border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 w-12"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Blueprint</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Entity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Operation</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {mockAuditData.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-3">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0"
                                            style={{ backgroundColor: entry.blueprintIconColor + '20' }}
                                        >
                                            <span style={{ color: entry.blueprintIconColor }}>
                                                {entry.blueprintIcon}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-900 font-medium">
                                            {entry.blueprint}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span className="text-sm text-blue-600 hover:underline cursor-pointer font-medium">
                                        {entry.entity}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">{entry.date}</td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 font-semibold"
                                            style={{
                                                backgroundColor: entry.sourceIconColor + '20',
                                                color: entry.sourceIconColor
                                            }}
                                        >
                                            {entry.sourceIcon}
                                        </div>
                                        <span className="text-sm text-gray-900">
                                            {entry.source}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                        style={{
                                            backgroundColor: entry.operationColor + '20',
                                            color: entry.operationColor
                                        }}
                                    >
                                        {entry.operation}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">{entry.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-3">
                    <div className="text-xs text-gray-500">1000 results</div>
                </div>
            </div>
        </div>
    )
}
