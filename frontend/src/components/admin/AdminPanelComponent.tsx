'use client'

import {useEffect, useState} from 'react'
import {managersApi} from '@/services/managers.api.services'
import {IStatisticsResponse} from '@/models/IStatistics'
import {IManager} from '@/models/IManager'

export const AdminPanelComponent = () => {
    const [stats, setStats] = useState<IStatisticsResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadStats = async () => {
        try {
            setLoading(true)
            const data = await managersApi.getStatistics()
            setStats(data)
        } catch {
            setError('Failed to load admin data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    const handleCreate = async () => {
        const email = prompt('Enter email:')
        if (!email) return
        try {
            await managersApi.create({email})
            await loadStats()
            alert('Manager created.')
        } catch {
            alert('Error creating manager.')
        }
    }

    const handleAction = async (id: number, action: 'ban' | 'unban') => {
        try {
            if (action === 'ban') await managersApi.ban(id)
            else await managersApi.unban(id)
            await loadStats()
        } catch {
            alert('Action failed.')
        }
    }


    const handleActivate = async (id: number) => {
        try {
            const link = await managersApi.activate(id)
            const frontendLink = link.replace('http://localhost:8000/api/users/activate/', 'http://localhost:3000/activate/')
            await navigator.clipboard.writeText(frontendLink)
            alert('Activation link copied!')
        } catch {
            alert('Activation failed.')
        }
    }

    const handleRecovery = async (id: number) => {
        try {
            const link = await managersApi.recovery(id)
            const frontendLink = link.replace('http://localhost:8000/api/users/recovery/', 'http://localhost:3000/recovery/')
            await navigator.clipboard.writeText(frontendLink)
            alert('Recovery link copied!')
        } catch {
            alert('Recovery failed.')
        }
    }


    if (loading) return <p className="text-center py-12 text-gray-500">Loading...</p>
    if (error) return <p className="text-center text-red-500">{error}</p>
    if (!stats) return <p className="text-center">No data.</p>

    return (
        <div className="w-screen min-h-screen bg-gray-50 overflow-auto">
            <div className="max-w-screen-2xl mx-auto px-8 py-10">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-pink-600">Admin Panel</h1>
                    <button
                        onClick={handleCreate}
                        className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition"
                    >
                        + Create Manager
                    </button>
                </div>

                <div className="bg-white border border-pink-100 rounded-2xl p-6 mb-8 shadow-sm w-full">
                    <h2 className="text-lg font-semibold text-pink-600 mb-4">Orders Statistics</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {Object.entries(stats.global).map(([key, value]) => (
                            <div key={key}
                                 className="bg-pink-50 border border-pink-100 rounded-xl p-4 text-center shadow-sm">
                                <p className="text-pink-600 font-semibold">{key}</p>
                                <p className="text-gray-700">{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="bg-white border border-pink-100 rounded-2xl shadow-sm w-full px-10 py-6 overflow-x-auto">
                    <h2 className="text-lg font-semibold text-pink-600 mb-4">Managers</h2>
                    <table className="w-full text-sm">
                        <thead className="bg-pink-100 text-pink-700">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Surname</th>
                            <th className="p-3 text-center">Active</th>
                            <th className="p-3 text-center">Last login</th>
                            <th className="p-3 text-center">Total</th>
                            <th className="p-3 text-center">In work</th>
                            <th className="p-3 text-center">Agree</th>
                            <th className="p-3 text-center">Disagree</th>
                            <th className="p-3 text-center">Dubbing</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stats.managers.map((m: IManager) => (
                            <tr key={m.id} className="border-t hover:bg-pink-50 transition text-center">
                                <td className="p-3 text-left">{m.id}</td>
                                <td className="p-3 text-left">{m.email}</td>
                                <td className="p-3 text-left">{m.first_name || '—'}</td>
                                <td className="p-3 text-left">{m.last_name || '—'}</td>
                                <td className="p-3">{m.is_active ? '✅' : '❌'}</td>
                                <td className="p-3">{m.last_login ? new Date(m.last_login).toLocaleDateString() : '—'}</td>
                                <td className="p-3">{m.stats?.total || 0}</td>
                                <td className="p-3">{m.stats?.in_work || 0}</td>
                                <td className="p-3">{m.stats?.agree || 0}</td>
                                <td className="p-3">{m.stats?.disagree || 0}</td>
                                <td className="p-3">{m.stats?.dubbing || 0}</td>
                                <td className="p-3 flex flex-wrap gap-2 justify-center">
                                    {m.is_active ? (
                                        <>
                                            <button
                                                onClick={() => handleAction(m.id, 'ban')}
                                                className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Ban
                                            </button>
                                            <button
                                                onClick={() => handleRecovery(m.id)}
                                                className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Recovery password
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleAction(m.id, 'unban')}
                                                className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                                            >
                                                Unban
                                            </button>
                                            <button
                                                onClick={() => handleActivate(m.id)}
                                                className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Activate
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}





