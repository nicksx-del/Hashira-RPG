import { BookOpen, Crosshair, Home, Layers, RefreshCcw, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../state/useAppStore'

function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition',
          isActive
            ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-white'
            : 'border-[var(--line-soft)] text-[var(--text-muted)] hover:border-[var(--line)] hover:bg-[#0f1b29]',
        ].join(' ')
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  )
}

export function AppShell() {
  const location = useLocation()
  const hydrateFromLegacy = useAppStore((state) => state.hydrateFromLegacy)
  const characters = useAppStore((state) => state.characters)
  const campaigns = useAppStore((state) => state.campaigns)

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-[var(--line)] bg-[#0b121c]/95 p-4 md:min-h-screen md:w-72 md:border-b-0 md:border-r">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Shield size={22} />
          </div>
          <div>
            <p className="display-font text-lg font-semibold text-[var(--text-main)]">Hashira Control</p>
            <p className="text-xs text-[var(--text-muted)]">Nova base profissional</p>
          </div>
        </div>

        <nav className="space-y-2">
          <SidebarLink to="/" icon={<Home size={16} />} label="Visão Geral" />
          <SidebarLink to="/characters" icon={<BookOpen size={16} />} label="Personagens" />
          <SidebarLink to="/creator" icon={<Crosshair size={16} />} label="Criador de Ficha" />
          <SidebarLink to="/campaigns" icon={<Layers size={16} />} label="Campanhas" />
        </nav>

        <div className="mt-6 rounded-xl border border-[var(--line-soft)] bg-[#0f1a26] p-3">
          <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">Controle do legado</p>
          <button
            type="button"
            onClick={hydrateFromLegacy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            <RefreshCcw size={14} />
            Sincronizar dados antigos
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
            <div className="rounded-lg border border-[var(--line)] bg-[#0c1520] p-2 text-center">
              <p className="text-lg font-bold text-white">{characters.length}</p>
              <p>Fichas</p>
            </div>
            <div className="rounded-lg border border-[var(--line)] bg-[#0c1520] p-2 text-center">
              <p className="text-lg font-bold text-white">{campaigns.length}</p>
              <p>Salas</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] px-4 py-3 md:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Hashira RPG</p>
          <h1 className="display-font mt-1 text-2xl font-bold text-[var(--text-main)] md:text-3xl">
            {location.pathname === '/'
              ? 'Operações e Visão Geral'
              : location.pathname === '/characters'
                ? 'Gestão de Personagens'
                : location.pathname === '/creator'
                  ? 'Criação Profissional de Ficha'
                  : location.pathname === '/campaigns'
                    ? 'Hub de Campanhas'
                    : 'Hashira Control'}
          </h1>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
