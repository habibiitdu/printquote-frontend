import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  FilePlus2,
  Files,
  LayoutDashboard,
  LayoutTemplate,
  Layers,
  Printer,
  Scissors,
  Users,
} from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav active' : 'nav')

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const MAIN: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/quotations/new', label: 'New quotation', icon: FilePlus2, end: true },
  { to: '/quotations', label: 'Quotations', icon: Files, end: true },
]

const CONFIG: NavItem[] = [
  { to: '/settings/papers', label: 'Paper & stock', icon: Layers },
  { to: '/settings/presses', label: 'Presses & print rates', icon: Printer },
  { to: '/settings/finishing', label: 'Finishing & pricing', icon: Scissors },
  { to: '/settings/templates', label: 'Product templates', icon: LayoutTemplate },
]

const DIRECTORY: NavItem[] = [
  { to: '/settings/customers', label: 'Customers', icon: Users },
  { to: '/settings/companies', label: 'Companies', icon: Building2 },
]

function NavGroup({ items }: { items: NavItem[] }) {
  return items.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} className={navClass} end={end}>
      <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
      {label}
    </NavLink>
  ))
}

/** Four overlapping process-colour dots: cyan, magenta, yellow and key. */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g style={{ mixBlendMode: 'screen' }}>
        <circle cx="9" cy="9" r="6" fill="#0ea5e9" opacity="0.95" />
        <circle cx="15" cy="9" r="6" fill="#db2777" opacity="0.9" />
        <circle cx="12" cy="15" r="6" fill="#eab308" opacity="0.9" />
      </g>
      <circle cx="12" cy="11" r="2.2" fill="#ffffff" />
    </svg>
  )
}

export function Layout() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav aria-label="Primary" className="side">
        <NavLink to="/" className="side-brand" end aria-label="PrintQuote home">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="side-brand-text">
            <span className="side-brand-name">PrintQuote</span>
            <span className="side-brand-sub">Print cost &amp; quotations</span>
          </span>
        </NavLink>
        <NavGroup items={MAIN} />
        <div className="side-label">Rates &amp; products</div>
        <NavGroup items={CONFIG} />
        <div className="side-label">Directory</div>
        <NavGroup items={DIRECTORY} />
        <div className="side-foot">Prices come from the rates under Rates &amp; products. Change a rate once and new quotes use it.</div>
      </nav>
      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
