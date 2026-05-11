import { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { api } from '../../api/client.js';

function toDateInput(d) {
  return d.toISOString().slice(0, 10);
}

const AdminAuditScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [events, setEvents] = useState([]);
  const today = toDateInput(new Date());
  const weekAgo = toDateInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  useEffect(() => {
    api.get('/events?limit=200').then(setEvents).catch(console.error);
  }, []);

  const types = [
    { id: 'all', l: 'Все события' },
    { id: 'login', l: 'Входы' },
    { id: 'login_failed', l: 'Неудачные входы' },
    { id: 'logout', l: 'Выходы' },
    { id: 'test_passed', l: 'Сдача тестов' },
    { id: 'test_failed', l: 'Провал тестов' },
    { id: 'overdue', l: 'Просрочки' },
  ];

  const filtered = useMemo(() => events.filter(e => {
    if (type !== 'all' && e.type !== type) return false;
    if (search && !e.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [events, type, search]);

  const eventIcon = {
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
    <AdminLayout active="audit" onNav={onNav} onLogout={onLogout} title="История событий" subtitle="Audit log всех действий в системе"
      actions={<Button variant="ghost" icon="download" onClick={() => {
        if (!filtered.length) { toast('Нет данных для экспорта', 'bad'); return; }
        const header = ['Время', 'Пользователь', 'Тип', 'Описание', 'IP'];
        const rows = filtered.map(ev => [
          ev.created_at ? new Date(ev.created_at).toLocaleString('ru-RU') : '—',
          ev.user_id || '—', ev.type, ev.text, ev.ip_address || '—',
        ]);
        const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click();
        URL.revokeObjectURL(url);
        toast('Лог событий выгружен', 'ok');
      }}>Экспорт</Button>}>

      <Card padding={16} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Icon name="search" size={16} color="#5B6778" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по тексту или пользователю…"
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}/>
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
            {types.map(t => <option key={t.id} value={t.id}>{t.l}</option>)}
          </select>
          <input type="date" defaultValue={weekAgo} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}/>
          <input type="date" defaultValue={today} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}/>
        </div>
      </Card>

      <Card padding={0}>
        <div className="s-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>{['Время', 'Пользователь', 'Тип', 'Описание', 'IP'].map(h =>
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет событий</td></tr>
              )}
              {filtered.map((ev, i) => {
                const icon = eventIcon[ev.type] || { ic: 'bell', color: '#5B6778' };
                const dt = ev.created_at ? new Date(ev.created_at).toLocaleString('ru-RU') : '—';
                return (
                  <tr key={ev.id} style={{ background: i%2 ? '#F7F9FC' : '#fff' }}>
                    <td style={{ padding:'10px 16px', fontSize:13, fontFamily:'JetBrains Mono, monospace', color: '#5B6778' }}>{dt}</td>
                    <td style={{ padding:'10px 16px', fontSize:13, fontWeight: 600 }}>{ev.user_id || '—'}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: icon.color }}>
                        <Icon name={icon.ic} size={14} color={icon.color}/>
                        {ev.type}
                      </span>
                    </td>
                    <td style={{ padding:'10px 16px', fontSize:13, color: '#1A2332' }}>{ev.text}</td>
                    <td style={{ padding:'10px 16px', fontSize:12, fontFamily:'JetBrains Mono, monospace', color: '#5B6778' }}>{ev.ip_address || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminAuditScreen;
