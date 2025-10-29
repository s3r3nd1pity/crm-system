'use client'

import {FC, useState} from 'react'
import {IOrder} from '@/models/IOrder'
import {ordersApi} from '@/services/orders.api.services'
import {useUser} from '@/hooks/useUser'
import {CommentsComponent} from '@/components/orders/CommentsComponent'
import {EditOrderModalComponent} from '@/components/orders/EditOrderModalComponent'

type Props = { order: IOrder }

export const OrderComponent: FC<Props> = ({order}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [comments, setComments] = useState(order.comments || [])
    const [editing, setEditing] = useState(false)
    const [localOrder, setLocalOrder] = useState<IOrder>(order)
    const user = useUser()

    const canEdit = user && localOrder.manager === user.last_name
    const isFree = !localOrder.manager

    const handleCommentsUpdated = async () => {
        const updated = await ordersApi.getById(localOrder.id)
        setComments(updated.comments || [])
        setLocalOrder(updated)
    }


    const handleOrderUpdated = (updated: IOrder) => {
        setLocalOrder(updated)
        setEditing(false)
        setIsOpen(true)
    }

    return (
        <>
            <tr
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer hover:bg-pink-50 transition"
            >
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.id}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.name || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.surname || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.email || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.phone || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.age ?? '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.course || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.course_format || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.course_type || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top text-pink-600 font-medium">
                    {localOrder.status || 'New'}
                </td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.sum ?? '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.alreadyPaid ?? '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">{localOrder.group?.name || '-'}</td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top">
                    {new Date(localOrder.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 text-xs sm:text-sm break-words whitespace-normal align-top text-pink-800">
                    {localOrder.manager || '-'}
                </td>
            </tr>

            {isOpen && (
                <tr className="bg-pink-50 border-t border-pink-200">
                    <td colSpan={15} className="p-4 text-sm text-gray-700 align-top">
                        <div className="flex flex-col gap-2">
                            <p>
                                <span className="font-semibold text-pink-700">Message:</span>{' '}
                                {localOrder.msg || '—'}
                            </p>
                            <p>
                                <span className="font-semibold text-pink-700">UTM:</span>{' '}
                                {localOrder.utm || '—'}
                            </p>

                            <CommentsComponent
                                orderId={localOrder.id}
                                initialComments={comments}
                                canComment={!!canEdit || isFree}
                                onCommentsUpdated={handleCommentsUpdated}
                            />


                            {(canEdit || isFree) && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="px-4 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}

            {editing && (
                <EditOrderModalComponent
                    order={localOrder}
                    onClose={() => setEditing(false)}
                    onUpdated={handleOrderUpdated}
                />
            )}
        </>
    )
}











