'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ordersApi } from '@/services/orders.api.services'
import { IOrder } from '@/models/IOrder'
import { OrderComponent } from './OrderComponent'
import { PaginationComponent } from './PaginationComponent'
import { OrdersFiltersComponent } from './OrdersFiltersComponent'

export const OrdersComponent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<IOrder[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const pageSize = 25
  const currentPage = Number(searchParams.get('page')) || 1
  const ordering = searchParams.get('ordering') || ''

  useEffect(() => {
    const controller = new AbortController()
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const params: Record<string, string> = {}
        searchParams.forEach((value, key) => {
          params[key] = value
        })
        const data = await ordersApi.getAll(currentPage, params)
        setOrders(data.results)
        setCount(data.count)
      } catch {
        setOrders([])
        setCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
    return () => controller.abort()
  }, [searchParams.toString(), currentPage])

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get('ordering')
    let newOrdering = field
    if (current === field) newOrdering = `-${field}`
    else if (current === `-${field}`) newOrdering = ''
    params.delete('page')
    if (newOrdering) params.set('ordering', newOrdering)
    else params.delete('ordering')
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const renderSortIcon = (field: string) => {
    if (ordering === field) return '▲'
    if (ordering === `-${field}`) return '▼'
    return ''
  }

  return (
    <div className="p-6">
      <OrdersFiltersComponent />
      {loading ? (
        <div className="flex justify-center items-center h-64 text-pink-500 text-lg">
          Loading orders...
        </div>
      ) : orders.length ? (
        <>
          <div className="w-full overflow-hidden rounded-2xl shadow-md">
            <table className="w-full table-fixed border-collapse bg-white">
              <thead className="bg-pink-200 select-none text-[0.75rem] sm:text-[0.85rem] md:text-[0.95rem]">
                <tr>
                  {[
                    'id',
                    'name',
                    'surname',
                    'email',
                    'phone',
                    'age',
                    'course',
                    'course_format',
                    'course_type',
                    'status',
                    'sum',
                    'alreadyPaid',
                    'group__name',
                    'created_at',
                    'manager__last_name',
                  ].map((field) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="p-2 text-left text-pink-900 cursor-pointer hover:bg-pink-300 transition break-words whitespace-normal min-w-[90px]"
                    >
                      <div className="flex items-center gap-1">
                        <span>
                          {field
                            .replace('__name', '')
                            .replace('__last_name', '')
                            .replace('_', ' ')}
                        </span>
                        <span className="text-xs">{renderSortIcon(field)}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderComponent key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          <PaginationComponent count={count} pageSize={pageSize} />
        </>
      ) : (
        <div className="text-center text-pink-500 text-lg mt-10">
          No orders found
        </div>
      )}
    </div>
  )
}



