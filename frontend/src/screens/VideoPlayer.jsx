import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, useToast } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listLessons } from '../api/lessons.js';
import { useCategories } from '../context/CategoriesContext.jsx';

const VideoPlayerScreen = ({ lesson, onSwitchLesson, onBack, onStartTest, onNav, onLogout }) => {
  const { getCategoryById } = useCategories();
  const { user } = useAuth();
  const { show: toast, ToastContainer } = useToast();
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!lesson) return;
    listLessons({ limit: 50 })
      .then(data => {
        const others = (Array.isArray(data) ? data : [])
          .filter(l => (l.category_id || 'specifics') === lesson.category && l.id !== lesson.id)
          .slice(0, 3)
          .map(l => ({
            id: l.id,
            title: l.title,
            category: l.category_id || 'specifics',
            video_url: l.video_url || null,
            description: l.description || '',
            duration: l.duration || '—',
            publishDate: l.created_at ? new Date(l.created_at).toLocaleDateString('ru-RU') : '—',
          }));
        setRelated(others);
      })
      .catch(console.error);
  }, [lesson?.id, lesson?.category]);

  if (!user || !lesson) return null;
  const c = getCategoryById(lesson.category);

  const handleDownload = (fileName) => {
    if (lesson.video_url) {
      window.open(lesson.video_url, '_blank');
    } else {
      toast(`«${fileName}» недоступен для скачивания`, 'bad');
    }
  };

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="video" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ flexDirection: 'row-reverse' }}>К каталогу</Button>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
          {/* Main */}
          <div>
            <Card padding={0} style={{ overflow: 'hidden' }}>
              {/* Player placeholder */}
              <div style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${c.bg}, ${c.color}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: 88, height: 88, borderRadius: 999, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(26,35,50,.18)', cursor: 'pointer' }}>
                  <Icon name="play" size={36} color={c.color}/>
                </div>
                <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '4px 10px', background: 'rgba(15,45,74,.85)', color: '#fff', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{lesson.duration}</div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', background: c.bg, color: c.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }} />
                    {c.name}
                  </span>
                </div>
                <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{lesson.title}</h1>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#5B6778', marginBottom: 16 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="timer" size={14} color="#5B6778"/>{lesson.duration}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="users" size={14} color="#5B6778"/>{lesson.views} просмотров</span>
                  <span>· Опубликован {lesson.publishDate}</span>
                </div>
                <p style={{ fontSize: 15, color: '#475060', lineHeight: 1.6, margin: '0 0 16px' }}>{lesson.description}</p>
                <p style={{ fontSize: 14, color: '#475060', lineHeight: 1.7, margin: 0 }}>
                  В уроке разбираются ключевые правила и нормы, актуальные требования законодательства, типичные ошибки и способы их избежать. Материал сопровождается практическими примерами из деятельности предприятий энергетики и машиностроения.
                </p>
              </div>
            </Card>

            {/* Прикреплённые материалы */}
            <Card padding={0} style={{ marginTop: 20 }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #EEF1F6' }}>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Прикреплённые материалы</h3>
              </div>
              {[
                { t: 'Конспект урока.pdf', s: '0.6 МБ' },
                { t: 'Презентация.pdf', s: '2.1 МБ' },
                { t: 'Чек-лист самопроверки.pdf', s: '0.2 МБ' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px', borderBottom: i === 2 ? 'none' : '1px solid #EEF1F6' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FBECEC', color: '#B8242D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700 }}>PDF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.t}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{d.s}</span>
                  <Button variant="ghost" size="sm" icon="download" onClick={() => handleDownload(d.t)}>Скачать</Button>
                </div>
              ))}
            </Card>
          </div>

          {/* Side */}
          <div>
            {lesson.hasTest && (
              <Card padding={24} style={{ borderTop: '4px solid #1F7A3D' }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1F7A3D', marginBottom: 8 }}>После просмотра</div>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: '0 0 8px' }}>Пройдите тест</h3>
                <p style={{ fontSize: 13, color: '#475060', margin: '0 0 14px' }}>5 вопросов · 5 минут · проходной 70%</p>
                <Button variant="success" fullWidth iconRight="arrow" onClick={() => onStartTest && onStartTest(lesson)}>Начать тест</Button>
              </Card>
            )}

            <Card padding={20} style={{ marginTop: lesson.hasTest ? 16 : 0 }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 12px' }}>Похожие уроки</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {related.length === 0 && <div style={{ fontSize: 13, color: '#5B6778' }}>Похожих уроков нет</div>}
                {related.map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onSwitchLesson ? onSwitchLesson(l) : undefined}
                    className="s-path-btn"
                    style={{
                      display: 'flex', gap: 12, padding: 10,
                      background: '#fff', border: '1px solid #E4E8EF', borderRadius: 8,
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', alignItems: 'center',
                      transition: 'border-color 140ms ease, box-shadow 140ms ease',
                    }}>
                    <div style={{ width: 56, height: 36, borderRadius: 6, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="play" size={14} color={c.color}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{l.duration}</div>
                    </div>
                    <Icon name="chevron" size={14} color="#8A95A5"/>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <BottomNav active="video" onNav={onNav} />
      <ToastContainer />
    </div>
  );
};

export default VideoPlayerScreen;
