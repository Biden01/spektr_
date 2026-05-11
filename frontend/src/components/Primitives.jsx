// Shared primitive components: Button, Chip, Card, Alert, TopBar, Sidebar
import { useState, useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

const MARK = '/mark.svg';
const LOGO_WHITE = '/logo-white.svg';

export const Button = ({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled, style, fullWidth, type, loading }) => {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const isDisabled = disabled || loading;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'inherit', fontWeight: 600, borderRadius: 8, border: '1px solid transparent',
    cursor: isDisabled ? (loading ? 'progress' : 'not-allowed') : 'pointer',
    transition: 'all 180ms cubic-bezier(.2,0,0,1)',
    whiteSpace: 'nowrap', width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.55 : 1,
  };
  const sizes = { sm: { padding: '7px 12px', fontSize: 13 }, md: { padding: '10px 18px', fontSize: 14 }, lg: { padding: '14px 24px', fontSize: 16 } };
  const variants = {
    primary:   { background: '#1B4B7A', color: '#fff', hover: { background: '#153C63', boxShadow: '0 4px 14px rgba(27,75,122,.25)' } },
    success:   { background: '#1F7A3D', color: '#fff', hover: { background: '#176030', boxShadow: '0 4px 14px rgba(31,122,61,.25)' } },
    danger:    { background: '#B8242D', color: '#fff', hover: { background: '#941C24', boxShadow: '0 4px 14px rgba(184,36,45,.25)' } },
    secondary: { background: '#fff', color: '#1B4B7A', borderColor: '#1B4B7A', hover: { background: '#EEF3F8' } },
    ghost:     { background: 'transparent', color: '#1A2332', borderColor: '#E4E8EF', hover: { background: '#F7F9FC', borderColor: '#D0D7E0' } },
    quiet:     { background: '#F7F9FC', color: '#1A2332', hover: { background: '#EEF1F6' } },
  };
  const v = variants[variant];
  // Active state: scale(0.97) for tactile press feedback; combined with translateY(0) to ground it.
  const hoverStyle = !isDisabled && hover
    ? { ...v.hover, transform: active ? 'translateY(0) scale(0.97)' : 'translateY(-1px)' }
    : {};
  const { hover: _h, ...baseVariant } = v;
  return (
    <button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className="s-btn"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={() => { setHover(false); setActive(false); }}
      onPointerDown={() => setActive(true)}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
      style={{
        ...base,
        ...sizes[size],
        ...baseVariant,
        ...(disabled && !loading ? { background: '#E4E8EF', color: '#8A95A5', borderColor: 'transparent' } : {}),
        ...hoverStyle,
        ...style,
      }}
    >
      {loading ? (
        <span className="s-btn-spinner" aria-hidden="true" />
      ) : icon ? (
        <Icon name={icon} size={size === 'lg' ? 20 : 16} />
      ) : null}
      {children}
      {!loading && iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 16} />}
    </button>
  );
};

export const Chip = ({ tone = 'neutral', children }) => {
  const tones = {
    ok:      { bg: '#EAF5EE', fg: '#176030', dot: '#1F7A3D' },
    warn:    { bg: '#FDF4E7', fg: '#8C5409', dot: '#C77A0F' },
    bad:     { bg: '#FBECEC', fg: '#941C24', dot: '#B8242D' },
    info:    { bg: '#EEF3F8', fg: '#153C63', dot: '#1B4B7A' },
    neutral: { bg: '#F7F9FC', fg: '#5B6778', dot: '#8A95A5' },
  };
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', background: t.bg, color: t.fg }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: t.dot }} />
      {children}
    </span>
  );
};

export const Card = ({ children, style, padding = 24, onClick, hoverable, className, ariaLabel }) => {
  const [hover, setHover] = useState(false);
  const isInteractive = !!onClick;
  const canHover = isInteractive || hoverable;
  const hoverStyle = canHover && hover ? { transform: 'translateY(-2px)', boxShadow: '0 10px 30px rgba(26,35,50,0.10)', borderColor: '#D6E2ED' } : {};
  // Keyboard: Enter / Space activate when card is a button surrogate
  const onKeyDown = isInteractive ? (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); }
  } : undefined;
  return (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? ariaLabel : undefined}
      className={`${className || ''}${isInteractive ? ' s-card-interactive' : ''}`.trim()}
      onPointerEnter={(e) => { if (canHover && e.pointerType === 'mouse') setHover(true); }}
      onPointerLeave={() => setHover(false)}
      style={{
        background: '#fff', border: '1px solid #E4E8EF', borderRadius: 12,
        boxShadow: '0 4px 20px rgba(26,35,50,0.06)', padding,
        cursor: canHover ? 'pointer' : 'default',
        transition: 'all 180ms cubic-bezier(.2,0,0,1)',
        ...style, ...hoverStyle,
      }}>{children}</div>
  );
};

