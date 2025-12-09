import { useState, useCallback, useEffect, useMemo } from 'react'
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
    EyeOff,
    Plus,
    Grid3x3,
    Network,
    Maximize2,
    Trash2,
    Link2,
    Settings,
    ChevronDown,
    Search,
    Check
} from 'lucide-react'
import { clsx } from 'clsx'
import * as Popover from '@radix-ui/react-popover'
import { BlueprintCreationModal } from '../../components/datamodel/BlueprintCreationModal'
import { BlueprintEditorModal } from '../../components/datamodel/BlueprintEditorModal'
import { ConfirmDeleteModal } from '../../components/datamodel/ConfirmDeleteModal'
import { IconDisplay } from '../../components/IconDisplay'
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
                    <IconDisplay name={data.blueprint.icon || '📦'} className="w-6 h-6 text-pink-600" />
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
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [eyeSearchQuery, setEyeSearchQuery] = useState('')
    const [cardSearchQuery, setCardSearchQuery] = useState('')
    const [isEyeOpen, setIsEyeOpen] = useState(false)
    const [hiddenBlueprintIds, setHiddenBlueprintIds] = useState<Set<string>>(new Set())
    const [editingBlueprint, setEditingBlueprint] = useState<Blueprint | null>(null)
    const [blueprintToDelete, setBlueprintToDelete] = useState<Blueprint | null>(null)

    const { currentOrganization, currentTenant } = useAuth()

    // Fetch blueprints using React Query
    const { data: blueprints = [], isLoading } = useQuery({
        queryKey: ['blueprints', currentOrganization?.id, currentTenant?.id],
        queryFn: () => blueprintApi.getAll(),
        enabled: !!currentOrganization && !!currentTenant,
        // Prevent unnecessary re-renders during drag operations
        refetchOnWindowFocus: false,
        staleTime: 1000,
    })

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    )

    // Create a stable serialized version of blueprints to detect real changes
    const blueprintsHash = useMemo(() => {
        return JSON.stringify(blueprints.map(b => ({
            id: b.identifier,
            relations: b.relations
        })));
    }, [blueprints])

    // Memoize edges based on blueprint relations only
    const computedEdges = useMemo(() => {
        const relationEdges: Edge[] = [];
        blueprints.forEach((blueprint) => {
            if (hiddenBlueprintIds.has(blueprint.identifier)) return;

            if (blueprint.relations && typeof blueprint.relations === 'object') {
                Object.entries(blueprint.relations).forEach(([relationId, relation]: [string, any]) => {
                    if (relation.target && !hiddenBlueprintIds.has(relation.target)) {
                        const edgeId = `${blueprint.identifier}-${relation.target}-${relationId}`;
                        relationEdges.push({
                            id: edgeId,
                            source: blueprint.identifier,
                            target: relation.target,
                            type: 'default',
                            animated: false,
                            label: relation.title,
                        });
                    }
                });
            }
        });
        return relationEdges;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blueprintsHash, hiddenBlueprintIds])

    // Update edges only when computed edges change
    useEffect(() => {
        setEdges(computedEdges);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [computedEdges])

    // Reconstruct nodes when blueprints change
    useEffect(() => {
        console.log('[DataModelPage] Blueprints updated, syncing graph nodes', blueprints.length);

        setNodes((currentNodes) => {
            return blueprints
                .filter(b => !hiddenBlueprintIds.has(b.identifier))
                .map((blueprint, index) => {
                    const existingNode = currentNodes.find((n) => n.id === blueprint.identifier);

                    // If it exists, keep its position. If not, assign initial position.
                    return {
                        id: blueprint.identifier,
                        type: 'custom' as const,
                        position: existingNode ? existingNode.position : {
                            x: 100 + (index % 3) * 300,
                            y: 100 + Math.floor(index / 3) * 150
                        },
                        data: {
                            blueprint,
                            onMaximize: () => setEditingBlueprint(blueprint)
                        },
                    };
                });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blueprintsHash, hiddenBlueprintIds])

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

            // Update the blueprint - edges will be automatically created by the useEffect
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
                    {/* Left side - Select dropdown or Search */}
                    <div className="flex items-center gap-2">
                        {viewMode === 'graph' ? (
                            <Popover.Root open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                                <Popover.Trigger asChild>
                                    <button
                                        className="flex items-center justify-between w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left text-gray-700"
                                    >
                                        <span className="truncate">Select Blueprint...</span>
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content
                                        className="z-50 w-64 rounded-lg bg-white p-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 slide-in-from-top-2"
                                        align="start"
                                        sideOffset={4}
                                    >
                                        <div className="p-2 border-b border-gray-100">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search blueprints..."
                                                    className="w-full pl-8 pr-2 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Blueprints
                                            </div>
                                            {blueprints.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                                <div className="px-2 py-3 text-sm text-gray-500 text-center italic">
                                                    No blueprints found
                                                </div>
                                            ) : (
                                                <div className="space-y-0.5">
                                                    {blueprints
                                                        .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                                        .map((blueprint) => (
                                                            <button
                                                                key={blueprint.identifier}
                                                                onClick={() => {
                                                                    setEditingBlueprint(blueprint);
                                                                    setIsSelectOpen(false);
                                                                    setSearchQuery('');
                                                                }}
                                                                className="flex w-full items-center gap-3 px-2 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-100 transition-colors group"
                                                            >
                                                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-50 rounded group-hover:bg-white border border-transparent group-hover:border-gray-200 transition-colors">
                                                                    <IconDisplay name={blueprint.icon || 'box'} className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                                <span className="truncate font-medium flex-1 text-left">
                                                                    {blueprint.title}
                                                                </span>
                                                            </button>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        ) : (
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={cardSearchQuery}
                                    onChange={(e) => setCardSearchQuery(e.target.value)}
                                    placeholder="Search blueprints..."
                                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center gap-2">
                        {viewMode === 'graph' && (
                            <Popover.Root open={isEyeOpen} onOpenChange={setIsEyeOpen}>
                                <Popover.Trigger asChild>
                                    <button className={clsx(
                                        "p-1.5 rounded-md transition-colors",
                                        isEyeOpen ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"
                                    )}>
                                        <EyeOff className="h-4 w-4" />
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content
                                        className="z-50 w-72 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 slide-in-from-top-2"
                                        align="end"
                                        sideOffset={4}
                                    >
                                        <div className="p-3 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm text-gray-900">Hide Blueprints</span>
                                                <button
                                                    onClick={() => {
                                                        if (hiddenBlueprintIds.size === blueprints.length) {
                                                            setHiddenBlueprintIds(new Set());
                                                        } else {
                                                            setHiddenBlueprintIds(new Set(blueprints.map(b => b.identifier)));
                                                        }
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {hiddenBlueprintIds.size === blueprints.length ? 'Show all' : 'Hide all'}
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={eyeSearchQuery}
                                                    onChange={(e) => setEyeSearchQuery(e.target.value)}
                                                    placeholder="Search"
                                                    className="w-full pl-8 pr-2 py-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                                                <span>Shown</span>
                                            </div>
                                            <div className="space-y-0.5">
                                                {blueprints
                                                    .filter(b => b.title.toLowerCase().includes(eyeSearchQuery.toLowerCase()))
                                                    .map((blueprint) => {
                                                        const isHidden = hiddenBlueprintIds.has(blueprint.identifier);
                                                        return (
                                                            <div
                                                                key={blueprint.identifier}
                                                                className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 group"
                                                            >
                                                                <div className="flex items-center gap-3 overflow-hidden">
                                                                    <IconDisplay name={blueprint.icon || 'box'} className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                                    <span className="text-sm text-gray-700 truncate font-medium">
                                                                        {blueprint.title}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        const newHidden = new Set(hiddenBlueprintIds);
                                                                        if (isHidden) {
                                                                            newHidden.delete(blueprint.identifier);
                                                                        } else {
                                                                            newHidden.add(blueprint.identifier);
                                                                        }
                                                                        setHiddenBlueprintIds(newHidden);
                                                                    }}
                                                                    className={clsx(
                                                                        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                                        !isHidden ? "bg-green-400" : "bg-gray-200"
                                                                    )}
                                                                >
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className={clsx(
                                                                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center",
                                                                            !isHidden ? "translate-x-4" : "translate-x-0"
                                                                        )}
                                                                    >
                                                                        {!isHidden && <Check className="w-2.5 h-2.5 text-green-500" strokeWidth={3} />}
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        )
                                                    })}
                                            </div>
                                            {blueprints.filter(b => b.title.toLowerCase().includes(eyeSearchQuery.toLowerCase())).length === 0 && (
                                                <div className="px-2 py-4 text-center text-xs text-gray-500 italic">
                                                    No blueprints found
                                                </div>
                                            )}
                                        </div>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        )}    <button
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
                        fitViewOptions={{ padding: 0.2 }}
                        attributionPosition="bottom-left"
                        className="bg-gray-50"
                        edgesUpdatable={false}
                        edgesFocusable={false}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        elementsSelectable={true}
                        deleteKeyCode={null}
                        multiSelectionKeyCode={null}
                        panOnDrag={true}
                        zoomOnScroll={true}
                        preventScrolling={true}
                    >
                        <Controls />
                        <Background color="#e5e7eb" gap={16} size={0.5} />
                    </ReactFlow>
                ) : (
                    <div className="h-full overflow-y-auto bg-gray-50 p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto">
                            {blueprints
                                .filter(b => b.title.toLowerCase().includes(cardSearchQuery.toLowerCase()))
                                .map((blueprint) => (
                                    <div
                                        key={blueprint.identifier}
                                        className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full"
                                    >
                                        {/* Large Icon Area */}
                                        <div className="bg-gradient-to-b from-gray-50 to-white p-6 flex items-center justify-center min-h-[120px] border-b border-gray-100 relative">
                                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <IconDisplay name={blueprint.icon || '📦'} className="w-8 h-8 text-gray-700" />
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
