import { Layers, X, Check } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useState } from 'react'

interface GroupByMenuProps {
    columns: { id: string; label: string }[]
    selectedGroupBy: string[]
    onGroupByChange: (columnIds: string[]) => void
}

export function GroupByMenu({ columns, selectedGroupBy, onGroupByChange }: GroupByMenuProps) {
    const [open, setOpen] = useState(false)

    const toggleColumn = (columnId: string) => {
        if (selectedGroupBy.includes(columnId)) {
            onGroupByChange(selectedGroupBy.filter(id => id !== columnId))
        } else {
            onGroupByChange([...selectedGroupBy, columnId])
        }
    }

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
                <button
                    className={`p-1.5 border rounded-md hover:bg-gray-50 flex items-center gap-2 ${selectedGroupBy.length > 0 ? 'bg-primary-50 text-primary-700 border-primary-200' : 'border-gray-300 text-gray-700'
                        }`}
                    title="Group by"
                >
                    <Layers className="h-3.5 w-3.5" />
                    {selectedGroupBy.length > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="text-xs font-medium">
                                {selectedGroupBy.length === 1
                                    ? (columns.find(c => c.id === selectedGroupBy[0])?.label || selectedGroupBy[0])
                                    : `${selectedGroupBy.length} grouped`}
                            </span>
                        </div>
                    )}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                    align="start"
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-900">Group by</h4>
                            {selectedGroupBy.length > 0 && (
                                <button
                                    onClick={() => {
                                        onGroupByChange([])
                                        setOpen(false)
                                    }}
                                    className="text-[10px] text-gray-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="space-y-1 max-h-60 overflow-y-auto">
                            {columns.length === 0 ? (
                                <p className="text-xs text-gray-400 italic px-2">No groupable columns</p>
                            ) : (
                                columns.map((col) => {
                                    const isSelected = selectedGroupBy.includes(col.id)
                                    const index = selectedGroupBy.indexOf(col.id)

                                    return (
                                        <div
                                            key={col.id}
                                            className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                                            onClick={() => toggleColumn(col.id)}
                                        >
                                            <span className={`text-xs ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                                {col.label}
                                            </span>
                                            {isSelected && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] bg-primary-100 text-primary-700 px-1 rounded-full font-medium w-4 h-4 flex items-center justify-center">
                                                        {index + 1}
                                                    </span>
                                                    <Check className="h-3.5 w-3.5 text-primary-600" />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {selectedGroupBy.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                                <p className="text-[10px] text-gray-500 truncate">
                                    Order: {selectedGroupBy.map(id => columns.find(c => c.id === id)?.label || id).join(' → ')}
                                </p>
                            </div>
                        )}
                    </div>
                    <Popover.Arrow className="fill-white" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
