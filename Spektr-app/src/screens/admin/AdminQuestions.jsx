import { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { listQuestions, createQuestion, deleteQuestion } from '../../api/questions.js';

const AdminQuestionsScreen = ({ onNav, onLogout }) => {
  const { categories: CATEGORIES, getCategoryById } = useCategories();
  const { show: toast, ToastContainer } = useToast();
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [diff, setDiff] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [newQ, setNewQ] = useState({ text: '', options: ['','','',''], correct: 0, category_id: 'specifics', difficulty: 'medium', explanation: '' });

  useEffect(() => {
    listQuestions({ limit: 500 }).then(setQuestions).catch(console.error);
  }, []);

  const filtered = useMemo(() => questions.filter(q => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (cat !== 'all' && q.category_id !== cat) return false;
    if (diff !== 'all' && q.difficulty !== diff) return false;
    return true;
  }), [questions, search, cat, diff]);

  const counts = useMemo(() => {
    const m = { total: questions.length };
    CATEGORIES.forEach(c => { m[c.id] = questions.filter(q => q.category_id === c.id).length; });
    return m;
  }, [questions]);

  const handleSaveQuestion = async () => {
    try {
      const payload = {
        text: newQ.text,
        option_1: newQ.options[0], option_2: newQ.options[1],
        option_3: newQ.options[2], option_4: newQ.options[3],
        correct_index: newQ.correct,
        category_id: newQ.category_id,
        difficulty: newQ.difficulty,
        explanation: newQ.explanation,
      };
      const created = await createQuestion(payload);
      setQuestions(prev => [created, ...prev]);
      setShowAdd(false);
      toast('Вопрос добавлен в базу', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      toast('Вопрос удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <AdminLayout active="questions" onNav={onNav} onLogout={onLogout} title="База вопросов" subtitle={`Всего ${questions.length} вопросов · отображено ${filtered.length}`}
      actions={<>
        <Button variant="ghost" icon="download" onClick={() => toast('База вопросов выгружена', 'ok')}>Экспорт</Button>
        <Button onClick={() => setShowAdd(true)}>Добавить вопрос</Button>
      </>}>

      {/* KPI по категориям */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }} className="s-cat-grid">
        {CATEGORIES.map(c => (
          <Card key={c.id} padding={14} hoverable onClick={() => setCat(c.id)} style={{ borderTop: `3px solid ${c.color}` }}>
            <div style={{ fontFamily: 'Manrope', fontSize: 24, fontWeight: 800, color: c.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 4 }}>{counts[c.id]}</div>
            <div style={{ fontSize: 12, color: '#3A4657', fontWeight: 600 }}>{c.short}</div>
          </Card>
        ))}
      </div>

      {/* Фильтры */}
      <Card padding={16} style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 200 }}>
            <Icon name="search" size={16} color="#5B6778" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по тексту вопроса…"
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}/>
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
            <option value="all">Все категории</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={diff} onChange={(e) => setDiff(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
            <option value="all">Любая сложность</option>
            <option value="easy">Лёгкие</option>
            <option value="medium">Средние</option>
            <option value="hard">Сложные</option>
          </select>
        </div>
      </Card>

      {selected.size > 0 && (
        <Card padding={12} style={{ marginBottom: 14, background: '#EEF3F8', borderColor: '#1B4B7A' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13 }}>Выбрано: <strong>{selected.size}</strong></div>
            <Button variant="ghost" size="sm" onClick={() => toast('Выберите категорию в модальном окне: функция в разработке', 'info')}>Изменить категорию</Button>
            <Button variant="danger" size="sm" onClick={async () => {
              try {
                await Promise.all([...selected].map(id => deleteQuestion(id)));
                setQuestions(prev => prev.filter(q => !selected.has(q.id)));
                setSelected(new Set());
                toast(`Удалено ${selected.size} вопроса(ов)`, 'ok');
              } catch(e) { toast(e.message || 'Ошибка удаления', 'bad'); }
            }}>Удалить</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Отмена</Button>
          </div>
        </Card>
      )}

      <Card padding={0}>
        <div className="s-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 40, padding: '12px 16px', background: '#F7F9FC', borderBottom: '1px solid #E4E8EF' }}>
                  <input type="checkbox"/>
                </th>
                <th style={{ width: 80, textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>ID</th>
                <th style={{ width: 140, textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>Категория</th>
                <th style={{ textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>Вопрос</th>
                <th style={{ width: 120, textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>Сложность</th>
                <th style={{ width: 120, textAlign:'left', padding:'12px 16px', fontSize:11, fontWeight:600, textTransform:'uppercase', color:'#5B6778', background:'#F7F9FC', borderBottom:'1px solid #E4E8EF' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет вопросов</td></tr>
              )}
              {filtered.slice(0, 50).map((q, i) => {
                const c = getCategoryById(q.category_id) || { short: q.category_id, bg: '#EEF3F8', color: '#5B6778' };
                return (
                  <tr key={q.id} style={{ background: selected.has(q.id) ? '#EEF3F8' : i%2 ? '#F7F9FC' : '#fff' }}>
                    <td style={{ padding: '10px 16px' }}><input type="checkbox" checked={selected.has(q.id)} onChange={() => toggle(q.id)}/></td>
                    <td style={{ padding: '10px 16px', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#5B6778' }}>{q.id}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', background: c.bg, color: c.color }}>{c.short}</span>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 13, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <Chip tone={q.difficulty === 'hard' ? 'bad' : q.difficulty === 'medium' ? 'warn' : 'ok'}>
                        {q.difficulty === 'hard' ? 'Сложная' : q.difficulty === 'medium' ? 'Средняя' : 'Лёгкая'}
                      </Chip>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)}>Удалить</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 600, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>Добавить вопрос</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea value={newQ.text} onChange={e => setNewQ(q => ({ ...q, text: e.target.value }))} placeholder="Текст вопроса" rows={3} style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}/>
              {[0,1,2,3].map(n => (
                <div key={n} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="radio" name="correct" checked={newQ.correct === n} onChange={() => setNewQ(q => ({ ...q, correct: n }))}/>
                  <input value={newQ.options[n]} onChange={e => setNewQ(q => { const opts = [...q.options]; opts[n] = e.target.value; return { ...q, options: opts }; })} placeholder={`Вариант ${n + 1}${n === 0 ? ' (отмечен — правильный)' : ''}`} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}/>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <select value={newQ.category_id} onChange={e => setNewQ(q => ({ ...q, category_id: e.target.value }))} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={newQ.difficulty} onChange={e => setNewQ(q => ({ ...q, difficulty: e.target.value }))} style={{ flex: 1, padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
                  <option value="easy">Лёгкая</option>
                  <option value="medium">Средняя</option>
                  <option value="hard">Сложная</option>
                </select>
              </div>
              <textarea value={newQ.explanation} onChange={e => setNewQ(q => ({ ...q, explanation: e.target.value }))} placeholder="Объяснение правильного ответа" rows={2} style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }}/>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Button>
              <Button onClick={handleSaveQuestion} iconRight="check">Сохранить</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminQuestionsScreen;
