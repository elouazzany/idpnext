import React, { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { IconDisplay, getAllIcons } from '../../components/IconDisplay';

interface Props {
    selectedIcon: string;
    onSelect: (icon: string) => void;
    onClose: () => void;
}

export const IconPickerModal: React.FC<Props> = ({ selectedIcon, onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [limit, setLimit] = useState(100);

    // Load all icons once
    const { lucideList, simpleList } = useMemo(() => getAllIcons(), []);

    // Combine list
    const allIcons = useMemo(() => [...simpleList, ...lucideList], [lucideList, simpleList]);

    // Filtering
    const filteredIcons = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) {
            // Return a curated mix or just the first N
            return allIcons;
        }
        return allIcons.filter(icon =>
            icon.label.toLowerCase().includes(query) ||
            icon.searchTerms.some(t => t.toLowerCase().includes(query))
        );
    }, [searchQuery, allIcons]);

    const displayIcons = filteredIcons.slice(0, limit);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
        if (bottom && limit < filteredIcons.length) {
            setLimit(prev => prev + 50);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[480px] h-[550px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                    <h3 className="text-sm font-semibold text-gray-900">Select an icon</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 flex-1 flex flex-col min-h-0">
                    {/* Search */}
                    <div className="relative mb-4 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setLimit(100); // Reset limit on search
                            }}
                            placeholder="Search for an icon (e.g. AWS, User, Database)"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setLimit(100);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Stats or Filter info */}
                    <div className="text-xs text-gray-500 mb-2 shrink-0 flex justify-between">
                        <span>{filteredIcons.length} icons found</span>
                        {displayIcons.length < filteredIcons.length && (
                            <span>Showing top {displayIcons.length}</span>
                        )}
                    </div>

                    {/* Icon Grid */}
                    <div
                        className="grid grid-cols-6 gap-2 overflow-y-auto px-1 pb-4 min-h-0"
                        onScroll={handleScroll}
                    >
                        {displayIcons.map((icon) => (
                            <button
                                key={`${icon.provider}-${icon.value}`}
                                onClick={() => onSelect(icon.value)}
                                className={`aspect-square flex flex-col items-center justify-center rounded-md transition-all hover:bg-gray-100 p-2 gap-1 border border-transparent 
                                    ${selectedIcon === icon.value ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'text-gray-600'}
                                `}
                                title={icon.label}
                            >
                                <IconDisplay name={icon.value} className="w-6 h-6" />
                            </button>
                        ))}
                    </div>

                    {filteredIcons.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No icons found matching "{searchQuery}"
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
                    <button
                        onClick={() => onSelect('')}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Clear selection
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
