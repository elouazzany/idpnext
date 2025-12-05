import { useState, useEffect } from 'react'
import {
    Search,
    SlidersHorizontal,
    ChevronRight,
    ChevronDown,
    Clock,
    User as UserIcon
} from 'lucide-react'
import { clsx } from 'clsx'
import { auditLogsApi, type AuditLog } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { AuditDiffViewer } from '@/components/audit/AuditDiffViewer'

type TabType = 'Entities' | 'Blueprints' | 'Actions' | 'Automations' | 'Scorecards' | 'Runs'

// Map resource types to tab names
const TAB_RESOURCE_MAP: Record<TabType, string> = {
    'Entities': 'entity',
    'Blueprints': 'blueprint',
    'Actions': 'action',
    'Automations': 'automation',
    'Scorecards': 'scorecard',
    'Runs': 'run'
}

// Operation color mapping
const getOperationColor = (operation: string) => {
    switch (operation.toUpperCase()) {
        case 'CREATE':
            return '#06b6d4' // cyan
        case 'UPDATE':
            return '#fb923c' // orange
        case 'DELETE':
            return '#f87171' // red
        default:
            return '#6b7280' // gray
    }
}

// Status color mapping
const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
        case 'SUCCESS':
            return '#10b981' // green
        case 'FAILURE':
            return '#ef4444' // red
        default:
            return '#6b7280' // gray
    }
}

// Origin icon mapping
const getOriginIcon = (origin: string) => {
    switch (origin.toUpperCase()) {
        case 'API':
            return '🔵'
        case 'UI':
            return '💻'
        case 'SYSTEM':
            return '⚙️'
        default:
            return 'S'
    }
}

export function AuditLogPage() {
    const [activeTab, setActiveTab] = useState<TabType>('Blueprints')
    const [searchTerm, setSearchTerm] = useState('')
    const [audits, setAudits] = useState<AuditLog[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [diffData, setDiffData] = useState<Record<string, any>>({})
    const [loadingDiff, setLoadingDiff] = useState<Set<string>>(new Set())

    const tabs: TabType[] = ['Entities', 'Blueprints', 'Actions', 'Automations', 'Scorecards', 'Runs']

    // Fetch audit logs when tab changes
    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                setLoading(true)
                setError(null)

                const resourceType = TAB_RESOURCE_MAP[activeTab]
                const response = await auditLogsApi.getAuditLogs({
                    resources: [resourceType],
                    limit: 1000
                })

                setAudits(response.audits)
                setTotal(response.total)
            } catch (err) {
                console.error('Error fetching audit logs:', err)
                setError('Failed to load audit logs')
            } finally {
                setLoading(false)
            }
        }

        fetchAuditLogs()
    }, [activeTab])

    // Filter audits based on search term
    const filteredAudits = audits.filter(audit => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            audit.identifier?.toLowerCase().includes(searchLower) ||
            audit.action?.toLowerCase().includes(searchLower) ||
            audit.resourceType?.toLowerCase().includes(searchLower) ||
            audit.status?.toLowerCase().includes(searchLower) ||
            audit.origin?.toLowerCase().includes(searchLower) ||
            audit.context?.blueprint?.toLowerCase().includes(searchLower) ||
            audit.context?.blueprintId?.toLowerCase().includes(searchLower)
        )
    })

    // Toggle row expansion and fetch diff if needed
    const toggleRow = async (identifier: string) => {
        const isExpanded = expandedRows.has(identifier)

        if (isExpanded) {
            // Collapse the row
            const newExpanded = new Set(expandedRows)
            newExpanded.delete(identifier)
            setExpandedRows(newExpanded)
        } else {
            // Expand the row
            const newExpanded = new Set(expandedRows)
            newExpanded.add(identifier)
            setExpandedRows(newExpanded)

            // Fetch diff if not already loaded
            if (!diffData[identifier]) {
                setLoadingDiff(new Set(loadingDiff).add(identifier))
                try {
                    console.log('[AuditLogPage] Fetching diff for identifier:', identifier);
                    const response = await auditLogsApi.getAuditLogWithDiff(identifier)
                    console.log('[AuditLogPage] Full response:', response);
                    console.log('[AuditLogPage] Audit data:', response.audit);
                    console.log('[AuditLogPage] Additional data:', response.audit?.additionalData);
                    console.log('[AuditLogPage] Diff:', response.audit?.additionalData?.diff);
                    setDiffData(prev => ({
                        ...prev,
                        [identifier]: response.audit
                    }))
                } catch (err) {
                    console.error('Error fetching diff:', err)
                } finally {
                    const newLoading = new Set(loadingDiff)
                    newLoading.delete(identifier)
                    setLoadingDiff(newLoading)
                }
            }
        }
    }

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
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading audit logs...</div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500">{error}</div>
                    </div>
                ) : (
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-white border-b sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 w-12"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Blueprint</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Source</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Operation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Error</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAudits.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        No audit logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredAudits.map((audit) => {
                                    const isExpanded = expandedRows.has(audit.identifier)
                                    const isLoadingDiff = loadingDiff.has(audit.identifier)
                                    const diff = diffData[audit.identifier]

                                    return (
                                        <>
                                            <tr key={audit.id} className="hover:bg-gray-50 group">
                                                <td className="px-6 py-3">
                                                    <button
                                                        onClick={() => toggleRow(audit.identifier)}
                                                        className="text-gray-400 hover:text-gray-600 transition-transform"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {audit.context?.blueprintIcon ? (
                                                            <span className="text-base">{audit.context.blueprintIcon}</span>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 bg-gray-100">
                                                                <UserIcon className="w-3 h-3 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <span className="text-sm text-gray-900 font-medium">
                                                            {audit.context?.blueprintIdentifier || audit.context?.blueprint || audit.resourceType}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600">
                                                    {formatDistanceToNow(new Date(audit.triggeredAt), { addSuffix: true })}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {audit.user ? (
                                                            <>
                                                                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                                                                    {audit.user.avatar ? (
                                                                        <img
                                                                            src={audit.user.avatar}
                                                                            alt={audit.user.name || audit.user.email}
                                                                            className="w-full h-full rounded-full"
                                                                        />
                                                                    ) : (
                                                                        <UserIcon className="w-3 h-3 text-white" />
                                                                    )}
                                                                </div>
                                                                <span className="text-sm text-gray-900">
                                                                    {audit.user.name || audit.user.email}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 font-semibold bg-purple-100 text-purple-600">
                                                                    {getOriginIcon(audit.origin)}
                                                                </div>
                                                                <span className="text-sm text-gray-900">
                                                                    {audit.origin}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: getOperationColor(audit.action) + '20',
                                                            color: getOperationColor(audit.action)
                                                        }}
                                                    >
                                                        {audit.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-600 uppercase text-xs">
                                                    {audit.origin}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                                                        style={{
                                                            backgroundColor: getStatusColor(audit.status) + '20',
                                                            color: getStatusColor(audit.status)
                                                        }}
                                                    >
                                                        {audit.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-sm text-gray-500 truncate max-w-xs">
                                                    {audit.message || '-'}
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${audit.id}-diff`}>
                                                    <td colSpan={8} className="p-0">
                                                        {isLoadingDiff ? (
                                                            <div className="px-6 py-4 text-center text-sm text-gray-500">
                                                                Loading diff...
                                                            </div>
                                                        ) : (
                                                            <AuditDiffViewer diff={diff?.additionalData?.diff} />
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                )}

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-3">
                    <div className="text-xs text-gray-500">{total} results</div>
                </div>
            </div>
        </div>
    )
}
