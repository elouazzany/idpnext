import { useState, useEffect } from 'react';
import { X, Info, ChevronDown } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Blueprint } from '../../types/blueprint';
import { entityService } from '../../services/entity.service';
import { UpdateEntityData, Entity } from '../../types/entity';
import { IconPickerModal } from '../datamodel/IconPickerModal';
import { IconDisplay } from '../IconDisplay';

interface EntityEditModalProps {
  blueprint: Blueprint;
  entity: Entity;
  onClose: () => void;
  onSuccess: () => void;
}

export function EntityEditModal({ blueprint, entity, onClose, onSuccess }: EntityEditModalProps) {
  const [title, setTitle] = useState(entity.title || '');
  const [description, setDescription] = useState(entity.description || '');
  const [icon, setIcon] = useState(entity.icon || blueprint.icon || '🔧');
  const [properties, setProperties] = useState<Record<string, any>>(entity.properties || {});
  const [relationEntities, setRelationEntities] = useState<Record<string, Entity[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Sync form data to JSON when switching to JSON mode
  useEffect(() => {
    if (isJsonMode) {
      const entityObject = {
        title: title || undefined,
        description: description || undefined,
        icon: icon || undefined,
        properties: Object.keys(properties).length > 0 ? properties : undefined,
      };
      setJsonData(JSON.stringify(entityObject, null, 2));
      setJsonError('');
    }
  }, [isJsonMode]);

  const handleToggleJsonMode = () => {
    if (!isJsonMode) {
      // Switching to JSON mode - sync form to JSON
      setIsJsonMode(true);
    } else {
      // Switching to form mode - parse JSON to form
      try {
        const parsed = JSON.parse(jsonData);
        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setIcon(parsed.icon || blueprint.icon || '🔧');
        setProperties(parsed.properties || {});
        setJsonError('');
        setIsJsonMode(false);
      } catch (err) {
        setJsonError('Invalid JSON. Please fix the errors before switching to form mode.');
      }
    }
  };

  // Load entities for relations
  useEffect(() => {
    const loadRelationEntities = async () => {
      if (!blueprint.relations) return;

      for (const [relationKey, relationDef] of Object.entries(blueprint.relations)) {
        try {
          const response = await entityService.getAll(relationDef.target);
          if (response.ok) {
            setRelationEntities((prev) => ({
              ...prev,
              [relationKey]: response.entities,
            }));
          }
        } catch (err) {
          console.error(`Failed to load entities for relation ${relationKey}:`, err);
        }
      }
    };

    loadRelationEntities();
  }, [blueprint.relations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setJsonError('');

    try {
      let entityData: UpdateEntityData;

      if (isJsonMode) {
        // Parse JSON data
        try {
          const parsed = JSON.parse(jsonData);
          entityData = {
            title: parsed.title?.trim() || undefined,
            description: parsed.description?.trim() || undefined,
            icon: parsed.icon || undefined,
            properties: parsed.properties || undefined,
          };
        } catch (err) {
          setJsonError('Invalid JSON format');
          setLoading(false);
          return;
        }
      } else {
        // Use form data
        entityData = {
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          icon: icon || undefined,
          properties: Object.keys(properties).length > 0 ? properties : undefined,
        };
      }

      await entityService.update(blueprint.identifier, entity.identifier, entityData);
      onSuccess();
    } catch (err: any) {
      console.error('Failed to update entity:', err);
      if (isJsonMode) {
        setJsonError(err.message || 'Failed to update entity');
      } else {
        setError(err.message || 'Failed to update entity');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (propertyKey: string, value: any) => {
    setProperties((prev) => ({
      ...prev,
      [propertyKey]: value,
    }));
  };

  const handleRelationChange = (relationKey: string, entityId: string) => {
    // Store the relation in properties
    handlePropertyChange(relationKey, entityId);
  };

  const renderPropertyInput = (propertyKey: string, propertyDef: any) => {
    const { type, description, enum: enumValues } = propertyDef;

    // Handle enum (select dropdown)
    if (enumValues && Array.isArray(enumValues)) {
      return (
        <select
          value={properties[propertyKey] || ''}
          onChange={(e) => handlePropertyChange(propertyKey, e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Select</option>
          {enumValues.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      );
    }

    // Handle different types
    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            value={properties[propertyKey] || ''}
            onChange={(e) => handlePropertyChange(propertyKey, e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter value"
          />
        );

      case 'number':
      case 'integer':
        return (
          <input
            type="number"
            value={properties[propertyKey] || ''}
            onChange={(e) => handlePropertyChange(propertyKey, e.target.valueAsNumber)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter value"
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={properties[propertyKey] || false}
              onChange={(e) => handlePropertyChange(propertyKey, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">{description || 'Enable'}</label>
          </div>
        );

      case 'array':
        return (
          <textarea
            value={Array.isArray(properties[propertyKey]) ? properties[propertyKey].join(', ') : ''}
            onChange={(e) => {
              const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
              handlePropertyChange(propertyKey, values);
            }}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            placeholder="Enter comma-separated values"
            rows={3}
          />
        );

      case 'object':
        return (
          <textarea
            value={typeof properties[propertyKey] === 'object' ? JSON.stringify(properties[propertyKey], null, 2) : ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropertyChange(propertyKey, parsed);
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono resize-none"
            placeholder='{"key": "value"}'
            rows={4}
          />
        );

      default:
        return (
          <input
            type="text"
            value={properties[propertyKey] || ''}
            onChange={(e) => handlePropertyChange(propertyKey, e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Enter value"
          />
        );
    }
  };

  const renderRelationInput = (relationKey: string) => {
    const entities = relationEntities[relationKey] || [];

    return (
      <div className="relative">
        <select
          value={properties[relationKey] || ''}
          onChange={(e) => handleRelationChange(relationKey, e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
        >
          <option value="">Select</option>
          {entities.map((entity) => (
            <option key={entity.identifier} value={entity.identifier}>
              {entity.icon ? `${entity.icon} ` : ''}{entity.title || entity.identifier}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    );
  };

  const requiredProperties = blueprint.schema?.required || [];
  const allProperties = blueprint.schema?.properties || {};
  const relations = blueprint.relations || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {blueprint.icon && <IconDisplay name={blueprint.icon} className="w-6 h-6 text-gray-700" />}
            <h2 className="text-base font-semibold text-gray-900">
              Edit {blueprint.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* JSON Mode Toggle */}
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <span>JSON Mode</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isJsonMode}
                  onChange={handleToggleJsonMode}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-5">
            {error && !isJsonMode && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            {jsonError && isJsonMode && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {jsonError}
              </div>
            )}

            {isJsonMode ? (
              /* JSON Editor */
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Entity JSON
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <Editor
                    height="500px"
                    defaultLanguage="json"
                    value={jsonData}
                    onChange={(value) => setJsonData(value || '')}
                    theme="vs"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      wordWrap: 'on',
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Edit the entity data in JSON format
                </p>
              </div>
            ) : (
              /* Form Fields */
              <>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter title"
                required
              />
            </div>

            {/* Identifier (Read-only) */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                Identifier
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </label>
              <div className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500">
                {entity.identifier}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                placeholder="Enter description"
                rows={3}
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Icon
              </label>
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="w-14 h-10 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-2xl flex items-center justify-center transition-colors"
              >
                <IconDisplay name={icon} className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Properties */}
            {Object.entries(allProperties).map(([key, def]) => {
              const isRequired = requiredProperties.includes(key);
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {def.title || key}
                    {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderPropertyInput(key, def)}
                </div>
              );
            })}

            {/* Relations */}
            {Object.entries(relations).map(([key, def]) => (
              <div key={key}>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                  <span>🔗</span>
                  {def.title || key}
                </label>
                {renderRelationInput(key)}
              </div>
            ))}
            </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
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
    </div>
  );
}
