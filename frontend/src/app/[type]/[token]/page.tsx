'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/services/axios.api.services'

export default function PasswordSetupPage() {
  const { type, token } = useParams<{ type: string; token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isRecovery = type === 'recovery'
  const title = isRecovery ? 'Reset Password' : 'Create Password'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      setError(null)
      await api.post(`/users/${type}/${token}/`, { password })
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2500)
    } catch {
      setError('Operation failed or token expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-pink-600 mb-6">{title}</h1>
        {success ? (
          <p className="text-green-600 font-medium">
            {isRecovery
              ? 'Password reset successfully. Redirecting...'
              : 'Password created successfully. Redirecting...'}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-pink-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border border-pink-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg py-2 transition disabled:opacity-60"
            >
              {loading ? 'Loading...' : 'Set Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}



