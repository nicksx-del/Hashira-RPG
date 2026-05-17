import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-8 text-center">
      <h2 className="display-font text-2xl font-bold text-white">Rota não encontrada</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">
        Esta área ainda não foi migrada para a nova arquitetura.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
      >
        Voltar para visão geral
      </Link>
    </section>
  )
}
