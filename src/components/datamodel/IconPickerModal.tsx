import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { BrandIcon } from './BrandIcon';

interface Props {
    selectedIcon: string;
    onSelect: (icon: string) => void;
    onClose: () => void;
}

// Icon type can be emoji or brand name
type IconItem = {
    value: string;
    label?: string;
    isBrand?: boolean;
};

// Popular icon emojis and brand icons organized by category
const ICON_CATEGORIES: Record<string, IconItem[]> = {
    'Popular': [
        { value: '📦' }, { value: '🚀' }, { value: '⚡' }, { value: '🎯' },
        { value: '💡' }, { value: '🔧' }, { value: '📊' }, { value: '🎨' },
        { value: '🔒' }, { value: '🌟' }, { value: '💻' }, { value: '📱' },
        { value: '🌐' }, { value: '📝' }, { value: '📈' }, { value: '🎮' }
    ],
    'Cloud': [
        { value: 'AWS', label: 'AWS', isBrand: true },
        { value: 'Azure', label: 'Azure', isBrand: true },
        { value: 'GCP', label: 'GCP', isBrand: true },
        { value: 'Heroku', label: 'Heroku', isBrand: true },
        { value: 'DigitalOcean', label: 'DO', isBrand: true },
        { value: 'Vercel', label: 'Vercel', isBrand: true },
        { value: 'Netlify', label: 'Netlify', isBrand: true },
        { value: 'Cloudflare', label: 'CF', isBrand: true },
        { value: '☁️' }, { value: '⛅' }, { value: '🌩️' }, { value: '💾' },
        { value: '🗄️' }, { value: '🔐' }, { value: '📡' }, { value: '🖥️' }
    ],
    'Languages': [
        { value: 'Python', label: 'Py', isBrand: true },
        { value: 'JavaScript', label: 'JS', isBrand: true },
        { value: 'TypeScript', label: 'TS', isBrand: true },
        { value: 'Java', label: 'Java', isBrand: true },
        { value: 'Go', label: 'Go', isBrand: true },
        { value: 'Rust', label: 'Rust', isBrand: true },
        { value: 'Ruby', label: 'Ruby', isBrand: true },
        { value: 'PHP', label: 'PHP', isBrand: true },
        { value: 'C++', label: 'C++', isBrand: true },
        { value: 'C#', label: 'C#', isBrand: true },
        { value: 'Swift', label: 'Swift', isBrand: true },
        { value: 'Kotlin', label: 'Kotlin', isBrand: true },
        { value: '🐍' }, { value: '☕' }, { value: '💎' }, { value: '🦀' }
    ],
    'DevOps': [
        { value: 'Docker', label: 'Docker', isBrand: true },
        { value: 'Kubernetes', label: 'K8s', isBrand: true },
        { value: 'Jenkins', label: 'Jenkins', isBrand: true },
        { value: 'GitLab', label: 'GitLab', isBrand: true },
        { value: 'GitHub', label: 'GitHub', isBrand: true },
        { value: 'Bitbucket', label: 'BB', isBrand: true },
        { value: 'Terraform', label: 'TF', isBrand: true },
        { value: 'Ansible', label: 'Ansible', isBrand: true },
        { value: '🐳' }, { value: '☸️' }, { value: '🔀' }, { value: '⚙️' },
        { value: '🛠️' }, { value: '🔧' }, { value: '📦' }, { value: '🔨' }
    ],
    'Databases': [
        { value: 'PostgreSQL', label: 'PG', isBrand: true },
        { value: 'MySQL', label: 'MySQL', isBrand: true },
        { value: 'MongoDB', label: 'Mongo', isBrand: true },
        { value: 'Redis', label: 'Redis', isBrand: true },
        { value: 'Elasticsearch', label: 'ES', isBrand: true },
        { value: 'Cassandra', label: 'Cass', isBrand: true },
        { value: '🗄️' }, { value: '💾' }, { value: '📊' }, { value: '🗃️' }
    ],
    'Frameworks': [
        { value: 'React', label: 'React', isBrand: true },
        { value: 'Vue', label: 'Vue', isBrand: true },
        { value: 'Angular', label: 'Angular', isBrand: true },
        { value: 'Next.js', label: 'Next', isBrand: true },
        { value: 'Django', label: 'Django', isBrand: true },
        { value: 'Flask', label: 'Flask', isBrand: true },
        { value: 'Spring', label: 'Spring', isBrand: true },
        { value: 'Laravel', label: 'Laravel', isBrand: true },
        { value: '⚛️' }, { value: '🔷' }, { value: '🟩' }, { value: '🔶' }
    ],
    'Objects': [
        { value: '📦' }, { value: '📁' }, { value: '📄' }, { value: '📋' },
        { value: '📌' }, { value: '🔖' }, { value: '🏷️' }, { value: '💼' },
        { value: '🗂️' }, { value: '📇' }, { value: '🗃️' }, { value: '🔐' },
        { value: '🔑' }, { value: '🔨' }, { value: '⚙️' }, { value: '🔧' }
    ],
    'Symbols': [
        { value: '✅' }, { value: '❌' }, { value: '⭐' }, { value: '💫' },
        { value: '✨' }, { value: '🔥' }, { value: '💧' }, { value: '⚡' },
        { value: '🌈' }, { value: '🎯' }, { value: '🎪' }, { value: '🎭' },
        { value: '🎨' }, { value: '🎬' }, { value: '🎮' }, { value: '🎲' }
    ],
};

export const IconPickerModal: React.FC<Props> = ({ selectedIcon, onSelect, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Popular');

    const allIcons = Object.values(ICON_CATEGORIES).flat();
    const filteredIcons = searchQuery
        ? allIcons.filter(icon =>
            icon.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
            icon.label?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ICON_CATEGORIES[selectedCategory] || allIcons;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[480px] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Select an icon</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for an icon"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Category Tabs */}
                    {!searchQuery && (
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                            {Object.keys(ICON_CATEGORIES).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${selectedCategory === category
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Icon Grid */}
                    <div className="grid grid-cols-8 gap-2 max-h-[320px] overflow-y-auto">
                        {filteredIcons.map((icon, index) => (
                            <button
                                key={`${icon.value}-${index}`}
                                onClick={() => onSelect(icon.value)}
                                className={`h-10 flex items-center justify-center rounded-md transition-all hover:bg-gray-100 ${selectedIcon === icon.value ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                                    } ${icon.isBrand ? 'text-[10px] font-bold text-gray-700 border border-gray-200' : 'text-2xl'}`}
                                title={icon.label || icon.value}
                            >
                                {icon.isBrand ? <BrandIcon name={icon.value} className="w-full h-full" /> : icon.value}
                            </button>
                        ))}
                    </div>

                    {filteredIcons.length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No icons found
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={() => onSelect('📦')}
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
