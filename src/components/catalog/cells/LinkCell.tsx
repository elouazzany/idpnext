import { ExternalLink, Github } from 'lucide-react'

interface LinkCellProps {
  url?: string
  repository?: string  // GitHub repository link
  type?: 'url' | 'github'
}

export function LinkCell({ url, repository, type = 'url' }: LinkCellProps) {
  const link = type === 'github' ? repository : url

  if (!link) return <span className="text-xs text-gray-400">-</span>

  const displayUrl = link.replace(/^https?:\/\//, '')
  const Icon = type === 'github' ? Github : ExternalLink

  return (
    <a
      href={link.startsWith('http') ? link : `https://${link}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="h-3 w-3" />
      <span className="truncate max-w-[200px]">{displayUrl}</span>
    </a>
  )
}
