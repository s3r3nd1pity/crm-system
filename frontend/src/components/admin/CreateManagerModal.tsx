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
  const [errors, setErrors] = useState<{ email?: string; firstName?: string; lastName?: string }>({})

  const validate = () => {
    const newErrors: typeof errors = {}

    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'

    if (!firstName.trim()) newErrors.firstName = 'First name is required'
    if (!lastName.trim()) newErrors.lastName = 'Last name is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await managersApi.create({
        email,
        first_name: firstName,
        last_name: lastName,
      })
      onCreated()
      onClose()
    } catch (err: unknown) {
      // @ts-expect-error mmm
      const responseData = err.response?.data || {}
      setErrors({
        email: responseData.email?.[0] || '',
        firstName: responseData.first_name?.[0] || '',
        lastName: responseData.last_name?.[0] || '',
      })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `w-full mt-1 rounded-md border px-3 py-2 focus:ring-2 focus:ring-pink-400 outline-none ${hasError ? 'border-red-500' : 'border-gray-300'}`

  return createPortal(
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold text-center mb-4 text-pink-600">
          Create Manager
        </h2>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </label>

        <label className="block mb-3">
          <span className="text-sm text-gray-600">First Name</span>
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className={inputClass(!!errors.firstName)}
          />
          {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-600">Last Name</span>
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className={inputClass(!!errors.lastName)}
          />
          {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
        </label>

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


