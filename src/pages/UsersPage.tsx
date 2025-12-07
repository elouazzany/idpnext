import { User } from 'lucide-react'
import { CatalogPageView } from './CatalogPageView'

export function UsersPage() {
    return (
        <CatalogPageView
            blueprintIdentifier="_user"
            pageTitle="Users"
            pageIcon={<User className="h-5 w-5" />}
            pageDescription="Manage users across the platform"
        />
    )
}
