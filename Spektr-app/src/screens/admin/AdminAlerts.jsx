import { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { getNotifications, sendBulkNotification } from '../../api/notifications.js';
import { listAlertRules, createAlertRule, updateAlertRule, deleteAlertRule } from '../../api/alertRules.js';
import { listUsers } from '../../api/users.js';

const TRIGGERS = [
  { value: 'fail_streak',   label: 'Провал 2 проверки подряд' },
  { value: 'before_annual', label: 'До ежегодной проверки' },
  { value: 'before_medical',label: 'До окончания медосмотра' },
  { value: 'overdue_3d',    label: 'Просрочка > 3 дней' },
  { value: 'weekly_report', label: 'Еженедельный отчёт' },
  { value: 'overdue',       label: 'Просрочка (общая)' },
];
const RECIPIENTS = [
  { value: 'employee',        label: 'Сотрудник' },
  { value: 'master',          label: 'Мастер' },
  { value: 'admin',           label: 'Администратор' },
  { value: 'employee_master', label: 'Сотрудник + Мастер' },
];
const CHANNELS = [
  { value: 'push',       label: 'Push' },
  { value: 'email',      label: 'Email' },
  { value: 'email_push', label: 'Email + Push' },
];

const EMPTY_RULE = { title: '', trigger: 'overdue', recipient: 'employee', channel: 'push' };
const EMPTY_SEND_FORM = { title: '', message: '', target: 'all' };

const AdminAlertsScreen = ({ onNav, onLogout }) => {
  const { show: toast, ToastContainer } = useToast();
  const [rules, setRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [ruleForm, setRuleForm] = useState(EMPTY_RULE);
  const [savingRule, setSavingRule] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [sendForm, setSendForm] = useState(EMPTY_SEND_FORM);
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    listAlertRules().then(data => setRules(Array.isArray(data) ? data : [])).catch(console.error);
    getNotifications().then(data => setNotifications(Array.isArray(data) ? data.slice(0, 20) : [])).catch(console.error);
    listUsers().then(data => setUsers(Array.isArray(data) ? data : [])).catch(console.error);
  }, []);

  const openAddRule = () => { setRuleForm(EMPTY_RULE); setEditRule(null); setShowRuleForm(true); };
  const openEditRule = (r) => {
    setRuleForm({ title: r.title, trigger: r.trigger, recipient: r.recipient, channel: r.channel });
    setEditRule(r);
    setShowRuleForm(true);
  };

  const handleSaveRule = async () => {
    if (!ruleForm.title.trim()) { toast('Укажите название правила', 'bad'); return; }
    setSavingRule(true);
    try {
      if (editRule) {
        const updated = await updateAlertRule(editRule.id, ruleForm);
        setRules(prev => prev.map(r => r.id === editRule.id ? updated : r));
        toast('Правило обновлено', 'ok');
      } else {
        const created = await createAlertRule(ruleForm);
        setRules(prev => [...prev, created]);
        toast('Правило создано', 'ok');
      }
      setShowRuleForm(false);
    } catch (e) {
      toast(e.message || 'Ошибка сохранения', 'bad');
    } finally {
      setSavingRule(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm('Удалить правило?')) return;
    try {
      await deleteAlertRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
      toast('Правило удалено', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка удаления', 'bad');
    }
  };

  const toggleRule = async (rule) => {
    try {
      const updated = await updateAlertRule(rule.id, { active: !rule.active });
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
      toast(rule.active ? 'Правило отключено' : 'Правило активировано', 'ok');
    } catch (e) {
      toast(e.message || 'Ошибка', 'bad');
    }
  };

  const handleSend = async () => {
    if (!sendForm.title.trim()) { toast('Укажите заголовок', 'bad'); return; }
    if (!sendForm.message.trim()) { toast('Введите текст сообщения', 'bad'); return; }
    setSending(true);
    try {
      let userIds;
      if (sendForm.target === 'all') {
        userIds = users.map(u => u.id);
      } else if (sendForm.target === 'employees') {
        userIds = users.filter(u => u.role === 'employee').map(u => u.id);
      } else if (sendForm.target === 'masters') {
        userIds = users.filter(u => u.role === 'master').map(u => u.id);
      } else {
        userIds = [parseInt(sendForm.target)];
      }
      if (!userIds.length) { toast('Нет подходящих получателей', 'bad'); setSending(false); return; }
      await sendBulkNotification({ user_ids: userIds, title: sendForm.title, message: sendForm.message });
      toast(`Отправлено ${userIds.length} получателям`, 'ok');
      setShowSend(false);
      setSendForm(EMPTY_SEND_FORM);
      // Refresh notification list
      getNotifications().then(data => setNotifications(Array.isArray(data) ? data.slice(0, 20) : [])).catch(() => {});
    } catch (e) {
      toast(e.message || 'Ошибка отправки', 'bad');
    } finally {
      setSending(false);
    }
  };

  const sf = (field) => (e) => setSendForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <AdminLayout active="alerts" onNav={onNav} onLogout={onLogout} title="Оповещения" subtitle="Правила автоматических уведомлений и шаблоны"
      actions={<><Button variant="ghost" onClick={openAddRule}>Добавить правило</Button><Button onClick={() => setShowSend(true)}>Отправить уведомление</Button></>}>

      <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Правила ({rules.length})</h3>
          </div>
          {rules.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет правил</div>}
          {rules.map((r, i) => {
            const triggerLabel = TRIGGERS.find(t => t.value === r.trigger)?.label || r.trigger;
            const recipientLabel = RECIPIENTS.find(t => t.value === r.recipient)?.label || r.recipient;
            const channelLabel = CHANNELS.find(t => t.value === r.channel)?.label || r.channel;
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i === rules.length - 1 ? 'none' : '1px solid #EEF1F6' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: r.active ? '#EAF5EE' : '#EEF1F6', color: r.active ? '#1F7A3D' : '#8A95A5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="bell" size={18}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#5B6778' }}>{triggerLabel} · {recipientLabel} · {channelLabel}</div>
                </div>
                <Chip tone={r.active ? 'ok' : 'neutral'}>{r.active ? 'Активно' : 'Откл.'}</Chip>
                <Button variant="ghost" size="sm" onClick={() => toggleRule(r)}>{r.active ? 'Откл.' : 'Вкл.'}</Button>
                <Button variant="ghost" size="sm" onClick={() => openEditRule(r)}>✎</Button>
                <Button variant="danger" size="sm" onClick={() => handleDeleteRule(r.id)}>✕</Button>
              </div>
            );
          })}
        </Card>

        <Card padding={0}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: 0 }}>Мои уведомления</h3>
          </div>
          {notifications.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#5B6778', fontSize: 13 }}>Нет уведомлений</div>
          )}
          {notifications.map((n, i) => {
            const dt = n.created_at
              ? new Date(n.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : '—';
            return (
              <div key={n.id ?? i} style={{ padding: '12px 20px', borderBottom: i === notifications.length - 1 ? 'none' : '1px solid #EEF1F6', background: n.read === false ? '#FAFBFF' : '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{n.title || '—'}</div>
                {n.message && <div style={{ fontSize: 12, color: '#475060', marginBottom: 4, lineHeight: 1.4 }}>{n.message}</div>}
                <div style={{ fontSize: 11, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>
                  {dt}{n.read === false ? ' · Не прочитано' : ''}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card padding={24}>
        <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 14px' }}>Шаблоны сообщений</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { t: 'Просрочка проверки', body: 'Уважаемый/ая {ФИО}, у вас просрочена {тип проверки} на {N} дней. Пройдите проверку незамедлительно.' },
            { t: 'Напоминание о сроке', body: 'Через {N} дней истекает срок {тип проверки}. Рекомендуем пройти заранее.' },
            { t: 'Медосмотр', body: 'Срок прохождения медосмотра истекает {дата}. Запишитесь через мастера.' },
            { t: 'Сводка участка', body: 'Еженедельная сводка по {участок}: пройдено {N} тестов, средний балл {%}.' },
          ].map((tmp, i) => (
            <div key={i} style={{ padding: 14, border: '1px solid #E4E8EF', borderRadius: 8, cursor: 'pointer' }}
              onClick={() => { setSendForm(f => ({ ...f, title: tmp.t, message: tmp.body })); setShowSend(true); }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{tmp.t}</div>
              <div style={{ fontSize: 12, color: '#475060', lineHeight: 1.5 }}>{tmp.body}</div>
              <div style={{ fontSize: 11, color: '#1B4B7A', marginTop: 8, fontWeight: 600 }}>↑ Использовать шаблон</div>
            </div>
          ))}
        </div>
      </Card>

      {showRuleForm && (
        <div onClick={() => setShowRuleForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>{editRule ? 'Редактировать правило' : 'Новое правило'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={ruleForm.title} onChange={e => setRuleForm(f => ({ ...f, title: e.target.value }))} placeholder="Название правила *"
                style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
              <select value={ruleForm.trigger} onChange={e => setRuleForm(f => ({ ...f, trigger: e.target.value }))}
                style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
                {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select value={ruleForm.recipient} onChange={e => setRuleForm(f => ({ ...f, recipient: e.target.value }))}
                  style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
                  {RECIPIENTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <select value={ruleForm.channel} onChange={e => setRuleForm(f => ({ ...f, channel: e.target.value }))}
                  style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
                  {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setShowRuleForm(false)}>Отмена</Button>
              <Button loading={savingRule} onClick={handleSaveRule}>{editRule ? 'Сохранить' : 'Создать'}</Button>
            </div>
          </div>
        </div>
      )}

      {showSend && (
        <div onClick={() => setShowSend(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 500, width: '100%' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>Отправить уведомление</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select value={sendForm.target} onChange={sf('target')} style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}>
                <option value="all">Всем пользователям ({users.length})</option>
                <option value="employees">Только сотрудникам ({users.filter(u => u.role === 'employee').length})</option>
                <option value="masters">Только мастерам ({users.filter(u => u.role === 'master').length})</option>
                {users.filter(u => u.role === 'employee' || u.role === 'master').map(u => (
                  <option key={u.id} value={String(u.id)}>{u.full_name || u.fullName} ({u.role})</option>
                ))}
              </select>
              <input value={sendForm.title} onChange={sf('title')} placeholder="Заголовок *" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
              <textarea value={sendForm.message} onChange={sf('message')} placeholder="Текст сообщения *" rows={4}
                style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5 }}/>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <Button variant="ghost" onClick={() => setShowSend(false)}>Отмена</Button>
              <Button loading={sending} onClick={handleSend}>Отправить</Button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminAlertsScreen;
