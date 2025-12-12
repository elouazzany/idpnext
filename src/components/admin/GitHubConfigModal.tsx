import { useState, useEffect } from 'react'
import { X, Play, RotateCw, ChevronRight, FileJson, Check, AlertCircle, Save } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { clsx } from 'clsx'
import { IconDisplay } from '../IconDisplay'
import { getAuthHeader } from '@/utils/auth'

interface GitHubConfigModalProps {
    isOpen: boolean
    onClose: () => void
    orgName: string // e.g. "aemyorg"
    organizationId: string
    tenantId?: string
}

type TabType = 'Mapping' | 'Audit log' | 'Event log'

export function GitHubConfigModal({ isOpen, onClose, orgName, organizationId, tenantId }: GitHubConfigModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('Mapping')
    const [selectedKind, setSelectedKind] = useState('repository')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Editor states
    const [jsonInput, setJsonInput] = useState<string>(JSON.stringify({
        "id": 912756474,
        "name": "deployments-config",
        "full_name": "aemyorg/deployments-config",
        "private": true,
        "owner": {
            "login": "aemyorg",
            "id": 193879850,
            "url": "https://api.github.com/users/aemyorg"
        },
        "html_url": "https://github.com/aemyorg/deployments-config",
        "description": null,
        "created_at": "2025-12-10T19:26:00Z",
        "updated_at": "2025-12-10T19:26:00Z"
    }, null, 2))

    const [mappingRule, setMappingRule] = useState<string>('')

    const [testResult, setTestResult] = useState<string>('')

    // Fetch config on open
    useEffect(() => {
        if (isOpen && organizationId) {
            const fetchConfig = async () => {
                setIsLoading(true)
                try {
                    const query = new URLSearchParams({
                        organizationId
                    });
                    if (tenantId) {
                        query.append('tenantId', tenantId);
                    }

                    const response = await fetch(`/api/github/config?${query.toString()}`, {
                        headers: getAuthHeader()
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.installed && data.config?.mappingYaml) {
                            setMappingRule(data.config.mappingYaml);
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch config:', err);
                } finally {
                    setIsLoading(false)
                }
            };
            fetchConfig();
        }
    }, [isOpen, organizationId, tenantId])

    const handleSave = async () => {
        if (!organizationId) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/github/config', {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    organizationId,
                    tenantId,
                    mappingYaml: mappingRule
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save config');
            }
            // Maybe show success toast?
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    const handleTestMapping = () => {
        // Mock transformation logic for display
        setTestResult(JSON.stringify({
            "repository": {
                "identifier": "deployments-config",
                "title": "deployments-config",
                "blueprint": "service",
                "properties": {
                    "readme": "<README.md Content>",
                    "url": "https://github.com/aemyorg/deployments-config"
                }
            }
        }, null, 2))
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[95vh] flex flex-col font-sans overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10">
                    <div className="flex items-center gap-3">
                        <IconDisplay name="GitHub" className="w-6 h-6" />
                        <h2 className="text-lg font-semibold text-gray-900">{orgName}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {(['Mapping', 'Audit log', 'Event log'] as TabType[]).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                        activeTab === tab
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeTab === 'Mapping' && (
                        <div className="flex flex-col p-6 space-y-6">

                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Map data from GitHub into Port</h3>
                                    <p className="text-sm text-blue-700">
                                        Write JQ to map data from GitHub into the relevant blueprints. You can test the JQ by loading an example data or manually entering one.
                                    </p>
                                </div>
                                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                    Learn More <ChevronRight className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Kinds Selection */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-4 mb-4">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Kinds to test</h4>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1/4 min-w-[200px] border-r border-gray-200 pr-4">
                                        <div className="space-y-1">
                                            {['repository', 'pull-request', 'team', 'issue'].map(kind => (
                                                <button
                                                    key={kind}
                                                    onClick={() => setSelectedKind(kind)}
                                                    className={clsx(
                                                        "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between",
                                                        selectedKind === kind
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "text-gray-600 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {kind}
                                                </button>
                                            ))}
                                            <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-2">
                                                <span className="text-lg leading-none">+</span> Kind to test
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500">repository #1 - Dec 10 2025 20:26:00</span>
                                            <div className="flex gap-2">
                                                <button className="p-1 hover:bg-gray-100 rounded" title="Refresh">
                                                    <RotateCw className="w-3 h-3 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-64 border border-gray-200 rounded-md overflow-hidden">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="json"
                                                value={jsonInput}
                                                onChange={(val) => setJsonInput(val || '')}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 12,
                                                    lineNumbers: 'on',
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mapping Logic Split View */}
                            <div className="flex-1 flex gap-6 min-h-[400px]">
                                {/* Mapping Rule Editor */}
                                <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-sm font-semibold text-gray-900">Mapping</h3>
                                        <div className="flex items-center gap-2">
                                            <a href="#" className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                Cheatsheet <ChevronRight className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Editor
                                            height="100%"
                                            defaultLanguage="yaml"
                                            value={isLoading ? 'Loading...' : mappingRule}
                                            onChange={(val) => setMappingRule(val || '')}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 12,
                                                lineNumbers: 'on',
                                                scrollBeyondLastLine: false,
                                                automaticLayout: true,
                                                renderWhitespace: 'all'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Test Result */}
                                <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                        <h3 className="text-sm font-semibold text-gray-900">Test result</h3>
                                        <button
                                            onClick={handleTestMapping}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors"
                                        >
                                            <Play className="w-3 h-3" />
                                            Test mapping
                                        </button>
                                    </div>
                                    <div className="flex-1 relative bg-gray-50">
                                        {testResult ? (
                                            <Editor
                                                height="100%"
                                                defaultLanguage="json"
                                                value={testResult}
                                                options={{
                                                    readOnly: true,
                                                    minimap: { enabled: false },
                                                    fontSize: 12,
                                                    lineNumbers: 'on',
                                                    scrollBeyondLastLine: false,
                                                    automaticLayout: true,
                                                }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                                                Run test to see results
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {(activeTab === 'Audit log' || activeTab === 'Event log') && (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>No logs available yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white border-t px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-600">Last catalog update: <strong>an hour ago</strong></span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Data ingested successfully
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <span className="text-sm text-gray-600">Manage this integration using "port-app-config.yml"</span>
                            <a href="#" className="text-blue-600 hover:underline text-xs"><ChevronRight className="w-3 h-3 inline" /></a>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">
                            Resync
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                        >
                            {isSaving ? (
                                <RotateCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
