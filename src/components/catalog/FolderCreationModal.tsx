import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import catalogPageService from '../../services/catalogPage.service';
import { CatalogFolder } from '../../types/catalogPage';

interface FolderCreationModalProps {
    onClose: () => void;
    onSuccess: () => void;
    parentId?: string;
}

export default function FolderCreationModal({ onClose, onSuccess, parentId }: FolderCreationModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedParentId, setSelectedParentId] = useState(parentId || '');
    const [folders, setFolders] = useState<CatalogFolder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        try {
            const res = await catalogPageService.getAllFolders();
            if (res.ok) setFolders(res.folders);
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
            await catalogPageService.createFolder({
                title: title.trim(),
                description: description.trim() || undefined,
                parentId: selectedParentId || undefined
            });

            onSuccess();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create folder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter folder title"
                            required
                        />
                    </div>



                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter folder description"
                            rows={3}
                        />
                    </div>

                    {/* Parent Folder */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parent Folder (optional)
                        </label>
                        <select
                            value={selectedParentId}
                            onChange={(e) => setSelectedParentId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Root (no parent)</option>
                            {folders.map(folder => (
                                <option key={folder.id} value={folder.id}>
                                    {folder.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
