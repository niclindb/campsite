// Simple line icons drawn in the brand colors. Decorative only (aria-hidden),
// since every icon sits next to its text label.
export type IconName =
  | 'fire' | 'toilet' | 'table' | 'wifi' | 'paw' | 'grill' | 'shed'
  | 'water' | 'shower' | 'plug' | 'tree' | 'egg' | 'home'
  | 'tag' | 'pin' | 'tent' | 'calendar' | 'mail' | 'phone' | 'chat'
  | 'bike' | 'boot' | 'wave' | 'city' | 'fish' | 'cliff'
  | 'clock' | 'moon' | 'users' | 'shield'

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
  egg: 'M12 3c3.5 0 6.5 5.6 6.5 10.2a6.5 6.5 0 0 1-13 0C5.5 8.6 8.5 3 12 3Z',
  home: 'M3 11.5 12 4l9 7.5M6 9.7V20h12V9.7M10 20v-5.5h4V20',
  tag: 'M3 12V4h8l10 10-8 8ZM7.5 8.5h.01',
  tent: 'M12 4 3 20h18ZM12 4v16M9 20l3-6 3 6',
  calendar: 'M4 6h16v14H4ZM4 10h16M8 3v5M16 3v5',
  mail: 'M3 6h18v12H3ZM3 6l9 7 9-7',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  chat: 'M4 5h16v11H9l-5 4Z',
  bike: 'M5.5 17.5a3.5 3.5 0 1 0 0-.01ZM18.5 17.5a3.5 3.5 0 1 0 0-.01ZM5.5 17.5 9 10h7l2.5 7.5M9 10l3.5 7.5L16 10M8 7h3M15 7h2l1 3',
  boot: 'M7 3h5v8l6 3.5c1.5.9 2 2 2 3.5v1H4V3h3ZM4 15h16M9 7h3M9 10h3',
  wave: 'M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2',
  city: 'M3 21h18M5 21V10l5-3v14M10 21V4h6v17M16 21v-9h3v9M12.5 8h1M12.5 11h1M12.5 14h1M7 13h1M7 16h1',
  fish: 'M3 12c3-4.5 9-6 14-2l4-3v10l-4-3c-5 4-11 2.5-14-2ZM8 11h.01',
  cliff: 'M3 20h18M4 20V9l4-4 3 3 2-2v14M13 6l3 4 2 0 2 3v7M6 12h2M7 15h3',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3.5 2',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.4c2.1.8 3.5 2.8 3.5 5.6',
  shield: 'M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6ZM9 12l2 2 4-4',
  pin: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
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
