import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { BlueprintProperty } from '@/types/blueprint';

interface Props {
    onClose: () => void;
    onCreate: (property: BlueprintProperty) => void;
}

const PROPERTY_TYPES = [
    { category: 'Essential', types: ['String', 'Number', 'Boolean', 'Object', 'Array', 'Enum', 'URL', 'Date & time'] },
    { category: 'Relations', types: ['Mirror', 'Relation'] },
    { category: 'Advanced', types: ['Calculation', 'Aggregation', 'Timer'] },
    { category: 'Embed', types: ['Embedded URL', 'Swagger UI', 'Markdown'] },
    { category: 'Users & Teams', types: ['Port Team', 'Port User'] },
];

export const PropertyCreationModal: React.FC<Props> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [autoGenerate, setAutoGenerate] = useState(true);
    const [type, setType] = useState('String');
    const [required, setRequired] = useState('False');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (autoGenerate) {
            setIdentifier(title.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
        }
    }, [title, autoGenerate]);

    const handleSubmit = () => {
        onCreate({
            id: crypto.randomUUID(),
            title,
            identifier,
            type,
            required: required === 'True',
            description
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">New property</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            autoFocus
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1">
                                <label className="text-sm font-medium text-gray-700">Identifier</label>
                                <span className="text-red-500">*</span>
                                <span className="text-gray-400 text-xs cursor-help" title="Unique identifier">ⓘ</span>
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
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <span className="text-red-500">*</span>
                        </div>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                {PROPERTY_TYPES.map(category => (
                                    <optgroup key={category.category} label={category.category}>
                                        {category.types.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Required</label>
                            <span className="text-red-500">*</span>
                            <span className="text-gray-400 text-xs cursor-help" title="Is this property required?">ⓘ</span>
                        </div>
                        <div className="relative">
                            <select
                                value={required}
                                onChange={(e) => setRequired(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="False">False</option>
                                <option value="True">True</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <span className="text-gray-400 text-xs cursor-help" title="Description of the property">ⓘ</span>
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
        </div>
    );
};
