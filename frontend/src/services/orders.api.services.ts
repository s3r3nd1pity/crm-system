import {IOrder} from '@/models/IOrder'
import {IComment} from '@/models/IComment'
import api from './axios.api.services'

interface OrdersResponse {
    count: number
    next: string | null
    previous: string | null
    results: IOrder[]
}

export const ordersApi = {
    async getAll(page = 1, filters: Record<string, string> = {}): Promise<OrdersResponse> {
        const params = new URLSearchParams({page: String(page), ...filters})
        const res = await api.get<OrdersResponse>(`/orders/?${params.toString()}`)
        return res.data
    },

    async getById(id: number): Promise<IOrder> {
        const res = await api.get<IOrder>(`/orders/${id}/`)
        return res.data
    },

    async createComment(orderId: number, text: string): Promise<IComment> {
        const res = await api.post<IComment>(`/orders/${orderId}/comments/`, {text})
        return res.data
    },

    async update(id: number, payload: Partial<IOrder>): Promise<IOrder> {
        const res = await api.patch<IOrder>(`/orders/${id}/edit/`, payload)
        return res.data
    }


}




