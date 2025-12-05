import React, { useState, useEffect } from 'react';
import { Plus, Folder, FileText, MoreVertical, Edit, Trash2, Move } from 'lucide-react';
import catalogPageService from '../../services/catalogPage.service';
import { CatalogFolder, CatalogPage } from '../../types/catalogPage';
import FolderCreationModal from './FolderCreationModal';
import PageCreationModal from './PageCreationModal';
import FolderEditModal from './FolderEditModal';
import PageEditModal from './PageEditModal';

export default function CatalogManagementPage() {
    const [folders, setFolders] = useState<CatalogFolder[]>([]);
    const [pages, setPages] = useState<CatalogPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [showPageModal, setShowPageModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState<CatalogFolder | null>(null);
    const [editingPage, setEditingPage] = useState<CatalogPage | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [foldersRes, pagesRes] = await Promise.all([
                catalogPageService.getFolderTree(),
                catalogPageService.getAllPages()
            ]);

            if (foldersRes.ok) setFolders(foldersRes.tree);
            if (pagesRes.ok) setPages(pagesRes.pages);
        } catch (error) {
            console.error('Failed to load catalog data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFolder = async (id: string) => {
        if (!confirm('Are you sure you want to delete this folder?')) return;

        try {
            await catalogPageService.deleteFolder(id, false);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete folder');
        }
    };

    const handleDeletePage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this page?')) return;

        try {
            await catalogPageService.deletePage(id);
            loadData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete page');
        }
    };

    const renderFolder = (folder: CatalogFolder, level: number = 0) => {
        const indent = level * 24;

        return (
            <div key={folder.id}>
                <div
                    className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${
                        selectedFolder === folder.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    style={{ marginLeft: `${indent}px` }}
                    onClick={() => setSelectedFolder(folder.id)}
                >
                    <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-gray-500" />
                        <div>
                            <div className="flex items-center gap-2">
                                {folder.icon && <span>{folder.icon}</span>}
                                <span className="font-medium text-gray-900">{folder.title}</span>
                            </div>
                            {folder.description && (
                                <p className="text-sm text-gray-500 mt-1">{folder.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingFolder(folder);
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Render child folders */}
                {folder.children && folder.children.map(child => renderFolder(child, level + 1))}

                {/* Render pages in this folder */}
                {folder.pages && folder.pages.map(page => (
                    <div
                        key={page.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg ml-6"
                        style={{ marginLeft: `${indent + 24}px` }}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="flex items-center gap-2">
                                    {page.icon && <span>{page.icon}</span>}
                                    <span className="text-gray-900">{page.title}</span>
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                        {page.layout}
                                    </span>
                                </div>
                                {page.description && (
                                    <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEditingPage(page)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeletePage(page.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Get pages without a folder (root pages)
    const rootPages = pages.filter(page => !page.folderId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
                        <p className="text-gray-600 mt-2">Organize your catalog with folders and pages</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFolderModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            <Folder className="w-5 h-5" />
                            New Folder
                        </button>
                        <button
                            onClick={() => setShowPageModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="w-5 h-5" />
                            New Page
                        </button>
                    </div>
                </div>

                {/* Catalog Tree */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Catalog Structure</h2>

                        {folders.length === 0 && rootPages.length === 0 ? (
                            <div className="text-center py-12">
                                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 mb-4">No folders or pages yet</p>
                                <button
                                    onClick={() => setShowFolderModal(true)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Create your first folder
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {/* Render folders with their nested structure */}
                                {folders.map(folder => renderFolder(folder))}

                                {/* Render root pages (pages without a folder) */}
                                {rootPages.map(page => (
                                    <div
                                        key={page.id}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {page.icon && <span>{page.icon}</span>}
                                                    <span className="text-gray-900">{page.title}</span>
                                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                        {page.layout}
                                                    </span>
                                                </div>
                                                {page.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingPage(page)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePage(page.id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showFolderModal && (
                <FolderCreationModal
                    onClose={() => setShowFolderModal(false)}
                    onSuccess={() => {
                        setShowFolderModal(false);
                        loadData();
                    }}
                    parentId={selectedFolder || undefined}
                />
            )}

            {showPageModal && (
                <PageCreationModal
                    onClose={() => setShowPageModal(false)}
                    onSuccess={() => {
                        setShowPageModal(false);
                        loadData();
                    }}
                    folderId={selectedFolder || undefined}
                />
            )}

            {editingFolder && (
                <FolderEditModal
                    folder={editingFolder}
                    onClose={() => setEditingFolder(null)}
                    onSuccess={() => {
                        setEditingFolder(null);
                        loadData();
                    }}
                />
            )}

            {editingPage && (
                <PageEditModal
                    page={editingPage}
                    onClose={() => setEditingPage(null)}
                    onSuccess={() => {
                        setEditingPage(null);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}
