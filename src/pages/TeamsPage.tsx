import { Users } from 'lucide-react'
import { CatalogPageView } from './CatalogPageView'

export function TeamsPage() {
    return (
        <CatalogPageView
            blueprintIdentifier="_team"
            pageTitle="Teams"
            pageIcon={<Users className="h-5 w-5" />}
            pageDescription="Manage teams and memberships"
        />
    )
}
