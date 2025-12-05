import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import catalogPageService from '../../services/catalogPage.service';
import { blueprintApi } from '../../services/blueprint.service';
import { CatalogFolder, CatalogPage } from '../../types/catalogPage';
import { Blueprint } from '../../types/blueprint';

interface PageEditModalProps {
    page: CatalogPage;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PageEditModal({ page, onClose, onSuccess }: PageEditModalProps) {
    const [title, setTitle] = useState(page.title);
    const [icon, setIcon] = useState(page.icon || '');
    const [description, setDescription] = useState(page.description || '');
    const [blueprintId, setBlueprintId] = useState(page.blueprintId);
    const [folderId, setFolderId] = useState(page.folderId || '');
    const [layout, setLayout] = useState<'table' | 'grid' | 'list'>(page.layout);
    const [isPublic, setIsPublic] = useState(page.isPublic);
    const [folders, setFolders] = useState<CatalogFolder[]>([]);
    const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

        setLoading(true);
        setError('');

        try {
            await catalogPageService.updatePage(page.id, {
                title: title.trim(),
                icon: icon || undefined,
                description: description.trim() || undefined,
                blueprintId,
                folderId: folderId || undefined,
                layout,
                isPublic
            });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update page');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Page</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon (emoji)
                        </label>
                        <input
                            type="text"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={2}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Blueprint *
                        </label>
                        <select
                            value={blueprintId}
                            onChange={(e) => setBlueprintId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            {blueprints.map(blueprint => (
                                <option key={blueprint.identifier} value={blueprint.identifier}>
                                    {blueprint.icon} {blueprint.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Folder
                        </label>
                        <select
                            value={folderId}
                            onChange={(e) => setFolderId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Root (no folder)</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.icon} {folder.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Layout
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['table', 'grid', 'list'] as const).map(layoutType => (
                                <button
                                    key={layoutType}
                                    type="button"
                                    onClick={() => setLayout(layoutType)}
                                    className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                                        layout === layoutType
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                    }`}
                                >
                                    {layoutType}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
                            Make this page public
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
