'use client'

import {FC, useEffect, useState} from 'react'
import { IComment } from '@/models/IComment'
import { ordersApi } from '@/services/orders.api.services'

type Props = {
  orderId: number
  initialComments: IComment[]
  canComment: boolean
  onCommentsUpdated?: () => void
}

export const CommentsComponent: FC<Props> = ({
  orderId,
  initialComments,
  canComment,
  onCommentsUpdated,
}) => {
  const [comments, setComments] = useState<IComment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setComments(initialComments)
  }, [initialComments])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !canComment) return
    setLoading(true)
    try {
      await ordersApi.createComment(orderId, newComment)
      const updated = await ordersApi.getById(orderId)
      setComments(updated.comments || [])
      onCommentsUpdated?.()
      setNewComment('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-pink-200 rounded-xl p-3 max-h-60 overflow-y-auto">
        {comments.length ? (
          comments.map((c) => (
            <div
              key={c.id}
              className="border-b border-pink-100 py-2 last:border-0 flex flex-col sm:flex-row sm:justify-between"
            >
              <span className="text-gray-800 break-words">{c.text}</span>
              <span className="text-gray-500 text-xs mt-1 sm:mt-0">
                {c.author_name} • {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No comments yet</p>
        )}
      </div>

      {canComment && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 mt-2"
        >
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-lg text-white ${
              loading
                ? 'bg-pink-300 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 transition'
            }`}
          >
            {loading ? '...' : 'Submit'}
          </button>
        </form>
      )}
    </div>
  )
}

