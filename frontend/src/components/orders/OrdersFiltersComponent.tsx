'use client'

import {useEffect, useRef, useState} from 'react'
import {useRouter, useSearchParams} from 'next/navigation'
import api from '@/services/axios.api.services'
import {ExportExcelComponent} from '@/components/orders/ExportExcelComponent'
import {IGroup} from '@/models/IGroup'
import {isValidDateRange, normalizeAge, normalizePhone, stripSpaces} from "@/utils/validation";


export const OrdersFiltersComponent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [filters, setFilters] = useState({
        name: stripSpaces(searchParams.get('name') || ''),
        surname: stripSpaces(searchParams.get('surname') || ''),
        email: stripSpaces(searchParams.get('email') || ''),
        phone: stripSpaces(searchParams.get('phone') || ''),
        age: searchParams.get('age') || '',
        status: stripSpaces(searchParams.get('status') || ''),
        course: stripSpaces(searchParams.get('course') || ''),
        course_format: stripSpaces(searchParams.get('course_format') || ''),
        course_type: stripSpaces(searchParams.get('course_type') || ''),
        group: stripSpaces(searchParams.get('group') || ''),
        start_date: stripSpaces(searchParams.get('start_date') || ''),
        end_date: stripSpaces(searchParams.get('end_date') || ''),
        mine: searchParams.get('mine') === 'true',
    })

    const [groups, setGroups] = useState<IGroup[]>([])
    const prevParams = useRef('')

    const statuses = [
        {label: 'All statuses', value: ''},
        {label: 'New', value: 'New'},
        {label: 'In work', value: 'Inwork'},
        {label: 'Agree', value: 'Agree'},
        {label: 'Disagree', value: 'Disagree'},
        {label: 'Dubbing', value: 'Dubbing'},
    ]

    const courses = [
        {label: 'All courses', value: ''},
        {label: 'FS', value: 'FS'},
        {label: 'QACX', value: 'QACX'},
        {label: 'JCX', value: 'JCX'},
        {label: 'JSCX', value: 'JSCX'},
        {label: 'FE', value: 'FE'},
        {label: 'PCX', value: 'PCX'},
    ]

    const formats = [
        {label: 'All formats', value: ''},
        {label: 'Static', value: 'static'},
        {label: 'Online', value: 'online'},
    ]

    const types = [
        {label: 'All types', value: ''},
        {label: 'Pro', value: 'pro'},
        {label: 'Minimal', value: 'minimal'},
        {label: 'Premium', value: 'premium'},
        {label: 'Incubator', value: 'incubator'},
        {label: 'VIP', value: 'vip'},
    ]

    useEffect(() => {
        const loadGroups = async () => {
            try {
                const res = await api.get<{ count: number; results: IGroup[] }>('/orders/groups/')
                setGroups(res.data.results || [])
            } catch {
                setGroups([])
            }
        }
        loadGroups()
    }, [])
    const isFirstRender = useRef(true)
    useEffect(() => {
            const handler = setTimeout(() => {
                const params = new URLSearchParams(searchParams.toString())
                Object.entries(filters).forEach(([k, v]) => {
                    if (v !== '' && v !== false) {
                        params.set(k, String(v))
                    } else {
                        params.delete(k)
                    }
                })
                const currentOrdering = searchParams.get('ordering') || ''
                if (currentOrdering) params.set('ordering', currentOrdering)
                if (!isFirstRender.current) {
                    params.delete('page')
                }

                const s = params.toString()
                if (s !== prevParams.current) {
                    prevParams.current = s
                    router.replace(`?${s}`, {scroll: false})
                }
                isFirstRender.current = false
            }, 500)
            return () => clearTimeout(handler)
        }, [filters, searchParams.toString(), router]
    )

    const updateQuery = (key: string, value: string | boolean) => {
        setFilters(prev => {
            let v: string | boolean = value
            if (typeof v === 'string') v = stripSpaces(v)
            if (key === 'age' && typeof v === 'string') v = normalizeAge(v)
            if (key === 'phone' && typeof v === 'string') v = normalizePhone(v)
            if (key === 'start_date' || key === 'end_date') {
                const s = key === 'start_date' ? String(v) : prev.start_date
                const e = key === 'end_date' ? String(v) : prev.end_date
                if (!isValidDateRange(s, e)) return prev
            }
            return {...prev, [key]: v}
        })
    }

    const resetFilters = () => {
        setFilters({
            name: '',
            surname: '',
            email: '',
            phone: '',
            age: '',
            status: '',
            course: '',
            course_format: '',
            course_type: '',
            group: '',
            start_date: '',
            end_date: '',
            mine: false,
        })
        prevParams.current = ''
        router.replace('?', {scroll: false})
    }

    return (
        <div className="mb-5 p-5 bg-pink-50 rounded-2xl shadow-sm">
            <div className="grid grid-cols-6 gap-3 mb-3">
                <input placeholder="Name" value={filters.name} onChange={e => updateQuery('name', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"/>
                <input placeholder="Surname" value={filters.surname}
                       onChange={e => updateQuery('surname', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"/>
                <input placeholder="Email" value={filters.email} onChange={e => updateQuery('email', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"/>
                <input placeholder="Phone" value={filters.phone} onChange={e => updateQuery('phone', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"/>
                <input placeholder="Age" value={filters.age} onChange={e => updateQuery('age', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-pink-400 outline-none"/>
                <select value={filters.course} onChange={e => updateQuery('course', e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white w-full focus:ring-2 focus:ring-pink-400">
                    {courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-6 gap-3 mb-3">
                <select value={filters.course_format} onChange={e => updateQuery('course_format', e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white w-full focus:ring-2 focus:ring-pink-400">
                    {formats.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <select value={filters.course_type} onChange={e => updateQuery('course_type', e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white w-full focus:ring-2 focus:ring-pink-400">
                    {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select value={filters.status} onChange={e => updateQuery('status', e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white w-full focus:ring-2 focus:ring-pink-400">
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={filters.group} onChange={e => updateQuery('group', e.target.value)}
                        className="px-3 py-2 border rounded-lg bg-white w-full focus:ring-2 focus:ring-pink-400">
                    <option value="">All groups</option>
                    {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
                <input type="date" value={filters.start_date} onChange={e => updateQuery('start_date', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full bg-white focus:ring-2 focus:ring-pink-400"/>
                <input type="date" value={filters.end_date} onChange={e => updateQuery('end_date', e.target.value)}
                       className="px-3 py-2 border rounded-lg w-full bg-white focus:ring-2 focus:ring-pink-400"/>
            </div>

            <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-pink-800 font-medium">
                    <input type="checkbox" checked={filters.mine} onChange={e => updateQuery('mine', e.target.checked)}
                           className="accent-pink-500 w-4 h-4"/>
                    My orders
                </label>
                <div className="flex gap-3">
                    <ExportExcelComponent filters={filters} ordering={searchParams.get('ordering') || ''}/>
                    <button onClick={resetFilters} className="p-2 rounded-lg hover:bg-pink-100 transition">
                        <img src="/icons/reset.png" alt="Reset" className="w-6 h-6"/>
                    </button>
                </div>
            </div>
        </div>
    )
}
