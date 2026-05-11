import { useState, useEffect } from 'react';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { listMechanisms, createMechanism, updateMechanism, deleteMechanism } from '../../api/mechanisms.js';

const EMPTY_FORM = { title: '', description: '', profession: 'mechanic', difficulty: 'medium', steps: '' };

const AdminMechanismsScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [mechanisms, setMechanisms] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listMechanisms()
      .then(data => setMechanisms(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowAdd(true); };
  const openEdit = (m) => {
    const stepsText = (m.steps || []).sort((a, b) => a.order_num - b.order_num).map(s => s.step_text).join('\n');
    setForm({ title: m.title || '', description: m.description || '', profession: m.profession || 'mechanic', difficulty: m.difficulty || 'medium', steps: stepsText });
    setEditItem(m);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Укажите название узла', 'bad'); return; }
    setSaving(true);
    try {
      const stepsArr = form.steps.split('\n').map((t, i) => ({ step_text: t.trim(), order_num: i + 1 })).filter(s => s.step_text);
      const payload = { title: form.title, description: form.description, profession: form.profession, difficulty: form.difficulty, steps: stepsArr };
      if (editItem) {
        const updated = await updateMechanism(editItem.id, payload);
        setMechanisms(prev => prev.map(m => m.id === editItem.id ? updated : m));
        toast('Узел обновлён', 'ok');
      } else {
        const created = await createMechanism(payload);
        setMechanisms(prev => [created, ...prev]);
        toast('Узел добавлен', 'ok');
      }
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить узел?')) return;
    try {
      await deleteMechanism(id);
      setMechanisms(prev => prev.filter(m => m.id !== id));
      toast('Узел удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const inp = { padding: '11px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
  const diffTone = { easy: 'ok', medium: 'warn', hard: 'bad' };
  const diffLabel = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' };

  return (
    <AdminLayout active="mechanisms" onNav={onNav} onLogout={onLogout}
      title="Узлы и механизмы"
      subtitle={`${mechanisms.length} заданий теоретического экзамена`}
      actions={<Button onClick={openAdd}>Добавить узел</Button>}>

      {mechanisms.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5B6778' }}>Узлы не найдены</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {mechanisms.map(m => {
          const stepsCount = (m.steps || []).length;
          return (
            <Card key={m.id} padding={20} style={{ borderLeft: '4px solid #1B4B7A' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>{m.title}</h4>
                <Chip tone={diffTone[m.difficulty] || 'warn'}>{diffLabel[m.difficulty] || m.difficulty}</Chip>
              </div>
              <p style={{ fontSize: 13, color: '#475060', margin: '0 0 10px', lineHeight: 1.4 }}>{m.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Chip tone="neutral">{m.profession === 'electrician' ? 'Электромонтёр' : 'Слесарь'}</Chip>
                <span style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{stepsCount} шагов</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Изменить</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(m.id)}>Удалить</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editItem ? 'Редактировать узел' : 'Добавить узел'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={f('title')} placeholder="Название узла *" style={inp}/>
              <input value={form.description} onChange={f('description')} placeholder="Описание" style={inp}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.profession} onChange={f('profession')} style={inp}>
                  <option value="mechanic">Слесарь</option>
                  <option value="electrician">Электромонтёр</option>
                </select>
                <select value={form.difficulty} onChange={f('difficulty')} style={inp}>
                  <option value="easy">Лёгкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </select>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3A4657' }}>
                Шаги сборки в правильном порядке (каждый с новой строки)
                <textarea value={form.steps} onChange={f('steps')} rows={8}
                  placeholder="Шаг 1&#10;Шаг 2&#10;Шаг 3"
                  style={{ ...inp, marginTop: 4, resize: 'vertical', lineHeight: 1.5 }}/>
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <Button variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Button>
                <Button loading={saving} onClick={handleSave}>{editItem ? 'Сохранить' : 'Добавить'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminMechanismsScreen;
