import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppStore } from '../state/useAppStore'

const createCharacterSchema = z.object({
  name: z.string().min(2, 'Nome precisa ter pelo menos 2 caracteres.'),
  age: z.number().int().min(10, 'Idade mínima 10.').max(80, 'Idade máxima 80.'),
  race: z.string().min(1, 'Escolha uma raça.'),
  background: z.string().min(1, 'Escolha um antecedente.'),
  breathingStyle: z.string().min(1, 'Escolha um estilo de respiração.'),
})

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>

const raceOptions = ['Humano', 'Marechi', 'Tsuyoi', 'Oni']
const backgroundOptions = ['Artista', 'Brigão', 'Costureiro', 'Estudioso', 'Ferreiro', 'Ladrão', 'Médico', 'Ninja']
const breathingOptions = ['Água', 'Trovão', 'Chamas', 'Vento', 'Névoa', 'Pedra', 'Fera']

export function CharacterCreatorPage() {
  const navigate = useNavigate()
  const createCharacter = useAppStore((state) => state.createCharacter)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCharacterFormData>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      age: 18,
      race: '',
      background: '',
      breathingStyle: '',
    },
  })

  const onSubmit = (data: CreateCharacterFormData) => {
    createCharacter(data)
    navigate('/characters')
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-5 md:p-6"
      >
        <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Criação estruturada</p>
        <h2 className="display-font mt-1 text-2xl font-bold text-white">Forjar Nova Ficha</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Essa versão já cria dados padronizados para o novo backend e mantém compatibilidade com o legado.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Nome</span>
            <input
              {...register('name')}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0b1622] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3d5c7d]"
              placeholder="Ex.: Kyojuro"
            />
            {errors.name && <span className="mt-1 block text-xs text-[#ff9ea8]">{errors.name.message}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Idade</span>
            <input
              type="number"
              min={10}
              max={80}
              step={1}
              {...register('age', { valueAsNumber: true })}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0b1622] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3d5c7d]"
            />
            {errors.age && <span className="mt-1 block text-xs text-[#ff9ea8]">{errors.age.message}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Raça</span>
            <select
              {...register('race')}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0b1622] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3d5c7d]"
            >
              <option value="">Selecione</option>
              {raceOptions.map((race) => (
                <option key={race} value={race}>
                  {race}
                </option>
              ))}
            </select>
            {errors.race && <span className="mt-1 block text-xs text-[#ff9ea8]">{errors.race.message}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Antecedente</span>
            <select
              {...register('background')}
              className="w-full rounded-xl border border-[var(--line)] bg-[#0b1622] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3d5c7d]"
            >
              <option value="">Selecione</option>
              {backgroundOptions.map((background) => (
                <option key={background} value={background}>
                  {background}
                </option>
              ))}
            </select>
            {errors.background && (
              <span className="mt-1 block text-xs text-[#ff9ea8]">{errors.background.message}</span>
            )}
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--text-muted)]">Respiração</span>
          <select
            {...register('breathingStyle')}
            className="w-full rounded-xl border border-[var(--line)] bg-[#0b1622] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3d5c7d]"
          >
            <option value="">Selecione</option>
            {breathingOptions.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
          {errors.breathingStyle && (
            <span className="mt-1 block text-xs text-[#ff9ea8]">{errors.breathingStyle.message}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-70"
        >
          <Sparkles size={16} />
          {isSubmitting ? 'Forjando...' : 'Criar ficha no novo sistema'}
        </button>
      </form>

      <aside className="rounded-2xl border border-[var(--line)] bg-[var(--bg-elev)] p-5 md:p-6">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <ShieldCheck size={18} />
          <p className="text-sm font-semibold">O que essa base já resolve</p>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
          <li className="rounded-xl border border-[var(--line-soft)] bg-[#0d1824] p-3">
            Estrutura de formulário validado com `react-hook-form + zod`.
          </li>
          <li className="rounded-xl border border-[var(--line-soft)] bg-[#0d1824] p-3">
            Criação de ficha com shape único para integração futura com Supabase.
          </li>
          <li className="rounded-xl border border-[var(--line-soft)] bg-[#0d1824] p-3">
            Persistência automática compatível com chaves legadas atuais.
          </li>
          <li className="rounded-xl border border-[var(--line-soft)] bg-[#0d1824] p-3">
            Base visual consistente pronta para expandir combate, inventário e campanha.
          </li>
        </ul>
      </aside>
    </section>
  )
}
