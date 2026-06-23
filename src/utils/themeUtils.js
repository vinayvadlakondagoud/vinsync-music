const STORAGE_KEY = 'vini_theme';

const ACCENTS = {
    cyan: { name: 'Cyan', primary: '#06b6d4', hex: '#06b6d4' },
    blue: { name: 'Blue', primary: '#3b82f6', hex: '#3b82f6' },
    green: { name: 'Green', primary: '#22c55e', hex: '#22c55e' },
    pink: { name: 'Pink', primary: '#ec4899', hex: '#ec4899' },
    purple: { name: 'Purple', primary: '#a855f7', hex: '#a855f7' },
    orange: { name: 'Orange', primary: '#f97316', hex: '#f97316' },
    red: { name: 'Red', primary: '#ef4444', hex: '#ef4444' },
    amber: { name: 'Amber', primary: '#f59e0b', hex: '#f59e0b' },
    emerald: { name: 'Emerald', primary: '#10b981', hex: '#10b981' },
};

const FONT_SIZES = {
    small: { name: 'Small', scale: 0.875 },
    medium: { name: 'Medium', scale: 1 },
    large: { name: 'Large', scale: 1.125 },
};

const defaultTheme = {
    mode: 'dark',
    accent: 'cyan',
    fontSize: 'medium',
};

const loadTheme = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return { ...defaultTheme, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...defaultTheme };
};

const saveTheme = (theme) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch { /* ignore */ }
};

const applyTheme = (theme) => {
    const root = document.documentElement;
    const accent = ACCENTS[theme.accent] || ACCENTS.cyan;
    const isDark = theme.mode === 'dark';
    const fontSize = FONT_SIZES[theme.fontSize] || FONT_SIZES.medium;

    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--accent', accent.primary);
    root.style.setProperty('--accent-hover', accent.primary + 'cc');

    // Font size
    root.style.fontSize = `${fontSize.scale * 16}px`;

    // Mode vars
    if (isDark) {
        root.style.setProperty('--bg-primary', '#050505');
        root.style.setProperty('--bg-secondary', '#0a0a0a');
        root.style.setProperty('--bg-surface', '#111111');
        root.style.setProperty('--bg-elevated', '#1a1a1a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#a1a1aa');
        root.style.setProperty('--text-tertiary', '#52525b');
        root.style.setProperty('--border-color', 'rgba(255,255,255,0.05)');
        root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.05)');
    } else {
        root.style.setProperty('--bg-primary', '#f5f5f5');
        root.style.setProperty('--bg-secondary', '#e5e5e5');
        root.style.setProperty('--bg-surface', '#ffffff');
        root.style.setProperty('--bg-elevated', '#ffffff');
        root.style.setProperty('--text-primary', '#0a0a0a');
        root.style.setProperty('--text-secondary', '#52525b');
        root.style.setProperty('--text-tertiary', '#a1a1aa');
        root.style.setProperty('--border-color', 'rgba(0,0,0,0.08)');
        root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.8)');
    }
};

export { ACCENTS, FONT_SIZES, defaultTheme, loadTheme, saveTheme, applyTheme };
