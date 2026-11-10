// Simple line icons drawn in the brand colors. Decorative only (aria-hidden),
// since every icon sits next to its text label.
export type IconName =
  | 'fire' | 'toilet' | 'table' | 'wifi' | 'paw' | 'grill' | 'shed'
  | 'water' | 'shower' | 'plug' | 'tree' | 'leaf' | 'egg' | 'home'

const paths: Record<IconName, string> = {
  fire: 'M12 3c1 3 4 4.5 4 8.5A4 4 0 0 1 8 11.5c0-1.6.7-2.7 1.6-3.6.2 1.3.9 2.1 1.9 2.4C11 8 11 5.5 12 3ZM5 21h14M7 18l10 3M17 18 7 21',
  toilet: 'M7 3h4v7H7zM5 10h14a7 7 0 0 1-7 7 7 7 0 0 1-7-7ZM9 16.5 8 21h8l-1-4.5',
  table: 'M3 9h18M5 9l-2 9M19 9l2 9M8 9l-1 5h10l-1-5',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
  paw: 'M8 10.5a1.8 2.2 0 1 0 0-.01ZM16 10.5a1.8 2.2 0 1 0 0-.01ZM5 14a1.6 2 0 1 0 0-.01ZM19 14a1.6 2 0 1 0 0-.01ZM12 14c-2.5 0-4.5 2.5-4.5 4.3 0 1.4 1.3 1.9 2.5 1.6 1.3-.3 2.7-.3 4 0 1.2.3 2.5-.2 2.5-1.6 0-1.8-2-4.3-4.5-4.3Z',
  grill: 'M4 9h16a8 8 0 0 1-16 0ZM8 16l-2 5M16 16l2 5M9 3c-.8 1.2.8 2 0 3.5M13 3c-.8 1.2.8 2 0 3.5',
  shed: 'M3 11 12 4l9 7M5 9.5V20h14V9.5M10 20v-5h4v5',
  water: 'M12 3c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0C6 10.2 9 7 12 3Z',
  shower: 'M4 20V7a3 3 0 0 1 6 0M7 10h6a3 3 0 0 0-6 0ZM8 14v.01M10 16v.01M12 14v.01M9 18v.01M11 20v.01',
  plug: 'M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0ZM12 17v4',
  tree: 'M12 3 6.5 10.5H9L5 16h14l-4-5.5h2.5ZM12 16v5',
  leaf: 'M5 19C5 10.5 10 5.5 20 4c-1.3 9.8-6.3 15-15 15ZM5 19l8.5-8.5',
  egg: 'M12 3c3.5 0 6.5 5.6 6.5 10.2a6.5 6.5 0 0 1-13 0C5.5 8.6 8.5 3 12 3Z',
  home: 'M3 11.5 12 4l9 7.5M6 9.7V20h12V9.7M10 20v-5.5h4V20',
}

const Icon = ({ name, size = 24 }: { name: IconName; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={paths[name]} />
  </svg>
)

export default Icon
