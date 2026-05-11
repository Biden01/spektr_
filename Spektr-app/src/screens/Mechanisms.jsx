import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, Alert } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { listMechanisms } from '../api/mechanisms.js';

function normalizeMechanism(m) {
  return {
    id: m.id,
    title: m.title,
    description: m.description || '',
    profession: m.profession || 'mechanic',
    difficulty: m.difficulty || 'medium',
    status: m.status || 'todo',
    steps: (m.steps || []).sort((a, b) => a.order_num - b.order_num).map(s => s.step_text),
  };
}

const StepRow = ({ step, idx, onMoveUp, onMoveDown, isFirst, isLast, isWrong }) => (
  <div
    style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      background: isWrong ? '#FBECEC' : '#fff',
      border: `1px solid ${isWrong ? '#F2CFD1' : '#E4E8EF'}`,
      borderRadius: 10, marginBottom: 8,
      transition: 'all 180ms ease',
    }}>
    <div style={{ width: 28, height: 28, borderRadius: 999, background: isWrong ? '#B8242D' : '#1B4B7A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
    <div style={{ flex: 1, fontSize: 14, color: isWrong ? '#941C24' : '#1A2332', lineHeight: 1.4 }}>{step}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
      <button type="button" onClick={onMoveUp} disabled={isFirst}
        aria-label="Переместить вверх"
        style={{ width: 28, height: 22, padding: 0, border: '1px solid #E4E8EF', background: '#fff', borderRadius: 4, cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevron" size={12} color="#5B6778" style={{ transform: 'rotate(-90deg)' }}/>
      </button>
      <button type="button" onClick={onMoveDown} disabled={isLast}
        aria-label="Переместить вниз"
        style={{ width: 28, height: 22, padding: 0, border: '1px solid #E4E8EF', background: '#fff', borderRadius: 4, cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevron" size={12} color="#5B6778" style={{ transform: 'rotate(90deg)' }}/>
      </button>
    </div>
  </div>
);

const MechanismDetail = ({ mech, onBack }) => {
  const shuffleSeed = (steps) => {
    const arr = steps.map((s, i) => ({ s, k: ((s.length * 31 + i * 7) % 17) }));
    return arr.sort((a, b) => a.k - b.k).map(x => x.s);
  };
  const [order, setOrder] = useState(() => shuffleSeed(mech.steps));
  const [checked, setChecked] = useState(false);
  const [wrongIdx, setWrongIdx] = useState(new Set());
  const [passed, setPassed] = useState(false);

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const arr = [...order];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setOrder(arr);
    setChecked(false);
    setWrongIdx(new Set());
  };

  const handleCheck = () => {
    const wrong = new Set();
    mech.steps.forEach((correctStep, i) => {
      if (order[i] !== correctStep) wrong.add(i);
    });
    setWrongIdx(wrong);
    setChecked(true);
    setPassed(wrong.size === 0);
  };

  const handleReset = () => {
    setOrder(shuffleSeed(mech.steps));
    setChecked(false);
    setWrongIdx(new Set());
    setPassed(false);
  };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
        <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ flexDirection: 'row-reverse' }}>К списку узлов</Button>
      </header>

      <Card padding={28} style={{ borderTop: '4px solid #1B4B7A', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 6 }}>Теоретический экзамен</div>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{mech.title}</h1>
            <p style={{ fontSize: 14, color: '#475060', margin: 0, lineHeight: 1.5 }}>{mech.description}</p>
          </div>
          <Chip tone={mech.difficulty === 'hard' ? 'bad' : mech.difficulty === 'medium' ? 'warn' : 'ok'}>
            {mech.difficulty === 'hard' ? 'Сложный' : mech.difficulty === 'medium' ? 'Средний' : 'Лёгкий'}
          </Chip>
        </div>
      </Card>

      {checked && passed && (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="ok" title="Все шаги расставлены верно" description={`Сборка узла «${mech.title}» выполнена в правильной последовательности. Засчитано.`}/>
        </div>
      )}
      {checked && !passed && (
        <div style={{ marginBottom: 20 }}>
          <Alert tone="bad" title={`Неправильный порядок · ошибок: ${wrongIdx.size}`} description="Шаги, выделенные красным, стоят не на своих местах. Поменяйте их и проверьте снова."/>
        </div>
      )}

      <Card padding={28}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Расставьте шаги в правильном порядке</h3>
          <div style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{order.length} шагов</div>
        </div>
        <div>
          {order.map((step, i) => (
            <StepRow key={`${step.slice(0,20)}-${i}`} step={step} idx={i}
              onMoveUp={() => move(i, -1)} onMoveDown={() => move(i, 1)}
              isFirst={i === 0} isLast={i === order.length - 1}
              isWrong={wrongIdx.has(i)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={handleReset}>Сбросить</Button>
          <Button onClick={handleCheck} iconRight="check">Проверить</Button>
        </div>
      </Card>
    </>
  );
};

const MechanismsScreen = ({ onBack, onNav, onLogout }) => {
  const { user } = useAuth();
  const [mechanisms, setMechanisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const profession = user?.position?.toLowerCase().includes('электр') ? 'electrician' : 'mechanic';

  useEffect(() => {
    listMechanisms({ profession })
      .then(data => setMechanisms(Array.isArray(data) ? data.map(normalizeMechanism) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profession]);

  if (!user) return null;

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="exam" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        {!selected ? (
          <>
            <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }}>В кабинет</Button>
                <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Теоретический экзамен</h1>
                <div className="s-main-header-sub" style={{ fontSize: 14, color: '#3A4657', marginTop: 4 }}>
                  {loading ? 'Загрузка…' : `Узлы и механизмы для ${profession === 'electrician' ? 'электромонтёров' : 'слесарей'} · ${mechanisms.length} заданий`}
                </div>
              </div>
              <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
            </header>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#5B6778' }}>Загрузка…</div>
            ) : mechanisms.length === 0 ? (
              <Card padding={40}>
                <div style={{ textAlign: 'center', color: '#5B6778' }}>Задания не найдены</div>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="s-feature-grid">
                {mechanisms.map(m => (
                  <Card key={m.id} padding={24} hoverable onClick={() => setSelected(m)} style={{ borderLeft: '4px solid #1B4B7A' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      <div style={{ width: 60, height: 60, borderRadius: 12, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={profession === 'electrician' ? 'zap' : 'settings'} size={32} color="#1B4B7A"/>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>{m.title}</h3>
                        <p style={{ fontSize: 13, color: '#475060', margin: '0 0 12px', lineHeight: 1.5 }}>{m.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{m.steps.length} шагов</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Chip tone={m.difficulty === 'hard' ? 'bad' : m.difficulty === 'medium' ? 'warn' : 'ok'}>
                              {m.difficulty === 'hard' ? 'Сложный' : m.difficulty === 'medium' ? 'Средний' : 'Лёгкий'}
                            </Chip>
                            <Chip tone={m.status === 'done' ? 'ok' : 'neutral'}>{m.status === 'done' ? 'Сдано' : 'Не сдано'}</Chip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <MechanismDetail mech={selected} onBack={() => setSelected(null)}/>
        )}
      </main>
      <BottomNav active="exam" onNav={onNav} />
    </div>
  );
};

export default MechanismsScreen;
