import React, { useState } from 'react';
import { X, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import { Blueprint, BlueprintProperty } from '@/types/blueprint';
import { PropertyCreationModal } from './PropertyCreationModal';
import { RelationCreationModal } from './RelationCreationModal';

interface Props {
    blueprint: Blueprint;
    availableBlueprints: Blueprint[];
    onClose: () => void;
    onUpdate: (blueprint: Blueprint) => void;
    onAddProperty: (property: Omit<BlueprintProperty, 'id' | 'blueprintId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onAddRelation: (relation: { title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => Promise<void>;
    onDeleteProperty: (propertyId: string) => Promise<void>;
}

export const BlueprintEditorModal: React.FC<Props> = ({ blueprint, availableBlueprints, onClose, onAddProperty, onAddRelation, onDeleteProperty }) => {
    const [activeTab, setActiveTab] = useState('Properties');
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleAddProperty = async (property: BlueprintProperty) => {
        const { id, blueprintId, createdAt, updatedAt, ...data } = property;
        await onAddProperty(data);
        setIsPropertyModalOpen(false);
    };

    const handleAddRelation = async (relation: { title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => {
        await onAddRelation(relation);
        setIsRelationModalOpen(false);
    };

    const handleDeleteProperty = async (propertyId: string) => {
        await onDeleteProperty(propertyId);
        setOpenDropdown(null);
    };

    // Get color for property type badge
    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'String': 'bg-orange-50 text-orange-600 border-orange-200',
            'Number': 'bg-blue-50 text-blue-600 border-blue-200',
            'Boolean': 'bg-purple-50 text-purple-600 border-purple-200',
            'Enum': 'bg-pink-50 text-pink-600 border-pink-200',
            'Markdown': 'bg-red-50 text-red-600 border-red-200',
            'Url': 'bg-cyan-50 text-cyan-600 border-cyan-200',
            'Relation': 'bg-indigo-50 text-indigo-600 border-indigo-200',
        };
        return colors[type] || 'bg-gray-50 text-gray-600 border-gray-200';
    };

    // Get icon for property type
    const getPropertyIcon = (title: string) => {
        const icons: Record<string, string> = {
            'Tier': '🎯',
            'README': '📄',
            'Language': '💎',
            'Slack': '💬',
            'URL': '🔗',
        };
        return icons[title] || '📝';
    };

    // Separate relations from regular properties
    const regularProperties = blueprint.properties.filter(p => p.type !== 'Relation');
    const relations = blueprint.properties.filter(p => p.type === 'Relation');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        <span>Blueprint schema</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Blueprint Title */}
                <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl">{blueprint.icon || '📦'}</div>
                        <h2 className="text-2xl font-bold text-gray-900">{blueprint.title}</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 px-6 border-b border-gray-200 flex-shrink-0">
                    {['Properties', 'Actions', 'Automations', 'Scorecards'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                ? 'text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {activeTab === 'Properties' && (
                        <div className="space-y-4">
                            {/* Regular Properties */}
                            <div className="space-y-2">
                                {regularProperties.map(prop => (
                                    <div key={prop.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors relative">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{getPropertyIcon(prop.title)}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">{prop.title}</span>
                                                {prop.required && <span className="text-red-500 text-xs">*</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-medium border rounded ${getTypeColor(prop.type)}`}>
                                                {prop.type}
                                            </span>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === prop.id ? null : prop.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {openDropdown === prop.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenDropdown(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                                            <button
                                                                onClick={() => handleDeleteProperty(prop.id)}
                                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsPropertyModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors w-full"
                            >
                                <Plus className="w-4 h-4" />
                                New property
                            </button>

                            {/* Relations Section */}
                            {relations.length > 0 && (
                                <div className="pt-4 space-y-2">
                                    {relations.map(rel => {
                                        const targetId = rel.defaultValue;
                                        const targetBlueprint = availableBlueprints.find(b => b.id === targetId);

                                        return (
                                            <div key={rel.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors relative">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🔗</span>
                                                    <span className="text-sm font-medium text-gray-700">{rel.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 rounded">
                                                        {targetBlueprint?.title || 'Unknown'}
                                                    </span>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenDropdown(openDropdown === rel.id ? null : rel.id)}
                                                            className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                        {openDropdown === rel.id && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-10"
                                                                    onClick={() => setOpenDropdown(null)}
                                                                />
                                                                <div className="absolute right-0 top-full mt-1 z-20 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                                                                    <button
                                                                        onClick={() => handleDeleteProperty(rel.id)}
                                                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={() => setIsRelationModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors w-full"
                            >
                                <Plus className="w-4 h-4" />
                                New relation
                            </button>
                        </div>
                    )}

                    {activeTab === 'Actions' && (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            Actions coming soon
                        </div>
                    )}

                    {activeTab === 'Automations' && (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            Automations coming soon
                        </div>
                    )}

                    {activeTab === 'Scorecards' && (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            Scorecards coming soon
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-200 flex-shrink-0">
                    <p className="text-xs text-gray-400 text-center">
                        Blueprint updated {blueprint.updatedAt ? new Date(blueprint.updatedAt).toLocaleString() : 'recently'}
                    </p>
                </div>
            </div>

            {/* Modals */}
            {isPropertyModalOpen && (
                <PropertyCreationModal
                    onClose={() => setIsPropertyModalOpen(false)}
                    onCreate={handleAddProperty}
                />
            )}

            {isRelationModalOpen && (
                <RelationCreationModal
                    currentBlueprint={blueprint}
                    availableBlueprints={availableBlueprints}
                    onClose={() => setIsRelationModalOpen(false)}
                    onCreate={handleAddRelation}
                />
            )}
        </div>
    );
};
