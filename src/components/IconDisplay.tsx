import React from 'react';
import * as LucideIcons from 'lucide-react';
import * as SimpleIcons from 'simple-icons';
import { LucideIcon } from 'lucide-react';

export interface IconDisplayProps {
    name: string;
    className?: string;
}

// Create a map for fast lookup of simple icons
const simpleIconsMap = new Map<string, any>();
Object.values(SimpleIcons).forEach((icon: any) => {
    if (icon && icon.title) {
        // Map by title (e.g. "AWS")
        simpleIconsMap.set(icon.title.toLowerCase(), icon);
        // Map by slug (e.g. "aws")
        simpleIconsMap.set(icon.slug, icon);
        // Map by normalized name if needed
    }
});

export const IconDisplay: React.FC<IconDisplayProps> = ({ name, className = "w-6 h-6" }) => {
    // 1. Check if it's a Lucide Icon
    // Lucide exports are PascalCase. We assume the stored name might match exactly or we try to match.
    // Usually we store the exact component name "User", "Home", etc.
    const LucideComponent = (LucideIcons as any)[name] as LucideIcon;

    if (LucideComponent) {
        return <LucideComponent className={className} />;
    }

    // 2. Check if it's a Simple Icon
    // We try exact match first (conceptually), then lower case, then slug
    let simpleIcon = simpleIconsMap.get(name.toLowerCase());
    if (!simpleIcon) {
        // Try searching by title if exact slug match failed?
        // We already mapped title.toLowerCase() and slug.
        // Maybe try normalized?
    }

    if (simpleIcon) {
        return (
            <svg
                role="img"
                viewBox="0 0 24 24"
                className={className}
                fill="currentColor"
                style={{ color: `#${simpleIcon.hex}` }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d={simpleIcon.path} />
            </svg>
        );
    }

    // 3. Fallback to Emoji or Text
    // If it looks like an emoji (non-ascii?), render it.
    // Or just render text.
    return (
        <span className={`${className} flex items-center justify-center not-italic`}>
            {name}
        </span>
    );
};

export const getAllIcons = () => {
    const lucideList = Object.keys(LucideIcons)
        .filter(key => key !== 'icons' && key !== 'createLucideIcon' && isNaN(Number(key))) // Filter out internal helpers
        .map(key => ({
            value: key,
            label: key,
            provider: 'lucide' as const,
            searchTerms: [key]
        }));

    const simpleList = Object.values(SimpleIcons).map((icon: any) => ({
        value: icon.title, // Store "AWS", "GitHub"
        label: icon.title,
        provider: 'simple' as const,
        searchTerms: [icon.title, icon.slug]
    }));

    return { lucideList, simpleList };
};
