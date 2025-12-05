import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, LayoutGrid, List, Plus, Download, Copy, Undo, Layers, Loader2, AlertCircle } from 'lucide-react';
import catalogPageService from '../services/catalogPage.service';
import { entityService } from '../services/entity.service';
import { blueprintApi } from '../services/blueprint.service';
import { CatalogPage } from '../types/catalogPage';
import { Entity } from '../types/entity';
import { Blueprint } from '../types/blueprint';
import { CatalogFilters } from '../types/catalog';
import { FilterModal } from '../components/catalog/FilterModal';
import { ColumnManagerModal } from '../components/catalog/ColumnManagerModal';
import { ColumnConfigProvider } from '../contexts/ColumnConfigContext';
import { EntityCreationModal } from '../components/catalog/EntityCreationModal';

export function CatalogPageView() {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<CatalogPage | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    types: [],
    teams: [],
    statuses: [],
    tags: [],
  });

  useEffect(() => {
    if (pageId) {
      loadPageData();
    }
  }, [pageId]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load page configuration
      const pageRes = await catalogPageService.getPage(pageId!);
      if (!pageRes.ok) {
        throw new Error('Failed to load page');
      }

      setPage(pageRes.page);

      // Load blueprint details
      const blueprintRes = await blueprintApi.getById(pageRes.page.blueprintId);
      setBlueprint(blueprintRes);

      // Load entities for the blueprint
      const entitiesRes = await entityService.getAll(pageRes.page.blueprintId);
      if (entitiesRes.ok) {
        setEntities(entitiesRes.entities);
        setTotal(entitiesRes.total);
      }
    } catch (err: any) {
      console.error('Failed to load catalog page:', err);
      setError(err.message || 'Failed to load catalog page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!page || !blueprint) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Catalog page not found</p>
        </div>
      </div>
    );
  }

  return (
    <ColumnConfigProvider>
      <div className="h-full flex flex-col -m-6">
        {/* Header */}
        <div className="bg-white border-b px-6 py-3">
          {/* Title and Search Row */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-shrink-0 flex items-center gap-2">
              {page.icon && <span className="text-lg">{page.icon}</span>}
              <h1 className="text-lg font-semibold text-gray-900">{page.title}</h1>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search columns"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs"
                />
              </div>

              {/* Action buttons */}
              <button
                onClick={() => setShowFilterModal(true)}
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Filters"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Group"
              >
                <Layers className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowColumnConfig(true)}
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Sort"
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
              <button
                className="p-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                title="Undo"
              >
                <Undo className="h-3.5 w-3.5" />
              </button>

              {/* Add Entity button */}
              <button
                onClick={() => setShowEntityModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-3.5 w-3.5" />
                {blueprint.title}
              </button>

              {/* Add Property button */}
              <button
                onClick={() => setShowColumnConfig(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Property
              </button>
            </div>
          </div>

          {/* Description Row */}
          <div className="px-1">
            <p className="text-xs text-gray-500">
              {page.description || `Showing ${total} ${total === 1 ? 'entity' : 'entities'} from ${blueprint.title} blueprint`}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {entities.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No entities found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create entities in the {blueprint.title} blueprint to see them here
                </p>
              </div>
            ) : (
              <>
                {page.layout === 'table' && <TableView entities={entities} blueprint={blueprint} />}
                {page.layout === 'grid' && <GridView entities={entities} />}
                {page.layout === 'list' && <ListView entities={entities} />}
              </>
            )}
          </div>
        </div>

        {/* Filter Modal */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={(conditions) => {
            const newFilters: CatalogFilters = {
              search: filters.search,
              types: [],
              teams: [],
              statuses: [],
              tags: [],
            };

            conditions.forEach((condition) => {
              const value = condition.value;
              if (!value || (Array.isArray(value) && value.length === 0)) return;

              switch (condition.field) {
                case 'type':
                  if (typeof value === 'string' && value) newFilters.types = [value as any];
                  break;
                case 'status':
                  if (typeof value === 'string' && value) newFilters.statuses = [value as any];
                  break;
                case 'team':
                  if (typeof value === 'string' && value) newFilters.teams = [value];
                  break;
                case 'tags':
                  if (Array.isArray(value)) newFilters.tags = value;
                  break;
                case 'name':
                  if (typeof value === 'string' && value) newFilters.search = value;
                  break;
              }
            });

            setFilters(newFilters);
          }}
        />

        {/* Column Manager Modal */}
        <ColumnManagerModal
          isOpen={showColumnConfig}
          onClose={() => setShowColumnConfig(false)}
        />

        {/* Entity Creation Modal */}
        {showEntityModal && blueprint && (
          <EntityCreationModal
            blueprint={blueprint}
            onClose={() => setShowEntityModal(false)}
            onSuccess={() => {
              setShowEntityModal(false);
              loadPageData(); // Reload entities after creation
            }}
          />
        )}
      </div>
    </ColumnConfigProvider>
  );
}

// Table Layout Component
function TableView({ entities, blueprint }: { entities: Entity[]; blueprint: Blueprint }) {
  // Get property keys from blueprint schema
  const propertyKeys = blueprint.schema?.properties ? Object.keys(blueprint.schema.properties) : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Identifier
              </th>
              {propertyKeys.slice(0, 4).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entities.map((entity) => (
              <tr key={entity.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {entity.icon ? `${entity.icon} ` : ''}{entity.title || entity.identifier}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entity.identifier}
                </td>
                {propertyKeys.slice(0, 4).map((key) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatPropertyValue(entity.properties?.[key])}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entity.updatedAt ? new Date(entity.updatedAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Grid Layout Component
function GridView({ entities }: { entities: Entity[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start gap-3">
            {entity.icon && <span className="text-2xl">{entity.icon}</span>}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {entity.title || entity.identifier}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{entity.identifier}</p>
              {entity.properties && Object.keys(entity.properties).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(entity.properties).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-500">{key}:</span>{' '}
                      <span className="text-gray-700">{formatPropertyValue(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// List Layout Component
function ListView({ entities }: { entities: Entity[] }) {
  return (
    <div className="space-y-2">
      {entities.map((entity) => (
        <div
          key={entity.id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-4">
            {entity.icon && <span className="text-xl">{entity.icon}</span>}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {entity.title || entity.identifier}
                </h3>
                <span className="text-xs text-gray-500">{entity.identifier}</span>
              </div>
              {entity.properties && Object.keys(entity.properties).length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {Object.entries(entity.properties).slice(0, 5).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-500">{key}:</span>{' '}
                      <span className="text-gray-700">{formatPropertyValue(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {entity.updatedAt && (
              <div className="text-xs text-gray-500">
                {new Date(entity.updatedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Utility function to format property values
function formatPropertyValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
