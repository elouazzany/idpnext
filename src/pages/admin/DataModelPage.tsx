import { useState, useCallback, useEffect } from 'react'
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
    Maximize2,
    Search
} from 'lucide-react'
import { BlueprintCreationModal } from '../../components/datamodel/BlueprintCreationModal'
import { BlueprintEditorModal } from '../../components/datamodel/BlueprintEditorModal'
import { Blueprint, BlueprintProperty } from '@/types/blueprint'
import { blueprintApi } from '@/services/blueprint.service'

interface CustomNodeData {
    blueprint: Blueprint
    onMaximize: () => void
}

// Custom Node Component matching the design
function CustomNode({ data }: NodeProps<CustomNodeData>) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 flex items-center justify-between w-[250px] hover:shadow-md transition-shadow group">
            <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-300" />

            <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-50 rounded-md">
                    <Box className="w-5 h-5 text-pink-500" />
                </div>
                <span className="font-medium text-gray-900">{data.blueprint.title}</span>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    data.onMaximize()
                }}
                className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Maximize2 className="w-4 h-4" />
            </button>

            <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-300" />
        </div>
    )
}

const nodeTypes = {
    custom: CustomNode,
}

const initialEdges: Edge[] = []

export function DataModelPage() {
    const [viewMode, setViewMode] = useState<'graph' | 'cards'>('graph')
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)
    const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null)
    const [blueprints, setBlueprints] = useState<Blueprint[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    // Fetch blueprints on mount and reconstruct edges from relations
    useEffect(() => {
        const loadBlueprints = async () => {
            try {
                const data = await blueprintApi.getAll()
                setBlueprints(data)

                // Convert to ReactFlow nodes
                const flowNodes = data.map((blueprint, index) => ({
                    id: blueprint.id,
                    type: 'custom' as const,
                    position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 150 },
                    data: {
                        blueprint,
                        onMaximize: () => setEditingBlueprint(blueprint)
                    }
                }))
                setNodes(flowNodes)

                // Rebuild edges from relation properties
                const relationEdges: Edge[] = []
                data.forEach(blueprint => {
                    blueprint.properties.forEach(prop => {
                        if (prop.type === 'Relation' && prop.defaultValue) {
                            relationEdges.push({
                                id: `${blueprint.id}-${prop.defaultValue}-${prop.id}`,
                                source: blueprint.id,
                                target: prop.defaultValue,
                                label: prop.title,
                                type: 'default',
                                animated: false
                            })
                        }
                    })
                })
                setEdges(relationEdges)
            } catch (error) {
                console.error('Failed to load blueprints:', error)
            } finally {
                setIsLoading(false)
            }
        }
        loadBlueprints()
    }, [setNodes, setEdges])

    const handleCreateBlueprint = async (blueprint: Blueprint) => {
        try {
            const created = await blueprintApi.create({
                title: blueprint.title,
                identifier: blueprint.identifier,
                icon: blueprint.icon,
                description: blueprint.description
            })

            setBlueprints(prev => [...prev, created])

            const newNode: Node<CustomNodeData> = {
                id: created.id,
                type: 'custom',
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                data: {
                    blueprint: created,
                    onMaximize: () => setEditingBlueprint(created)
                }
            }
            setNodes((nds) => [...nds, newNode])
            setIsCreationModalOpen(false)
        } catch (error) {
            console.error('Failed to create blueprint:', error)
        }
    }

    const handleUpdateBlueprint = (updatedBlueprint: Blueprint) => {
        setBlueprints(prev => prev.map(b => b.id === updatedBlueprint.id ? updatedBlueprint : b))
        setNodes((nds) => nds.map(node => {
            if (node.id === updatedBlueprint.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        blueprint: updatedBlueprint,
                        onMaximize: () => setEditingBlueprint(updatedBlueprint)
                    }
                }
            }
            return node
        }))
        setEditingBlueprint(updatedBlueprint)
    }

    const handleAddProperty = async (property: Omit<BlueprintProperty, 'id' | 'blueprintId' | 'createdAt' | 'updatedAt'>) => {
        if (!editingBlueprint) return

        try {
            const createdProperty = await blueprintApi.addProperty(editingBlueprint.id, property)
            const updatedBlueprint = {
                ...editingBlueprint,
                properties: [...editingBlueprint.properties, createdProperty]
            }
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to add property:', error)
        }
    }

    const handleAddRelation = async (relation: { title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => {
        if (!editingBlueprint) return

        try {
            // Add relation as a property
            const createdProperty = await blueprintApi.addProperty(editingBlueprint.id, {
                title: relation.title,
                identifier: relation.identifier,
                type: 'Relation',
                required: relation.required,
                description: `${relation.description || ''} | Limit: ${relation.limit}`,
                defaultValue: relation.targetBlueprintId // Store target blueprint ID
            })

            // Create edge in ReactFlow
            const newEdge: Edge = {
                id: `${editingBlueprint.id}-${relation.targetBlueprintId}-${createdProperty.id}`,
                source: editingBlueprint.id,
                target: relation.targetBlueprintId,
                label: relation.title,
                type: 'default',
                animated: false
            }
            setEdges(eds => [...eds, newEdge])

            // Refresh the blueprint to show the new property
            const updatedBlueprint = await blueprintApi.getById(editingBlueprint.id)
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to add relation:', error)
        }
    }

    const handleDeleteProperty = async (propertyId: string) => {
        if (!editingBlueprint) return

        try {
            // Get the property to check if it's a relation
            const property = editingBlueprint.properties.find(p => p.id === propertyId)

            // Delete the property
            await blueprintApi.deleteProperty(propertyId)

            // If it's a relation, remove the edge from the graph
            if (property && property.type === 'Relation') {
                setEdges(eds => eds.filter(edge =>
                    !(edge.source === editingBlueprint.id && edge.id.includes(propertyId))
                ))
            }

            // Update the blueprint
            const updatedBlueprint = {
                ...editingBlueprint,
                properties: editingBlueprint.properties.filter(p => p.id !== propertyId)
            }
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to delete property:', error)
        }
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full">Loading...</div>
    }

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
                                <Search className="h-4 w-4 text-gray-400" />
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
                        <button
                            onClick={() => setIsCreationModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                        >
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
            <div className="flex-1 min-h-0 relative">
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
                        className="bg-gray-50"
                    >
                        <Controls />
                        <Background color="#e5e7eb" gap={16} size={0.5} />
                    </ReactFlow>
                ) : (
                    <div className="p-6 grid grid-cols-3 gap-4 overflow-y-auto h-full bg-gray-50">
                        {blueprints.map((blueprint) => (
                            <div
                                key={blueprint.id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setEditingBlueprint(blueprint)}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pink-50 rounded-md">
                                        <Box className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{blueprint.title}</h3>
                                        <p className="text-xs text-gray-500 font-mono">{blueprint.identifier}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{blueprint.description || 'No description'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {isCreationModalOpen && (
                <BlueprintCreationModal
                    onClose={() => setIsCreationModalOpen(false)}
                    onCreate={handleCreateBlueprint}
                />
            )}

            {editingBlueprint && (
                <BlueprintEditorModal
                    blueprint={editingBlueprint}
                    availableBlueprints={blueprints}
                    onClose={() => setEditingBlueprint(null)}
                    onUpdate={handleUpdateBlueprint}
                    onAddProperty={handleAddProperty}
                    onAddRelation={handleAddRelation}
                    onDeleteProperty={handleDeleteProperty}
                />
            )}
        </div>
    )
}
