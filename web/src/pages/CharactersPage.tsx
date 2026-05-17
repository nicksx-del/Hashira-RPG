import { Crown, Skull, Sparkles, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../state/useAppStore'

function CharacterCard({
  id,
  name,
  race,
  level,
  rank,
  breathingStyle,
  hp,
  pe,
  source,
  active,
  onActivate,
  onRemove,
}: {
  id: string
  name: string
  race: string
  level: number
  rank: string
  breathingStyle: string
  hp: string
  pe: string
  source: string
  active: boolean
  onActivate: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <article
      className={[
        'rounded-2xl border p-4 transition',
        active
          ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
          : 'border-[var(--line)] bg-[var(--bg-card)] hover:border-[#36506d]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="display-font text-lg font-semibold text-white">{name}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {race} • {breathingStyle}
          </p>
        </div>
        <span className="rounded-full border border-[var(--line)] px-2 py-1 text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
          {source}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
          <p className="text-[11px] uppercase text-[var(--text-muted)]">Rank</p>
          <p className="font-semibold text-white">{rank}</p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
          <p className="text-[11px] uppercase text-[var(--text-muted)]">Nível</p>
          <p className="font-semibold text-white">{level}</p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
          <p className="text-[11px] uppercase text-[var(--text-muted)]">HP</p>
          <p className="font-semibold text-white">{hp}</p>
        </div>
        <div className="rounded-lg border border-[var(--line-soft)] bg-[#0b1520] p-2">
          <p className="text-[11px] uppercase text-[var(--text-muted)]">PE</p>
          <p className="font-semibold text-white">{pe}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onActivate(id)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#172436] px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
        >
          <Crown size={13} />
          {active ? 'Ativo' : 'Definir ativo'}
        </button>
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="inline-flex items-center gap-1 rounded-lg border border-[#6b2b35] bg-[#2a1016] px-3 py-2 text-xs font-semibold text-[#ff8e9f] transition hover:brightness-110"
        >
          <Trash2 size={13} />
          Remover
        </button>
      </div>
    </article>
  )
}

export function CharactersPage() {
  const hydrateFromLegacy = useAppStore((state) => state.hydrateFromLegacy)
  const hydrated = useAppStore((state) => state.hydrated)
  const characters = useAppStore((state) => state.characters)
  const activeCharacterId = useAppStore((state) => state.activeCharacterId)
  const setActiveCharacter = useAppStore((state) => state.setActiveCharacter)
  const removeCharacter = useAppStore((state) => state.removeCharacter)

  useEffect(() => {
    if (!hydrated) hydrateFromLegacy()
  }, [hydrateFromLegacy, hydrated])

  if (!characters.length) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-8 text-center">
        <Skull className="mx-auto text-[var(--accent)]" size={26} />
        <h2 className="display-font mt-3 text-2xl font-bold text-white">Nenhuma ficha encontrada</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--text-muted)]">
          Você ainda não possui personagens na nova base. Crie uma ficha agora ou use o botão de sincronização para
          puxar dados legados.
        </p>
        <Link
          to="/creator"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          <Sparkles size={14} />
          Criar primeira ficha
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Arsenal do esquadrão</p>
          <h2 className="display-font text-xl font-semibold text-white">Gerencie e organize suas fichas</h2>
        </div>
        <Link
          to="/creator"
          className="rounded-xl border border-[var(--line)] bg-[#101b28] px-3 py-2 text-sm font-semibold text-white"
        >
          Nova ficha
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            id={character.id}
            name={character.name}
            race={character.race}
            level={character.level}
            rank={character.rank}
            breathingStyle={character.breathingStyle}
            hp={`${character.currentHP}/${character.maxHP}`}
            pe={`${character.currentPE}/${character.maxPE}`}
            source={character.source}
            active={activeCharacterId === character.id}
            onActivate={setActiveCharacter}
            onRemove={removeCharacter}
          />
        ))}
      </div>
    </section>
  )
}
