export interface CharacterSheet {
  id: string
  name: string
  age: number
  race: string
  background: string
  breathingStyle: string
  rank: string
  level: number
  currentHP: number
  maxHP: number
  currentPE: number
  maxPE: number
  createdAt: string
  updatedAt: string
  source: 'legacy' | 'new'
}

export interface CampaignRoom {
  id: string
  name: string
  dmName: string
  players: number
  monsters: number
  combatActive: boolean
  round: number
  createdAt: string
}

export interface NewCharacterInput {
  name: string
  age: number
  race: string
  background: string
  breathingStyle: string
}
