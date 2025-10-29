'use client'

import { FormEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import { managersApi } from '@/services/managers.api.services'

type Props = {
  onClose: () => void
  onCreated: () => void
}

export const CreateManagerModal = ({ onClose, onCreated }: Props) => {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await managersApi.create({
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      })
      onCreated()
      onClose()
    } catch (err: unknown) {
      // @ts-ignore
      setError(err.response?.data?.email?.[0] || 'Error creating manager')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg"
      >
        <h2 className="text-lg font-semibold text-center mb-4 text-pink-600">
          Create Manager
        </h2>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
          />
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Name</span>
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-600">Surname</span>
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none"
          />
        </label>

        {error && <p className="text-sm text-red-500 mb-3 text-center">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}



