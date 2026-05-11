import { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Chip, Card, MARK, useToast } from '../components/Primitives.jsx';
import { useTest } from '../context/TestContext.jsx';
import { useCategories } from '../context/CategoriesContext.jsx';

const Results = ({ onHome, onRetry }) => {
  const { categories: CATEGORIES, getCategoryById } = useCategories();
  const { session, reset } = useTest();
  const { show: toast, ToastContainer } = useToast();
  const [animPct, setAnimPct] = useState(0);
  const [openIdx, setOpenIdx] = useState(null);

  // Map questionId → { correctIndex, isCorrect } from server response
  const correctMap = useMemo(() => {
    if (!session?.serverAnswers?.length) return {};
    const m = {};
    session.serverAnswers.forEach(a => {
      m[a.question_id] = { correctIndex: a.correct_index, isCorrect: a.is_correct };
    });
    return m;
  }, [session?.serverAnswers]);

  // Считаем разбивку по категориям
  const breakdown = useMemo(() => {
    if (!session?.questions) return [];
    const m = {};
    CATEGORIES.forEach(c => { m[c.id] = { ...c, total: 0, correct: 0 }; });
    session.questions.forEach((q) => {
      m[q.category].total += 1;
      if (correctMap[q.id]?.isCorrect) m[q.category].correct += 1;
    });
    return CATEGORIES.map(c => m[c.id]).filter(c => c.total > 0);
  }, [session, correctMap]);

  const passPct = session?.passPct ?? 70;
  const finalPct = session?.pct ?? 0;
  const passed = session?.passed ?? false;

  // Анимированный счётчик кольца
  useEffect(() => {
    if (!session?.isFinished) return;
    const start = performance.now();
    const dur = 1100;
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3); // easeOutCubic
      setAnimPct(Math.round(eased * finalPct));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [session?.isFinished, finalPct]);

  if (!session?.isFinished) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: 40 }}>
        <Card padding={40} style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: '0 0 8px' }}>Результатов пока нет</h2>
          <p style={{ color: '#5B6778', margin: '0 0 20px' }}>Сначала пройдите тест.</p>
          <Button onClick={onHome} iconRight="arrow">В кабинет</Button>
        </Card>
      </div>
    );
  }

  const ringRadius = 80;
  const ringStroke = 14;
  const c = 2 * Math.PI * ringRadius;
  const dash = (animPct / 100) * c;
  const ringColor = passed ? '#1F7A3D' : '#B8242D';

  const dur = session.durationSec;
  const durMin = Math.floor(dur / 60);
  const durSec = dur % 60;

  const onDownload = () => window.print();

  const handleHome = () => { reset(); onHome && onHome(); };
  const handleRetry = () => { const t = session?.type; reset(); onRetry && onRetry(t); };

  return (
    <div style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #E4E8EF', padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={MARK} style={{ height: 28 }} alt=""/>
          <span style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 16 }}>СПЕКТР</span>
        </div>
        <div style={{ flex: 1, fontSize: 13, color: '#5B6778', textAlign: 'center' }}>{session.title} · Результаты</div>
        <Button variant="ghost" icon="logout" onClick={handleHome}>В кабинет</Button>
      </header>

      <div className="s-results-wrap" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 40px 80px' }}>
        {/* HERO — кольцо + статус */}
        <div className="s-results-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32, alignItems: 'center', marginBottom: 28 }}>
          <Card padding={32} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r={ringRadius} fill="none" stroke="#EEF1F6" strokeWidth={ringStroke} />
                <circle cx="100" cy="100" r={ringRadius} fill="none"
                  stroke={ringColor} strokeWidth={ringStroke} strokeLinecap="round"
                  strokeDasharray={`${dash} ${c}`} transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dasharray 80ms linear' }}/>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'Manrope', fontSize: 44, fontWeight: 800, color: '#1A2332', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{animPct}%</div>
                <div style={{ fontSize: 12, color: '#5B6778', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>{session.correctCount} / {session.total}</div>
              </div>
            </div>
          </Card>
          <div>
            <Chip tone={passed ? 'ok' : 'bad'}>{passed ? 'Сдано' : 'Не сдано — требуется пересдача'}</Chip>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, margin: '14px 0 6px', letterSpacing: '-0.02em' }}>
              {passed ? 'Поздравляем!' : 'Попробуйте ещё раз'}
            </h1>
            <p style={{ fontSize: 15, color: '#475060', lineHeight: 1.6, margin: '0 0 20px' }}>
              {passed
                ? `Проходной балл — ${passPct}%, у вас ${finalPct}%. Допуск получен.`
                : `Проходной балл — ${passPct}%, у вас ${finalPct}%. Не хватило ${passPct - finalPct} процентных пунктов.`}
            </p>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#475060' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="timer" size={14} color="#5B6778" />
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontVariantNumeric: 'tabular-nums' }}>{durMin}:{String(durSec).padStart(2, '0')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="clipboard" size={14} color="#5B6778" />
                <span>Вопросов: {session.total}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              <Button onClick={handleHome} iconRight="arrow">В кабинет</Button>
              {!passed && <Button variant="danger" onClick={handleRetry}>Пересдать</Button>}
              <Button variant="ghost" icon="download" onClick={onDownload}>PDF-протокол</Button>
            </div>
          </div>
        </div>

        {/* Разбивка по категориям */}
        <Card padding={28} style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 18px' }}>Результаты по категориям</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {breakdown.map(b => {
              const pct = b.total ? Math.round((b.correct / b.total) * 100) : 0;
              return (
                <div key={b.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{b.name}</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#3A4657', fontVariantNumeric: 'tabular-nums' }}>{b.correct} / {b.total} · {pct}%</span>
                  </div>
                  <div style={{ height: 10, background: '#EEF1F6', borderRadius: 6, overflow: 'hidden' }}
                       role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={b.name}>
                    <div style={{ width: `${pct}%`, height: '100%', background: b.color, borderRadius: 6, transition: 'width 700ms cubic-bezier(.2,0,0,1)' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Все вопросы — аккордеон */}
        <Card padding={0}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Разбор вопросов ({session.total})</h3>
            <p style={{ fontSize: 13, color: '#5B6778', margin: '4px 0 0' }}>Кликните на вопрос, чтобы увидеть правильный ответ и объяснение</p>
          </div>
          <div>
            {session.questions.map((q, i) => {
              const userAns = session.answers[i];
              const isCorrect = correctMap[q.id]?.isCorrect ?? false;
              const isAnswered = userAns !== undefined;
              const isOpen = openIdx === i;
              const cat = getCategoryById(q.category);
              return (
                <div key={q.id} style={{ borderBottom: i === session.questions.length - 1 ? 'none' : '1px solid #EEF1F6' }}>
                  <button type="button" onClick={() => setOpenIdx(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%', padding: '16px 24px', background: 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'background 140ms ease',
                    }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 999, flexShrink: 0,
                      background: !isAnswered ? '#EEF1F6' : isCorrect ? '#EAF5EE' : '#FBECEC',
                      color: !isAnswered ? '#8A95A5' : isCorrect ? '#1F7A3D' : '#B8242D',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
                    }}>{i + 1}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 14, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', background: cat.bg, color: cat.color, flexShrink: 0 }}>{cat.short}</span>
                    {!isAnswered ? (
                      <Chip tone="neutral">Не отвечено</Chip>
                    ) : isCorrect ? (
                      <Chip tone="ok">Верно</Chip>
                    ) : (
                      <Chip tone="bad">Неверно</Chip>
                    )}
                    <Icon name="chevron" size={16} color="#8A95A5" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 140ms ease' }}/>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 24px 20px 66px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {q.options.map((opt, k) => {
                        const isUser = userAns === k;
                        const isRight = correctMap[q.id]?.correctIndex === k;
                        let bg = '#fff', border = '#E4E8EF', color = '#475060';
                        if (isRight) { bg = '#EAF5EE'; border = '#CFE7D6'; color = '#176030'; }
                        else if (isUser && !isRight) { bg = '#FBECEC'; border = '#F2CFD1'; color = '#941C24'; }
                        return (
                          <div key={k} style={{ padding: '10px 14px', border: `1px solid ${border}`, borderRadius: 8, background: bg, color, fontSize: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 12, marginTop: 2 }}>{String.fromCharCode(65 + k)}.</span>
                            <span style={{ flex: 1 }}>{opt}</span>
                            {isRight && <Icon name="check" size={16} color="#1F7A3D"/>}
                            {isUser && !isRight && <Icon name="x" size={16} color="#B8242D"/>}
                          </div>
                        );
                      })}
                      {q.explanation && (
                        <div style={{ marginTop: 6, padding: '12px 14px', background: '#EEF3F8', borderRadius: 8, fontSize: 13, color: '#1A2332', lineHeight: 1.55 }}>
                          <strong style={{ color: '#1B4B7A' }}>Объяснение: </strong>{q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Results;
