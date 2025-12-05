import React from 'react';

interface BrandIconProps {
    name: string;
    className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ name, className = "w-6 h-6" }) => {
    // Simple colored boxes with brand initials as a placeholder
    const brandColors: Record<string, string> = {
        'AWS': '#FF9900',
        'Azure': '#0078D4',
        'GCP': '#4285F4',
        'Docker': '#2496ED',
        'Kubernetes': '#326CE5',
        'GitHub': '#181717',
        'GitLab': '#FC6D26',
        'Python': '#3776AB',
        'JavaScript': '#F7DF1E',
        'TypeScript': '#3178C6',
        'React': '#61DAFB',
        'Vue': '#4FC08D',
        'Angular': '#DD0031',
    };

    const color = brandColors[name] || '#6B7280';
    const initials = name.length <= 3 ? name : name.substring(0, 2);

    return (
        <div
            className={`${className} rounded flex items-center justify-center text-white font-bold text-[10px]`}
            style={{ backgroundColor: color }}
        >
            {initials}
        </div>
    );
};
