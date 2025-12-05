import { useState, useCallback, useEffect } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import ReactFlow, {
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
    Maximize2,
    Search,
    Trash2,
    Link2,
    Settings
} from 'lucide-react'
import { BlueprintCreationModal } from '../../components/datamodel/BlueprintCreationModal'
import { BlueprintEditorModal } from '../../components/datamodel/BlueprintEditorModal'
import { ConfirmDeleteModal } from '../../components/datamodel/ConfirmDeleteModal'
import { Blueprint } from '@/types/blueprint'
import { blueprintApi } from '@/services/blueprint.service'
import { useAuth } from '@/contexts/AuthContext'

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
                <div className="p-2 bg-pink-50 rounded-md flex items-center justify-center">
                    <span className="text-xl">{data.blueprint.icon || '📦'}</span>
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
    const queryClient = useQueryClient()
    const [viewMode, setViewMode] = useState<'graph' | 'cards'>('graph')
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false)
    const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null)
    const [blueprintToDelete, setBlueprintToDelete] = useState<Blueprint | null>(null)

    const { currentOrganization, currentTenant } = useAuth()

    // Fetch blueprints using React Query
    const { data: blueprints = [], isLoading } = useQuery({
        queryKey: ['blueprints', currentOrganization?.id, currentTenant?.id],
        queryFn: () => blueprintApi.getAll(),
        enabled: !!currentOrganization && !!currentTenant
    })

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    // Reconstruct nodes and edges when blueprints change
    useEffect(() => {

        // Convert to ReactFlow nodes
        const flowNodes = blueprints.map((blueprint, index) => ({
            id: blueprint.identifier,
            type: 'custom' as const,
            position: { x: 100 + (index % 3) * 300, y: 100 + Math.floor(index / 3) * 150 },
            data: {
                blueprint,
                onMaximize: () => setEditingBlueprint(blueprint)
            }
        }));

        setNodes(flowNodes);

        // Reconstruct edges from blueprint relations
        const relationEdges: Edge[] = [];
        blueprints.forEach((blueprint) => {
            if (blueprint.relations && typeof blueprint.relations === 'object') {
                Object.entries(blueprint.relations).forEach(([_relationId, relation]: [string, any]) => {
                    if (relation.target) {
                        relationEdges.push({
                            id: `${blueprint.identifier}-${relation.target}`,
                            source: blueprint.identifier,
                            target: relation.target,
                            type: 'default',
                            animated: false,
                        });
                    }
                });
            }
        });

        setEdges(relationEdges);
    }, [blueprints, setNodes, setEdges])

    const handleCreateBlueprint = async (blueprint: Blueprint) => {
        try {
            await blueprintApi.create({
                title: blueprint.title,
                identifier: blueprint.identifier,
                icon: blueprint.icon,
                description: blueprint.description
            });

            // Invalidate queries to refetch blueprints
            queryClient.invalidateQueries({ queryKey: ['blueprints'] });
            setIsCreationModalOpen(false);
        } catch (error) {
            console.error('Failed to create blueprint:', error);
        }
    }

    const handleUpdateBlueprint = async (updatedBlueprint: Blueprint) => {
        try {
            // Invalidate queries to refetch blueprints
            queryClient.invalidateQueries({ queryKey: ['blueprints'] });
            setNodes((nds) => nds.map(node => {
                if (node.id === updatedBlueprint.identifier) {
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

            // Persist to backend
            await blueprintApi.update(updatedBlueprint.identifier, updatedBlueprint)
        } catch (error) {
            console.error('Failed to update blueprint:', error)
            // Revert changes if needed (could re-fetch or use previous state)
            // For now, we'll just log the error as a full revert strategy is more complex
            alert('Failed to save changes to the server.')
        }
    }

    const handleAddProperty = async (property: any) => {
        console.log('[blueprintApi] Adding property:', property);
        if (!editingBlueprint) return

        // Extract identifier and required which are handled separately in the schema
        const { identifier, required, ...propertyFields } = property;

        try {
            const updatedSchema = {
                ...editingBlueprint.schema,
                properties: {
                    ...editingBlueprint.schema.properties,
                    [identifier]: propertyFields
                },
                required: required
                    ? [...(editingBlueprint.schema.required || []), identifier]
                    : editingBlueprint.schema.required
            }
            const updatedBlueprint = {
                ...editingBlueprint,
                schema: updatedSchema
            }
            console.log('[blueprintApi] Updating blueprint with identifier:', editingBlueprint.identifier);
            console.log('[blueprintApi] Blueprint data:', updatedBlueprint);
            await blueprintApi.update(editingBlueprint.identifier, updatedBlueprint)
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to add property:', error)
            throw error;
        }
    }

    const handleAddRelation = async (relation: { title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => {
        if (!editingBlueprint) return

        try {
            // Add relation to relations object
            const updatedRelations = {
                ...editingBlueprint.relations,
                [relation.identifier]: {
                    title: relation.title,
                    target: relation.targetBlueprintId,
                    required: relation.required,
                    many: relation.limit === 'Many entities'
                }
            }

            // Create edge in ReactFlow
            const newEdge: Edge = {
                id: `${editingBlueprint.identifier}-${relation.targetBlueprintId}-${relation.identifier}`,
                source: editingBlueprint.identifier,
                target: relation.targetBlueprintId,
                label: relation.title,
                type: 'default',
                animated: false
            }
            setEdges(eds => [...eds, newEdge])

            // Update the blueprint
            const updatedBlueprint = {
                ...editingBlueprint,
                relations: updatedRelations
            }
            await blueprintApi.update(editingBlueprint.identifier, updatedBlueprint)
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to add relation:', error)
        }
    }

    const handleDeleteProperty = async (propertyId: string) => {
        if (!editingBlueprint) return

        try {
            // Remove from schema properties
            const updatedProperties = { ...editingBlueprint.schema.properties }
            delete updatedProperties[propertyId]

            const updatedSchema = {
                ...editingBlueprint.schema,
                properties: updatedProperties,
                required: editingBlueprint.schema.required?.filter(r => r !== propertyId) || []
            }

            const updatedBlueprint = {
                ...editingBlueprint,
                schema: updatedSchema
            }
            await blueprintApi.update(editingBlueprint.identifier, updatedBlueprint)
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to delete property:', error)
        }
    }

    const handleUpdateProperty = async (propertyId: string, propertyData: any) => {
        if (!editingBlueprint) return

        try {
            // Update property in schema
            const updatedProperties = {
                ...editingBlueprint.schema.properties,
                [propertyId]: {
                    ...editingBlueprint.schema.properties[propertyId],
                    ...propertyData
                }
            }

            const updatedBlueprint = {
                ...editingBlueprint,
                schema: {
                    ...editingBlueprint.schema,
                    properties: updatedProperties
                }
            }
            await blueprintApi.update(editingBlueprint.identifier, updatedBlueprint)
            handleUpdateBlueprint(updatedBlueprint)
        } catch (error) {
            console.error('Failed to update property:', error)
            throw error;
        }
    }

    const handleDeleteBlueprint = async () => {
        console.log('[handleDeleteBlueprint] Called');
        if (!editingBlueprint) {
            console.log('[handleDeleteBlueprint] No editing blueprint');
            return;
        }

        console.log('[handleDeleteBlueprint] Deleting:', editingBlueprint.identifier, editingBlueprint.title);
        setBlueprintToDelete(editingBlueprint);
    }

    const confirmDelete = async () => {
        if (!blueprintToDelete) return;

        console.log('[confirmDelete] User confirmed, calling blueprintApi.delete');
        try {
            await blueprintApi.delete(blueprintToDelete.identifier);
            console.log('[confirmDelete] Delete successful, invalidating queries');
            queryClient.invalidateQueries({ queryKey: ['blueprints'] });
            setEditingBlueprint(null);
            setBlueprintToDelete(null);
            console.log('[confirmDelete] Done');
        } catch (error) {
            console.error('[confirmDelete] Error:', error);
            alert('Failed to delete blueprint: ' + (error as Error).message);
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
                    <div className="h-full overflow-y-auto bg-gray-50 p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
                            {blueprints.map((blueprint) => (
                                <div
                                    key={blueprint.identifier}
                                    className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full"
                                >
                                    {/* Large Icon Area */}
                                    <div className="bg-gradient-to-b from-gray-50 to-white p-6 flex items-center justify-center min-h-[120px] border-b border-gray-100 relative">
                                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
                                            {blueprint.icon || '📦'}
                                        </div>

                                        {/* Quick Actions Overlay */}
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBlueprintToDelete(blueprint);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Delete Blueprint"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4 flex-1">
                                            <h3 className="font-semibold text-gray-900 text-base mb-1">
                                                {blueprint.title}
                                            </h3>
                                            {blueprint.description ? (
                                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                    {blueprint.description}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">No description provided</p>
                                            )}
                                        </div>

                                        {/* Bottom Row */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            {/* Relations Count */}
                                            <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                                <Link2 className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">
                                                    {blueprint.relations && typeof blueprint.relations === 'object'
                                                        ? Object.keys(blueprint.relations).length
                                                        : 0} relations
                                                </span>
                                            </div>

                                            {/* Manage Button */}
                                            <button
                                                onClick={() => setEditingBlueprint(blueprint)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                                Manage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
                        onUpdateProperty={handleUpdateProperty}
                        onAddRelation={handleAddRelation}
                        onDeleteProperty={handleDeleteProperty}
                        onDeleteBlueprint={handleDeleteBlueprint}
                    />
                )}

                <ConfirmDeleteModal
                    isOpen={blueprintToDelete !== null}
                    title="Delete Blueprint"
                    message={`Are you sure you want to delete the blueprint "${blueprintToDelete?.title}"? This action cannot be undone.`}
                    confirmLabel="Delete Blueprint"
                    onConfirm={confirmDelete}
                    onCancel={() => setBlueprintToDelete(null)}
                />
            </div>
        </div>
    )
}
