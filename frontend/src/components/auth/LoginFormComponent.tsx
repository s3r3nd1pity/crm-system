'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {usersApi} from "@/services/users.api.services";

export const LoginFormComponent = () => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const tokens = await usersApi.login(email, password)
            localStorage.setItem('access', tokens.access)
            localStorage.setItem('refresh', tokens.refresh)
            router.push('/orders')

        } catch {
            setError('Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white shadow-soft rounded-2xl p-8 w-full max-w-sm"
        >
            <h1 className="text-2xl font-bold text-pink-600 mb-6 text-center">
                CRM Login
            </h1>
            {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-6 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-xl font-medium text-white transition ${
                    loading
                        ? 'bg-pink-300 cursor-not-allowed'
                        : 'bg-pink-500 hover:bg-pink-600'
                }`}
            >
                {loading ? 'Logging in…' : 'Login'}
            </button>
        </form>
    )
}
