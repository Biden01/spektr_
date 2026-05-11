import { useState, useEffect } from 'react';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { listCourses, createCourse, updateCourse, deleteCourse } from '../../api/courses.js';

const DIRECTIONS = ['Электробезопасность', 'Охрана труда', 'Пожарная безопасность', 'Работы на высоте', 'Грузоподъёмные работы', 'Первая помощь'];
const EMPTY_FORM = { title: '', direction: DIRECTIONS[0], format: 'mixed', duration_hours: '', price_label: '', instructor: '', cover_emoji: '📚', program: '' };

const AdminCoursesScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [courses, setCourses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listCourses().then(data => setCourses(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowAdd(true); };
  const openEdit = (c) => {
    const programText = (c.program_items || []).sort((a, b) => a.order_num - b.order_num).map(p => p.item_text).join('\n');
    setForm({
      title: c.title || '', direction: c.direction || DIRECTIONS[0], format: c.format || 'mixed',
      duration_hours: c.duration_hours || '', price_label: c.price_label || '',
      instructor: c.instructor || '', cover_emoji: c.cover_emoji || '📚', program: programText,
    });
    setEditItem(c);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Укажите название курса', 'bad'); return; }
    setSaving(true);
    try {
      const programArr = form.program.split('\n').map((t, i) => ({ item_text: t.trim(), order_num: i + 1 })).filter(p => p.item_text);
      const payload = {
        title: form.title, direction: form.direction, format: form.format,
        duration_hours: Number(form.duration_hours) || null,
        price_label: form.price_label, instructor: form.instructor,
        cover_emoji: form.cover_emoji, program_items: programArr,
      };
      if (editItem) {
        const updated = await updateCourse(editItem.id, payload);
        setCourses(prev => prev.map(c => c.id === editItem.id ? updated : c));
        toast('Курс обновлён', 'ok');
      } else {
        const created = await createCourse(payload);
        setCourses(prev => [created, ...prev]);
        toast('Курс добавлен', 'ok');
      }
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить курс?')) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast('Курс удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const inp = { padding: '11px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };
  const formatLabel = { online: 'Онлайн', offline: 'Очно', mixed: 'Смешанный' };

  return (
    <AdminLayout active="courses" onNav={onNav} onLogout={onLogout}
      title="Каталог курсов"
      subtitle={`${courses.length} курсов в учебном центре`}
      actions={<Button onClick={openAdd}>Добавить курс</Button>}>

      {courses.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5B6778' }}>Курсы не найдены</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {courses.map(c => (
          <Card key={c.id} padding={20} style={{ borderTop: '4px solid #1F7A3D' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.cover_emoji || '📚'}</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1F7A3D', marginBottom: 4 }}>{c.direction}</div>
            <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 8px', lineHeight: 1.3 }}>{c.title}</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <Chip tone="neutral">{formatLabel[c.format] || c.format}</Chip>
              {c.price_label && <span style={{ fontSize: 13, color: '#1F7A3D', fontWeight: 700 }}>{c.price_label}</span>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Изменить</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Удалить</Button>
            </div>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editItem ? 'Редактировать курс' : 'Добавить курс'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={f('title')} placeholder="Название курса *" style={inp}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.direction} onChange={f('direction')} style={inp}>
                  {DIRECTIONS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={form.format} onChange={f('format')} style={inp}>
                  <option value="mixed">Смешанный</option>
                  <option value="online">Онлайн</option>
                  <option value="offline">Очно</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input value={form.duration_hours} onChange={f('duration_hours')} placeholder="Часов (напр. 40)" type="number" style={inp}/>
                <input value={form.price_label} onChange={f('price_label')} placeholder="Цена (напр. 45 000 ₸)" style={inp}/>
              </div>
              <input value={form.instructor} onChange={f('instructor')} placeholder="Преподаватель" style={inp}/>
              <input value={form.cover_emoji} onChange={f('cover_emoji')} placeholder="Эмодзи обложки (напр. ⚡)" style={inp}/>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3A4657' }}>
                Программа курса (каждый пункт с новой строки)
                <textarea value={form.program} onChange={f('program')} rows={5}
                  placeholder="Модуль 1&#10;Модуль 2&#10;Практические работы"
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

export default AdminCoursesScreen;
