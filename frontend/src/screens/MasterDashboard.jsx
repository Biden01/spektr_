import { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, Alert } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listUsers } from '../api/users.js';
import { getTestHistory } from '../api/tests.js';

const MasterDashboardScreen = ({ onLogout, onNav }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState([]);
  const [teamResults, setTeamResults] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    listUsers({ section: user.section, limit: 200 })
      .then(users => setTeam(users.map(u => ({
        id: u.id,
        fullName: u.full_name,
        tabNumber: u.tab_number || String(u.id),
        position: u.position || '',
        testStatus: u.state === 'overdue' ? 'overdue_annual' : 'ok',
        lastTest: '—',
        lastResult: 0,
        dailyDoneToday: u.daily_done_today,
      }))))
      .catch(console.error);
    getTestHistory(0, 20).then(setTeamResults).catch(console.error);
  }, [user?.section]);

  if (!user) return null;

  const filtered = team.filter(e => {
    if (search && !e.fullName.toLowerCase().includes(search.toLowerCase()) && !String(e.tabNumber).includes(search)) return false;
    if (filter === 'attention' && e.testStatus === 'ok') return false;
    if (filter === 'overdue' && !e.testStatus.startsWith('overdue')) return false;
    return true;
  });

  const overdueCount = team.filter(e => e.testStatus.startsWith('overdue') || e.testStatus.startsWith('failed')).length;
  const okCount = team.filter(e => e.testStatus === 'ok').length;
  const todayTests = team.filter(e => e.dailyDoneToday).length;

  const statusLabel = {
    ok: { tone: 'ok', l: 'В норме' },
    overdue_annual: { tone: 'bad', l: 'Просрочена ежегодная' },
    overdue_medical: { tone: 'bad', l: 'Просрочен медосмотр' },
    overdue_daily: { tone: 'warn', l: 'Не пройдена ежедневная' },
    failed_annual: { tone: 'bad', l: 'Не сдал ежегодную' },
  };

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="home" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: '#475060', marginBottom: 4 }}>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Здравствуйте, {user.fullName.split(' ').slice(0, 2).join(' ')}</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>{user.position} · {user.section || '—'} · {team.length} сотрудников</div>
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        {overdueCount > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Alert tone="bad" title={`Требуется внимание: ${overdueCount} сотрудник(ов)`} description="У сотрудников вашего участка есть просрочки или несдачи. Откройте список ниже для оперативных действий." />
          </div>
        )}

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }} className="s-feature-grid">
          {[
            { ic: 'users',     l: 'Всего на участке',         v: team.length,      bg: '#EEF3F8', fg: '#1B4B7A' },
            { ic: 'check',     l: 'В норме',                  v: okCount,          bg: '#EAF5EE', fg: '#1F7A3D' },
            { ic: 'alert',     l: 'Требуют внимания',         v: overdueCount,     bg: '#FBECEC', fg: '#B8242D' },
            { ic: 'clipboard', l: 'Тестов сегодня',           v: todayTests,       bg: '#FDF4E7', fg: '#C77A0F' },
          ].map((k, i) => (
            <Card key={i} padding={20}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: k.bg, color: k.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={k.ic} size={18} color={k.fg}/>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#5B6778', textTransform: 'uppercase', letterSpacing: '.06em' }}>{k.l}</div>
              </div>
              <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: '#1A2332', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{k.v}</div>
            </Card>
          ))}
        </div>

        {/* Подчинённые */}
        <Card padding={0} style={{ marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0, flex: 1 }}>Подчинённые ({filtered.length})</h3>
            <div style={{ position: 'relative' }}>
              <Icon name="search" size={14} color="#5B6778" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск…"
                style={{ padding: '8px 10px 8px 32px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', minWidth: 200 }}/>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'all', l: 'Все' },
                { id: 'attention', l: 'Требуют внимания' },
                { id: 'overdue', l: 'Просрочки' },
              ].map(f => (
                <button key={f.id} type="button" onClick={() => setFilter(f.id)}
                  style={{
                    padding: '6px 12px', border: '1px solid', borderColor: filter === f.id ? '#1B4B7A' : '#E4E8EF',
                    background: filter === f.id ? '#EEF3F8' : '#fff', color: filter === f.id ? '#1B4B7A' : '#475060',
                    borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}>{f.l}</button>
              ))}
            </div>
          </div>
          <div className="s-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
              <thead>
                <tr>{['ФИО','Таб. №','Должность','Посл. тест','Результат','Статус','Действия'].map(h =>
                  <th key={h} style={{ textAlign:'left', padding:'10px 24px', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>{h}</th>
                )}</tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => {
                  const st = statusLabel[e.testStatus] || statusLabel.ok;
                  return (
                    <tr key={e.id} className="s-table-row" style={{ background: i%2 ? '#F7F9FC' : '#fff' }}>
                      <td style={{ padding:'12px 24px', fontSize:13, fontWeight: 600 }}>{e.fullName}</td>
                      <td style={{ padding:'12px 24px', fontSize:13, fontFamily:'JetBrains Mono, monospace' }}>{e.tabNumber}</td>
                      <td style={{ padding:'12px 24px', fontSize:13, color: '#475060' }}>{e.position}</td>
                      <td style={{ padding:'12px 24px', fontSize:13, fontFamily:'JetBrains Mono, monospace', color: '#5B6778' }}>{e.lastTest}</td>
                      <td style={{ padding:'12px 24px', fontSize:13, fontFamily:'JetBrains Mono, monospace', fontWeight: 600, color: e.lastResult >= 80 ? '#1F7A3D' : e.lastResult >= 70 ? '#C77A0F' : '#B8242D' }}>{e.lastResult}%</td>
                      <td style={{ padding:'12px 24px' }}><Chip tone={st.tone}>{st.l}</Chip></td>
                      <td style={{ padding:'12px 24px' }}>
                        <Button variant="ghost" size="sm" onClick={() => onNav && onNav('profile')}>Открыть</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Активность участка */}
        <Card padding={0}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Последняя активность участка</h3>
          </div>
          <div>
            {teamResults.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет активности</div>}
            {teamResults.slice(0, 6).map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: i === Math.min(teamResults.length, 6) - 1 ? 'none' : '1px solid #EEF1F6' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: r.passed ? '#EAF5EE' : '#FBECEC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={r.passed ? 'check' : 'x'} size={16} color={r.passed ? '#1F7A3D' : '#B8242D'}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>«{r.title}»</div>
                  <div style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>
                    {new Date(r.date_taken).toLocaleDateString('ru-RU')} · {r.score}/{r.total} · {r.pct}%
                  </div>
                </div>
                <Chip tone={r.passed ? 'ok' : 'bad'}>{r.passed ? 'Сдано' : 'Не сдано'}</Chip>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <BottomNav active="home" onNav={onNav} />
    </div>
  );
};

export default MasterDashboardScreen;
