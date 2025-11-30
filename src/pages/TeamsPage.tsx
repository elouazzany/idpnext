import { useState } from 'react'
import {
    Search,
    SlidersHorizontal,
    List,
    Plus,
    Download,
    Copy,
    Users,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react'

interface TeamEntity {
    id: string
    name: string
    lastUpdate: string
    creationDate: string
    description: string
}

const mockTeams: TeamEntity[] = [
    {
        id: '1',
        name: 'guardians_of_the_galaxy',
        lastUpdate: 'a month ago',
        creationDate: 'a month ago',
        description: 'PR Approvers'
    },
    {
        id: '2',
        name: 'the_engine_room',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'Backend Team'
    },
    {
        id: '3',
        name: 'the_executive_council',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'Management Team'
    },
    {
        id: '4',
        name: 'the_firewall',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'Security Team'
    },
    {
        id: '5',
        name: 'the_automation_aces',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'DevOps Team'
    },
    {
        id: '6',
        name: 'the_visual_storytellers',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'Frontend Team'
    },
    {
        id: '7',
        name: 'the_relationship_builders',
        lastUpdate: '5 days ago',
        creationDate: 'a month ago',
        description: 'Customer Success Team'
    },
    {
        id: '8',
        name: 'the_perfection_pursuers',
        lastUpdate: 'a month ago',
        creationDate: 'a month ago',
        description: 'QA Team'
    }
]

export function TeamsPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3">
                {/* Title Row */}
                <div className="flex items-center gap-3 mb-4">
                    <Users className="h-5 w-5 text-gray-900" />
                    <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
                    <div className="ml-auto flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <span className="sr-only">Settings</span>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <span className="sr-only">Circle</span>
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search columns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <div className="flex-1" />

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200">
                            <List className="h-3.5 w-3.5" />
                            <span className="text-gray-400">×</span>
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <ArrowUpDown className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <Copy className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
                            <Download className="h-4 w-4" />
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-md text-xs font-medium hover:bg-gray-50">
                            <Plus className="h-3.5 w-3.5" />
                            Team
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full min-w-[1000px]">
                    <thead className="bg-white border-b sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Identifier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Last Update</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Entity Creation Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    <Plus className="h-3 w-3" />
                                    Property
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {mockTeams.map((team) => (
                            <tr key={team.id} className="hover:bg-gray-50 group">
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-4 w-4 text-gray-900" />
                                        <span className="text-sm text-blue-600 hover:underline cursor-pointer font-medium">
                                            {team.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">{team.lastUpdate}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{team.creationDate}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{team.description}</td>
                                <td className="px-6 py-3">
                                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t px-6 py-3">
                    <div className="text-xs text-gray-500">12 results</div>
                </div>
            </div>
        </div>
    )
}
