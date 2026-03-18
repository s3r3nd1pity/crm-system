'use client'

import {FormEvent, useEffect, useState, useRef} from 'react'
import {createPortal} from 'react-dom'
import {IOrder} from '@/models/IOrder'
import {IGroup} from '@/models/IGroup'
import {ordersApi} from '@/services/orders.api.services'
import api from '@/services/axios.api.services'
import {validateEmail, validatePhone, validateText, sanitizeNumber} from '@/utils/validation'

type Props = {
  order: IOrder
  onClose: () => void
  onUpdated: (updated: IOrder) => void
}

type FormKeys = keyof IOrder

export const EditOrderModalComponent = ({order, onClose, onUpdated}: Props) => {
  const [form, setForm] = useState<IOrder>({...order})
  const [groups, setGroups] = useState<IGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const initialApplied = useRef(false)

  const courses = ['FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX', 'PM', 'AQA', 'Python', 'Java']
  const courseFormats = ['static', 'online']
  const courseTypes = ['pro', 'premium', 'minimal']
  const statuses = ['New', 'In work', 'Agree', 'Disagree', 'Dubbing']

  const numericKeys: FormKeys[] = ['age', 'sum', 'alreadyPaid']
  const stringKeys: FormKeys[] = ['name', 'surname', 'email', 'phone']

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
    const name = newGroupName.trim()
    if (!name) return
    try {
      const res = await api.post<IGroup>('/orders/groups/', {name})
      setGroups(prev => [res.data, ...prev])
      setForm(prev => ({...prev, group: res.data}))
      setNewGroupName('')
    } catch {}
  }

  const handleChange = (key: FormKeys, value: string) => {
    let newValue: string | number = value.trim()
    if (numericKeys.includes(key)) {
      newValue = sanitizeNumber(value)
    }
    setForm(prev => ({...prev, [key]: newValue}))
    setErrors(prev => ({...prev, [key]: ''}))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    stringKeys.forEach(key => {
      const val = form[key] as string
      if (!val) return
      if (key === 'email') newErrors.email = validateEmail(val)
      if (key === 'phone') newErrors.phone = validatePhone(val)
      if (['name', 'surname'].includes(key)) newErrors[key] = validateText(val)
    })

    numericKeys.forEach(key => {
      const val = form[key] as number
      if (val < 0) newErrors[key] = `${key} must be ≥ 0`
    })

    setErrors(newErrors)
    return Object.values(newErrors).every(err => !err)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
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
                value={form.group?.id ?? ''}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    group: groups.find(g => g.id === Number(e.target.value)) || null
                  }))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="">Select</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
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
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
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
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
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
              {courseFormats.map(f => <option key={f} value={f}>{f}</option>)}
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
              {courseTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {[...stringKeys, ...numericKeys].map(key => {
            const val = form[key] as string | number
            return (
              <div key={key}>
                <label className="block text-sm text-pink-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  value={val ?? ''}
                  onChange={e => handleChange(key, e.target.value)}
                  type={numericKeys.includes(key) ? 'number' : 'text'}
                  min={numericKeys.includes(key) ? 0 : undefined}
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors[key] && <span className="text-red-500 text-sm">{errors[key]}</span>}
              </div>
            )
          })}

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
              className={`px-5 py-2 rounded-lg text-white ${loading ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'}`}
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








