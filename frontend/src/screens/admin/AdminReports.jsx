import { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { getOverview, getTestResultsReport, getSectionStats } from '../../api/reports.js';

function downloadCSV(rows, filename) {
  const header = ['Дата', 'Сотрудник', 'Тест', 'Длительность (мин)', 'Результат', 'Статус'];
  const csv = [header, ...rows.map(r => [
    r.date_taken ? new Date(r.date_taken).toLocaleDateString('ru-RU') : '—',
    r.user_full_name || r.user_id || '—',
    r.title || r.test_type || '—',
    r.duration_sec ? Math.round(r.duration_sec / 60) : '—',
    r.score !== undefined ? `${r.score}/${r.total} · ${r.pct}%` : '—',
    r.passed ? 'Сдано' : 'Не сдано',
  ])].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const AdminReportsScreen = ({ onNav, onLogout }) => {
  const { categories: CATEGORIES } = useCategories();
  const { show: toast, ToastContainer } = useToast();
  const [periodFrom, setPeriodFrom] = useState('2026-04-01');
  const [periodTo, setPeriodTo] = useState('2026-04-28');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [overview, setOverview] = useState({ total_test_results: 0, passed_results: 0, pass_rate: 0 });
  const [sectionStats, setSectionStats] = useState({});
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    getOverview().then(setOverview).catch(console.error);
    getSectionStats().then(setSectionStats).catch(console.error);
    getTestResultsReport(30).then(r => setTestResults(r.results || [])).catch(console.error);
  }, []);

  const total = overview.total_test_results || 0;
  const passed = overview.passed_results || 0;
  const passRate = Math.round(overview.pass_rate || 0);
  const failRate = 100 - passRate;

  const sectionStatsList = Object.entries(sectionStats).map(([name, s]) => ({
    name,
    total: s.total,
    ok: s.daily_done,
    pct: s.total ? Math.round((s.daily_done / s.total) * 100) : 0,
  }));

  const sectionNames = sectionStatsList.map(s => s.name);

  // Динамика по категориям — считаем из testResults
  const trend = CATEGORIES.map(c => {
    const catResults = testResults.filter(r => r.category_id === c.id);
    const catPassed = catResults.filter(r => r.passed).length;
    const pct = catResults.length ? Math.round((catPassed / catResults.length) * 100) : 0;
    return { ...c, pct };
  }).filter(c => {
    const catResults = testResults.filter(r => r.category_id === c.id);
    return catResults.length > 0;
  });

  const displayResults = sectionFilter === 'all'
    ? testResults
    : testResults.filter(r => r.section === sectionFilter);

  const handleExportExcel = () => {
    if (!testResults.length) { toast('Нет данных для экспорта', 'bad'); return; }
    downloadCSV(testResults, 'отчёт-тесты.csv');
    toast('Отчёт выгружен', 'ok');
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <AdminLayout active="reports" onNav={onNav} onLogout={onLogout} title="Отчёты" subtitle="Аналитика по тестированию персонала"
      actions={<>
        <Button variant="ghost" icon="download" onClick={handleExportPDF}>PDF</Button>
        <Button icon="download" onClick={handleExportExcel}>Excel</Button>
      </>}>

      {/* Фильтры */}
      <Card padding={20} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6778', marginBottom: 4 }}>Период с</div>
            <input type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13 }}/>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6778', marginBottom: 4 }}>по</div>
            <input type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13 }}/>
          </div>
          <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13 }}>
            <option value="all">Все участки</option>
            {sectionNames.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={{ padding: '8px 10px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13 }}>
            <option>Все категории</option>{CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
          </select>
          <select style={{ padding: '8px 10px', border: '1px solid #E4E8EF', borderRadius: 6, fontSize: 13 }}>
            <option>Все тесты</option><option>Ежедневная</option><option>Ежегодная</option>
          </select>
        </div>
      </Card>

      {/* Метрики */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }} className="s-feature-grid">
        {[
          { l: 'Всего тестов',  v: total,            c: '#1B4B7A' },
          { l: '% сдач',        v: passRate + '%',   c: '#1F7A3D' },
          { l: '% не сдач',     v: failRate + '%',   c: '#B8242D' },
          { l: 'Сдано',         v: passed,           c: '#1F7A3D' },
        ].map((k, i) => (
          <Card key={i} padding={20}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#5B6778', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: k.c, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{k.v}</div>
          </Card>
        ))}
      </div>

      {/* Бары по участкам */}
      <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card padding={24}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Результаты по участкам</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sectionStatsList.length === 0 && <div style={{ color: '#5B6778', fontSize: 13 }}>Нет данных</div>}
            {sectionStatsList.map(s => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{s.pct}% ({s.ok}/{s.total})</span>
                </div>
                <div style={{ height: 10, background: '#EEF1F6', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: s.pct >= 80 ? '#1F7A3D' : s.pct >= 70 ? '#C77A0F' : '#B8242D', transition: 'width 700ms ease' }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding={24}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 16px' }}>Динамика по категориям</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trend.length === 0 && <div style={{ color: '#5B6778', fontSize: 13 }}>Нет данных</div>}
            {trend.map(t => (
              <div key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{t.name}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{t.pct}%</span>
                </div>
                <div style={{ height: 10, background: '#EEF1F6', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${t.pct}%`, height: '100%', background: t.color, transition: 'width 700ms ease' }}/>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Таблица */}
      <Card padding={0}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F6' }}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Детальные результаты ({displayResults.length})</h3>
        </div>
        <div className="s-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr>{['Дата','Сотрудник','Тест','Длительность','Результат','Статус'].map(h =>
                <th key={h} style={{ textAlign:'left', padding:'10px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {displayResults.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет данных</td></tr>
              )}
              {displayResults.slice(0, 15).map((r, i) => (
                <tr key={r.id || i} style={{ background: i%2 ? '#F7F9FC' : '#fff' }}>
                  <td style={{ padding:'10px 16px', fontSize:13, fontFamily:'JetBrains Mono, monospace' }}>
                    {r.date_taken ? new Date(r.date_taken).toLocaleDateString('ru-RU') : '—'}
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:13, fontWeight: 600 }}>{r.user_full_name || r.user_id || '—'}</td>
                  <td style={{ padding:'10px 16px', fontSize:13 }}>{r.title || r.test_type || '—'}</td>
                  <td style={{ padding:'10px 16px', fontSize:13, fontFamily:'JetBrains Mono, monospace', color: '#5B6778' }}>
                    {r.duration_sec ? Math.round(r.duration_sec / 60) : '—'} мин
                  </td>
                  <td style={{ padding:'10px 16px', fontSize:13, fontFamily:'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {r.score !== undefined ? `${r.score}/${r.total} · ${r.pct}%` : '—'}
                  </td>
                  <td style={{ padding:'10px 16px' }}>
                    <Chip tone={r.passed ? 'ok' : 'bad'}>{r.passed ? 'Сдано' : 'Не сдано'}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminReportsScreen;
