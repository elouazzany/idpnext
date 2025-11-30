import { useState } from 'react'
import {
    Search,
    User,
    Bell,
    MoreHorizontal,
    Plus,
    Filter,
    Eye,
    ArrowUpDown,
    Copy,
    Download,
    List
} from 'lucide-react'
import { clsx } from 'clsx'

interface UserData {
    id: string
    identifier: string
    lastUpdate: string
    entityCreationDate: string
    portType: string
    portRole: 'Admin' | 'Member'
    moderatedBlueprints: string
    status: 'Active'
}

const mockUsers: UserData[] = [
    {
        id: '1',
        identifier: 'monika.jadhav691@freenet.name',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Member',
        moderatedBlueprints: '',
        status: 'Active'
    },
    {
        id: '2',
        identifier: 'taylor.parker@getport-example.io',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Admin',
        moderatedBlueprints: '',
        status: 'Active'
    },
    {
        id: '3',
        identifier: 'yupanya41@comcast.biz',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Member',
        moderatedBlueprints: '',
        status: 'Active'
    },
    {
        id: '4',
        identifier: 'francisca+makarova37@mac.net',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Member',
        moderatedBlueprints: '',
        status: 'Active'
    },
    {
        id: '5',
        identifier: 'michaelmolina@show.org',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Member',
        moderatedBlueprints: '',
        status: 'Active'
    },
    {
        id: '6',
        identifier: 'daniyel-moshe31@sbcglobal.dev',
        lastUpdate: 'a month ago',
        entityCreationDate: 'a month ago',
        portType: 'Standard',
        portRole: 'Member',
        moderatedBlueprints: '',
        status: 'Active'
    }
]

export function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <div className="h-full flex flex-col -m-6">
            {/* Header */}
            <div className="bg-white border-b px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    {/* Left side - Title */}
                    <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-900" />
                        <h1 className="text-lg font-semibold text-gray-900">Users</h1>
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 relative">
                            <Bell className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700">
                            <Plus className="w-3 h-3" />
                            <span>1</span>
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Search and Actions Row */}
                <div className="flex items-center justify-between mt-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search columns"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Filter">
                            <Filter className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Columns">
                            <List className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Close">
                            <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Sort">
                            <ArrowUpDown className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Copy">
                            <Copy className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50" title="Download">
                            <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800">
                            <Plus className="h-4 w-4" />
                            User
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 border-b sticky top-0">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                Identifier
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                Last Update
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                Entity Creation Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Port Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1">
                                    <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                    Port Role
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                Moderated Blueprints
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                <button className="text-gray-400 hover:text-gray-600 text-xs">
                                    + Property
                                </button>
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {mockUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-3 h-3 text-white" />
                                        </div>
                                        <a href="#" className="text-sm text-blue-600 hover:underline">
                                            {user.identifier}
                                        </a>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{user.lastUpdate}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{user.entityCreationDate}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                                        {user.portType}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={clsx(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                                        user.portRole === 'Admin'
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-700"
                                    )}>
                                        {user.portRole}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-gray-700">{user.moderatedBlueprints}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3"></td>
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

            {/* Footer */}
            <div className="bg-white border-t px-6 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">{mockUsers.length} results</div>
                    <div className="flex items-center gap-2">
                        {/* Progress bars */}
                        <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
                        <div className="w-24 h-1 bg-green-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
