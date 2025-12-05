import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Blueprint } from '@/types/blueprint';

interface Props {
    relation?: { id: string; title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string };
    currentBlueprint: Blueprint;
    availableBlueprints: Blueprint[];
    onClose: () => void;
    onCreate?: (relation: { title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => void;
    onUpdate?: (relation: { id: string; title: string; identifier: string; targetBlueprintId: string; required: boolean; limit: string; description?: string }) => void;
}

export const RelationCreationModal: React.FC<Props> = ({ relation, currentBlueprint, availableBlueprints, onClose, onCreate, onUpdate }) => {
    const isEditMode = !!relation;
    const [title, setTitle] = useState(relation?.title || '');
    const [identifier, setIdentifier] = useState(relation?.identifier || '');
    const [autoGenerate, setAutoGenerate] = useState(!relation);
    const [targetBlueprintId, setTargetBlueprintId] = useState(relation?.targetBlueprintId || '');
    const [limit, setLimit] = useState(relation?.limit || '1 entity');
    const [required, setRequired] = useState(relation?.required ? 'True' : 'False');
    const [description, setDescription] = useState(relation?.description || '');

    const selectableBlueprints = availableBlueprints.filter(b => b.identifier !== currentBlueprint.identifier);

    useEffect(() => {
        if (autoGenerate && !isEditMode) {
            setIdentifier(title.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
        }
    }, [title, autoGenerate, isEditMode]);

    const handleSubmit = () => {
        if (!targetBlueprintId || !title || !identifier) return;
        const relationData = {
            id: relation?.id || '',
            title,
            identifier,
            targetBlueprintId,
            limit,
            required: required === 'True',
            description
        };

        if (isEditMode && onUpdate) {
            onUpdate(relationData);
        } else if (onCreate) {
            onCreate(relationData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[450px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
                    <h2 className="text-sm font-semibold text-gray-900">{isEditMode ? 'Edit relation' : 'New relation'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto">
                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-gray-700">Title</label>
                            <span className="text-red-500 text-xs">*</span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title"
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            autoFocus
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                                <label className="text-xs font-medium text-gray-700">Identifier</label>
                                <span className="text-red-500 text-xs">*</span>
                            </div>
                            {!isEditMode && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500">Autogenerate</span>
                                    <button
                                        onClick={() => setAutoGenerate(!autoGenerate)}
                                        className={`w-7 h-3.5 rounded-full relative transition-colors ${autoGenerate ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${autoGenerate ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => {
                                setIdentifier(e.target.value);
                                setAutoGenerate(false);
                            }}
                            disabled={autoGenerate || isEditMode}
                            className={`w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${(autoGenerate || isEditMode) ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-gray-700">Type</label>
                            <span className="text-red-500 text-xs">*</span>
                        </div>
                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-xs font-medium text-blue-700">Relation</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a description"
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-gray-700">Related to</label>
                            <span className="text-red-500 text-xs">*</span>
                        </div>
                        <div className="relative">
                            <select
                                value={targetBlueprintId}
                                onChange={(e) => setTargetBlueprintId(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Choose target blueprint</option>
                                {selectableBlueprints.map(blueprint => (
                                    <option key={blueprint.identifier} value={blueprint.identifier}>{blueprint.title}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-gray-700">Limit</label>
                            <span className="text-red-500 text-xs">*</span>
                        </div>
                        <div className="relative">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="1 entity">1 entity</option>
                                <option value="Many entities">Many entities</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1">
                            <label className="text-xs font-medium text-gray-700">Required</label>
                            <span className="text-red-500 text-xs">*</span>
                        </div>
                        <div className="relative">
                            <select
                                value={required}
                                onChange={(e) => setRequired(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="False">False</option>
                                <option value="True">True</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title || !identifier || !targetBlueprintId}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isEditMode ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};
