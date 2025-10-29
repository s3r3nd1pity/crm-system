import { IManager } from './IManager'

export interface IGlobalStats {
  total: number
  New: number
  InWork: number
  Agree: number
  Disagree: number
  Dubbing: number
  null: number
}

export interface IStatisticsResponse {
  global: IGlobalStats
  managers: IManager[]
}

