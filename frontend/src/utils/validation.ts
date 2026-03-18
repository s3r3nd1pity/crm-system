export const validateEmail = (email: string): string => {
    if (!email) return ''
    return /^\S+@\S+\.\S+$/.test(email) ? '' : 'Invalid email format'
}

export const validatePhone = (phone: string): string => {
    if (!phone) return ''
    return /^\+?\d{5,20}$/.test(phone) ? '' : 'Phone must be 5–20 digits, optionally starting with +'
}

export const validateText = (value: string): string => {
    if (!value) return ''
    return /^[\p{L}\s-]+$/u.test(value)
        ? ''
        : 'Only letters, spaces, and hyphen allowed'
}

export const sanitizeNumber = (value: string): number => {
    let num = Number(value.replace(/\s/g, ''))
    if (isNaN(num) || num < 0) num = 0
    return num
}

export const stripSpaces = (v: string) => v.replace(/\s+/g, '')
export const normalizeAge = (v: string) => {
    if (v === '') return ''
    const n = Number(v)
    if (Number.isNaN(n)) return ''
    if (n < 0) return '0'
    if (n > 120) return '120'
    return String(n)
}
export const normalizePhone = (v: string) => stripSpaces(v).replace(/[^\d+]/g, '')
export const isValidDateRange = (s: string, e: string) => !s || !e || new Date(e) >= new Date(s)
