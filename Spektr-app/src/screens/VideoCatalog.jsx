import { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listLessons } from '../api/lessons.js';
import { useCategories } from '../context/CategoriesContext.jsx';

function normalizeLesson(l) {
  return {
    id: l.id,
    title: l.title,
    category: l.category_id || 'specifics',
    video_url: l.video_url || null,
    description: l.description || '',
    duration: l.duration || '—',
    views: l.views || 0,
    publishDate: l.created_at ? new Date(l.created_at).toLocaleDateString('ru-RU') : '—',
    status: 'todo',
  };
}

const VideoCatalogScreen = ({ onOpenLesson, onBack, onNav, onLogout }) => {
  const { categories: CATEGORIES, getCategoryById } = useCategories();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  useEffect(() => {
    listLessons({ limit: 200 })
      .then(data => setLessons(Array.isArray(data) ? data.map(normalizeLesson) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const filtered = useMemo(() => lessons.filter(l => {
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat !== 'all' && l.category !== cat) return false;
    return true;
  }), [lessons, q, cat]);

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="video" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }}>В кабинет</Button>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Видеоуроки</h1>
            <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>
              {loading ? 'Загрузка…' : `${lessons.length} уроков · 5 направлений`}
            </div>
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
          <aside>
            <div style={{ position: 'relative', marginBottom: 18 }}>
              <Icon name="search" size={16} color="#5B6778" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск…"
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 10 }}>Направление</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[{ id: 'all', name: 'Все направления' }, ...CATEGORIES].map(c => (
                <button key={c.id} type="button" onClick={() => setCat(c.id)}
                  style={{
                    padding: '8px 12px', border: 'none', background: cat === c.id ? '#EEF3F8' : 'transparent',
                    color: cat === c.id ? '#1B4B7A' : '#3A4657', fontWeight: cat === c.id ? 600 : 500, fontSize: 14,
                    borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}>{c.name}</button>
              ))}
            </div>
          </aside>

          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#5B6778' }}>Загрузка уроков…</div>
            ) : (
              <>
                <div style={{ fontSize: 14, color: '#475060', marginBottom: 14 }}>Найдено: <strong>{filtered.length}</strong></div>
                {filtered.length === 0 ? (
                  <Card padding={40}>
                    <div style={{ textAlign: 'center', color: '#5B6778' }}>
                      <Icon name="film" size={36} color="#B8C0CC" style={{ marginBottom: 12 }}/>
                      <div style={{ fontWeight: 600, color: '#1A2332' }}>Уроков не найдено</div>
                    </div>
                  </Card>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {filtered.map(l => {
                      const c = getCategoryById(l.category);
                      return (
                        <Card key={l.id} padding={0} hoverable onClick={() => onOpenLesson && onOpenLesson(l)}>
                          <div style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${c.bg}, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '12px 12px 0 0' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,35,50,.1)' }}>
                              <Icon name="play" size={24} color={c.color} />
                            </div>
                            <div style={{ position: 'absolute', top: 10, left: 10 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: c.color, color: '#fff' }}>
                                {c.short}
                              </span>
                            </div>
                            {l.duration !== '—' && (
                              <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '3px 8px', background: 'rgba(15,45,74,.85)', color: '#fff', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{l.duration}</div>
                            )}
                          </div>
                          <div style={{ padding: 16 }}>
                            <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, margin: '0 0 8px', lineHeight: 1.3 }}>{l.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip tone="neutral">Не пройдено</Chip>
                              <span style={{ fontSize: 12, color: '#5B6778' }}>{l.publishDate}</span>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <BottomNav active="video" onNav={onNav} />
    </div>
  );
};

export default VideoCatalogScreen;
