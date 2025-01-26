import Link from 'next/link'

const navItems = {
  '/': {
    name: 'Home',
  },
  '/blog': {
    name: 'Projects',
  },
  '/Arjun-Aggarwal-Resume.pdf': {
    name: 'Resume'
  }
}

export function Navbar() {
  return (
    <nav className="flex items-center">
      <div className="flex space-x-6">
        {Object.entries(navItems).map(([path, { name }]) => {
          return (
            <Link
              key={path}
              href={path}
              className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              {name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
