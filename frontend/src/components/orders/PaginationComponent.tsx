'use client'

import { FC } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Props = {
  count: number
  pageSize: number
}

export const PaginationComponent: FC<Props> = ({ count, pageSize }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const totalPages = Math.ceil(count / pageSize)

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
  }

  const createPages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    }
    else if (currentPage < 5) {
      pages.push(1, 2, 3, 4, 5, 6, 7, '...', totalPages)
    }
    else if (currentPage >= 5 && currentPage < totalPages - 4) {
      pages.push(
        1,
        '...',
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        '...',
        totalPages
      )
    }
    else {
      pages.push(
        1,
        '...',
        totalPages - 6,
        totalPages - 5,
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      )
    }

    return pages
  }

  const pages = createPages()

  return (
    <div className="flex justify-center mt-6 gap-2 items-center">
      {currentPage > 1 && (
        <button
          onClick={() => goToPage(currentPage - 1)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-pink-300 text-pink-900 hover:bg-pink-400 transition"
        >
          &lt;
        </button>
      )}

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={idx} className="text-gray-400 px-2">
            ...
          </span>
        ) : (
          <button
            key={idx}
            onClick={() => goToPage(p as number)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              currentPage === p
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-pink-200 text-pink-900 hover:bg-pink-400'
            }`}
          >
            {p}
          </button>
        )
      )}

      {currentPage < totalPages && (
        <button
          onClick={() => goToPage(currentPage + 1)}
          className="px-3 py-1 rounded-full text-sm font-medium bg-pink-300 text-pink-900 hover:bg-pink-400 transition"
        >
          &gt;
        </button>
      )}
    </div>
  )
}


