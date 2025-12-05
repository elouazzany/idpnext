import React, { useState, useEffect } from 'react';
import { X, Code } from 'lucide-react';
import { Blueprint } from '@/types/blueprint';
import { JsonEditorModal } from './JsonEditorModal';
import { IconPickerModal } from './IconPickerModal';

interface Props {
    onClose: () => void;
    onCreate: (blueprint: Blueprint) => void;
}

export const BlueprintCreationModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [description, setDescription] = useState('');

    const [icon, setIcon] = useState('📦');
    const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    useEffect(() => {
        if (autoGenerate) {
            setIdentifier(title.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
        }
    }, [title, autoGenerate]);

    const handleSubmit = () => {
        onCreate({
            title,
            identifier,
            icon,
            description,
            schema: {
                properties: {},
                required: []
            },
            relations: {},
            mirrorProperties: {},
            calculationProperties: {},
            aggregationProperties: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        } as Blueprint);
    };

    const handleJsonSave = (data: any) => {
        if (data.title) setTitle(data.title);
        if (data.identifier) {
            setIdentifier(data.identifier);
            setAutoGenerate(false);
        }
        if (data.description) setDescription(data.description);
        if (data.icon) setIcon(data.icon);
    };

    const getCurrentJson = () => ({
        identifier,
        description,
        title,
        icon,
        schema: {
            properties: {
                language: {
                    type: "string",
                    icon: "Git",
                    title: "Language",
                    default: "Node",
                    enum: ["GO", "Python", "Node"]
                },
                url: {
                    type: "string",
                    title: "Github URL",
                    icon: "Github",
                    format: "url",
                    description: "the link to the repo in our github"
                }
            },
            required: []
        },
        mirrorProperties: {},
        calculationProperties: {},
        aggregationProperties: {},
        relations: {}
    });

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">New Blueprint</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsJsonEditorOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <Code className="w-3.5 h-3.5" />
                                Edit JSON
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Title</label>
                                <span className="text-red-500">*</span>
                                <span className="text-gray-400 text-xs cursor-help" title="The display name of the blueprint">ⓘ</span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. microservice"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                autoFocus
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1">
                                    <label className="text-sm font-medium text-gray-700">Identifier</label>
                                    <span className="text-red-500">*</span>
                                    <span className="text-gray-400 text-xs cursor-help" title="Unique identifier for API usage">ⓘ</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Autogenerate</span>
                                    <button
                                        onClick={() => setAutoGenerate(!autoGenerate)}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${autoGenerate ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoGenerate ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => {
                                    setIdentifier(e.target.value);
                                    setAutoGenerate(false);
                                }}
                                disabled={autoGenerate}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${autoGenerate ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
                            <button
                                type="button"
                                onClick={() => setIsIconPickerOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-2xl">{icon}</span>
                                <span className="text-sm text-gray-600">Change icon</span>
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <span className="text-gray-400 text-xs cursor-help" title="Brief description of what this blueprint represents">ⓘ</span>
                            </div>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!title || !identifier}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </div>

                {isIconPickerOpen && (
                    <IconPickerModal
                        selectedIcon={icon}
                        onSelect={(newIcon) => {
                            setIcon(newIcon);
                            setIsIconPickerOpen(false);
                        }}
                        onClose={() => setIsIconPickerOpen(false)}
                    />
                )}

                {
                    isJsonEditorOpen && (
                        <JsonEditorModal
                            initialValue={getCurrentJson()}
                            onClose={() => setIsJsonEditorOpen(false)}
                            onSave={handleJsonSave}
                        />
                    )
                }
            </div>
        </>
    );
};
