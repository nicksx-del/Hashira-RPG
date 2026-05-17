import { create } from 'zustand'
import {
  buildCharacterFromInput,
  loadCampaignsFromLegacy,
  loadCharactersFromLegacy,
  saveCharactersToLegacy,
} from '../lib/legacy-storage'
import type { CampaignRoom, CharacterSheet, NewCharacterInput } from '../types/domain'

interface AppState {
  characters: CharacterSheet[]
  campaigns: CampaignRoom[]
  activeCharacterId: null | string
  hydrated: boolean
  hydrateFromLegacy: () => void
  createCharacter: (input: NewCharacterInput) => CharacterSheet
  removeCharacter: (id: string) => void
  setActiveCharacter: (id: string) => void
  refreshCampaigns: () => void
}

function persistCharacterState(state: Pick<AppState, 'characters' | 'activeCharacterId'>): void {
  saveCharactersToLegacy(state.characters, state.activeCharacterId)
}

export const useAppStore = create<AppState>((set, get) => ({
  characters: [],
  campaigns: [],
  activeCharacterId: null,
  hydrated: false,

  hydrateFromLegacy: () => {
    const loaded = loadCharactersFromLegacy()
    set({
      characters: loaded.characters,
      activeCharacterId: loaded.activeCharacterId,
      campaigns: loadCampaignsFromLegacy(),
      hydrated: true,
    })
  },

  createCharacter: (input) => {
    const current = get()
    const newCharacter = buildCharacterFromInput(input)
    const updatedCharacters = [newCharacter, ...current.characters]
    const nextState = {
      characters: updatedCharacters,
      activeCharacterId: newCharacter.id,
    }

    set(nextState)
    persistCharacterState(nextState)
    return newCharacter
  },

  removeCharacter: (id) => {
    const current = get()
    const updatedCharacters = current.characters.filter((character) => character.id !== id)
    const nextActive =
      current.activeCharacterId === id
        ? (updatedCharacters[0]?.id ?? null)
        : current.activeCharacterId

    const nextState = {
      characters: updatedCharacters,
      activeCharacterId: nextActive,
    }

    set(nextState)
    persistCharacterState(nextState)
  },

  setActiveCharacter: (id) => {
    const current = get()
    const found = current.characters.some((character) => character.id === id)
    if (!found) return

    const nextState = { characters: current.characters, activeCharacterId: id }
    set({ activeCharacterId: id })
    persistCharacterState(nextState)
  },

  refreshCampaigns: () => {
    set({ campaigns: loadCampaignsFromLegacy() })
  },
}))
