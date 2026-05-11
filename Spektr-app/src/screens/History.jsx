import { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, useToast } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getTestHistory } from '../api/tests.js';

function normalizeResult(r) {
  return {
    id: r.id,
    testType: r.test_type,
    title: r.title,
    date: new Date(r.date_taken).toLocaleDateString('ru-RU'),
    pct: r.pct,
    status: r.passed ? 'ok' : 'fail',
    score: r.score,
    total: r.total,
    duration: r.duration_sec,
    testName: r.title,
    durationMin: r.duration_sec ? Math.round(r.duration_sec / 60) : 0,
  };
}

const HistoryScreen = ({ onBack, onNav, onLogout }) => {
  const { user } = useAuth();
  const { show: toast, ToastContainer } = useToast();
  const [allResults, setAllResults] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    getTestHistory(0, 100)
      .then(data => setAllResults(data.map(normalizeResult)))
      .catch(console.error)
      .finally(() => setHistLoading(false));
  }, []);

  if (!user) return null;

  const filtered = useMemo(() => {
    return allResults.filter(r => {
      if (type !== 'all' && r.testType !== type) return false;
      if (status !== 'all' && r.status !== status) return false;
      return true;
    });
  }, [allResults, type, status]);

  // Простой график динамики — последние 8 результатов
  const chartData = filtered.slice(0, 8).reverse();
  const maxPct = 100;

  // Метрики
  const avgPct = filtered.length ? Math.round(filtered.reduce((a, r) => a + r.pct, 0) / filtered.length) : 0;
  const okCount = filtered.filter(r => r.status === 'ok').length;
  const okPct = filtered.length ? Math.round((okCount / filtered.length) * 100) : 0;

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="results" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }}>В кабинет</Button>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>История результатов</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>Все ваши тесты за всё время</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" icon="download" onClick={() => {
              if (!filtered.length) { toast('Нет данных для экспорта', 'bad'); return; }
              const header = ['Дата', 'Тест', 'Длительность (мин)', 'Результат', 'Статус'];
              const rows = filtered.map(r => [r.date, r.testName, r.durationMin, `${r.score}/${r.total} · ${r.pct}%`, r.status === 'ok' ? 'Сдано' : 'Не сдано']);
              const csv = [header, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = 'история-тестов.csv'; a.click();
              URL.revokeObjectURL(url);
              toast('Отчёт выгружен', 'ok');
            }}>Excel</Button>
            <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
          </div>
        </header>

        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }} className="s-feature-grid">
          <Card padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 8 }}>Всего тестов</div>
            <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: '#1A2332', fontVariantNumeric: 'tabular-nums' }}>{filtered.length}</div>
          </Card>
          <Card padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 8 }}>Средний балл</div>
            <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: avgPct >= 80 ? '#1F7A3D' : avgPct >= 70 ? '#C77A0F' : '#B8242D', fontVariantNumeric: 'tabular-nums' }}>{avgPct}%</div>
          </Card>
          <Card padding={20}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 8 }}>% сдач</div>
            <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: '#1F7A3D', fontVariantNumeric: 'tabular-nums' }}>{okPct}%</div>
          </Card>
        </div>

        {/* Фильтры + чарт */}
        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20, marginBottom: 24 }}>
          <Card padding={24}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 14 }}>Фильтры</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3A4657', marginBottom: 6 }}>Тип теста</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { id: 'all',     l: 'Все' },
                  { id: 'daily',   l: 'Ежедневная' },
                  { id: 'annual',  l: 'Ежегодная' },
                  { id: 'protocol',l: 'Протоколы' },
                  { id: 'lesson',  l: 'Уроки' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setType(t.id)}
                    style={{
                      padding: '6px 12px', border: '1px solid', borderColor: type === t.id ? '#1B4B7A' : '#E4E8EF',
                      background: type === t.id ? '#EEF3F8' : '#fff', color: type === t.id ? '#1B4B7A' : '#475060',
                      borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 140ms ease',
                    }}>{t.l}</button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3A4657', marginBottom: 6 }}>Статус</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  { id: 'all', l: 'Все' },
                  { id: 'ok',  l: 'Сдано' },
                  { id: 'bad', l: 'Не сдано' },
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setStatus(t.id)}
                    style={{
                      padding: '6px 12px', border: '1px solid', borderColor: status === t.id ? '#1B4B7A' : '#E4E8EF',
                      background: status === t.id ? '#EEF3F8' : '#fff', color: status === t.id ? '#1B4B7A' : '#475060',
                      borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}>{t.l}</button>
                ))}
              </div>
            </div>
          </Card>
          <Card padding={24}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 14 }}>Динамика последних результатов</div>
            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#5B6778', fontSize: 13, padding: 20 }}>Нет данных для графика</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 8, paddingBottom: 24, position: 'relative' }}>
                {chartData.map((r, i) => {
                  const h = (r.pct / maxPct) * 100;
                  const color = r.status === 'ok' ? '#1F7A3D' : '#B8242D';
                  return (
                    <div key={r.id} title={`${r.date}: ${r.pct}%`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, position: 'relative' }}>
                      <div style={{ fontSize: 10, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{r.pct}%</div>
                      <div style={{ width: '100%', height: `${h}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4, transition: 'height 600ms cubic-bezier(.2,0,0,1)' }}/>
                      <div style={{ fontSize: 10, color: '#8A95A5', position: 'absolute', bottom: -20, fontFamily: 'JetBrains Mono, monospace' }}>{r.date.slice(0, 5)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Таблица */}
        <Card padding={0}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Все результаты ({filtered.length})</h3>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#5B6778' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>Ничего не найдено</div>
              <div style={{ fontSize: 13 }}>Измените фильтры</div>
            </div>
          ) : (
            <>
              <div className="s-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
                  <thead>
                    <tr>{['Дата','Тест','Длительность','Результат','Статус'].map(h =>
                      <th key={h} style={{ textAlign:'left', padding:'12px 24px', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>{h}</th>
                    )}</tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id} className="s-table-row" style={{ background: i%2 ? '#F7F9FC' : '#fff' }}>
                        <td style={{ padding:'14px 24px', fontSize:14, fontFamily:'JetBrains Mono, monospace' }}>{r.date}</td>
                        <td style={{ padding:'14px 24px', fontSize:14 }}>{r.testName}</td>
                        <td style={{ padding:'14px 24px', fontSize:14, fontFamily:'JetBrains Mono, monospace', color: '#5B6778' }}>{r.durationMin} мин</td>
                        <td style={{ padding:'14px 24px', fontSize:14, fontFamily:'JetBrains Mono, monospace', fontWeight: 600 }}>{r.score} / {r.total} · {r.pct}%</td>
                        <td style={{ padding:'14px 24px' }}><Chip tone={r.status}>{r.status === 'ok' ? 'Сдано' : 'Не сдано'}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="s-table-mobile">
                {filtered.map(r => (
                  <div key={r.id} className="s-table-mobile-row">
                    <div className="s-table-mobile-row-info">
                      <div className="s-tmr-name">{r.testName}</div>
                      <div className="s-tmr-meta">{r.date} &middot; {r.score} / {r.total} · {r.pct}%</div>
                    </div>
                    <Chip tone={r.status}>{r.status === 'ok' ? 'Сдано' : 'Не сдано'}</Chip>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </main>
      <BottomNav active="results" onNav={onNav} />
      <ToastContainer />
    </div>
  );
};

export default HistoryScreen;
