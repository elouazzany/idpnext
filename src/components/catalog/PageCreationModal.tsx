import React, { useState, useEffect } from 'react';
import { X, Info, Building2 } from 'lucide-react';
import catalogPageService from '../../services/catalogPage.service';
import { blueprintApi } from '../../services/blueprint.service';
import { CatalogFolder } from '../../types/catalogPage';
import { Blueprint } from '../../types/blueprint';
import { IconPickerModal } from '../datamodel/IconPickerModal';

interface PageCreationModalProps {
    onClose: () => void;
    onSuccess: () => void;
    folderId?: string;
}

export default function PageCreationModal({ onClose, onSuccess, folderId }: PageCreationModalProps) {
    const [title, setTitle] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [autoGenerateId, setAutoGenerateId] = useState(true);
    const [icon, setIcon] = useState('📄');
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [description, setDescription] = useState('');
    const [blueprintId, setBlueprintId] = useState('');
    const [excludedProperties, setExcludedProperties] = useState<string[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState(folderId || '');
    const [layout, setLayout] = useState<'table' | 'grid' | 'list'>('table');
    const [isPublic, setIsPublic] = useState(true);
    const [folders, setFolders] = useState<CatalogFolder[]>([]);
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-generate identifier from title
    useEffect(() => {
        if (autoGenerateId && title) {
            const generated = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setIdentifier(generated);
        }
    }, [title, autoGenerateId]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [foldersRes, blueprints] = await Promise.all([
                catalogPageService.getAllFolders(),
                blueprintApi.getAll()
            ]);

            if (foldersRes.ok) setFolders(foldersRes.folders);
            setBlueprints(blueprints);
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (!blueprintId) {
            setError('Blueprint is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await catalogPageService.createPage({
                title: title.trim(),
                icon: icon || undefined,
                description: description.trim() || undefined,
                blueprintId,
                folderId: selectedFolderId || undefined,
                layout,
                isPublic
            });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-700" />
                        <h2 className="text-base font-semibold text-gray-900">
                            New catalog page
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-6 space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Title<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Enter value here"
                                required
                            />
                        </div>

                        {/* Identifier */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    Identifier
                                    <Info className="h-3.5 w-3.5 text-gray-400" />
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>Autogenerate</span>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={autoGenerateId}
                                            onChange={(e) => setAutoGenerateId(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    </div>
                                </label>
                            </div>
                            <div className="bg-white px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500">
                                {identifier || 'auto-generated-id'}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                placeholder="Enter value here"
                                rows={3}
                            />
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Icon
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowIconPicker(true)}
                                className="w-14 h-10 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl flex items-center justify-center transition-colors"
                            >
                                {icon}
                            </button>
                        </div>

                        {/* Blueprint */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Blueprint<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={blueprintId}
                                onChange={(e) => setBlueprintId(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            >
                                <option value="">Choose a value</option>
                                {blueprints.map(blueprint => (
                                    <option key={blueprint.identifier} value={blueprint.identifier}>
                                        {blueprint.icon} {blueprint.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Excluded Properties */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Excluded Properties
                                </label>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <button
                                type="button"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-left text-gray-400"
                            >
                                Select
                            </button>
                        </div>

                        {/* Initial filters */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">
                                    Initial filters
                                </label>
                                <Info className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <button
                                type="button"
                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-600 flex items-center gap-1.5"
                            >
                                <span className="text-gray-400">=</span>
                                Filters
                            </button>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Icon Picker Modal */}
            {showIconPicker && (
                <IconPickerModal
                    selectedIcon={icon}
                    onSelect={(selectedIcon) => {
                        setIcon(selectedIcon);
                        setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                />
            )}
        </div>
    );
}
