import { useState, useEffect } from 'react';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { listProtocols, createProtocol, updateProtocol, deleteProtocol } from '../../api/protocols.js';

const TONES = ['warn', 'bad'];
const ICONS = ['shield', 'zap', 'alert', 'target', 'fire', 'bolt'];

const EMPTY_FORM = { title: '', short: '', icon: 'shield', tone: 'warn', rules: '' };

const AdminProtocolsScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [protocols, setProtocols] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listProtocols().then(data => setProtocols(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const openAdd = () => { setForm(EMPTY_FORM); setEditItem(null); setShowAdd(true); };
  const openEdit = (p) => {
    const rulesText = (p.rules || []).sort((a, b) => a.order_num - b.order_num).map(r => r.rule_text).join('\n');
    setForm({ title: p.title || '', short: p.short || '', icon: p.icon || 'shield', tone: p.tone || 'warn', rules: rulesText });
    setEditItem(p);
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Укажите название протокола', 'bad'); return; }
    setSaving(true);
    try {
      const rulesArr = form.rules.split('\n').map((t, i) => ({ rule_text: t.trim(), order_num: i + 1 })).filter(r => r.rule_text);
      const payload = { title: form.title, short: form.short, icon: form.icon, tone: form.tone, rules: rulesArr };
      if (editItem) {
        const updated = await updateProtocol(editItem.id, payload);
        setProtocols(prev => prev.map(p => p.id === editItem.id ? updated : p));
        toast('Протокол обновлён', 'ok');
      } else {
        const created = await createProtocol(payload);
        setProtocols(prev => [created, ...prev]);
        toast('Протокол добавлен', 'ok');
      }
      setShowAdd(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить протокол?')) return;
    try {
      await deleteProtocol(id);
      setProtocols(prev => prev.filter(p => p.id !== id));
      toast('Протокол удалён', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const inp = { padding: '11px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' };

  return (
    <AdminLayout active="protocols" onNav={onNav} onLogout={onLogout}
      title="Протоколы безопасного труда"
      subtitle={`${protocols.length} протоколов смертельных опасностей`}
      actions={<Button onClick={openAdd}>Добавить протокол</Button>}>

      {protocols.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: '#5B6778' }}>Протоколы не найдены</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {protocols.map(p => {
          const tones = { bad: { bg: '#FBECEC', fg: '#B8242D' }, warn: { bg: '#FDF4E7', fg: '#C77A0F' } };
          const t = tones[p.tone] || tones.warn;
          const rulesCount = (p.rules || []).length;
          return (
            <Card key={p.id} padding={20} style={{ borderTop: `4px solid ${t.fg}` }}>
              <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>{p.title}</h4>
              <p style={{ fontSize: 13, color: '#475060', margin: '0 0 10px', lineHeight: 1.4 }}>{p.short}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Chip tone={p.tone === 'bad' ? 'bad' : 'warn'}>{p.tone === 'bad' ? 'Смертельная' : 'Предупреждение'}</Chip>
                <span style={{ fontSize: 12, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{rulesCount} правил</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Изменить</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Удалить</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editItem ? 'Редактировать протокол' : 'Добавить протокол'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={form.title} onChange={f('title')} placeholder="Название *" style={inp}/>
              <input value={form.short} onChange={f('short')} placeholder="Краткое описание" style={inp}/>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={form.icon} onChange={f('icon')} style={inp}>
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select value={form.tone} onChange={f('tone')} style={inp}>
                  <option value="warn">Предупреждение</option>
                  <option value="bad">Смертельная опасность</option>
                </select>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#3A4657' }}>
                Правила (каждое с новой строки)
                <textarea value={form.rules} onChange={f('rules')} rows={6}
                  placeholder="Правило 1&#10;Правило 2&#10;Правило 3"
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

export default AdminProtocolsScreen;
