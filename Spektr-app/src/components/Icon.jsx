// Shared icon component — small Lucide-style set (1.5px stroke)
const Icon = ({ name, size = 20, color = 'currentColor', style, title, 'aria-hidden': ariaHidden }) => {
  // Decorative by default (aria-hidden=true). Pass `title` to make it labeled/meaningful for screen readers.
  const isDecorative = !title && ariaHidden !== false;
  const paths = {
    home: <><path d="M3 10 L12 3 L21 10 V20 a1 1 0 0 1-1 1H4 a1 1 0 0 1-1-1Z"/><path d="M9 21V12h6v9"/></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/></>,
    book: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5"/><path d="M4 4.5V21.5"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></>,
    shield: <><path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5Z"/><path d="m9 12 2 2 4-4"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></>,
    logout: <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h12"/></>,
    bell: <><path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 8v5l3 2"/><path d="M9 2h6"/></>,
    check: <><path d="m5 12 5 5L20 7"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    graduation: <><path d="M3 9l9-5 9 5-9 5-9-5Z"/><path d="M7 11v5c0 1 2 3 5 3s5-2 5-3v-5"/></>,
    alert: <><path d="M12 3 2 20h20z"/><path d="M12 10v5M12 18v.5"/></>,
    film: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/></>,
    play: <><path d="M7 4v16l13-8z" fill={color}/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.7l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.7-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.7.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.7 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.7.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.7-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.7v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/><circle cx="17" cy="6" r="3"/><path d="M21 15v-1a4 4 0 0 0-4-4"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7v.5"/><circle cx="12" cy="17" r=".6" fill={color}/></>,
    trending: <><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></>,
    hard: <><path d="M12 3a8 8 0 0 0-8 8v3h16v-3a8 8 0 0 0-8-8Z"/><path d="M2 17h20"/><path d="M8 14V9M16 14V9"/></>,
    zap: <><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></>,
    flame: <><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-1 .5-2 1-3-1 0-3 1-3 4a6 6 0 0 0 12 0c0-5-6-9-6-9Z"/></>,
    chevron: <><path d="m9 6 6 6-6 6"/></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    'eye-off': <><path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-3.2 4.2"/><path d="M6.6 6.6A17.5 17.5 0 0 0 2 12s3.5 7 10 7a9 9 0 0 0 4-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>,
    keyboard: <><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></>,
  };
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={style}
      aria-hidden={isDecorative || undefined}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {paths[name] || null}
    </svg>
  );
};

export default Icon;
