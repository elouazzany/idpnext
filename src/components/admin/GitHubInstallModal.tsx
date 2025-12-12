import { useState, useEffect } from 'react'
import { X, ArrowLeft, Github } from 'lucide-react'
import { IconDisplay } from '../IconDisplay'

interface GitHubInstallModalProps {
    isOpen: boolean
    onClose: () => void
    onBack: () => void
    onDone: () => void
}

export function GitHubInstallModal({ isOpen, onClose, onBack, onDone }: GitHubInstallModalProps) {
    const [selectedType, setSelectedType] = useState('Cloud')

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <IconDisplay name="GitHub" className="w-5 h-5" />
                        <h2 className="text-lg font-semibold text-gray-900">Generate new GitHub data source</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="max-w-md">
                        <div className="mb-6">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Cloud">Cloud</option>
                                <option value="Server">Server</option>
                            </select>
                        </div>

                        <p className="text-gray-600 text-sm">
                            Install the cloud GitHub App{' '}
                            <a href="#" className="text-blue-600 hover:underline inline-flex items-center gap-0.5">
                                here
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <button
                        onClick={onDone}
                        className="px-4 py-2 bg-gray-100 text-gray-400 font-medium text-sm rounded-md hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
