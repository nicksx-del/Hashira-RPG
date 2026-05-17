import type { CampaignRoom, CharacterSheet, NewCharacterInput } from '../types/domain'

const LEGACY_SLOTS_KEY = 'demonSlayerSaveSlots'
const LEGACY_ACTIVE_KEY = 'demonSlayerChar'
const LEGACY_CAMPAIGNS_KEY = 'demonSlayerCampaigns'

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function normalizeCharacter(raw: Record<string, unknown>): CharacterSheet {
  const now = new Date().toISOString()
  const id = String(raw.id ?? `char_${Date.now()}`)
  const maxHP = Number(raw.maxHP ?? raw.hp ?? 10)
  const currentHP = Number(raw.currentHP ?? maxHP)
  const maxPE = Number(raw.maxPE ?? raw.pe ?? 1)
  const currentPE = Number(raw.currentPE ?? maxPE)
  const level = Number(raw.level ?? 1)

  return {
    id,
    name: String(raw.name ?? 'Sem nome'),
    age: Number(raw.age ?? 18),
    race: String(raw.race ?? 'Humano'),
    background: String(raw.background ?? 'Sem antecedente'),
    breathingStyle: String(raw.breathingStyle ?? raw.breathing ?? 'Não definido'),
    rank: String(raw.rank ?? 'Mizunoto'),
    level,
    currentHP,
    maxHP,
    currentPE,
    maxPE,
    createdAt: String(raw.createdAt ?? now),
    updatedAt: String(raw.updatedAt ?? now),
    source: 'legacy',
  }
}

export function loadCharactersFromLegacy(): {
  characters: CharacterSheet[]
  activeCharacterId: string | null
} {
  const slots = safeParse<Record<string, unknown>[]>(
    localStorage.getItem(LEGACY_SLOTS_KEY),
    [],
  )
  const active = safeParse<Record<string, unknown> | null>(
    localStorage.getItem(LEGACY_ACTIVE_KEY),
    null,
  )

  const map = new Map<string, CharacterSheet>()

  for (const slot of slots) {
    const normalized = normalizeCharacter(slot)
    map.set(normalized.id, normalized)
  }

  if (active) {
    const normalized = normalizeCharacter(active)
    map.set(normalized.id, normalized)
  }

  const activeCharacterId = active?.id ? String(active.id) : null
  return { characters: Array.from(map.values()), activeCharacterId }
}

export function saveCharactersToLegacy(
  characters: CharacterSheet[],
  activeCharacterId: string | null,
): void {
  localStorage.setItem(LEGACY_SLOTS_KEY, JSON.stringify(characters))
  if (!activeCharacterId) {
    localStorage.removeItem(LEGACY_ACTIVE_KEY)
    return
  }

  const activeCharacter = characters.find((char) => char.id === activeCharacterId)
  if (activeCharacter) {
    localStorage.setItem(LEGACY_ACTIVE_KEY, JSON.stringify(activeCharacter))
  }
}

export function buildCharacterFromInput(input: NewCharacterInput): CharacterSheet {
  const now = new Date().toISOString()
  const hasCrypto = typeof crypto !== 'undefined' && 'randomUUID' in crypto
  const id = hasCrypto ? crypto.randomUUID() : `char_${Date.now()}_${Math.round(Math.random() * 999)}`

  return {
    id,
    name: input.name.trim(),
    age: input.age,
    race: input.race,
    background: input.background,
    breathingStyle: input.breathingStyle,
    rank: 'Mizunoto',
    level: 1,
    currentHP: 12,
    maxHP: 12,
    currentPE: 2,
    maxPE: 2,
    createdAt: now,
    updatedAt: now,
    source: 'new',
  }
}

export function loadCampaignsFromLegacy(): CampaignRoom[] {
  const campaigns = safeParse<Record<string, unknown>[]>(
    localStorage.getItem(LEGACY_CAMPAIGNS_KEY),
    [],
  )

  return campaigns.map((campaign) => {
    const combat =
      typeof campaign.combat === 'object' && campaign.combat !== null
        ? (campaign.combat as Record<string, unknown>)
        : null

    const round = Number(combat?.round ?? 1)

    return {
      id: String(campaign.id ?? `camp_${Date.now()}`),
      name: String(campaign.name ?? 'Nova Campanha'),
      dmName: String(campaign.dmName ?? 'Mestre'),
      players: Array.isArray(campaign.players) ? campaign.players.length : 0,
      monsters: Array.isArray(campaign.monsters) ? campaign.monsters.length : 0,
      combatActive: Boolean(combat?.active),
      round: Number.isFinite(round) ? round : 1,
      createdAt: String(campaign.createdAt ?? new Date().toISOString()),
    }
  })
}
