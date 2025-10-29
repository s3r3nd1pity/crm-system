'use client'

import {FormEvent, useEffect, useState, useRef} from 'react'
import {IOrder} from '@/models/IOrder'
import {ordersApi} from '@/services/orders.api.services'
import {IGroup} from '@/models/IGroup'
import api from '@/services/axios.api.services'
import {createPortal} from 'react-dom'

type Props = {
  order: IOrder
  onClose: () => void
  onUpdated: (updated: IOrder) => void
}

export const EditOrderModalComponent = ({order, onClose, onUpdated}: Props) => {
  const [form, setForm] = useState<IOrder>({...order})
  const [groups, setGroups] = useState<IGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const initialApplied = useRef(false)

  const courses = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX', 'PM', 'AQA', 'Python', 'Java']
  const courseFormats = ['static', 'online']
  const courseTypes = ['pro', 'premium', 'minimal']
  const statuses = ['New', 'In work', 'Agree', 'Disagree', 'Dubbing']

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const res = await api.get<{results: IGroup[]}>('/orders/groups/')
        setGroups(res.data.results || [])
      } catch {
        setGroups([])
      }
    }
    loadGroups()
  }, [])

  useEffect(() => {
    if (!initialApplied.current) {
      if (!order.manager && (!order.status || order.status === 'New')) {
        setForm(prev => ({...prev, status: 'In work'}))
      } else {
        setForm({...order})
      }
      initialApplied.current = true
    }
  }, [order])

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return
    try {
      const res = await api.post<IGroup>('/orders/groups/', {name: newGroupName})
      setGroups(prev => [res.data, ...prev])
      setForm(prev => ({...prev, group: res.data}))
      setNewGroupName('')
    } catch {}
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Partial<IOrder> & {group_id?: number} = {...form}
      if (payload.group) {
        payload.group_id = payload.group.id
        delete payload.group
      }
      const updated = await ordersApi.update(order.id, payload)
      const refreshed = await ordersApi.getById(updated.id)
      onUpdated(refreshed)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-pink-600 mb-4 text-center">Edit Order</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-full flex flex-col gap-2">
            <label className="block text-sm text-pink-700 mb-1">Group</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Group"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Add
              </button>
              <select
                value={form.group?.id || ''}
                onChange={e =>
                  setForm({
                    ...form,
                    group: groups.find(g => g.id === Number(e.target.value)) || null,
                  })
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-pink-700 mb-1">Status</label>
            <select
              value={form.status || 'New'}
              onChange={e => setForm({...form, status: e.target.value || null})}
              className="w-full border rounded-lg px-3 py-2"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-pink-700 mb-1">Course</label>
            <select
              value={form.course || ''}
              onChange={e => setForm({...form, course: e.target.value || null})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select course</option>
              {courses.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-pink-700 mb-1">Course format</label>
            <select
              value={form.course_format || ''}
              onChange={e => setForm({...form, course_format: e.target.value || null})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select format</option>
              {courseFormats.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-pink-700 mb-1">Course type</label>
            <select
              value={form.course_type || ''}
              onChange={e => setForm({...form, course_type: e.target.value || null})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select type</option>
              {courseTypes.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {[
            ['Name', 'name'],
            ['Surname', 'surname'],
            ['Email', 'email'],
            ['Phone', 'phone'],
            ['Age', 'age'],
            ['Sum', 'sum'],
            ['Already paid', 'alreadyPaid'],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="block text-sm text-pink-700 mb-1">{label}</label>
              <input
                value={String(
                  (form as unknown as Record<string, string | number | null>)[key] ?? ''
                )}
                onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          ))}

          <div className="col-span-full flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg text-white ${
                loading ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}







