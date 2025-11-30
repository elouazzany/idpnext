import { useState } from 'react'
import {
    Search,
    SlidersHorizontal,
    EyeOff,
    Plus,
    Users,
    MoreHorizontal,
    Copy
} from 'lucide-react'
import { clsx } from 'clsx'

type ActiveTab = 'users' | 'teams'

interface PortUser {
    id: string
    name: string
    email: string
    role: 'Admin' | 'Member'
    owningTeams: string[]
}

interface PortTeam {
    id: string
    name: string
    description: string
    users: string[]
    icon: string
    color: string
}

const mockUsers: PortUser[] = [
    {
        id: '1',
        name: 'Taylor Parker',
        email: 'taylor.parker@getport-example.io',
        role: 'Admin',
        owningTeams: ['The Visual Storytellers']
    }
]

const mockTeams: PortTeam[] = [
    {
        id: '1',
        name: 'The Executive Council',
        description: 'Management Team',
        users: [],
        icon: 'T',
        color: 'blue'
    },
    {
        id: '2',
        name: 'The Visual Storytellers',
        description: 'Frontend Team',
        users: ['Taylor Parker'],
        icon: 'T',
        color: 'pink'
    },
    {
        id: '3',
        name: 'The Relationship Builders',
        description: 'Customer Success Team',
        users: [],
        icon: 'T',
        color: 'green'
    },
    {
        id: '4',
        name: 'Team Vision',
        description: 'Product Team',
        users: [],
        icon: 'T',
        color: 'pink'
    },
    {
        id: '5',
        name: 'The Explorers',
        description: 'Research Team',
        users: [],
        icon: 'T',
        color: 'blue'
    },
    {
        id: '6',
        name: 'The Engine Room',
        description: 'Backend Team',
        users: [],
        icon: 'T',
        color: 'blue'
    },
    {
        id: '7',
        name: 'Guardians of the Galaxy',
        description: 'PR Approvers',
        users: [],
        icon: 'G',
        color: 'orange'
    }
]

export function UsersTeamsPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('users')
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="h-full flex flex-col -m-6 bg-white">
            {/* Header */}
            <div className="border-b bg-white">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-gray-900" />
                        <h1 className="text-xl font-semibold text-gray-900">Port Users & Teams</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <div className="flex items-center gap-6 border-b">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={clsx(
                                'pb-3 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'users'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            )}
                        >
                            Port Users
                        </button>
                        <button
                            onClick={() => setActiveTab('teams')}
                            className={clsx(
                                'pb-3 text-sm font-medium border-b-2 transition-colors',
                                activeTab === 'teams'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            )}
                        >
                            Port Teams
                        </button>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="px-6 py-3 border-b bg-white">
                <div className="flex items-center justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search columns"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <EyeOff className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                            <Plus className="h-4 w-4" />
                            {activeTab === 'users' ? 'Invite User' : 'Create Team'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'users' ? (
                    <UsersTable users={mockUsers} />
                ) : (
                    <TeamsTable teams={mockTeams} />
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-white">
                <div className="text-sm text-gray-600">
                    {activeTab === 'users' ? `${mockUsers.length} results` : `${mockTeams.length} results`}
                </div>
            </div>
        </div>
    )
}

function UsersTable({ users }: { users: PortUser[] }) {
    return (
        <div className="border border-gray-200 mx-6 mt-6 rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Port User Info
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Owning Teams
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-gray-700">{user.email}</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={clsx(
                                    'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
                                    user.role === 'Admin'
                                        ? 'bg-cyan-100 text-cyan-700'
                                        : 'bg-gray-100 text-gray-700'
                                )}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {user.owningTeams.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-medium text-pink-600">T</span>
                                        </div>
                                        <span className="text-sm text-gray-700">{user.owningTeams[0]}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function TeamsTable({ teams }: { teams: PortTeam[] }) {
    const getColorClasses = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-600',
            pink: 'bg-pink-100 text-pink-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600'
        }
        return colorMap[color] || 'bg-gray-100 text-gray-600'
    }

    return (
        <div className="border border-gray-200 mx-6 mt-6 rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Port Team
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Port Users
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {teams.map((team) => (
                        <tr key={team.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        'w-8 h-8 rounded-full flex items-center justify-center',
                                        getColorClasses(team.color)
                                    )}>
                                        <span className="text-sm font-medium">{team.icon}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{team.name}</span>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className="text-sm text-gray-700">{team.description}</span>
                            </td>
                            <td className="px-4 py-3">
                                {team.users.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-medium text-gray-600">
                                                {team.users[0].split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-700">{team.users[0]}</span>
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
