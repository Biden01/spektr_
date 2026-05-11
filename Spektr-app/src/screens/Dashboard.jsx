import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Chip, Card, Alert, Sidebar, BottomNav } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getTestHistory } from '../api/tests.js';

function normalizeResult(r) {
  return {
    id: r.id,
    testName: r.title,
    date: new Date(r.date_taken).toLocaleDateString('ru-RU'),
    score: r.score,
    total: r.total,
    pct: r.pct,
    status: r.passed ? 'ok' : 'fail',
  };
}

const DashboardScreen = ({ onStartTest, onLogout, onNav }) => {
  const { user, refresh } = useAuth();
  const [results, setResults] = useState([]);

  useEffect(() => {
    refresh().catch(console.error);
    getTestHistory(0, 3).then(data => setResults(data.map(normalizeResult))).catch(console.error);
  }, []);

  if (!user) return null;
  const annualOverdue = (user.annualDueDays ?? 999) < 0;
  const annualSoon = (user.annualDueDays ?? 999) >= 0 && (user.annualDueDays ?? 999) <= 14;
  const medOverdue = (user.medicalDueDays ?? 999) < 0;
  const medSoon = (user.medicalDueDays ?? 999) >= 0 && (user.medicalDueDays ?? 999) <= 7;

  let stateBannerProps = null;
  if (annualOverdue || medOverdue) {
    stateBannerProps = {
      tone: 'bad',
      title: annualOverdue
        ? `Ежегодная проверка просрочена на ${Math.abs(user.annualDueDays)} дней`
        : `Медосмотр просрочен на ${Math.abs(user.medicalDueDays)} дней`,
      description: annualOverdue
        ? '50 вопросов, 60 минут. Без проверки — недопуск к работе.'
        : 'Обратитесь к мастеру участка для записи на приём.',
      action: annualOverdue ? 'Пройти сейчас' : null,
      onAction: annualOverdue ? onStartTest : null,
    };
  } else if (annualSoon || medSoon) {
    stateBannerProps = {
      tone: 'warn',
      title: annualSoon
        ? `Ежегодная проверка через ${user.annualDueDays} дней`
        : `Медосмотр через ${user.medicalDueDays} дней`,
      description: annualSoon
        ? 'Рекомендуем пройти заранее, чтобы избежать просрочки.'
        : 'Запишитесь на приём через мастера участка.',
      action: annualSoon ? 'Пройти сейчас' : null,
      onAction: annualSoon ? onStartTest : null,
    };
  } else {
    stateBannerProps = {
      tone: 'ok',
      title: 'Все проверки в норме',
      description: `Ближайшая ежегодная — через ${user.annualDueDays ?? '—'} дней.`,
    };
  }

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="home" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: '#475060', marginBottom: 4 }}>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Здравствуйте, {user.fullName.split(' ').slice(0, 2).join(' ')}</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>{user.position} · {user.section} · Таб. № {user.tabNumber}</div>
          </div>
          <div className="s-main-header-actions" style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Button variant="ghost" icon="bell" aria-label="Уведомления">
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                Уведомления
                {(annualOverdue || medOverdue || annualSoon || medSoon) && (
                  <span style={{background:'#B8242D',color:'#fff',fontSize:11,fontWeight:700,padding:'1px 7px',borderRadius:999,minWidth:18,textAlign:'center'}}>
                    {(annualOverdue?1:0)+(medOverdue?1:0)+(annualSoon?1:0)+(medSoon?1:0)}
                  </span>
                )}
              </span>
            </Button>
            <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {stateBannerProps && <Alert {...stateBannerProps} />}
          {medSoon && !medOverdue && !annualOverdue && (
            <Alert tone="warn" title={`Медосмотр через ${user.medicalDueDays} дней`} description="Обратитесь к мастеру участка для записи." />
          )}
        </div>

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
          <Card padding={28} style={{ borderLeft: '4px solid #1B4B7A' }}>
            <div className="s-daily-card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 8 }}>Ежедневная проверка</div>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 8px' }}>10 вопросов · 10 минут</h3>
                <p style={{ fontSize: 14, color: '#475060', margin: 0 }}>{user.dailyDoneToday ? 'Сегодня уже пройдено. Допуск к смене получен.' : 'Допуск к смене. Пройти до 08:00.'}</p>
              </div>
              <Chip tone={user.dailyDoneToday ? 'ok' : 'neutral'}>{user.dailyDoneToday ? 'Пройдено' : 'Не пройдено'}</Chip>
            </div>
            <div style={{ position: 'relative', height: 8, background: user.dailyDoneToday ? '#EAF5EE' : 'repeating-linear-gradient(45deg, #EEF1F6 0 8px, #E4E8EF 8px 16px)', borderRadius: 4, marginTop: 24 }}
                 role="progressbar" aria-valuenow={user.dailyDoneToday ? 10 : 0} aria-valuemin={0} aria-valuemax={10} aria-label="Прогресс ежедневной проверки">
              {user.dailyDoneToday && <div style={{ width: '100%', height: '100%', background: '#1F7A3D', borderRadius: 4 }} />}
            </div>
            <div className="s-daily-card-foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475060', fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>
                <Icon name="clipboard" size={14} color="#475060"/>
                {user.dailyDoneToday ? 'Сегодня · 10 / 10' : 'Сегодня · 0 / 10'}
              </div>
              <Button onClick={() => onNav && onNav('daily-start')} iconRight="arrow" disabled={user.dailyDoneToday}>{user.dailyDoneToday ? 'Пройдено' : 'Начать'}</Button>
            </div>
          </Card>

          <Card padding={28} style={{ borderLeft: `4px solid ${annualOverdue ? '#B8242D' : annualSoon ? '#C77A0F' : '#1F7A3D'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: annualOverdue ? '#B8242D' : annualSoon ? '#C77A0F' : '#1F7A3D' }}>Ежегодная проверка</div>
              <Chip tone={annualOverdue ? 'bad' : annualSoon ? 'warn' : 'ok'}>{annualOverdue ? 'Срочно' : annualSoon ? 'Скоро' : 'В норме'}</Chip>
            </div>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 20px' }}>
              {annualOverdue ? `Просрочено на ${Math.abs(user.annualDueDays)} дней` : `Осталось ${user.annualDueDays} дней`}
            </h3>
            <div className="s-annual-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#475060', marginBottom: 20 }}>
              <div><div style={{ fontFamily:'Manrope', fontSize:22, fontWeight:700, color:'#1A2332', lineHeight: 1 }}>50</div><div style={{ marginTop: 4 }}>вопросов</div></div>
              <div><div style={{ fontFamily:'Manrope', fontSize:22, fontWeight:700, color:'#1A2332', lineHeight: 1 }}>60</div><div style={{ marginTop: 4 }}>минут</div></div>
              <div><div style={{ fontFamily:'Manrope', fontSize:22, fontWeight:700, color:'#1A2332', lineHeight: 1 }}>80%</div><div style={{ marginTop: 4 }}>проходной</div></div>
            </div>
            <Button variant={annualOverdue ? 'danger' : 'primary'} fullWidth iconRight="arrow" onClick={() => onNav && onNav('annual-start')}>
              {annualOverdue ? 'Пройти сейчас' : 'Начать проверку'}
            </Button>
          </Card>
        </div>

        <div className="s-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { ic:'film',   t:'Видеоуроки',          s:'12 уроков',         bg:'#EEF3F8', fg:'#1B4B7A', target:'video' },
            { ic:'target', t:'Теоретический экзамен', s:'8 узлов',         bg:'#EAF5EE', fg:'#1F7A3D', target:'exam' },
            { ic:'shield', t:'Безопасный труд',     s:'6 протоколов',     bg:'#FBECEC', fg:'#B8242D', target:'safe' },
            { ic:'chart',  t:'История результатов', s:'За 12 месяцев',    bg:'#FDF4E7', fg:'#C77A0F', target:'history' },
          ].map((c,i)=>(
            <Card key={i} padding={20} hoverable onClick={() => onNav && onNav(c.target)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={c.ic} size={22} color={c.fg}/>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.t}</div>
                  <div style={{ fontSize: 12, color: '#475060', marginTop: 2 }}>{c.s}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card padding={0}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Последние результаты</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); onNav && onNav('history'); }} style={{ fontSize: 13, color: '#1B4B7A', textDecoration: 'none', fontWeight: 500 }}>Все результаты →</a>
          </div>
          {results.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#5B6778' }}>
              <div style={{ marginBottom: 8 }}>Тестов пока нет</div>
              <div style={{ fontSize: 13 }}>Начните с ежедневной проверки.</div>
            </div>
          ) : (
            <>
              <div className="s-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontVariantNumeric: 'tabular-nums' }}>
                  <thead><tr>{['Дата','Тест','Результат','Статус'].map(h=><th key={h} style={{ textAlign:'left', padding:'12px 24px', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {results.map((r,i)=>(
                      <tr key={r.id} className="s-table-row" style={{ background: i%2?'#F7F9FC':'#fff', cursor: 'pointer', transition: 'background 140ms ease' }}>
                        <td style={{ padding:'14px 24px', fontSize:14, fontFamily:'JetBrains Mono, monospace' }}>{r.date}</td>
                        <td style={{ padding:'14px 24px', fontSize:14 }}>{r.testName}</td>
                        <td style={{ padding:'14px 24px', fontSize:14, fontFamily:'JetBrains Mono, monospace' }}>{r.score} / {r.total} · {r.pct} %</td>
                        <td style={{ padding:'14px 24px' }}><Chip tone={r.status}>{r.status === 'ok' ? 'Сдано' : 'Не сдано'}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="s-table-mobile">
                {results.map((r) => (
                  <div key={r.id} className="s-table-mobile-row">
                    <div className="s-table-mobile-row-info">
                      <div className="s-tmr-name">{r.testName}</div>
                      <div className="s-tmr-meta">{r.date} &middot; {r.score} / {r.total} · {r.pct} %</div>
                    </div>
                    <Chip tone={r.status}>{r.status === 'ok' ? 'Сдано' : 'Не сдано'}</Chip>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </main>
      <BottomNav active="home" onNav={onNav} />
    </div>
  );
};

export default DashboardScreen;
