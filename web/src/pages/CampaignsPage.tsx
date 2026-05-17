import { RadioTower, RefreshCw, Swords, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useAppStore } from '../state/useAppStore'

export function CampaignsPage() {
  const hydrateFromLegacy = useAppStore((state) => state.hydrateFromLegacy)
  const refreshCampaigns = useAppStore((state) => state.refreshCampaigns)
  const hydrated = useAppStore((state) => state.hydrated)
  const campaigns = useAppStore((state) => state.campaigns)

  useEffect(() => {
    if (!hydrated) hydrateFromLegacy()
  }, [hydrateFromLegacy, hydrated])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Módulo do mestre</p>
          <h2 className="display-font text-xl font-semibold text-white">Campanhas e Salas em evolução</h2>
        </div>
        <button
          type="button"
          onClick={refreshCampaigns}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[#0d1a28] px-3 py-2 text-sm font-semibold text-white transition hover:border-[#37506c]"
        >
          <RefreshCw size={14} />
          Atualizar lista
        </button>
      </div>

      {!campaigns.length && (
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6">
          <p className="text-sm text-[var(--text-muted)]">
            Ainda não há campanhas salvas no localStorage. Assim que você criar salas no fluxo legado, elas aparecerão
            aqui automaticamente.
          </p>
        </article>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="display-font text-lg font-semibold text-white">{campaign.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">Mestre: {campaign.dmName}</p>
              </div>
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] uppercase tracking-wide',
                  campaign.combatActive
                    ? 'border-[#4f2a2f] bg-[#2a1218] text-[#ff9ea8]'
                    : 'border-[#1f4035] bg-[#0f231f] text-[#7ce8be]',
                ].join(' ')}
              >
                <RadioTower size={11} />
                {campaign.combatActive ? `Em combate • R${campaign.round}` : 'Em preparo'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
                <p className="text-[11px] uppercase text-[var(--text-muted)]">Jogadores</p>
                <p className="mt-1 inline-flex items-center gap-1 font-semibold text-white">
                  <Users size={14} />
                  {campaign.players}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
                <p className="text-[11px] uppercase text-[var(--text-muted)]">Monstros</p>
                <p className="mt-1 inline-flex items-center gap-1 font-semibold text-white">
                  <Swords size={14} />
                  {campaign.monsters}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
