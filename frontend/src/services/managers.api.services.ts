import { IStatisticsResponse } from '@/models/IStatistics'
import api from "@/services/axios.api.services";

export const managersApi = {
  async getStatistics(): Promise<IStatisticsResponse> {
    const response = await api.get<IStatisticsResponse>('/users/statistics/')
    return response.data
  },

  async create(data: { email: string }) {
    return api.post('/users/managers/create/', data)
  },

  async ban(id: number) {
    return api.patch(`/users/managers/${id}/action/`, { action: 'ban' })
  },

  async unban(id: number) {
    return api.patch(`/users/managers/${id}/action/`, { action: 'unban' })
  },

  async activate(id: number): Promise<string> {
    const response = await api.post<{ activation_link: string }>(
      `/users/managers/${id}/activate/`
    )
    return response.data.activation_link
  },

  async recovery(id: number): Promise<string> {
    const response = await api.post<{ recovery_link: string }>(
      `/users/managers/${id}/recovery/`
    )
    return response.data.recovery_link
  },
}
