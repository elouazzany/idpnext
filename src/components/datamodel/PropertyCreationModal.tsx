import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Code } from 'lucide-react';
import { IconPickerModal } from './IconPickerModal';
import { IconDisplay } from '../../components/IconDisplay';
import { CodeEditorModal } from './CodeEditorModal';

interface Props {
    property?: any;
    onClose: () => void;
    onCreate?: (property: any) => void;
    onUpdate?: (property: any) => void;
}

const PROPERTY_TYPES = [
    { category: 'Essential', types: ['string', 'number', 'boolean', 'object', 'array', 'enum', 'url', 'date-time'] },
    { category: 'Relations', types: ['mirror', 'relation'] },
    { category: 'Advanced', types: ['calculation', 'aggregation', 'timer'] },
    { category: 'Embed', types: ['embedded-url', 'swagger-ui', 'markdown'] },
    { category: 'Users & Teams', types: ['team', 'user'] },
];

const STRING_FORMATS = [
    'date-time', 'url', 'email', 'idn-email', 'ipv4', 'ipv6',
    'markdown', 'yaml', 'user', 'blueprints', 'team', 'timer', 'proto'
];

export const PropertyCreationModal: React.FC<Props> = ({ property, onClose, onCreate, onUpdate }) => {
    // Helper to determine initial kind from property data
    const getInitialKind = (prop: any) => {
        if (!prop) return 'string';

        // Enum detection
        if (prop.enum || (prop.type === 'array' && prop.items?.enum)) {
            return 'enum';
        }

        // URL detection
        if (prop.format === 'url' || (prop.type === 'array' && prop.items?.format === 'url')) {
            return 'url';
        }

        // Object detection
        if (prop.type === 'object' || prop.format === 'yaml' || prop.format === 'proto') {
            return 'object';
        }

        // Advanced string formats
        if (prop.type === 'string' && prop.format && STRING_FORMATS.includes(prop.format)) {
            return prop.format;
        }

        // Basic types
        return prop.type || 'string';
    };

    const defaultColors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

    const predefinedColors = [
        { name: 'Blue', value: '#3b82f6' },
        { name: 'Turquoise', value: '#06b6d4' },
        { name: 'Orange', value: '#f97316' },
        { name: 'Purple', value: '#8b5cf6' },
        { name: 'Pink', value: '#ec4899' },
        { name: 'Yellow', value: '#eab308' },
        { name: 'Green', value: '#10b981' },
        { name: 'Red', value: '#ef4444' },
        { name: 'Dark Grey', value: '#6b7280' },
        { name: 'Bronze', value: '#d97706' },
        { name: 'Gold', value: '#f59e0b' },
        { name: 'Lime', value: '#84cc16' },
        { name: 'Olive', value: '#a3e635' },
        { name: 'Brown', value: '#92400e' },
    ];

    const isEditMode = !!property;
    const [title, setTitle] = useState(property?.title || '');
    const [identifier, setIdentifier] = useState(property?.identifier || '');
    const [autoGenerate, setAutoGenerate] = useState(!property);
    const [type, setType] = useState(getInitialKind(property));
    const [required, setRequired] = useState(property?.required ? 'True' : 'False');
    const [description, setDescription] = useState(property?.description || '');
    const [identifierError, setIdentifierError] = useState('');

    // Type-specific fields
    const [icon, setIcon] = useState(property?.icon || '');
    const [defaultValue, setDefaultValue] = useState(() => {
        if (!property) return '';
        if (property.default === undefined || property.default === null) return '';
        // Handle array defaults (e.g. URL list)
        if (Array.isArray(property.default)) {
            if (property.type === 'array' && property.items?.format === 'url' && property.default.length > 0) {
                return property.default[0]; // For URL list, we edit the single default value
            }
            return JSON.stringify(property.default);
        }
        // Handle object defaults
        if (typeof property.default === 'object') {
            return JSON.stringify(property.default);
        }
        return property.default.toString();
    });
    const [minLength, setMinLength] = useState(property?.minLength?.toString() || '');
    const [maxLength, setMaxLength] = useState(property?.maxLength?.toString() || '');
    const [pattern, setPattern] = useState(property?.pattern || '');
    // const [format,] = useState(property?.format || '');
    const [min, setMin] = useState(property?.minimum?.toString() || '');
    const [max, setMax] = useState(property?.maximum?.toString() || '');

    const [objectType, setObjectType] = useState(() => {
        if (!property) return 'json';
        if (property.format === 'yaml') return 'yaml';
        if (property.format === 'proto') return 'proto';
        return 'json';
    });

    const [arrayType, setArrayType] = useState(property?.items?.type || 'string');

    const [enumType, setEnumType] = useState(() => {
        if (!property) return 'string';
        if (property.type === 'array' && property.items?.type) return property.items.type;
        return 'string'; // Default for single enum is string
    });

    const [enumOptions, setEnumOptions] = useState<string[]>(() => {
        if (!property) return [];
        if (property.enum) return property.enum;
        if (property.items?.enum) return property.items.enum;
        return [];
    });

    const [enumLimit, setEnumLimit] = useState(() => {
        if (!property) return 'single';
        if (property.type === 'array' && property.items?.enum) return 'list';
        return 'single';
    });

    const [enumDefaults, setEnumDefaults] = useState<string[]>(() => {
        if (!property?.default) return [];
        return Array.isArray(property.default) ? property.default : [property.default];
    });

    const [enumColors, setEnumColors] = useState<string[]>(() => {
        if (!property) return [];
        const colorsObj = property.enumColors || property.items?.enumColors || {};
        // Map color names back to hex values if possible, or keep as is
        // We need the options to map correctly
        const options = property.enum || property.items?.enum || [];
        return options.map((opt: string) => {
            const colorName = colorsObj[opt];
            if (!colorName) return '#3b82f6'; // Default blue
            const found = predefinedColors.find(c => c.name.toLowerCase().replace(' ', '') === colorName);
            return found ? found.value : '#3b82f6';
        });
    });

    const [urlLimit, setUrlLimit] = useState(() => {
        if (!property) return 'single';
        if (property.type === 'array' && property.items?.format === 'url') return 'list';
        return 'single';
    });

    const [showIconPicker, setShowIconPicker] = useState(false);
    const [showJsonEditor, setShowJsonEditor] = useState(false);



    const getColorName = (colorValue: string) => {
        const color = predefinedColors.find(c => c.value === colorValue);
        return color ? color.name.toLowerCase().replace(' ', '') : 'blue';
    };

    useEffect(() => {
        if (autoGenerate && !isEditMode) {
            const generated = title.toLowerCase().replace(/[^a-z0-9_@=-]/g, '_');
            setIdentifier(generated);
            validateIdentifier(generated);
        }
    }, [title, autoGenerate, isEditMode]);

    // Handle boolean type special behavior
    useEffect(() => {
        if (type === 'boolean' && !isEditMode) {
            setRequired('False');
            if (!defaultValue) {
                setDefaultValue('false');
            }
        }
    }, [type, isEditMode]);

    // Port.io validation: Property identifier pattern ^[A-Za-z0-9@_=\-]+$
    const validateIdentifier = (value: string) => {
        if (!value) {
            setIdentifierError('Identifier is required');
            return false;
        }
        if (value.length > 100) {
            setIdentifierError('Identifier must be at most 100 characters');
            return false;
        }
        if (!/^[A-Za-z0-9@_=\-]+$/.test(value)) {
            setIdentifierError('Identifier must match pattern: A-Z, a-z, 0-9, @, _, =, -');
            return false;
        }
        setIdentifierError('');
        return true;
    };

    const handleIdentifierChange = (value: string) => {
        setIdentifier(value);
        setAutoGenerate(false);
        validateIdentifier(value);
    };

    const [error, setError] = useState<string | null>(null);

    // ... existing code ...

    const handleSubmit = async () => {
        // Validate identifier before submission
        if (!validateIdentifier(identifier)) {
            return;
        }

        setError(null);

        // Basic/primitive types
        const BASIC_TYPES = ['string', 'number', 'boolean', 'object', 'array'];

        const propertyData: any = {
            title,
            identifier,
            required: required === 'True',
            description
        };

        // Handle type and format conversion based on kind selection
        if (BASIC_TYPES.includes(type)) {
            // If kind is a basic type, set type directly
            if (type === 'object') {
                // For object, handle based on objectType
                if (objectType === 'json') {
                    propertyData.type = 'object';
                    // No format for json
                } else {
                    // For yaml or proto, set type to string with format
                    propertyData.type = 'string';
                    propertyData.format = objectType;
                }
            } else {
                // For other basic types (string, number, boolean, array)
                propertyData.type = type;
            }
        } else if (type === 'url') {
            // Handle URL type based on limit
            if (urlLimit === 'list') {
                propertyData.type = 'array';
                propertyData.items = {
                    type: 'string',
                    format: 'url'
                };
            } else {
                propertyData.type = 'string';
                propertyData.format = 'url';
            }
        } else {
            // If kind is advanced type (date-time, email, etc.), set type to "string" and format to kind value
            propertyData.type = 'string';
            propertyData.format = type;
        }

        // Add optional fields if they have values
        if (icon) propertyData.icon = icon;

        // Handle default value with type conversion
        if (type !== 'enum' && defaultValue) {
            if (propertyData.type === 'boolean') {
                propertyData.default = defaultValue === 'true';
            } else if (propertyData.type === 'number') {
                propertyData.default = parseFloat(defaultValue);
            } else if (type === 'url' && urlLimit === 'list') {
                // For URL list, wrap the default value in an array
                propertyData.default = [defaultValue];
            } else if (propertyData.type === 'object' || propertyData.type === 'array') {
                try {
                    propertyData.default = JSON.parse(defaultValue);
                } catch (e) {
                    // If parsing fails, don't set default
                    console.warn('Invalid JSON for default value:', defaultValue);
                }
            } else {
                propertyData.default = defaultValue;
            }
        }

        // String-specific fields (only for actual string type)
        if (propertyData.type === 'string') {
            if (minLength) propertyData.minLength = parseInt(minLength);
            if (maxLength) propertyData.maxLength = parseInt(maxLength);
            if (pattern) propertyData.pattern = pattern;
        }

        // Number-specific fields
        if (propertyData.type === 'number') {
            if (min) propertyData.minimum = parseFloat(min);
            if (max) propertyData.maximum = parseFloat(max);
        }

        // Array-specific fields
        if (type === 'array') {
            propertyData.items = {
                type: arrayType
            };
            delete propertyData.format;
        }

        // Enum-specific fields
        if (type === 'enum') {
            // Build enumColors object mapping option values to color names
            delete propertyData.format;
            const enumColorsObj: Record<string, string> = {};
            enumOptions.forEach((opt, index) => {
                if (opt) {
                    const colorValue = enumColors[index] || defaultColors[index % 5];
                    enumColorsObj[opt] = getColorName(colorValue);
                }
            });

            if (enumLimit === 'single') {
                // Single value: type=string with enum and enumColors at top level
                propertyData.type = 'string';
                propertyData.enum = enumOptions.filter(opt => opt); // Remove empty options
                propertyData.enumColors = enumColorsObj;
                // Default is a single value
                if (enumDefaults.length > 0) {
                    propertyData.default = enumDefaults[0];
                }
            } else {
                // List: type=array with enum and enumColors in items
                propertyData.type = 'array';
                propertyData.items = {
                    type: enumType,
                    enum: enumOptions.filter(opt => opt), // Remove empty options
                    enumColors: enumColorsObj
                };
                // Default is an array
                if (enumDefaults.length > 0) {
                    propertyData.default = enumDefaults;
                }
            }
        }

        try {
            if (isEditMode && onUpdate) {
                await onUpdate(propertyData);
            } else if (onCreate) {
                await onCreate(propertyData);
            }
            onClose();
        } catch (err: any) {
            console.error('Failed to save property:', err);
            setError(err.message || 'Failed to save property. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit property' : 'New property'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                            autoFocus
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1">
                                <label className="text-sm font-medium text-gray-700">Identifier</label>
                                <span className="text-red-500">*</span>
                                <span className="text-gray-400 text-xs cursor-help" title="Unique identifier">ⓘ</span>
                            </div>
                            {!isEditMode && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Autogenerate</span>
                                    <button
                                        onClick={() => setAutoGenerate(!autoGenerate)}
                                        className={`w-8 h-4 rounded-full relative transition-colors ${autoGenerate ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${autoGenerate ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => handleIdentifierChange(e.target.value)}
                            disabled={autoGenerate || isEditMode}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${(autoGenerate || isEditMode)
                                ? 'bg-gray-50 text-gray-500 border-gray-300'
                                : identifierError
                                    ? 'bg-white border-red-500 focus:ring-red-500'
                                    : 'bg-white border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                        {identifierError && !autoGenerate && (
                            <p className="mt-1 text-xs text-red-600">{identifierError}</p>
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Kind</label>
                            <span className="text-red-500">*</span>
                        </div>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled={isEditMode}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                {PROPERTY_TYPES.map(category => (
                                    <optgroup key={category.category} label={category.category}>
                                        {category.types.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Required</label>
                            <span className="text-red-500">*</span>
                            <span className="text-gray-400 text-xs cursor-help" title="Is this property required?">ⓘ</span>
                        </div>
                        <div className="relative">
                            <select
                                value={required}
                                onChange={(e) => setRequired(e.target.value)}
                                disabled={type === 'boolean'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="False">False</option>
                                <option value="True">True</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <span className="text-gray-400 text-xs cursor-help" title="Description of the property">ⓘ</span>
                        </div>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {/* Icon field - shown for all types */}
                    <div>
                        <div className="flex items-center gap-1 mb-1.5">
                            <label className="text-sm font-medium text-gray-700">Icon</label>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowIconPicker(true)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white text-left flex items-center gap-2 hover:bg-gray-50"
                        >
                            {icon ? (
                                <>
                                    <IconDisplay name={icon} className="w-5 h-5" />
                                    <span className="text-sm text-gray-600 truncate">{icon}</span>
                                </>
                            ) : (
                                <span className="text-sm text-gray-400">Click to select an icon</span>
                            )}
                        </button>
                    </div>

                    {/* Default value for string, number, and boolean types */}
                    {(type === 'string' || type === 'number' || type === 'boolean' || type === 'object' || type === 'array' || type === 'url' || type === 'date-time' || type === 'email') && (
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Default</label>
                            </div>
                            {type === 'boolean' ? (
                                <div className="relative">
                                    <select
                                        value={defaultValue}
                                        onChange={(e) => setDefaultValue(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">None</option>
                                        <option value="true">true</option>
                                        <option value="false">false</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            ) : type === 'object' ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={defaultValue}
                                        readOnly
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 focus:outline-none cursor-not-allowed"
                                        placeholder="Configure default JSON..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowJsonEditor(true)}
                                        className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 transition-colors"
                                        title="Edit JSON"
                                    >
                                        <Code className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <input
                                    type={type === 'number' ? 'number' : 'text'}
                                    value={defaultValue}
                                    onChange={(e) => setDefaultValue(e.target.value)}
                                    placeholder={type === 'url' ? 'Enter default URL' : type === 'date-time' ? 'Enter default date-time' : type === 'email' ? 'Enter default email' : 'Enter default value'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                            )}
                        </div>
                    )}

                    {/* Number type-specific fields */}
                    {type === 'number' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Min</label>
                                </div>
                                <input
                                    type="number"
                                    value={min}
                                    onChange={(e) => setMin(e.target.value)}
                                    placeholder="Enter minimum value"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Max</label>
                                </div>
                                <input
                                    type="number"
                                    value={max}
                                    onChange={(e) => setMax(e.target.value)}
                                    placeholder="Enter maximum value"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                        </div>
                    )}

                    {/* Object type-specific fields */}
                    {type === 'object' && (
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Object Type</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={objectType}
                                    onChange={(e) => setObjectType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="json">json</option>
                                    <option value="yaml">yaml</option>
                                    <option value="proto">protobuf</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Array type-specific fields */}
                    {type === 'array' && (
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Array Type</label>
                                <span className="text-red-500">*</span>
                            </div>
                            <div className="relative">
                                <select
                                    value={arrayType}
                                    onChange={(e) => setArrayType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="string">string</option>
                                    <option value="number">number</option>
                                    <option value="boolean">boolean</option>
                                    <option value="object">object</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Enum type-specific fields */}
                    {type === 'enum' && (
                        <>
                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Item type</label>
                                    <span className="text-red-500">*</span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={enumType}
                                        onChange={(e) => setEnumType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="string">String</option>
                                        <option value="number">Number</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Limit</label>
                                </div>
                                <div className="relative">
                                    <select
                                        value={enumLimit}
                                        onChange={(e) => {
                                            setEnumLimit(e.target.value);
                                            // If switching to single value, keep only first default
                                            if (e.target.value === 'single' && enumDefaults.length > 1) {
                                                setEnumDefaults([enumDefaults[0]]);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="single">Single value</option>
                                        <option value="list">List of options</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Options</label>
                                </div>
                                <div className="space-y-2">
                                    {enumOptions.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="relative">
                                                <select
                                                    value={enumColors[index] || defaultColors[index % 5]}
                                                    onChange={(e) => {
                                                        const newColors = [...enumColors];
                                                        newColors[index] = e.target.value;
                                                        setEnumColors(newColors);
                                                    }}
                                                    className="appearance-none w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer text-sm"
                                                >
                                                    {predefinedColors.map((color) => (
                                                        <option key={color.value} value={color.value}>
                                                            {color.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full pointer-events-none"
                                                    style={{ backgroundColor: enumColors[index] || defaultColors[index % 5] }}
                                                ></div>
                                            </div>
                                            <input
                                                type={enumType === 'number' ? 'number' : 'text'}
                                                value={option}
                                                onChange={(e) => {
                                                    const newOptions = [...enumOptions];
                                                    newOptions[index] = e.target.value;
                                                    setEnumOptions(newOptions);
                                                }}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newOptions = enumOptions.filter((_, i) => i !== index);
                                                    setEnumOptions(newOptions);
                                                    // Remove from defaults if present
                                                    setEnumDefaults(enumDefaults.filter(d => d !== option));
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setEnumOptions([...enumOptions, ''])}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        + New option
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Default</label>
                                </div>
                                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[44px]">
                                    {enumDefaults.map((def, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">
                                            {def}
                                            <button
                                                type="button"
                                                onClick={() => setEnumDefaults(enumDefaults.filter((_, i) => i !== index))}
                                                className="hover:text-orange-900"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                if (enumLimit === 'single') {
                                                    // For single value, replace existing default
                                                    setEnumDefaults([e.target.value]);
                                                } else {
                                                    // For list, add to defaults if not already included
                                                    if (!enumDefaults.includes(e.target.value)) {
                                                        setEnumDefaults([...enumDefaults, e.target.value]);
                                                    }
                                                }
                                            }
                                        }}
                                        className="flex-1 min-w-[120px] border-0 focus:outline-none focus:ring-0 text-sm"
                                    >
                                        <option value="">Select option...</option>
                                        {enumOptions.filter(opt => opt && !enumDefaults.includes(opt)).map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* URL type-specific fields */}
                    {type === 'url' && (
                        <div>
                            <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-sm font-medium text-gray-700">Limit</label>
                            </div>
                            <div className="relative">
                                <select
                                    value={urlLimit}
                                    onChange={(e) => setUrlLimit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="single">One URL</option>
                                    <option value="list">List of URLs</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* String type-specific fields */}
                    {type === 'string' && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <label className="text-sm font-medium text-gray-700">Min Length</label>
                                    </div>
                                    <input
                                        type="number"
                                        value={minLength}
                                        onChange={(e) => setMinLength(e.target.value)}
                                        placeholder="Enter a number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <label className="text-sm font-medium text-gray-700">Max Length</label>
                                    </div>
                                    <input
                                        type="number"
                                        value={maxLength}
                                        onChange={(e) => setMaxLength(e.target.value)}
                                        placeholder="Enter a number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-1 mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">Pattern (Regex)</label>
                                    <span className="text-gray-400 text-xs cursor-help" title="Regular expression pattern">ⓘ</span>
                                </div>
                                <input
                                    type="text"
                                    value={pattern}
                                    onChange={(e) => setPattern(e.target.value)}
                                    placeholder="Enter value here"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title || !identifier || !!identifierError}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isEditMode ? 'Save' : 'Create'}
                    </button>
                </div>
            </div>

            {/* Icon Picker Modal */}
            {showIconPicker && (
                <IconPickerModal
                    selectedIcon={icon}
                    onSelect={(selectedIcon) => {
                        setIcon(selectedIcon);
                        setShowIconPicker(false);
                    }}
                    onClose={() => setShowIconPicker(false)}
                />
            )}

            {showJsonEditor && (
                <CodeEditorModal
                    initialValue={defaultValue ? (objectType === 'json' ? JSON.parse(defaultValue) : defaultValue) : (objectType === 'json' ? {} : '')}
                    onClose={() => setShowJsonEditor(false)}
                    onSave={(value) => {
                        // For JSON, value is object so we stringify
                        // For others, value is raw string so we keep as is
                        setDefaultValue(typeof value === 'object' ? JSON.stringify(value) : value);
                    }}
                    language={objectType as 'json' | 'yaml' | 'proto'}
                    title={`Edit Default ${objectType.toUpperCase()}`}
                />
            )}
        </div>
    );
};
