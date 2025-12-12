import { useState, useEffect } from 'react'
import { Search, Plus, MoreHorizontal, X, Copy, Filter, EyeOff, ChevronRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthHeader } from '@/utils/auth'
import { NewDataSourceModal } from '../../components/admin/NewDataSourceModal'
import { GitHubConfigModal } from '../../components/admin/GitHubConfigModal'
import { GitHubInstallModal } from '../../components/admin/GitHubInstallModal'
import { RotateCw, GitPullRequest, Box } from 'lucide-react' // Import icons for badges

interface DataSource {
    id: string
    name: string
    category: string
    status: 'active' | 'waiting' | 'deprecated'
    description?: string
    icon?: string
}

const categories = [
    'All',
    'API',
    'CICD',
    'Exporters',
    'GitOps',
]

const mockDataSources: DataSource[] = [
    // API sources (from reference image)
    { id: '1', name: 'REST API', category: 'API', status: 'active', icon: '🟢' },
    { id: '2', name: 'Repository', category: 'API', status: 'active', icon: '📁' },
    { id: '3', name: 'PagerDuty Oncall Schedule', category: 'API', status: 'active', icon: '📞' },
    { id: '4', name: 'Team', category: 'API', status: 'active', icon: '👥' },
    { id: '5', name: 'Snyk Project', category: 'API', status: 'active', icon: '🔒' },
    { id: '6', name: 'Dependabot Alert', category: 'API', status: 'active', icon: '⚠️' },
    { id: '7', name: 'Cloud Resource Costs', category: 'API', status: 'active', icon: '💰' },
    { id: '8', name: 'Image', category: 'API', status: 'active', icon: '🖼️' },
    { id: '9', name: 'Cloud Permission', category: 'API', status: 'active', icon: '🔐' },
    { id: '10', name: 'K8s Namespace', category: 'API', status: 'active', icon: '☸️' },
    { id: '11', name: 'DevEx Survey Response', category: 'API', status: 'active', icon: '📊' },
    { id: '12', name: 'API', category: 'API', status: 'active', icon: '🔌' },
    { id: '13', name: 'Announcement', category: 'API', status: 'active', icon: '📢' },
    { id: '14', name: 'Devops Ticket', category: 'API', status: 'active', icon: '🎫' },
    { id: '15', name: 'New Relic Service Level', category: 'API', status: 'active', icon: '📈' },
    { id: '16', name: 'K8s Cluster', category: 'API', status: 'active', icon: '⚙️' },
    { id: '17', name: 'Wiz Control', category: 'API', status: 'active', icon: '🛡️' },
    { id: '18', name: 'New Relic Service', category: 'API', status: 'active', icon: '📊' },
    { id: '19', name: 'Snyk Target', category: 'API', status: 'active', icon: '🎯' },
    { id: '20', name: 'User', category: 'API', status: 'active', icon: '👤' },
    { id: '21', name: 'Code Owner', category: 'API', status: 'active', icon: '👨‍💻' },
    { id: '22', name: 'Case Management', category: 'API', status: 'active', icon: '📋' },
    { id: '23', name: 'Domain', category: 'API', status: 'active', icon: '🌐' },
    { id: '24', name: 'SonarQube Project', category: 'API', status: 'active', icon: '🔍' },
    { id: '25', name: 'K8s Resource', category: 'API', status: 'active', icon: '📦' },
    { id: '26', name: 'Port Survey Analytics', category: 'API', status: 'active', icon: '📊' },
    { id: '27', name: 'Product Filter', category: 'API', status: 'active', icon: '🔖' },
    { id: '28', name: 'Feature Workflow', category: 'API', status: 'active', icon: '⚡' },
    { id: '29', name: 'Wiz Issue', category: 'API', status: 'active', icon: '⚠️' },
    { id: '30', name: 'Wiz Department', category: 'API', status: 'active', icon: '🏢' },
    { id: '31', name: 'API & Port Environment', category: 'API', status: 'active', icon: '🌍' },
    { id: '32', name: 'Portal Feedback', category: 'API', status: 'active', icon: '💬' },
    { id: '33', name: 'Organization', category: 'API', status: 'active', icon: '🏛️' },
    { id: '34', name: 'Falco Alert', category: 'API', status: 'active', icon: '🚨' },
    { id: '35', name: 'Jira Issue', category: 'API', status: 'active', icon: '📝' },
    { id: '36', name: 'API Project', category: 'API', status: 'active', icon: '📁' },
    { id: '37', name: 'Event', category: 'API', status: 'active', icon: '📅' },
    { id: '38', name: 'Cloud Account', category: 'API', status: 'active', icon: '☁️' },
    { id: '39', name: 'Cloud Resource', category: 'API', status: 'active', icon: '💾' },
    { id: '40', name: 'Dependency', category: 'API', status: 'active', icon: '🔗' },

    // CICD sources
    { id: '50', name: 'GH Deployment', category: 'CICD', status: 'waiting', icon: '🚀' },

    // Exporters
    { id: '60', name: 'Kubernetes - cluster', category: 'Exporters', status: 'waiting', icon: '☸️' },
    { id: '61', name: 'Kilo Node', category: 'Exporters', status: 'waiting', icon: '🖥️' },
    { id: '62', name: 'Kilo Pod', category: 'Exporters', status: 'waiting', icon: '📦' },

    // GitOps sources
    { id: '70', name: 'Github - GitHub GitOps', category: 'GitOps', status: 'waiting', icon: '🔧' },
    { id: '71', name: 'G2', category: 'GitOps', status: 'waiting', icon: '⚙️' },
]

