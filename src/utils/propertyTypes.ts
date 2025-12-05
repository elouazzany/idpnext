// Property type icon and color mappings
export const getPropertyTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
        'String': '📝',
        'Number': '#️⃣',
        'Boolean': '✓',
        'Object': '{}',
        'Array': '[]',
        'Enum': '📋',
        'URL': '🔗',
        'Date & time': '📅',
        'Relation': '🔗',
        'Mirror': '🪞',
        'Calculation': '🧮',
        'Aggregation': '📊',
        'Timer': '⏱️',
        'Embedded URL': '🌐',
        'Swagger UI': '📡',
        'Markdown': '📄',
        'Port Team': '👥',
        'Port User': '👤',
    };
    return icons[type] || '📝';
};

export const getPropertyTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        'String': 'bg-orange-100 text-orange-600',
        'Number': 'bg-purple-100 text-purple-600',
        'Boolean': 'bg-green-100 text-green-600',
        'Object': 'bg-pink-100 text-pink-600',
        'Array': 'bg-yellow-100 text-yellow-600',
        'Enum': 'bg-orange-100 text-orange-600',
        'URL': 'bg-cyan-100 text-cyan-600',
        'Date & time': 'bg-gray-100 text-gray-600',
        'Relation': 'bg-blue-100 text-blue-600',
        'Mirror': 'bg-indigo-100 text-indigo-600',
        'Calculation': 'bg-purple-100 text-purple-600',
        'Aggregation': 'bg-blue-100 text-blue-600',
        'Timer': 'bg-red-100 text-red-600',
        'Embedded URL': 'bg-cyan-100 text-cyan-600',
        'Swagger UI': 'bg-teal-100 text-teal-600',
        'Markdown': 'bg-gray-100 text-gray-600',
        'Port Team': 'bg-pink-100 text-pink-600',
        'Port User': 'bg-pink-100 text-pink-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
};
