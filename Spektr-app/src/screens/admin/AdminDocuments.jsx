import { useState, useEffect } from 'react';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { listDocuments, createDocument, updateDocument, deleteDocument } from '../../api/documents.js';

const CATEGORIES = [
  { id: 'license',     label: 'Лицензии и сертификаты' },
  { id: 'regulations', label: 'Положения и регламенты' },
  { id: 'samples',     label: 'Образцы удостоверений' },
  { id: 'contracts',   label: 'Договоры' },
];
const FORMATS = ['PDF', 'DOCX', 'XLSX', 'JPG'];
const EMPTY_FORM = { title: '', category: 'license', format: 'PDF', file_size: '', file_url: '' };

const AdminDocumentsScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [docs, setDocs] = useState([]);
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listDocuments().then(data => setDocs(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowAdd(true); };
  const openEdit = (d) => {
    setForm({ title: d.title || '', category: d.category || 'license', format: d.format || 'PDF', file_size: d.file_size || d.size || '', file_url: d.file_url || '' });
    setEditItem(d);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Укажите название документа', 'bad'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, category: form.category, format: form.format, file_size: form.file_size, file_url: form.file_url };
      if (editItem) {
        const updated = await updateDocument(editItem.id, payload);
        setDocs(prev => prev.map(d => d.id === editItem.id ? updated : d));
        toast('Документ обновлён', 'ok');
      } else {
        const created = await createDocument(payload);
        setDocs(prev => [created, ...prev]);
        toast('Документ добавлен', 'ok');
      }
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить документ?')) return;
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      toast('Документ удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const filtered = catFilter === 'all' ? docs : docs.filter(d => d.category === catFilter);
  const inp = { padding: '11px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };

  return (
    <AdminLayout active="documents" onNav={onNav} onLogout={onLogout}
      title="Документы"
      subtitle={`${docs.length} документов в базе`}
      actions={<Button onClick={openAdd}>Добавить документ</Button>}>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[{ id: 'all', label: 'Все' }, ...CATEGORIES].map(c => (
          <button key={c.id} type="button" onClick={() => setCatFilter(c.id)}
            style={{
              padding: '7px 14px', border: '1px solid', borderRadius: 20, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              background: catFilter === c.id ? '#1B4B7A' : '#fff',
              color: catFilter === c.id ? '#fff' : '#3A4657',
              borderColor: catFilter === c.id ? '#1B4B7A' : '#E4E8EF',
              fontWeight: catFilter === c.id ? 600 : 400,
            }}>{c.label}</button>
        ))}
      </div>

      {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5B6778' }}>Документы не найдены</div>}

      <Card padding={0}>
        {filtered.map((d, i) => (
          <div key={d.id} style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 100px 100px auto',
            alignItems: 'center', gap: 16, padding: '14px 20px',
            borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #EEF1F6',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: d.format === 'PDF' ? '#FBECEC' : '#EEF3F8', color: d.format === 'PDF' ? '#B8242D' : '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {d.format}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
              <div style={{ fontSize: 12, color: '#5B6778', marginTop: 2 }}>{CATEGORIES.find(c => c.id === d.category)?.label || d.category}</div>
            </div>
            <div style={{ fontSize: 13, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{d.file_size || d.size || '—'}</div>
            <div style={{ fontSize: 13, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>
              {d.updated_date ? new Date(d.updated_date).toLocaleDateString('ru-RU') : (d.date || '—')}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>Изменить</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(d.id)}>Удалить</Button>
            </div>
          </div>
        ))}
      </Card>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 520, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editItem ? 'Редактировать документ' : 'Добавить документ'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={f('title')} placeholder="Название документа *" style={inp}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.category} onChange={f('category')} style={inp}>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <select value={form.format} onChange={f('format')} style={inp}>
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <input value={form.file_size} onChange={f('file_size')} placeholder="Размер файла (напр. 1.2 МБ)" style={inp}/>
              <input value={form.file_url} onChange={f('file_url')} placeholder="Ссылка на файл (https://...)" style={inp}/>
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

export default AdminDocumentsScreen;
