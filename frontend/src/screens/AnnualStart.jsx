import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Alert, Chip } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';

const AnnualStartScreen = ({ onStart, onBack, onNav, onLogout }) => {
  const { categories: CATEGORIES } = useCategories();
  const { user } = useAuth();
  if (!user) return null;
  const annualOverdue = (user.annualDueDays ?? 999) < 0;
  const annualSoon = (user.annualDueDays ?? 999) >= 0 && (user.annualDueDays ?? 999) <= 14;

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="annual" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }}>Назад</Button>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Ежегодная проверка знаний</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>Подтверждение квалификации · 50 вопросов · 60 минут</div>
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        {annualOverdue && (
          <div style={{ marginBottom: 24 }}>
            <Alert tone="bad" title={`Просрочено на ${Math.abs(user.annualDueDays)} дней`} description="Вы не имеете допуска к работе до прохождения проверки. Минимально необходимо набрать 80% правильных ответов." />
          </div>
        )}
        {annualSoon && !annualOverdue && (
          <div style={{ marginBottom: 24 }}>
            <Alert tone="warn" title={`До срока ${user.annualDueDays} дней`} description="Рекомендуем пройти заранее, чтобы избежать просрочки и недопуска к работе." />
          </div>
        )}

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
          <Card padding={32}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>О проверке</div>
            <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 12px' }}>Что нужно знать</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475060', fontSize: 15, lineHeight: 1.7 }}>
              <li><strong style={{ color: '#1A2332' }}>50 вопросов</strong> — по 10 из каждой категории</li>
              <li><strong style={{ color: '#1A2332' }}>60 минут</strong> на прохождение, обратный отсчёт</li>
              <li><strong style={{ color: '#1A2332' }}>Проходной балл — 80%</strong> (минимум 40 правильных)</li>
              <li>Можно пропускать вопросы и возвращаться через мини-карту</li>
              <li>В конце получите детальную разбивку по 5 направлениям</li>
              <li>При несдаче доступна <strong>пересдача</strong> через 24 часа</li>
            </ul>
          </Card>
          <Card padding={32} style={{ borderTop: `4px solid ${annualOverdue ? '#B8242D' : '#1F7A3D'}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: annualOverdue ? '#B8242D' : '#1F7A3D', marginBottom: 12 }}>Срок</div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, color: '#1A2332', lineHeight: 1, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
              {annualOverdue ? `−${Math.abs(user.annualDueDays)}` : `${user.annualDueDays}`}
            </div>
            <div style={{ fontSize: 14, color: '#475060', marginBottom: 16 }}>{annualOverdue ? 'дней просрочено' : 'дней осталось'}</div>
            <Chip tone={annualOverdue ? 'bad' : annualSoon ? 'warn' : 'ok'}>{annualOverdue ? 'Срочно' : annualSoon ? 'Скоро' : 'В норме'}</Chip>
          </Card>
        </div>

        {/* Категории */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 12 }}>Структура вопросов</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }} className="s-cat-grid">
            {CATEGORIES.map(c => (
              <Card key={c.id} padding={16} style={{ borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 28, color: c.color, lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums' }}>10</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>вопросов</div>
                <div style={{ fontSize: 13, color: '#3A4657', fontWeight: 600 }}>{c.short}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Старт */}
        <Card padding={28} style={{ borderLeft: `4px solid ${annualOverdue ? '#B8242D' : '#1B4B7A'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: '0 0 6px' }}>{annualOverdue ? 'Пройдите проверку немедленно' : 'Готовы начать?'}</h3>
              <div style={{ fontSize: 14, color: '#475060' }}>После старта таймер на 60 минут уже не остановится. Подготовьтесь к спокойному прохождению.</div>
            </div>
            <Button size="lg" variant={annualOverdue ? 'danger' : 'primary'} iconRight="arrow" onClick={onStart}>
              {annualOverdue ? 'Пройти сейчас' : 'Начать проверку'}
            </Button>
          </div>
        </Card>
      </main>
      <BottomNav active="home" onNav={onNav} />
    </div>
  );
};

export default AnnualStartScreen;
