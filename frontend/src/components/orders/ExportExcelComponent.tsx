'use client'

import {useState} from 'react'
import api from '@/services/axios.api.services'

interface ExportExcelComponentProps {
    filters: Record<string, string | boolean>
}

export const ExportExcelComponent = ({filters}: ExportExcelComponentProps) => {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.set(key, String(value))
            })

            const response = await api.get(`/orders/export/?${params.toString()}`, {
                responseType: 'blob',
            })

            const blob = new Blob([response.data as BlobPart], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            })

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'orders_export.xlsx'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (e) {
            console.error('Export failed', e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className={`p-2 rounded-lg transition ${
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-pink-100'
            }`}
            title="Export to Excel"
        >
            <img src="/icons/excel.png" alt="Export" className="w-6 h-6"/>
        </button>
    )
}
