import { useState, useEffect } from 'react'
import { X, Info } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/AuthContext'
import { organizationsApi } from '@/services/api'

interface OrganizationSettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

type TabType = 'Logo' | 'Settings' | 'AI' | 'Announcement' | 'Port Support Access'

export function OrganizationSettingsModal({ isOpen, onClose }: OrganizationSettingsModalProps) {
    const { currentOrganization, refreshUser } = useAuth()
    const [activeTab, setActiveTab] = useState<TabType>('Logo')

    // Form State
    const [title, setTitle] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [autoUserAccess, setAutoUserAccess] = useState(false)
    const [enableAnnouncement, setEnableAnnouncement] = useState(false)
    const [announcement, setAnnouncement] = useState('')
    const [announcementLink, setAnnouncementLink] = useState('')
    const [enableSupportAccess, setEnableSupportAccess] = useState(true)
    const [accessDuration, setAccessDuration] = useState('Indefinitely')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load organization data
    useEffect(() => {
        if (isOpen && currentOrganization) {
            setTitle(currentOrganization.name || '')
            setLogoUrl(currentOrganization.logoUrl || '')

            // Load settings if they exist
            const settings = currentOrganization.settings as any || {}
            setAutoUserAccess(settings.autoUserAccess || false)
            setEnableAnnouncement(settings.enableAnnouncement || false)
            setAnnouncement(settings.announcement || '')
            setAnnouncementLink(settings.announcementLink || '')
            setEnableSupportAccess(settings.enableSupportAccess ?? true)
            setAccessDuration(settings.accessDuration || 'Indefinitely')
        }
    }, [isOpen, currentOrganization])

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

    const handleSave = async () => {
        if (!currentOrganization) return

        setIsLoading(true)
        setError(null)

        try {
            const settings = {
                autoUserAccess,
                enableAnnouncement,
                announcement,
                announcementLink,
                enableSupportAccess,
                accessDuration
            }

            await organizationsApi.updateOrganization(currentOrganization.id, {
                name: title,
                logoUrl,
                settings
            })

            await refreshUser()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to update organization settings')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">Organization settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-6 pt-4 border-b flex-shrink-0 overflow-x-auto">
                    {(['Logo', 'Settings', 'AI', 'Announcement', 'Port Support Access'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-md transition-colors",
                                activeTab === tab
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Logo Tab */}
                    {activeTab === 'Logo' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo URL
                                </label>
                                <input
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Previews</p>

                                {/* Light theme preview */}
                                <div className="mb-3 p-4 bg-gray-50 rounded-md flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M7 7h10v10H7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{title}</span>
                                </div>

                                {/* Dark theme preview */}
                                <div className="p-4 bg-gray-900 rounded-md flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M7 7h10v10H7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-white">{title}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'Settings' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Automatic user access</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Allow anyone signing in via SSO to join this org as a member
                                    </p>
                                    <button
                                        onClick={() => setAutoUserAccess(!autoUserAccess)}
                                        className={clsx(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            autoUserAccess ? "bg-green-500" : "bg-gray-300"
                                        )}
                                    >
                                        <span
                                            className={clsx(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                autoUserAccess ? "translate-x-6" : "translate-x-1"
                                            )}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AI Tab */}
                    {activeTab === 'AI' && (
                        <div className="space-y-4">
                            <div className="flex gap-3 p-4 bg-blue-50 rounded-md border border-blue-200">
                                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-gray-700">
                                    <p>
                                        Your account doesn't have access to AI features. Reach your account manager or contact
                                        support to get access.
                                    </p>
                                </div>
                            </div>
                            <a href="#" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M9 11l3 3L22 4" />
                                </svg>
                                Learn how your data is being used
                            </a>
                        </div>
                    )}

                    {/* Announcement Tab */}
                    {activeTab === 'Announcement' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">Enable announcement</span>
                                <button
                                    onClick={() => setEnableAnnouncement(!enableAnnouncement)}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        enableAnnouncement ? "bg-green-500" : "bg-gray-300"
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            enableAnnouncement ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Announcement<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={announcement}
                                        onChange={(e) => setAnnouncement(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                    <button className="absolute bottom-2 right-2 p-1 text-blue-500 hover:bg-blue-50 rounded">
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="12" r="10" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Link (optional)
                                </label>
                                <input
                                    type="text"
                                    value={announcementLink}
                                    onChange={(e) => setAnnouncementLink(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-3">Previews</p>

                                {/* Light theme banner */}
                                <div className="mb-3 p-4 bg-blue-100 rounded-md">
                                    <p className="text-sm text-gray-900">{announcement || 'Your announcement will appear here'}</p>
                                </div>

                                {/* Dark theme banner */}
                                <div className="p-4 bg-gray-800 rounded-md">
                                    <p className="text-sm text-white">{announcement || 'Your announcement will appear here'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 p-3 bg-gray-50 rounded-md">
                                <Info className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-600">
                                    Users can dismiss the banner, and it will stay hidden until the admin updates the announcement.{' '}
                                    <a href="#" className="text-blue-600 hover:underline">
                                        Learn more
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Port Support Access Tab */}
                    {activeTab === 'Port Support Access' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">Enable support user access</span>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <Info className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setEnableSupportAccess(!enableSupportAccess)}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                        enableSupportAccess ? "bg-green-500" : "bg-gray-300"
                                    )}
                                >
                                    <span
                                        className={clsx(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            enableSupportAccess ? "translate-x-6" : "translate-x-1"
                                        )}
                                    />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Access Duration
                                </label>
                                <select
                                    value={accessDuration}
                                    onChange={(e) => setAccessDuration(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option>Indefinitely</option>
                                    <option>1 hour</option>
                                    <option>24 hours</option>
                                    <option>7 days</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4 border-t flex-shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className={clsx(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            isLoading
                                ? "bg-blue-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}
