import { ExternalLink, Github, Link2 } from 'lucide-react'

interface LinkCellProps {
  url?: string
  repository?: string  // GitHub repository link
  type?: 'url' | 'github'
}

export function LinkCell({ url, repository, type = 'url' }: LinkCellProps) {
  const link = type === 'github' ? repository : url

  if (!link) return <span className="text-xs text-gray-400">-</span>

  const Icon = type === 'github' ? Github : Link2

  return (
    <a
      href={link.startsWith('http') ? link : `https://${link}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors group relative"
      onClick={(e) => e.stopPropagation()}
      title={link}
    >
      <Icon className="h-4 w-4" />

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10 pointer-events-none">
        {link}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </a>
  )
}
