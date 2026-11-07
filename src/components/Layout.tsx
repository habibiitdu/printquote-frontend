import { NavLink, Outlet } from 'react-router-dom'

const navClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav active' : 'nav')

export function Layout() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav aria-label="Primary" className="side">
        <NavLink to="/" className="side-brand" end>
          <span className="side-brand-name">PrintQuote</span>
          <span className="side-brand-sub">Draft quotations</span>
        </NavLink>
        <NavLink to="/" className={navClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/quotations/new" className={navClass} end>
          New quotation
        </NavLink>
        <NavLink to="/quotations" className={navClass} end>
          Quotations
        </NavLink>
        <div className="side-label">Configuration</div>
        <NavLink to="/settings/papers" className={navClass}>
          Paper &amp; stock
        </NavLink>
        <NavLink to="/settings/presses" className={navClass}>
          Presses &amp; print rates
        </NavLink>
        <NavLink to="/settings/finishing" className={navClass}>
          Finishing, binding &amp; pricing
        </NavLink>
        <NavLink to="/settings/templates" className={navClass}>
          Product templates
        </NavLink>
        <NavLink to="/settings/customers" className={navClass}>
          Customers
        </NavLink>
        <NavLink to="/settings/companies" className={navClass}>
          Companies
        </NavLink>
      </nav>
      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
