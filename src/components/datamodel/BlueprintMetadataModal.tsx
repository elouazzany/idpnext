import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Blueprint } from '@/types/blueprint';
import { IconPickerModal } from './IconPickerModal';
import { IconDisplay } from '../../components/IconDisplay';

interface Props {
    blueprint: Blueprint;
    onClose: () => void;
    onSave: (data: Partial<Blueprint>) => void;
}

export const BlueprintMetadataModal: React.FC<Props> = ({ blueprint, onClose, onSave }) => {
    const [title, setTitle] = useState(blueprint.title);
    const [description, setDescription] = useState(blueprint.description || '');
    const [icon, setIcon] = useState(blueprint.icon || '📦');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    const handleSubmit = () => {
        onSave({
            title,
            description,
            icon
        });
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Edit Blueprint</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Title</label>
                                <span className="text-red-500">*</span>
                            </div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Identifier</label>
                            <input
                                type="text"
                                value={blueprint.identifier}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-500">Identifier cannot be changed after creation</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon</label>
                            <button
                                onClick={() => setIsIconPickerOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <IconDisplay name={icon} className="w-6 h-6 text-gray-700" />
                                <span className="text-sm text-gray-600">Change icon</span>
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Enter a description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!title}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
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
        </>
    );
};
