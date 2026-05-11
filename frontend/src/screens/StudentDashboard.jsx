import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, Alert, MARK } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listCourses } from '../api/courses.js';

function normalizeCourse(c) {
  return {
    id: c.id,
    title: c.title,
    direction: c.direction || '',
    format: c.format || 'mixed',
    duration: c.duration_label || `${c.duration_hours} ч`,
    price: c.price_label || '—',
    nextStart: c.next_start_date ? new Date(c.next_start_date).toLocaleDateString('ru-RU') : '—',
    teacher: c.instructor || '—',
    program: (c.program_items || []).sort((a, b) => a.order_num - b.order_num).map(p => p.item_text),
    cover: c.cover_emoji || '📚',
  };
}

const StudentDashboardScreen = ({ onLogout, onNav }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCourses()
      .then(data => setCourses(Array.isArray(data) ? data.map(normalizeCourse) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const enrolled = courses.find(c => c.id === user.enrolledCourse) || null;

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E4E8EF', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={MARK} style={{ height: 32 }} alt=""/>
          <div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 18 }}>СПЕКТР</div>
            <div style={{ fontSize: 11, color: '#1F7A3D', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Учебный центр</div>
          </div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.fullName.split(' ').slice(0, 2).join(' ')}</div>
            <div style={{ fontSize: 11, color: '#5B6778' }}>Слушатель</div>
          </div>
          <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 999, background: 'linear-gradient(135deg, #1F7A3D, #176030)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 700, fontSize: 14 }}>
            {user.initials}
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 40px 60px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: '#475060', marginBottom: 4 }}>{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', margin: 0 }}>Добро пожаловать, {user.fullName.split(' ')[0]}!</h1>
          <p style={{ fontSize: 14, color: '#475060', marginTop: 6 }}>Кабинет внешнего слушателя · Учебный центр НТЦ ВТС</p>
        </div>

        <Alert
          tone={enrolled ? 'ok' : 'info'}
          title={enrolled ? `Вы записаны на курс «${enrolled.title}»` : 'Вы пока не записаны на курс'}
          description={enrolled ? `Старт занятий: ${enrolled.nextStart} · Преподаватель: ${enrolled.teacher}` : 'Выберите курс из каталога Учебного центра.'}
          action={enrolled ? null : 'Каталог курсов'}
        />

        {enrolled && (
          <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginTop: 24, marginBottom: 24 }}>
            <Card padding={28} style={{ borderLeft: '4px solid #1F7A3D' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1F7A3D' }}>Текущий курс</div>
                <Chip tone="ok">Активен</Chip>
              </div>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: '0 0 12px' }}>{enrolled.title}</h2>
              <p style={{ fontSize: 14, color: '#475060', margin: '0 0 18px', lineHeight: 1.6 }}>
                {enrolled.direction} · {enrolled.duration} · {enrolled.format === 'mixed' ? 'смешанный формат' : enrolled.format === 'online' ? 'онлайн' : 'очно'}
              </p>
              {enrolled.program.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#5B6778', marginBottom: 8 }}>Программа курса</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {enrolled.program.map((p, i) => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1A2332' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 999, background: i < 2 ? '#EAF5EE' : '#F7F9FC', color: i < 2 ? '#1F7A3D' : '#8A95A5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {i < 2 ? <Icon name="check" size={12} color="#1F7A3D"/> : <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</span>}
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button variant="success" iconRight="arrow" onClick={() => onNav && onNav('video')}>Перейти к занятиям</Button>
            </Card>

            <Card padding={28} style={{ borderTop: '4px solid #1F7A3D' }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1F7A3D', marginBottom: 12 }}>Прогресс обучения</div>
              <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#EEF1F6" strokeWidth="10"/>
                  <circle cx="70" cy="70" r="58" fill="none" stroke="#1F7A3D" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${0.32 * 2 * Math.PI * 58} ${2 * Math.PI * 58}`} transform="rotate(-90 70 70)"/>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'Manrope', fontSize: 32, fontWeight: 800, color: '#1F7A3D', lineHeight: 1 }}>32%</div>
                  <div style={{ fontSize: 11, color: '#5B6778', marginTop: 4 }}>пройдено</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#475060', textAlign: 'center', marginBottom: 16 }}>Сертификат будет доступен после прохождения 100% программы и итогового экзамена.</div>
              <Button variant="ghost" fullWidth disabled>Получить сертификат</Button>
            </Card>
          </div>
        )}

        {/* Каталог курсов */}
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: '24px 0 16px' }}>
          {loading ? 'Загрузка курсов…' : `Доступные курсы (${courses.length})`}
        </h2>
        {!loading && courses.length === 0 && (
          <Card padding={40}>
            <div style={{ textAlign: 'center', color: '#5B6778' }}>Курсы не найдены</div>
          </Card>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          {courses.map(c => (
            <Card key={c.id} padding={24} hoverable style={{ borderTop: `4px solid #1F7A3D` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{c.cover}</div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 8px', lineHeight: 1.4 }}>{c.title}</h3>
              <div style={{ fontSize: 13, color: '#475060', marginBottom: 12 }}>
                {c.direction} · {c.duration} · {c.format === 'mixed' ? 'смешанный' : c.format === 'online' ? 'онлайн' : 'очно'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ color: '#1F7A3D', fontWeight: 700 }}>{c.price}</span>
                <span style={{ color: '#5B6778' }}>Старт: {c.nextStart}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="s-action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { ic: 'film',       t: 'Видео-занятия',       s: 'по программе курса',   bg: '#EEF3F8', fg: '#1B4B7A' },
            { ic: 'target',     t: 'Промежуточные тесты', s: 'после каждого модуля', bg: '#FDF4E7', fg: '#C77A0F' },
            { ic: 'graduation', t: 'Итоговый экзамен',    s: 'после программы',      bg: '#EAF5EE', fg: '#1F7A3D' },
          ].map((item, i) => (
            <Card key={i} padding={20} hoverable>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: item.bg, color: item.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={item.ic} size={22} color={item.fg}/>
                </div>
                <div>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15 }}>{item.t}</div>
                  <div style={{ fontSize: 12, color: '#475060', marginTop: 2 }}>{item.s}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardScreen;
