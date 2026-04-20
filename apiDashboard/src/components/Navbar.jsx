const navItems = [
  { label: 'Pricing', path: '/pricing' },
  { label: 'Product', path: '/product' },
  { label: 'Features', path: '/features' },
  { label: 'Services', path: '/services' },
  { label: 'Resources', path: '/resources' },
  { label: 'Integrations', path: '/integrations' },
  { label: 'Registration', path: '/registration' },
]

export default function NavBar({ activePath, onNavigate }) {
  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-10">
        <button type="button" onClick={() => onNavigate('/')} className="shrink-0">
          <img
            src="/company-logo.jpg"
            alt="Company logo"
            className="h-14 w-auto rounded-xl object-contain"
          />
        </button>

        <nav className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-8 text-[1.05rem] font-medium text-slate-900">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.path)}
                  className={`transition hover:text-emerald-500 ${activePath === item.path
                    ? 'text-emerald-600'
                    : 'text-slate-900'
                    }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className={`text-[1rem] font-medium transition hover:text-emerald-500 ${activePath === '/login' ? 'text-emerald-600' : 'text-slate-900'
              }`}
          >
            Login
          </button>
        </div>

        <button className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-emerald-500 hover:text-emerald-500 lg:hidden">
          Menu
        </button>
      </div>
    </header>
  )
}
