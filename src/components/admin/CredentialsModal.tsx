import { useState, useEffect } from 'react'
import { X, Copy, Key, RotateCw, Building2, User } from 'lucide-react'
import { clsx } from 'clsx'

interface CredentialsModalProps {
    isOpen: boolean
    onClose: () => void
}

type TabType = 'Organization' | 'Personal'

export function CredentialsModal({ isOpen, onClose }: CredentialsModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('Organization')
    const [copied, setCopied] = useState<string | null>(null)

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isOpen, onClose])

    // Mock credentials data
    const credentials = {
        orgId: 'org_DMU9ELbeKA8PfWmd',
        clientId: 'yX6N2ViJkqcgSn1MWWc1z4s1XzOlLad',
        clientSecret: 'AaeQLWOcf7fB1uJRyilAISflEjuqETgit8jO5WlGdrFpDGVAp2S7vWqpKyQu2g..'
    }

    const handleCopy = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(field)
            setTimeout(() => setCopied(null), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-gray-900" />
                        <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 px-6 pt-4 border-b">
                    <button
                        onClick={() => setActiveTab('Organization')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'Organization'
                                ? "border-gray-900 text-gray-900"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Building2 className="h-4 w-4" />
                        Organization
                    </button>
                    <button
                        onClick={() => setActiveTab('Personal')}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                            activeTab === 'Personal'
                                ? "border-gray-900 text-gray-900"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <User className="h-4 w-4" />
                        Personal
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Org ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Org ID
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={credentials.orgId}
                                readOnly
                                className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 font-mono"
                            />
                            <button
                                onClick={() => handleCopy(credentials.orgId, 'orgId')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                title="Copy"
                            >
                                {copied === 'orgId' ? (
                                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Client ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client ID
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={credentials.clientId}
                                readOnly
                                className="w-full px-3 py-2 pr-10 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 font-mono"
                            />
                            <button
                                onClick={() => handleCopy(credentials.clientId, 'clientId')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                title="Copy"
                            >
                                {copied === 'clientId' ? (
                                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Client Secret */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Secret
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={credentials.clientSecret}
                                readOnly
                                className="w-full px-3 py-2 pr-20 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900 font-mono"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                <button
                                    onClick={() => handleCopy(credentials.clientSecret, 'clientSecret')}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                    title="Copy"
                                >
                                    {copied === 'clientSecret' ? (
                                        <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                                <button
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                    title="Rotate secret"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* JWT Token */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            JWT Token
                        </label>
                        <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
                            Generate API token
                        </button>
                    </div>

                    {/* Info Boxes */}
                    <div className="space-y-3">
                        {/* Warning */}
                        <div className="flex gap-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">
                                The client secret will soon be hidden. Save it now to avoid losing access. Rotating it could break existing applications.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="flex gap-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex-shrink-0 mt-0.5">
                                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">
                                Use your credentials to{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    interact with the API
                                </a>
                                , use integrations and verify{' '}
                                <a href="#" className="text-blue-600 hover:underline">
                                    webhooks
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
