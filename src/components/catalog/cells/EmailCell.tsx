import { User } from 'lucide-react'

interface EmailCellProps {
  email?: string
}

export function EmailCell({ email }: EmailCellProps) {
  if (!email) return <span className="text-xs text-gray-400">-</span>

  return (
    <div className="flex items-center gap-1.5">
      <User className="h-3 w-3 text-gray-400" />
      <span className="text-xs text-gray-700">{email}</span>
    </div>
  )
}