export const Alert = ({ tone = 'info', title, description, action, onAction }) => {
  const ariaRole = tone === 'bad' ? 'alert' : tone === 'warn' ? 'status' : undefined;
  const tones = {
    bad:  { bg: '#FBECEC', border: '#F2CFD1', ic: '#B8242D', icName: 'alert' },
    warn: { bg: '#FDF4E7', border: '#F2DEB6', ic: '#C77A0F', icName: 'timer' },
    ok:   { bg: '#EAF5EE', border: '#CFE7D6', ic: '#1F7A3D', icName: 'check' },
    info: { bg: '#EEF3F8', border: '#D6E2ED', ic: '#1B4B7A', icName: 'bell' },
  };
  const t = tones[tone];
  return (
    <div
      style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, border: `1px solid ${t.border}`, background: t.bg, alignItems: 'center' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: t.ic, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={t.icName} size={18} color="#fff" />
      </div>
      {/* Text region is the live-region; the action button is intentionally outside so SR doesn't announce it inline */}
      <div
        role={ariaRole}
        aria-live={tone === 'bad' ? 'assertive' : tone === 'warn' ? 'polite' : undefined}
        style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1A2332', marginBottom: 2 }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: '#475060' }}>{description}</div>}
      </div>
      {action && <Button variant="ghost" size="sm" onClick={onAction} iconRight="arrow">{action}</Button>}
    </div>
  );
};

export const TopBar = ({ onLogin, onRegister, onHome, onAbout, onCenter, onDocs }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { label: 'О системе',     action: onAbout  },
    { label: 'Учебный центр', action: onCenter },
    { label: 'Документы',     action: onDocs   },
  ];

  return (
    <header className="s-topbar" style={{ height: 72, background: '#fff', borderBottom: '1px solid #E4E8EF', display: 'flex', alignItems: 'center', padding: '0 40px', position: 'sticky', top: 0, zIndex: 10 }}>
      <a href="#" onClick={(e) => { e.preventDefault(); onHome && onHome(); }}
         aria-label="СПЕКТР — на главную"
         style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
        <img src={MARK} className="s-topbar-logo-img" style={{ height: 36 }} alt="" />
        <span className="s-topbar-logo-text" style={{ fontFamily: 'Manrope, Inter, sans-serif', fontWeight: 800, fontSize: 22, color: '#1A2332', letterSpacing: '-0.01em' }}>СПЕКТР</span>
      </a>
      <nav className="s-topbar-nav" aria-label="Основная навигация" style={{ display: 'flex', gap: 28, marginLeft: 48 }}>
        {NAV_LINKS.map(({ label, action }) => (
          <a key={label} href="#" onClick={(e) => { e.preventDefault(); action && action(); }}
             style={{ color: '#2F3B4D', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{label}</a>
        ))}
      </nav>
      <div className="s-topbar-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button variant="ghost" onClick={onLogin}>Войти</Button>
        <span className="s-topbar-register" style={{ display: 'contents' }}>
          <Button variant="success" icon="graduation" onClick={onRegister}>Регистрация в Учебном центре</Button>
        </span>
        <button
          type="button"
          className="s-topbar-burger"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="s-topbar-mobile-menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
        </button>
      </div>
      {menuOpen && (
        <div id="s-topbar-mobile-menu" className="s-topbar-mobile-menu" role="dialog" aria-label="Меню">
          <nav aria-label="Мобильная навигация" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_LINKS.map(({ label, action }) => (
              <a key={label} href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); action && action(); }}
                 style={{ padding: '12px 16px', borderRadius: 8, color: '#1A2332', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>{label}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid #E4E8EF' }}>
            <Button variant="ghost" fullWidth onClick={() => { setMenuOpen(false); onLogin && onLogin(); }}>Войти</Button>
            <Button variant="success" icon="graduation" fullWidth onClick={() => { setMenuOpen(false); onRegister && onRegister(); }}>Регистрация в Учебном центре</Button>
          </div>
        </div>
      )}
    </header>
  );
};

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0] || '?').slice(0, 2).toUpperCase();
};

