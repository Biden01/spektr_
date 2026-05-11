import Icon from '../../components/Icon.jsx';
import { Button } from '../../components/Primitives.jsx';
import AdminSidebar from '../../components/AdminSidebar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminLayout = ({ active, onNav, onLogout, title, subtitle, actions, children }) => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <AdminSidebar active={active} onNav={onNav} user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), initials: user.initials, role: 'Администратор' }}/>
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#B8242D', marginBottom: 4 }}>Админ-панель</div>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
            {subtitle && <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>{subtitle}</div>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            {actions}
            <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
