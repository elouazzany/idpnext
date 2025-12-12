import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { IconDisplay } from '../IconDisplay'
import { clsx } from 'clsx'

interface NewDataSourceModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectSource?: (sourceId: string) => void
}

type TabType = 'Exporters' | 'API' | 'GitOps' | 'IaC' | 'Webhook'

interface Integration {
    id: string
    name: string
    icon: string
    badges?: Array<'Beta' | 'Community'>
}

interface Section {
    title: string
    items: Integration[]
}

const TABS: TabType[] = ['Exporters', 'API', 'GitOps', 'IaC', 'Webhook']

const EXPORTERS_DATA: Section[] = [
    {
        title: 'Git Providers',
        items: [
            { id: 'github', name: 'GitHub', icon: 'GitHub' },
            { id: 'azure-devops', name: 'Azure DevOps', icon: 'Azure DevOps' },
            { id: 'bitbucket-cloud', name: 'Bitbucket Cloud', icon: 'Bitbucket' },
            { id: 'gitlab', name: 'GitLab', icon: 'GitLab' },
            { id: 'bitbucket-server', name: 'Bitbucket Server', icon: 'Bitbucket' },
            { id: 'github-ocean', name: 'Github-ocean', icon: 'GitHub', badges: ['Beta'] },
        ]
    },
    {
        title: 'Kubernetes Stack',
        items: [
            { id: 'argo-cd', name: 'Argo CD', icon: 'Argo', badges: ['Community'] }, // Argo icon might be tricky, checking simple-icons name typically "Argo"
            { id: 'komodor', name: 'Komodor', icon: 'Komodor', badges: ['Community'] }, // hypothetical
            { id: 'istio', name: 'Istio', icon: 'Istio' },
            { id: 'kubernetes', name: 'Kubernetes', icon: 'Kubernetes' },
        ]
    },
    {
        title: 'Cloud Providers',
        items: [
            { id: 'aws', name: 'AWS', icon: 'Amazon AWS' },
            { id: 'azure', name: 'Azure', icon: 'Microsoft Azure' },
            { id: 'gcp', name: 'Google Cloud', icon: 'Google Cloud' },
        ]
    },
    {
        title: 'IaC',
        items: [
            { id: 'terraform-cloud', name: 'Terraform Cloud', icon: 'Terraform' },
        ]
    },
    {
        title: 'Secret Management',
        items: [
            { id: '1password', name: '1Password', icon: '1Password' },
            { id: 'vault', name: 'Vault', icon: 'Vault' },
            { id: 'aws-secrets', name: 'AWS Secrets Manager', icon: 'Amazon AWS' },
        ]
    },
    {
        title: 'Vulnerability Scanners',
        items: [
            { id: 'snyk', name: 'Snyk', icon: 'Snyk' },
            { id: 'mend', name: 'Mend', icon: 'Mend' }, // check if exists
            { id: 'wiz', name: 'Wiz', icon: 'Wiz' }, // check if exists
        ]
    },
    {
        title: 'CI/CD',
        items: [
            { id: 'jenkins', name: 'Jenkins', icon: 'Jenkins' },
            { id: 'github-actions', name: 'GitHub Actions', icon: 'GitHub Actions' },
        ]
    },
    {
        title: 'Notification',
        items: [
            { id: 'slack', name: 'Slack', icon: 'Slack' },
            { id: 'teams', name: 'Microsoft Teams', icon: 'Microsoft Teams' },
        ]
    },
    {
        title: 'Cost Management',
        items: [
            { id: 'kubecost', name: 'Kubecost', icon: 'Kubecost' }, // check if exists
        ]
    },
    {
        title: 'Other',
        items: [
            { id: 'pagerduty', name: 'PagerDuty', icon: 'PagerDuty' },
            { id: 'prometheus', name: 'Prometheus', icon: 'Prometheus' },
            { id: 'dynatrace', name: 'Dynatrace', icon: 'Dynatrace' },
        ]
    }
]

export function NewDataSourceModal({ isOpen, onClose, onSelectSource }: NewDataSourceModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('Exporters')

    // Close on escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col font-sans">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">New data source</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 py-2 bg-gray-50 border-b">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm border",
                                activeTab === tab
                                    ? "bg-white text-gray-900 border-gray-200"
                                    : "bg-transparent text-gray-500 border-transparent hover:bg-gray-200/50"
                            )}
                        >
                            <span className={clsx(
                                "w-4 h-4 rounded flex items-center justify-center",
                                tab === 'Exporters' && "text-gray-900",
                                tab === 'API' && "text-blue-500",
                                tab === 'GitOps' && "text-orange-500",
                                tab === 'IaC' && "text-purple-500",
                                tab === 'Webhook' && "text-pink-500",
                            )}>
                                {/* Icons for tabs can be added here if needed, keeping it simple for now as per design */}
                                {tab === 'Exporters' && <span className="rotate-90">⤵️</span>}
                                {tab === 'API' && <span className="text-xl leading-none">⚡</span>}
                                {tab === 'GitOps' && <span className="text-xl leading-none">🔄</span>}
                                {tab === 'IaC' && <span className="text-xl leading-none">☁️</span>}
                                {tab === 'Webhook' && <span className="text-xl leading-none">🔗</span>}
                            </span>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Description */}
                        {activeTab === 'Exporters' && (
                            <div className="space-y-8">
                                {EXPORTERS_DATA.map((section) => (
                                    <div key={section.title}>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{section.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Export data from your {section.title.toLowerCase()}...
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {section.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => onSelectSource?.(item.id)}
                                                    className="group relative flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all h-40"
                                                >
                                                    {/* Badges */}
                                                    {item.badges?.map((badge, i) => (
                                                        <span
                                                            key={i}
                                                            className={clsx(
                                                                "absolute top-3 left-3 px-2 py-0.5 text-[10px] font-medium rounded-full border",
                                                                badge === 'Beta' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                                    badge === 'Community' ? "bg-gray-100 text-gray-600 border-gray-200" : ""
                                                            )}
                                                        >
                                                            {badge}
                                                        </span>
                                                    ))}

                                                    {/* Flag/Region (mocked as Dutch flag in screenshot for some reason?) */}
                                                    <div className="absolute top-3 right-3 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="w-4 h-3 bg-gray-100 rounded-sm"></div>
                                                    </div>

                                                    <div className="w-12 h-12 mb-4 flex items-center justify-center">
                                                        <IconDisplay name={item.icon} className="w-10 h-10" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab !== 'Exporters' && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <p>Content for {activeTab} coming soon...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
