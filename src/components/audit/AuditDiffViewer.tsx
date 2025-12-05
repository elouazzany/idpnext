import { useMemo, useState } from 'react'
import { Columns2, List, Minimize2 } from 'lucide-react'
import { clsx } from 'clsx'

interface DiffLine {
    lineNumber: number
    type: 'add' | 'remove' | 'context'
    content: string
}

interface AuditDiffViewerProps {
    diff: any
}

export function AuditDiffViewer({ diff }: AuditDiffViewerProps) {
    const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
    const [isCompact, setIsCompact] = useState(false)

    const { beforeLines, afterLines, diffLines } = useMemo(() => {
        if (!diff || !diff.before || !diff.after) {
            return { beforeLines: [], afterLines: [], diffLines: [] }
        }

        const beforeContent = JSON.stringify(diff.before, null, 2)
        const afterContent = JSON.stringify(diff.after, null, 2)

        const beforeLinesList = beforeContent.split('\n')
        const afterLinesList = afterContent.split('\n')

        const lines: DiffLine[] = []
        const maxLines = Math.max(beforeLinesList.length, afterLinesList.length)

        for (let i = 0; i < maxLines; i++) {
            const beforeLine = beforeLinesList[i] || ''
            const afterLine = afterLinesList[i] || ''

            if (beforeLine !== afterLine) {
                if (beforeLine && !afterLinesList.includes(beforeLine)) {
                    lines.push({
                        lineNumber: i + 1,
                        type: 'remove',
                        content: beforeLine
                    })
                }
                if (afterLine && !beforeLinesList.includes(afterLine)) {
                    lines.push({
                        lineNumber: i + 1,
                        type: 'add',
                        content: afterLine
                    })
                }
            } else if (!isCompact) {
                lines.push({
                    lineNumber: i + 1,
                    type: 'context',
                    content: beforeLine
                })
            }
        }

        return {
            beforeLines: beforeLinesList,
            afterLines: afterLinesList,
            diffLines: lines
        }
    }, [diff, isCompact])

    if (!diff) {
        return (
            <div className="px-6 py-4 text-sm text-gray-500">
                No diff available
            </div>
        )
    }

    return (
        <div className="bg-gray-50 border-t border-gray-200">
            {/* Controls */}
            <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-2 bg-white">
                <span className="text-xs font-medium text-gray-500 mr-2">View:</span>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <button
                        onClick={() => setViewMode('unified')}
                        className={clsx(
                            'px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5',
                            viewMode === 'unified'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        <List className="w-3.5 h-3.5" />
                        Unified
                    </button>
                    <button
                        onClick={() => setViewMode('split')}
                        className={clsx(
                            'px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 border-l border-gray-300',
                            viewMode === 'split'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        )}
                    >
                        <Columns2 className="w-3.5 h-3.5" />
                        Side by Side
                    </button>
                </div>

                {/* Compact Toggle */}
                <button
                    onClick={() => setIsCompact(!isCompact)}
                    className={clsx(
                        'px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1.5 rounded-md border',
                        isCompact
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                >
                    <Minimize2 className="w-3.5 h-3.5" />
                    Compact
                </button>
            </div>

            <div className="overflow-x-auto">
                {viewMode === 'unified' ? (
                    // Unified View
                    <table className="w-full text-xs font-mono">
                        <tbody>
                            {diffLines.map((line, idx) => (
                                <tr
                                    key={idx}
                                    className={
                                        line.type === 'add'
                                            ? 'bg-green-50'
                                            : line.type === 'remove'
                                                ? 'bg-red-50'
                                                : 'bg-white'
                                    }
                                >
                                    <td className="px-4 py-1 text-gray-400 text-right select-none w-12 border-r border-gray-200">
                                        {line.lineNumber}
                                    </td>
                                    <td className="px-4 py-1 w-6">
                                        {line.type === 'add' && (
                                            <span className="text-green-600">+</span>
                                        )}
                                        {line.type === 'remove' && (
                                            <span className="text-red-600">-</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-1">
                                        <pre className="whitespace-pre-wrap break-all">
                                            {line.content}
                                        </pre>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    // Side by Side View
                    <div className="grid grid-cols-2 gap-px bg-gray-200">
                        <div className="bg-white">
                            <div className="px-4 py-2 bg-red-100 border-b border-gray-200 text-xs font-semibold text-red-800">
                                Before
                            </div>
                            <table className="w-full text-xs font-mono">
                                <tbody>
                                    {beforeLines.map((line, idx) => {
                                        const isChanged = beforeLines[idx] !== afterLines[idx]
                                        const isRemoved = isChanged && line && !afterLines.includes(line)

                                        if (isCompact && !isRemoved && !isChanged) return null

                                        return (
                                            <tr
                                                key={idx}
                                                className={isRemoved ? 'bg-red-50' : isChanged ? 'bg-orange-50' : 'bg-white'}
                                            >
                                                <td className="px-4 py-1 text-gray-400 text-right select-none w-12 border-r border-gray-200">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-1 w-6">
                                                    {isRemoved && <span className="text-red-600">-</span>}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <pre className="whitespace-pre-wrap break-all">
                                                        {line}
                                                    </pre>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-white">
                            <div className="px-4 py-2 bg-green-100 border-b border-gray-200 text-xs font-semibold text-green-800">
                                After
                            </div>
                            <table className="w-full text-xs font-mono">
                                <tbody>
                                    {afterLines.map((line, idx) => {
                                        const isChanged = beforeLines[idx] !== afterLines[idx]
                                        const isAdded = isChanged && line && !beforeLines.includes(line)

                                        if (isCompact && !isAdded && !isChanged) return null

                                        return (
                                            <tr
                                                key={idx}
                                                className={isAdded ? 'bg-green-50' : isChanged ? 'bg-orange-50' : 'bg-white'}
                                            >
                                                <td className="px-4 py-1 text-gray-400 text-right select-none w-12 border-r border-gray-200">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-1 w-6">
                                                    {isAdded && <span className="text-green-600">+</span>}
                                                </td>
                                                <td className="px-2 py-1">
                                                    <pre className="whitespace-pre-wrap break-all">
                                                        {line}
                                                    </pre>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
