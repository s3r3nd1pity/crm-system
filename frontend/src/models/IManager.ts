export interface IManagerStatsBlock {
  total: number
  in_work: number
  agree: number
  disagree: number
  dubbing: number
  new: number
}

export interface IManager {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
  is_banned: boolean
  date_joined: string
  last_login: string | null
  stats?: IManagerStatsBlock
}
