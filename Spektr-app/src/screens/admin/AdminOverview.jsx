import { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import { Card, Chip, Button } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { getOverview, getSectionStats, getEmployeeActivity, getCategoryStats } from '../../api/reports.js';
import { getRecentEvents } from '../../api/events.js';

const AdminOverviewScreen = ({ onNav, onLogout }) => {
  const { categories: CATEGORIES } = useCategories();
  const [overview, setOverview] = useState({ total_users: 0, overdue_count: 0, daily_done_today: 0, pass_rate: 0 });
  const [sectionStats, setSectionStats] = useState({});
  const [activity, setActivity] = useState([]);
  const [events, setEvents] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    getOverview().then(setOverview).catch(console.error);
    getSectionStats().then(setSectionStats).catch(console.error);
    getEmployeeActivity(30).then(setActivity).catch(console.error);
    getRecentEvents(10).then(setEvents).catch(console.error);
    getCategoryStats().then(setCategoryStats).catch(console.error);
  }, []);

  const total = overview.total_users;
  const dailyToday = overview.daily_done_today;
  const overdueAnnual = overview.overdue_count;
  const overdueMed = 0;

  // Активность за 30 дней — из API или плейсхолдер
  const days = activity.length > 0
    ? activity.map((a, i) => ({ d: i + 1, n: a.count }))
    : Array.from({ length: 30 }, (_, i) => ({ d: i + 1, n: 0 }));
  const maxN = Math.max(...days.map(d => d.n), 1);

  // Распределение по категориям — реальные данные из /reports/category-stats
  const catStats = CATEGORIES.map(c => ({
    ...c,
    avg: categoryStats[c.id] != null ? Math.round(categoryStats[c.id]) : null,
  }));

  // Требуют внимания — placeholder until API provides it
  const attention = [];

  const eventToneIcon = {
    test_passed:    { ic: 'check', color: '#1F7A3D' },
    test_failed:    { ic: 'x', color: '#B8242D' },
    overdue:        { ic: 'alert', color: '#B8242D' },
    medical_warning:{ ic: 'help', color: '#C77A0F' },
    login:          { ic: 'user', color: '#1B4B7A' },
    question_added: { ic: 'clipboard', color: '#1B4B7A' },
    lesson_added:   { ic: 'film', color: '#1B4B7A' },
    user_added:     { ic: 'users', color: '#1B4B7A' },
    enrollment:     { ic: 'graduation', color: '#1F7A3D' },
    lesson_done:    { ic: 'play', color: '#1F7A3D' },
  };

  return (
    <AdminLayout active="overview" onNav={onNav} onLogout={onLogout} title="Обзор системы" subtitle="Ключевые метрики и оперативная сводка">
      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="s-feature-grid">
        {[
          { l: 'Всего сотрудников',      v: total,         d: '+3 за неделю',  bg: '#EEF3F8', fg: '#1B4B7A', ic: 'users' },
          { l: 'Прошли ежедневную',      v: dailyToday,    d: `из ${total}`,   bg: '#EAF5EE', fg: '#1F7A3D', ic: 'check' },
          { l: 'Просрочки ежегодных',    v: overdueAnnual, d: 'требуют действий', bg: '#FBECEC', fg: '#B8242D', ic: 'alert' },
          { l: 'Просрочки медосмотров',  v: overdueMed,    d: 'обратиться к мастеру', bg: '#FDF4E7', fg: '#C77A0F', ic: 'help' },
        ].map((k, i) => (
          <Card key={i} padding={20}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, color: k.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={k.ic} size={18} color={k.fg}/>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5B6778', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 4 }}>{k.v}</div>
            <div style={{ fontSize: 12, color: '#5B6778' }}>{k.d}</div>
          </Card>
        ))}
      </div>

      {/* Графики */}
      <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        <Card padding={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Активность за 30 дней</h3>
            <div style={{ fontSize: 12, color: '#5B6778' }}>тестов в день</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
            {days.map((d, i) => {
              const h = (d.n / maxN) * 100;
              return (
                <div key={i} title={`День ${d.d}: ${d.n} тестов`}
                  style={{ flex: 1, height: `${h}%`, minHeight: 4, background: '#1B4B7A', borderRadius: '3px 3px 0 0', transition: 'height 600ms cubic-bezier(.2,0,0,1)', cursor: 'pointer' }}/>
              );
            })}
          </div>
        </Card>

        <Card padding={24}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Средний % по категориям</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {catStats.map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{c.short}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {c.avg != null ? `${c.avg}%` : '—'}
                  </span>
                </div>
                <div style={{ height: 8, background: '#EEF1F6', borderRadius: 4, overflow: 'hidden' }}>
                  {c.avg != null && <div style={{ width: `${c.avg}%`, height: '100%', background: c.color, transition: 'width 700ms cubic-bezier(.2,0,0,1)' }}/>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Лента событий + требуют внимания */}
      <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F6', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Последние события</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav('audit'); }} style={{ fontSize: 13, color: '#1B4B7A', textDecoration: 'none', fontWeight: 500 }}>Все события →</a>
          </div>
          <div>
            {events.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет событий</div>}
            {events.slice(0, 8).map((ev, i) => {
              const t = eventToneIcon[ev.type] || { ic: 'bell', color: '#5B6778' };
              const time = ev.created_at ? new Date(ev.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i === events.slice(0, 8).length - 1 ? 'none' : '1px solid #EEF1F6' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: '#F7F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={t.ic} size={14} color={t.color}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#1A2332' }}>
                    {ev.text}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A95A5', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>{time}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F6', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Требуют внимания</h3>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav('users'); }} style={{ fontSize: 13, color: '#1B4B7A', textDecoration: 'none', fontWeight: 500 }}>Все →</a>
          </div>
          <div>
            {attention.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет проблем — отлично!</div>}
            {attention.map((e, i) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i === attention.length - 1 ? 'none' : '1px solid #EEF1F6' }}>
                <div style={{ width: 32, height: 32, borderRadius: 999, background: '#FBECEC', color: '#B8242D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="alert" size={14} color="#B8242D"/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.fullName.split(' ').slice(0, 2).join(' ')}</div>
                  <div style={{ fontSize: 11, color: '#5B6778' }}>Таб. {e.tabNumber} · {e.section}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNav && onNav('users')}>Открыть</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOverviewScreen;
