import { useState } from 'react';
import { Button, Card, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { createCategory, updateCategory, deleteCategory } from '../../api/categories.js';

const EMPTY_FORM = { id: '', name: '', short: '', color: '#1B4B7A', bg_color: '#EEF3F8' };

const AdminCategoriesScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const { categories, reload } = useCategories();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowAdd(true); };
  const openEdit = (c) => {
    setForm({ id: c.id, name: c.name, short: c.short || '', color: c.color || '#1B4B7A', bg_color: c.bg || '#EEF3F8' });
    setEditItem(c);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Укажите название категории', 'bad'); return; }
    if (!editItem && !form.id.trim()) { toast('Укажите идентификатор (латиница)', 'bad'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, short: form.short, color: form.color, bg_color: form.bg_color };
      if (editItem) {
        await updateCategory(editItem.id, payload);
        toast('Категория обновлена', 'ok');
      } else {
        await createCategory({ id: form.id, ...payload });
        toast('Категория добавлена', 'ok');
      }
      await reload();
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Удалить категорию «${id}»? Это может нарушить вопросы и уроки, привязанные к ней.`)) return;
    try {
      await deleteCategory(id);
      await reload();
      toast('Категория удалена', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const inp = { padding: '11px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };

  return (
    <AdminLayout active="categories" onNav={onNav} onLogout={onLogout}
      title="Категории проверок"
      subtitle={`${categories.length} направлений знаний`}
      actions={<Button onClick={openAdd}>Добавить категорию</Button>}>

      <Card padding={0}>
        {categories.map((c, i) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '44px 1fr 90px 90px auto',
            alignItems: 'center', gap: 16, padding: '14px 20px',
            borderBottom: i === categories.length - 1 ? 'none' : '1px solid #EEF1F6',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 13 }}>
              {c.short?.slice(0, 2) || c.id.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>id: {c.id}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: c.color, border: '1px solid #E4E8EF' }}/>
              <span style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{c.color}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: c.bg, border: '1px solid #E4E8EF' }}/>
              <span style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{c.bg}</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Изменить</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Удалить</Button>
            </div>
          </div>
        ))}
      </Card>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editItem ? 'Редактировать категорию' : 'Добавить категорию'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {!editItem && (
                <input value={form.id} onChange={f('id')} placeholder="ID (латиница, напр. electro) *" style={inp}/>
              )}
              <input value={form.name} onChange={f('name')} placeholder="Полное название *" style={inp}/>
              <input value={form.short} onChange={f('short')} placeholder="Короткое название (для чипов)" style={inp}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3A4657', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  Цвет текста
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.color} onChange={f('color')} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}/>
                    <input value={form.color} onChange={f('color')} style={{ ...inp, flex: 1 }}/>
                  </div>
                </label>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#3A4657', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  Цвет фона
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.bg_color} onChange={f('bg_color')} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}/>
                    <input value={form.bg_color} onChange={f('bg_color')} style={{ ...inp, flex: 1 }}/>
                  </div>
                </label>
              </div>
              <div style={{ padding: 12, background: form.bg_color, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${form.color}20` }}>
                <span style={{ fontSize: 13, color: form.color, fontWeight: 700 }}>Предпросмотр: {form.short || form.name || 'Категория'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Отмена</Button>
              <Button loading={saving} onClick={handleSave}>{editItem ? 'Сохранить' : 'Добавить'}</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminCategoriesScreen;
