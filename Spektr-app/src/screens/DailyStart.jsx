import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';
import { getDailyStatus } from '../api/tests.js';

const DailyStartScreen = ({ onStart, onBack, onNav, onLogout }) => {
  const { categories: CATEGORIES } = useCategories();
  const { user } = useAuth();
  const [dailyDone, setDailyDone] = useState(user?.dailyDoneToday || false);

  useEffect(() => {
    getDailyStatus().then(s => setDailyDone(s.done)).catch(console.error);
  }, []);

  if (!user) return null;
  const lastDaily = null;

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="daily" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Button variant="ghost" size="sm" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }} icon="chevron">Назад</Button>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Ежедневная проверка</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>Допуск к смене · 10 вопросов · 10 минут</div>
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
          <Card padding={32}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>О проверке</div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 12px' }}>Что нужно знать</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475060', fontSize: 15, lineHeight: 1.7 }}>
              <li><strong style={{ color: '#1A2332' }}>10 вопросов</strong> — по 2 из каждой категории</li>
              <li><strong style={{ color: '#1A2332' }}>10 минут</strong> на прохождение</li>
              <li><strong style={{ color: '#1A2332' }}>Проходной балл — 70%</strong> (минимум 7 правильных)</li>
              <li>Подсказки и подсчёт результатов автоматический</li>
              <li>Можно вернуться к пропущенным вопросам через мини-карту</li>
            </ul>
          </Card>
          <Card padding={32}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 12 }}>Последняя попытка</div>
            {lastDaily ? (
              <>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 32, margin: '0 0 8px', color: lastDaily.status === 'ok' ? '#1F7A3D' : '#B8242D' }}>{lastDaily.pct}%</div>
                <div style={{ fontSize: 14, color: '#475060', fontFamily: 'JetBrains Mono, monospace' }}>{lastDaily.date}</div>
                <Chip tone={lastDaily.status} >{lastDaily.status === 'ok' ? 'Сдано' : 'Не сдано'}</Chip>
              </>
            ) : (
              <div style={{ fontSize: 14, color: '#5B6778' }}>Попыток ещё не было</div>
            )}
          </Card>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 12 }}>Категории вопросов</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="s-cat-grid">
            {CATEGORIES.map(c => (
              <Card key={c.id} padding={16} style={{ borderTop: `3px solid ${c.color}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <Icon name={c.id === 'electro' ? 'zap' : c.id === 'fire' ? 'flame' : c.id === 'medical' ? 'help' : c.id === 'labour' ? 'shield' : 'book'} size={18} color={c.color} />
                </div>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14 }}>{c.short}</div>
                <div style={{ fontSize: 12, color: '#5B6778', marginTop: 2 }}>2 вопроса</div>
              </Card>
            ))}
          </div>
        </div>

        <Card padding={28} style={{ borderLeft: '4px solid #1B4B7A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>Готовы начать?</h3>
              <div style={{ fontSize: 14, color: '#475060' }}>После старта таймер уже не остановится. Убедитесь, что у вас есть 10 свободных минут.</div>
            </div>
            <Button size="lg" onClick={onStart} iconRight="arrow">Начать проверку</Button>
          </div>
        </Card>
      </main>
      <BottomNav active="daily" onNav={onNav} />
    </div>
  );
};

export default DailyStartScreen;