export function DataSourcesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('All')
    const [selectedSource, setSelectedSource] = useState<DataSource | null>(null)
    const [activeTab, setActiveTab] = useState<'ingested' | 'audit'>('ingested')
    const [activeLanguage, setActiveLanguage] = useState<'curl' | 'python' | 'javascript' | 'go'>('curl')
    const [isNewDataSourceModalOpen, setIsNewDataSourceModalOpen] = useState(false)
    const [isGitHubInstallModalOpen, setIsGitHubInstallModalOpen] = useState(false)
    const [isGitHubConfigModalOpen, setIsGitHubConfigModalOpen] = useState(false)
    const [installedExporters, setInstalledExporters] = useState<any[]>([])
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSyncing) return;

        setIsSyncing(true);
        try {
            const response = await fetch('/api/github/sync', {
                method: 'POST',
                headers: getAuthHeader()
            });
            if (!response.ok) {
                console.error('Sync failed');
            }
        } catch (err) {
            console.error('Sync error:', err);
        } finally {
            // Animate for at least 1 second to show feedback
            setTimeout(() => setIsSyncing(false), 1000);
        }
    };

    const { currentOrganization, currentTenant } = useAuth();

    // Filter sources
    const filteredSources = mockDataSources.filter(source => {
        const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || source.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Group by category for display
    const groupedByCategory = filteredSources.reduce((acc, source) => {
        if (!acc[source.category]) {
            acc[source.category] = []
        }
        acc[source.category].push(source)
        return acc
    }, {} as Record<string, DataSource[]>)

    // Fetch installed integrations
    useEffect(() => {
        const fetchIntegrations = async () => {
            if (!currentOrganization) return;

            try {
                const query = new URLSearchParams({
                    organizationId: currentOrganization.id
                });
                if (currentTenant) {
                    query.append('tenantId', currentTenant.id);
                }

                const response = await fetch(`/api/github/config?${query.toString()}`, {
                    headers: getAuthHeader()
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.installed) {
                        setInstalledExporters([{
                            id: data.config.installationId || 'github-app',
                            name: `Github - ${currentOrganization.name}`, // Or org slug?
                            icon: 'GitHub',
                            status: 'active',
                            category: 'Exporters',
                            details: {
                                services: 'Service',
                                pullRequests: 'Pull Request'
                            }
                        }]);
                    } else {
                        setInstalledExporters([]);
                    }
                } else {
                    setInstalledExporters([]);
                }
            } catch (err) {
                console.error('Failed to fetch integrations:', err);
            }
        };

        fetchIntegrations();
    }, [currentOrganization, currentTenant]);

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header with filters */}
            <div className="border-b bg-white">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">Data sources</h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setIsNewDataSourceModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                                <Plus className="h-4 w-4" />
                                Data source
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="px-6 pb-3">
                    <div className="flex items-center gap-2">
                        {categories.map((category) => {

                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${selectedCategory === category
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Installed Exporters Section */}
            {installedExporters.length > 0 && (selectedCategory === 'All' || selectedCategory === 'Exporters') && (
                <div className="px-6 py-6 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Exporters</h2>
                    <div className="space-y-3">
                        {installedExporters.map((exporter) => (
                            <div
                                key={exporter.id}
                                className="bg-white border boundary-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                                onClick={() => setIsGitHubConfigModalOpen(true)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <span className="text-2xl">{exporter.icon === 'GitHub' ? <svg role="img" viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.896-.014 3.293 0 .319.22.694.825.576C20.566 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg> : exporter.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                            {exporter.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <Box className="w-3 h-3" />
                                                {exporter.details.services}
                                            </span>
                                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                                                <GitPullRequest className="w-3 h-3" />
                                                {exporter.details.pullRequests}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500">Last catalog update: <strong>an hour ago</strong></span>
                                    <button
                                        onClick={handleSync}
                                        className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${isSyncing ? 'animate-spin text-primary-600' : ''}`}
                                        disabled={isSyncing}
                                        title="Trigger manual sync"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Data Sources Grid */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(groupedByCategory)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([category, sources]) => (
                        <div key={category} className="px-6 py-6">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                                {category}
                            </h2>

                            {/* Card for category with all sources */}
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <h3 className="font-medium text-gray-900">{category === 'API' ? 'REST API' : category}</h3>
                                    </div>
                                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Grid of data source items */}
                                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                                    {sources.map((source) => (
                                        <button
                                            key={source.id}
                                            onClick={() => setSelectedSource(source)}
                                            className="flex items-center gap-2 hover:bg-white hover:shadow-sm rounded px-2 py-1 -mx-2 -my-1 transition-all text-left"
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${source.status === 'active'
                                                ? 'bg-green-500'
                                                : source.status === 'waiting'
                                                    ? 'bg-orange-400'
                                                    : 'bg-gray-400'
                                                }`} />
                                            <span className="text-xs text-gray-600">{source.icon}</span>
                                            <span className="text-sm text-gray-700 truncate">{source.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                {filteredSources.length === 0 && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-gray-500">No data sources found</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedSource && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedSource(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b">
                            <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                                <span className="text-sm">{selectedSource.icon}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">{selectedSource.category}</h2>
                            <button
                                onClick={() => setSelectedSource(null)}
                                className="ml-auto p-1 hover:bg-gray-100 rounded"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 px-6 border-b">
                            <button
                                onClick={() => setActiveTab('ingested')}
                                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ingested'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Ingested data
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'audit'
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Audit log
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                            {activeTab === 'ingested' && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-4">
                                            To ingest a new {selectedSource.name}, copy the following example to your script.{' '}
                                            <a href="#" className="text-primary-600 hover:underline inline-flex items-center gap-1">
                                                Read more
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </p>

                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Blueprint API example
                                            </label>
                                            <div className="relative">
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white">
                                                    <option>{selectedSource.name}</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Language Tabs */}
                                        <div className="flex items-center gap-2 mb-3">
                                            {(['curl', 'python', 'javascript', 'go'] as const).map((lang) => (
                                                <button
                                                    key={lang}
                                                    onClick={() => setActiveLanguage(lang)}
                                                    className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${activeLanguage === lang
                                                        ? 'bg-primary-100 text-primary-700'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {lang === 'curl' && '⚡'}
                                                    {lang === 'python' && '🐍'}
                                                    {lang === 'javascript' && 'JS'}
                                                    {lang === 'go' && '🔵'}
                                                    <span className="capitalize">{lang === 'javascript' ? 'Javascript' : lang.toUpperCase()}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Code Block */}
                                        <div className="relative bg-gray-900 rounded-lg p-4">
                                            <button
                                                onClick={() => {
                                                    // Copy to clipboard logic
                                                    navigator.clipboard.writeText(getCodeExample(selectedSource, activeLanguage))
                                                }}
                                                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <pre className="text-xs text-gray-100 overflow-x-auto">
                                                <code>{getCodeExample(selectedSource, activeLanguage)}</code>
                                            </pre>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-3">
                                            # The token will be available in the access_token variable
                                        </p>

                                        <div className="mt-4 pt-4 border-t">
                                            <code className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                                blueprint_id='githubRepository'
                                            </code>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'audit' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        See the recent catalog changes made by this data source and debug issues using the following table.
                                    </p>

                                    {/* Search and Filter Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search columns"
                                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                            <Filter className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                            <EyeOff className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Audit Log Table */}
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="w-10 px-4 py-3"></th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Operation
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Blueprint
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Entity
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Error
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {/* Sample audit log entries */}
                                                    {[
                                                        { operation: 'Timer Expiration', blueprint: 'Developer Env', entity: 'systemswayacademy', error: '', status: 'Success' },
                                                        { operation: 'Timer Expiration', blueprint: 'Developer Env', entity: 'test', error: '', status: 'Success' },
                                                        { operation: 'Timer Expiration', blueprint: 'Developer Env', entity: 'my-new-env-donald', error: '', status: 'Success' },
                                                        { operation: 'Timer Expiration', blueprint: 'Developer Env', entity: 'my-new-dev-env', error: '', status: 'Success' },
                                                        { operation: 'Timer Expiration', blueprint: 'Developer Env', entity: 'env1', error: '', status: 'Success' },
                                                    ].map((log, index) => (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3">
                                                                <button className="text-gray-400 hover:text-gray-600">
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                                                        <X className="w-3.5 h-3.5 text-red-600" />
                                                                    </div>
                                                                    <span className="text-sm text-gray-900">{log.operation}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                                                                        <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <span className="text-sm text-gray-700">{log.blueprint}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <a href="#" className="text-sm text-primary-600 hover:underline">
                                                                    {log.entity}
                                                                </a>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="text-sm text-gray-500">-</span>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700">
                                                                    {log.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Results Count */}
                                    <div className="text-sm text-gray-600">
                                        1000 results
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                            <button
                                onClick={() => setSelectedSource(null)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-gray-600">Data ingested successfully</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <NewDataSourceModal
                isOpen={isNewDataSourceModalOpen}
                onClose={() => setIsNewDataSourceModalOpen(false)}
                onSelectSource={(sourceId) => {
                    if (sourceId === 'github') {
                        setIsNewDataSourceModalOpen(false)
                        // Directly open install modal for GitHub
                        setIsGitHubInstallModalOpen(true)
                    }
                }}
            />

            <GitHubInstallModal
                isOpen={isGitHubInstallModalOpen}
                onClose={() => setIsGitHubInstallModalOpen(false)}
                onBack={() => {
                    setIsGitHubInstallModalOpen(false)
                    setIsNewDataSourceModalOpen(true)
                }}
                onDone={() => {
                    setIsGitHubInstallModalOpen(false)
                    // Simulate installation
                    setInstalledExporters(prev => [...prev, {
                        id: 'github-app',
                        name: 'Github - aemyorg',
                        icon: 'GitHub',
                        status: 'active',
                        category: 'Exporters',
                        details: {
                            services: 'Service',
                            pullRequests: 'Pull Request'
                        }
                    }])
                }}
            />

            <GitHubConfigModal
                isOpen={isGitHubConfigModalOpen}
                onClose={() => setIsGitHubConfigModalOpen(false)}
                orgName="aemyorg"
                organizationId={currentOrganization?.id || ''}
                tenantId={currentTenant?.id}
            />
        </div>
    )
}

// Helper function to get code examples
function getCodeExample(source: DataSource, language: 'curl' | 'python' | 'javascript' | 'go'): string {
    const examples = {
        curl: `# Dependencies to install:
# For apt:
# $ sudo apt-get install jq
# For yum:
# $ sudo yum install jq

access_token=$(curl --location --request POST 'https://api.showcase.port.io/v1/auth/access_token' --header 'Content-Type: application/json' \\
--data-raw '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "AaeQLW0Cf7fiB1uJRy1lAISfIEjugEIgl8j05WIdGFpDGVAp2S7wMgpKyQu2gJG"
}' | jq '.accessToken' | sed 's/"//g')

# The token will be available in the access_token variable

blueprint_id='githubRepository'`,
        python: `import requests

# Get access token
response = requests.post(
    'https://api.showcase.port.io/v1/auth/access_token',
    json={
        'clientId': 'YOUR_CLIENT_ID',
        'clientSecret': 'AaeQLW0Cf7fiB1uJRy1lAISfIEjugEIgl8j05WIdGFpDGVAp2S7wMgpKyQu2gJG'
    }
)
access_token = response.json()['accessToken']

blueprint_id = 'githubRepository'`,
        javascript: `const axios = require('axios');

// Get access token
const response = await axios.post(
    'https://api.showcase.port.io/v1/auth/access_token',
    {
        clientId: 'YOUR_CLIENT_ID',
        clientSecret: 'AaeQLW0Cf7fiB1uJRy1lAISfIEjugEIgl8j05WIdGFpDGVAp2S7wMgpKyQu2gJG'
    }
);
const accessToken = response.data.accessToken;

const blueprintId = 'githubRepository';`,
        go: `package main

import (
    "encoding/json"
    "net/http"
)

func main() {
    // Get access token
    resp, _ := http.Post(
        "https://api.showcase.port.io/v1/auth/access_token",
        "application/json",
        strings.NewReader(\`{
            "clientId": "YOUR_CLIENT_ID",
            "clientSecret": "AaeQLW0Cf7fiB1uJRy1lAISfIEjugEIgl8j05WIdGFpDGVAp2S7wMgpKyQu2gJG"
        }\`),
    )

    blueprintId := "githubRepository"
}`
    }

    return examples[language]
}
