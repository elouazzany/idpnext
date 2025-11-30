import { useState, useCallback } from 'react'
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Handle,
    Position,
    NodeProps,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
    Eye,
    X,
    Plus,
    Grid3x3,
    Network,
    Box,
    Zap,
    Database,
    FileCode,
    Bell,
    ExternalLink,
    ChevronRight,
    Search
} from 'lucide-react'
import { BlueprintDetailModal } from '../../components/admin/BlueprintDetailModal'

interface CustomNodeData {
    label: string
    icon: any
    iconColor: string
    onExpand?: () => void
}

// Custom Node Component
function CustomNode({ data }: NodeProps<CustomNodeData>) {
    const IconComponent = data.icon || Box
    const iconColor = data.iconColor || '#ec4899'

    return (
        <div className="px-4 py-2 shadow-md rounded-lg bg-white border border-gray-200 min-w-[180px]">
            <Handle type="target" position={Position.Left} className="w-2 h-2" />

            <div className="flex items-center gap-2">
                <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconColor + '20' }}
                >
                    <IconComponent
                        className="w-3.5 h-3.5"
                        style={{ color: iconColor }}
                    />
                </div>

                <div className="flex-1 text-sm font-medium text-gray-900">
                    {data.label}
                </div>

                <div className="flex gap-1">
                    <button className="p-0.5 hover:bg-gray-100 rounded">
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                        className="p-0.5 hover:bg-gray-100 rounded"
                        onClick={(e) => {
                            e.stopPropagation()
                            data.onExpand?.()
                        }}
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                </div>
            </div>

            <Handle type="source" position={Position.Right} className="w-2 h-2" />
        </div>
    )
}

const nodeTypes = {
    custom: CustomNode,
}

const initialNodes: Node[] = [
    {
        id: 'service',
        type: 'custom',
        data: { label: 'Service', icon: Box, iconColor: '#ec4899' },
        position: { x: 250, y: 200 },
    },
    {
        id: 'api',
        type: 'custom',
        data: { label: 'API', icon: Zap, iconColor: '#3b82f6' },
        position: { x: 550, y: 50 },
    },
    {
        id: 'repository',
        type: 'custom',
        data: { label: 'Repository', icon: Database, iconColor: '#6b7280' },
        position: { x: 750, y: 200 },
    },
    {
        id: 'scorecard',
        type: 'custom',
        data: { label: 'ScorecardProject', icon: FileCode, iconColor: '#06b6d4' },
        position: { x: 550, y: 0 },
    },
    {
        id: 'pagerdutysvc',
        type: 'custom',
        data: { label: 'PagerDuty Servi...', icon: Bell, iconColor: '#10b981' },
        position: { x: 550, y: 250 },
    },
    {
        id: 'newrelic',
        type: 'custom',
        data: { label: 'New Relic Service', icon: Database, iconColor: '#14b8a6' },
        position: { x: 250, y: 400 },
    },
    {
        id: 'newrelicsvc',
        type: 'custom',
        data: { label: 'New Relic Service', icon: Database, iconColor: '#14b8a6' },
        position: { x: 550, y: 400 },
    },
]

const initialEdges: Edge[] = [
    {
        id: 'e1',
        source: 'service',
        target: 'api',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
    {
        id: 'e2',
        source: 'service',
        target: 'repository',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
    {
        id: 'e3',
        source: 'service',
        target: 'pagerdutysvc',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
    {
        id: 'e4',
        source: 'scorecard',
        target: 'api',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
    {
        id: 'e5',
        source: 'pagerdutysvc',
        target: 'newrelic',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
    {
        id: 'e6',
        source: 'pagerdutysvc',
        target: 'newrelicsvc',
        type: 'default',
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
    },
]

export function DataModelPage() {
    const [viewMode, setViewMode] = useState<'graph' | 'cards'>('graph')
    const [selectedBlueprint, setSelectedBlueprint] = useState<{ name: string, icon: any, iconColor: string } | null>(null)

    // Create nodes with onExpand callbacks
    const nodesWithHandlers = initialNodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onExpand: () => setSelectedBlueprint({
                name: node.data.label,
                icon: node.data.icon,
                iconColor: node.data.iconColor
            })
        }
    }))

    const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithHandlers)
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* Left side - Select dropdown */}
                    <div className="flex items-center gap-2">
                        <div className="relative w-48">
                            <select className="w-full px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
                                <option>Select</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
                            <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
                            <X className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                            </svg>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            <Plus className="h-4 w-4" />
                            Blueprint
                        </button>
                        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <button
                                onClick={() => setViewMode('graph')}
                                className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'graph'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Network className="h-4 w-4" />
                            </button>
                            <div className="w-px h-6 bg-gray-300" />
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 py-1.5 text-sm font-medium ${viewMode === 'cards'
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0">
                {viewMode === 'graph' ? (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-left"
                        className="bg-white"
                    >
                        <Controls />
                        <Background color="#e5e7eb" gap={16} size={0.5} />
                    </ReactFlow>
                ) : (
                    <div className="h-full flex flex-col bg-white">
                        {/* Search bar */}
                        <div className="px-6 py-4 border-b flex-shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search blueprints"
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Cards Grid with proper scrolling */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 gap-4">
                                {initialNodes.map((node) => {
                                    const IconComponent = node.data.icon || Box
                                    const iconColor = node.data.iconColor || '#ec4899'

                                    return (
                                        <div
                                            key={node.id}
                                            className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative group"
                                            onClick={() => setSelectedBlueprint({
                                                name: node.data.label,
                                                icon: node.data.icon,
                                                iconColor: node.data.iconColor
                                            })}
                                        >
                                            {/* Card Header - Action buttons */}
                                            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button className="p-1 hover:bg-gray-100 rounded">
                                                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                                        <circle cx="12" cy="12" r="1.5" />
                                                        <circle cx="12" cy="6" r="1.5" />
                                                        <circle cx="12" cy="18" r="1.5" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Large Icon */}
                                            <div className="pt-12 pb-6 flex justify-center">
                                                <div
                                                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: iconColor + '15' }}
                                                >
                                                    <IconComponent
                                                        className="w-10 h-10"
                                                        style={{ color: iconColor }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="px-6 pb-6 text-center">
                                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                                    {node.data.label}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-6">
                                                    This blueprint represents a {node.data.label}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-2">
                                                        {/* Related icons */}
                                                        <div
                                                            className="w-6 h-6 rounded flex items-center justify-center"
                                                            style={{ backgroundColor: '#ec489920' }}
                                                        >
                                                            <Box className="w-3.5 h-3.5" style={{ color: '#ec4899' }} />
                                                        </div>
                                                        {node.id !== 'scorecard' && node.id !== 'repository' && (
                                                            <div
                                                                className="w-6 h-6 rounded flex items-center justify-center"
                                                                style={{ backgroundColor: '#3b82f620' }}
                                                            >
                                                                <Zap className="w-3.5 h-3.5" style={{ color: '#3b82f6' }} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Manage button */}
                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors border border-gray-200">
                                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        Manage
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Blueprint Detail Modal */}
            <BlueprintDetailModal
                isOpen={!!selectedBlueprint}
                onClose={() => setSelectedBlueprint(null)}
                blueprint={selectedBlueprint}
            />
        </div>
    )
}
