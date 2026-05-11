import Icon from './Icon.jsx';
import { MARK } from './Primitives.jsx';

const items = [
  { id: 'overview',    icon: 'chart',     label: 'Обзор' },
  { id: 'users',       icon: 'users',     label: 'Пользователи' },
  { id: 'questions',   icon: 'clipboard', label: 'База вопросов' },
  { id: 'lessons',     icon: 'film',      label: 'Видеоуроки' },
  { id: 'protocols',   icon: 'shield',    label: 'Протоколы ОТ' },
  { id: 'mechanisms',  icon: 'hard',      label: 'Узлы/механизмы' },
  { id: 'courses',     icon: 'graduation',label: 'Курсы УЦ' },
  { id: 'documents',   icon: 'book',      label: 'Документы' },
  { id: 'reports',     icon: 'trending',  label: 'Отчёты' },
  { id: 'alerts',      icon: 'bell',      label: 'Оповещения' },
  { id: 'settings',    icon: 'settings',  label: 'Настройки' },
  { id: 'categories',  icon: 'target',    label: 'Категории' },
  { id: 'audit',       icon: 'eye',       label: 'История событий' },
];

const AdminSidebar = ({ active, onNav, user }) => (
  <aside className="s-sidebar" style={{ width: 248, background: '#0F2D4A', color: '#fff', display: 'flex', flexDirection: 'column', padding: '20px 14px', minHeight: '100vh' }}>
    <div className="s-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 14 }}>
      <img src={MARK} style={{ width: 32, height: 32 }} alt=""/>
      <div>
        <div className="s-sidebar-title" style={{ fontFamily: 'Manrope, Inter, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>СПЕКТР</div>
        <div style={{ fontSize: 11, color: '#A8C0D6', textTransform: 'uppercase', letterSpacing: '.06em' }}>Админ-панель</div>
      </div>
    </div>
    <nav aria-label="Админ навигация" style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <button key={it.id} type="button" onClick={() => onNav && onNav(it.id)}
            aria-current={isActive ? 'page' : undefined}
            className="s-sidebar-item"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 8, fontSize: 14,
              cursor: 'pointer', border: 'none', textAlign: 'left', fontFamily: 'inherit',
              background: isActive ? '#1B4B7A' : 'transparent',
              color: isActive ? '#fff' : '#A8C0D6',
              fontWeight: isActive ? 600 : 500, marginBottom: 2,
              transition: 'background 140ms ease, color 140ms ease',
            }}>
            <Icon name={it.icon} size={18}/>
            <span className="s-sidebar-label">{it.label}</span>
          </button>
        );
      })}
    </nav>
    <div className="s-sidebar-user" style={{ marginTop: 'auto', padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 999, background: '#B8242D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14 }}>{user?.initials || 'А'}</div>
      <div style={{ fontSize: 13, lineHeight: 1.3 }}>
        <div style={{ fontWeight: 600 }}>{user?.name || 'Администратор'}</div>
        <div style={{ color: '#A8C0D6', fontSize: 12 }}>{user?.role || 'admin'}</div>
      </div>
    </div>
  </aside>
);

export default AdminSidebar;
