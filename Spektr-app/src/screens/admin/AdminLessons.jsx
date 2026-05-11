import { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { listLessons, createLesson, updateLesson, deleteLesson } from '../../api/lessons.js';

const EMPTY_FORM = { title: '', category_id: 'labour', video_url: '', description: '', withTest: true };

const AdminLessonsScreen = ({ onNav, onLogout }) => {
  const { categories: CATEGORIES, getCategoryById } = useCategories();
  const { show: toast, ToastContainer } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    listLessons({ limit: 200 }).then(setLessons).catch(console.error);
  }, []);

  const f = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditLesson(null); setShowAdd(true); };
  const openEdit = (l) => {
    setForm({ title: l.title, category_id: l.category_id || 'labour', video_url: l.video_url || '', description: l.description || '', withTest: true });
    setEditLesson(l);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Укажите название урока', 'bad'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, category_id: form.category_id, video_url: form.video_url, description: form.description };
      if (editLesson) {
        const updated = await updateLesson(editLesson.id, payload);
        setLessons(prev => prev.map(l => l.id === editLesson.id ? updated : l));
        toast('Урок обновлён', 'ok');
      } else {
        const created = await createLesson(payload);
        setLessons(prev => [created, ...prev]);
        toast('Урок добавлен в каталог', 'ok');
      }
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLesson(id);
      setLessons(prev => prev.filter(l => l.id !== id));
      toast('Урок удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  return (
    <AdminLayout active="lessons" onNav={onNav} onLogout={onLogout} title="Видеоуроки" subtitle={`${lessons.length} уроков в библиотеке`}
      actions={<Button onClick={openAdd}>Добавить урок</Button>}>
      {lessons.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5B6778' }}>Уроки не найдены</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {lessons.map(l => {
          const c = getCategoryById(l.category_id) || { short: l.category_id, bg: '#EEF3F8', color: '#1B4B7A' };
          return (
            <Card key={l.id} padding={0} hoverable>
              <div style={{ aspectRatio: '16/9', background: l.thumbnail_url ? `url(${l.thumbnail_url}) center/cover` : `linear-gradient(135deg, ${c.bg}, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '12px 12px 0 0' }}>
                <Icon name="play" size={32} color={c.color}/>
                <div style={{ position: 'absolute', top: 10, left: 10, padding: '3px 8px', background: c.color, color: '#fff', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{c.short}</div>
                {l.duration_min && <div style={{ position: 'absolute', bottom: 10, right: 10, padding: '3px 8px', background: 'rgba(15,45,74,.85)', color: '#fff', borderRadius: 4, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{l.duration_min} мин</div>}
              </div>
              <div style={{ padding: 16 }}>
                <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 15, margin: '0 0 8px', lineHeight: 1.3 }}>{l.title}</h4>
                <div style={{ fontSize: 12, color: '#5B6778', marginBottom: 10 }}>{l.description || ''}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(l)}>Изменить</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(l.id)}>Удалить</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 520, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editLesson ? 'Редактировать урок' : 'Добавить видеоурок'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={f('title')} placeholder="Название *" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}/>
              <select value={form.category_id} onChange={f('category_id')} style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input value={form.video_url} onChange={f('video_url')} placeholder="Ссылка на видео (YouTube или файл)" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14 }}/>
              <textarea value={form.description} onChange={f('description')} placeholder="Описание" rows={3} style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }}/>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={form.withTest} onChange={f('withTest')}/> Привязать тест после просмотра
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Button>
              <Button onClick={handleSave} loading={saving}>Сохранить</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminLessonsScreen;
