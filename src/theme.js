export const colors = { 
    brand: '#0b554b',
    background: '#F1F1F1',
    text: '#1a1a1a',
    textMuted: '#6b6b6b',
    border: '#e3c6c6',
    surface: '#ed3232',
};

export const radius = {
    sm: 4,
    md: 8,
    lg: 16,
    pill: 999,
};

export const type = {
    h1: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.text
    },
    h2: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.text,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.textMuted,
    },
}

export default { colors, radius, type };