import { ArrowRight, Clock3, Shield, Swords } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from '../state/useAppStore'

function QuickCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-4">
      <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">{title}</p>
      <p className="display-font mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
    </div>
  )
}

export function HomePage() {
  const hydrateFromLegacy = useAppStore((state) => state.hydrateFromLegacy)
  const hydrated = useAppStore((state) => state.hydrated)
  const characters = useAppStore((state) => state.characters)
  const campaigns = useAppStore((state) => state.campaigns)
  const activeCharacterId = useAppStore((state) => state.activeCharacterId)

  useEffect(() => {
    if (!hydrated) hydrateFromLegacy()
  }, [hydrateFromLegacy, hydrated])

  const activeCharacter = characters.find((character) => character.id === activeCharacterId)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--line)] bg-gradient-to-br from-[#101c2a] to-[#1a2535] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-xl">
            <p className="mb-2 inline-flex items-center rounded-full border border-[var(--line)] bg-[#101826] px-3 py-1 text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Estrutura pronta para escalar
            </p>
            <h2 className="display-font text-3xl font-bold leading-tight text-white md:text-4xl">
              Novo núcleo do Hashira RPG com visual profissional e base para controle total.
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] md:text-base">
              Esta versão já centraliza estado, rotas e sincronização com seus dados antigos. Agora fica viável evoluir
              combate, campanhas e ficha sem manter milhares de linhas soltas em HTML.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/creator"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Criar nova ficha
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/characters"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[#0f1a26] px-4 py-2 text-sm font-semibold text-[var(--text-main)] transition hover:border-[#37506c]"
            >
              Abrir gestão de personagens
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickCard title="Fichas carregadas" value={String(characters.length)} subtitle="Sincronizadas do legado + novas" />
        <QuickCard title="Salas de campanha" value={String(campaigns.length)} subtitle="Prontas para migração do painel do mestre" />
        <QuickCard
          title="Personagem ativo"
          value={activeCharacter ? activeCharacter.name : 'Nenhum'}
          subtitle={activeCharacter ? `${activeCharacter.race} • Nível ${activeCharacter.level}` : 'Selecione uma ficha'}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5">
          <Shield className="text-[var(--accent)]" size={20} />
          <h3 className="mt-3 text-lg font-semibold text-white">Design consistente</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Cores, tipografia e componentes padronizados para eliminar aparência de páginas desconectadas.
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5">
          <Swords className="text-[var(--accent)]" size={20} />
          <h3 className="mt-3 text-lg font-semibold text-white">Base para combate</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Estrutura pronta para acoplar regras de batalha, iniciativa e websocket sem reescrever a interface.
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5">
          <Clock3 className="text-[var(--accent)]" size={20} />
          <h3 className="mt-3 text-lg font-semibold text-white">Evolução incremental</h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Migramos módulo por módulo sem travar o projeto inteiro nem perder compatibilidade com dados existentes.
          </p>
        </article>
      </section>
    </div>
  )
}
