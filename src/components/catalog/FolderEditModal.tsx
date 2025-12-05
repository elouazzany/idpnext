import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import catalogPageService from '../../services/catalogPage.service';
import { CatalogFolder } from '../../types/catalogPage';

interface FolderEditModalProps {
    folder: CatalogFolder;
    onClose: () => void;
    onSuccess: () => void;
}

export default function FolderEditModal({ folder, onClose, onSuccess }: FolderEditModalProps) {
    const [title, setTitle] = useState(folder.title);
    const [icon, setIcon] = useState(folder.icon || '');
    const [description, setDescription] = useState(folder.description || '');
    const [parentId, setParentId] = useState(folder.parentId || '');
    const [folders, setFolders] = useState<CatalogFolder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            const res = await catalogPageService.getAllFolders();
            if (res.ok) {
                // Filter out current folder and its descendants to prevent circular references
                setFolders(res.folders.filter(f => f.id !== folder.id));
            }
        } catch (error) {
            console.error('Failed to load folders:', error);
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
            await catalogPageService.updateFolder(folder.id, {
                title: title.trim(),
                icon: icon || undefined,
                description: description.trim() || undefined,
                parentId: parentId || undefined
            });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update folder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Folder</h2>
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
                            Parent Folder
                        </label>
                        <select
                            value={parentId}
                            onChange={(e) => setParentId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Root (no parent)</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.icon} {f.title}
                                </option>
                            ))}
                        </select>
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