export const Sidebar = ({ active, onNav, user }) => {
  const items = [
    { id: 'home',    icon: 'home',      label: 'Главная' },
    { id: 'daily',   icon: 'clipboard', label: 'Ежедневная проверка' },
    { id: 'video',   icon: 'film',      label: 'Видеоуроки' },
    { id: 'exam',    icon: 'target',    label: 'Экзамены' },
    { id: 'safe',    icon: 'shield',    label: 'Безопасный труд' },
    { id: 'results', icon: 'chart',     label: 'Мои результаты' },
    { id: 'profile', icon: 'user',      label: 'Профиль' },
  ];
  return (
    <aside className="s-sidebar" style={{ width: 248, background: '#0F2D4A', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 14px', minHeight: '100vh' }}>
      <div className="s-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 14 }}>
        <img src={MARK} style={{ width: 32, height: 32 }} alt="" />
        <span className="s-sidebar-title" style={{ fontFamily: 'Manrope, Inter, sans-serif', fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' }}>СПЕКТР</span>
      </div>
      <nav aria-label="Основная навигация" style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map(it => {
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onNav && onNav(it.id)}
              aria-current={isActive ? 'page' : undefined}
              className="s-sidebar-item"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 8, fontSize: 14,
                cursor: 'pointer', border: 'none', textAlign: 'left', fontFamily: 'inherit',
                background: isActive ? '#1B4B7A' : 'transparent',
                color: isActive ? '#fff' : '#A8C0D6',
                fontWeight: isActive ? 600 : 500,
                marginBottom: 2,
                transition: 'background 140ms ease, color 140ms ease',
              }}>
              <Icon name={it.icon} size={18} />
              <span className="s-sidebar-label">{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="s-sidebar-user" style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 999, background: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {getInitials(user?.name)}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.3, minWidth: 0 }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Пользователь'}</div>
          <div style={{ color: '#A8C0D6', fontSize: 12 }}>Таб. № {user?.id || '—'}</div>
        </div>
      </div>
    </aside>
  );
};

export const BottomNav = ({ active, onNav }) => {
  const items = [
    { id: 'home',    icon: 'home',      label: 'Главная' },
    { id: 'daily',   icon: 'clipboard', label: 'Проверка' },
    { id: 'video',   icon: 'film',      label: 'Уроки' },
    { id: 'exam',    icon: 'target',    label: 'Экзамены' },
    { id: 'results', icon: 'chart',     label: 'Итоги' },
  ];
  return (
    <nav className="s-bottom-nav" aria-label="Мобильная навигация">
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <button key={it.id} type="button" onClick={() => onNav && onNav(it.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={it.label}
            className={`s-bottom-nav-item${isActive ? ' active' : ''}`}>
            <Icon name={it.icon} size={22} color={isActive ? '#1B4B7A' : '#5B6778'} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// ── useToast ──────────────────────────────────────────────────────────────────
// Usage: const { show: toast, ToastContainer } = useToast();
//        toast('Файл скачан');   toast('Ошибка', 'bad');
// ToastContainer must be rendered inside the component's JSX return.
const TOAST_COLORS = {
  ok:   { bg: '#EAF5EE', border: '#CFE7D6', text: '#176030', icon: '#1F7A3D', icName: 'check' },
  bad:  { bg: '#FBECEC', border: '#F2CFD1', text: '#941C24', icon: '#B8242D', icName: 'alert' },
  info: { bg: '#EEF3F8', border: '#D6E2ED', text: '#153C63', icon: '#1B4B7A', icName: 'bell' },
  warn: { bg: '#FDF4E7', border: '#F2DEB6', text: '#8C5409', icon: '#C77A0F', icName: 'timer' },
};

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const show = (msg, tone = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, tone }]);
    timers.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timers.current[id];
    }, 3500);
  };

  // Cleanup on unmount
  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const ToastContainer = () => (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed', bottom: 90, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none',
      }}>
      {toasts.map(t => {
        const c = TOAST_COLORS[t.tone] || TOAST_COLORS.ok;
        return (
          <div key={t.id} role="status" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: c.bg, border: `1px solid ${c.border}`,
            color: c.text, fontSize: 14, fontWeight: 500,
            boxShadow: '0 4px 20px rgba(26,35,50,.14)',
            fontFamily: 'Inter, sans-serif',
            animation: 'fadeInUp 180ms ease',
            pointerEvents: 'auto',
          }}>
            <Icon name={c.icName} size={16} color={c.icon} />
            {t.msg}
          </div>
        );
      })}
    </div>
  );

  return { show, ToastContainer };
};

export { MARK, LOGO_WHITE };
