import { useState, useEffect } from 'react';
import Icon from '../../components/Icon.jsx';
import { Button, Card, Chip, useToast } from '../../components/Primitives.jsx';
import AdminLayout from './AdminLayout.jsx';
import { useCategories } from '../../context/CategoriesContext.jsx';
import { api } from '../../api/client.js';

const DEFAULTS = {
  general: { org: 'НТЦ «Востоктехносервис»', email: 'support@spektr.kz', phone: '+7 (7232) 00-00-00' },
  tests: { dailyPass: '70', dailyDur: '10', annualPass: '80', annualDur: '60', dailyDeadline: '08:00', dailyAttempts: '3' },
  security: { twofa: true, minPwd: true, rotatePwd: false, audit: true },
};

function fromApi(raw) {
  return {
    general: {
      org:   raw.org_name      ?? DEFAULTS.general.org,
      email: raw.contact_email ?? DEFAULTS.general.email,
      phone: raw.contact_phone ?? DEFAULTS.general.phone,
    },
    tests: {
      dailyPass:     raw.daily_pass_pct      ?? DEFAULTS.tests.dailyPass,
      dailyDur:      raw.daily_duration_min  ?? DEFAULTS.tests.dailyDur,
      annualPass:    raw.annual_pass_pct     ?? DEFAULTS.tests.annualPass,
      annualDur:     raw.annual_duration_min ?? DEFAULTS.tests.annualDur,
      dailyDeadline: raw.daily_deadline      ?? DEFAULTS.tests.dailyDeadline,
      dailyAttempts: raw.daily_attempts      ?? DEFAULTS.tests.dailyAttempts,
    },
    security: {
      twofa:     raw.security_2fa      === 'true' ? true : (raw.security_2fa      === 'false' ? false : DEFAULTS.security.twofa),
      minPwd:    raw.security_min_pwd  === 'true' ? true : (raw.security_min_pwd  === 'false' ? false : DEFAULTS.security.minPwd),
      rotatePwd: raw.security_rotate   === 'true' ? true : (raw.security_rotate   === 'false' ? false : DEFAULTS.security.rotatePwd),
      audit:     raw.security_audit    === 'true' ? true : (raw.security_audit    === 'false' ? false : DEFAULTS.security.audit),
    },
  };
}

const AdminSettingsScreen = ({ onNav, onLogout }) => {
  const { categories: CATEGORIES } = useCategories();
  const { show: toast, ToastContainer } = useToast();
  const [tab, setTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [general, setGeneral] = useState(DEFAULTS.general);
  const [tests, setTests] = useState(DEFAULTS.tests);
  const [security, setSecurity] = useState(DEFAULTS.security);

  const [sections, setSections] = useState(['Участок № 1', 'Участок № 2', 'Участок № 3', 'Участок № 4']);
  const [positions, setPositions] = useState(['Электромонтёр', 'Слесарь-ремонтник', 'Сварщик', 'Слесарь КИПиА', 'Мастер участка', 'Мастер смены']);
  const [newSection, setNewSection] = useState('');
  const [newPosition, setNewPosition] = useState('');

  useEffect(() => {
    api.get('/settings')
      .then(raw => {
        const parsed = fromApi(raw);
        setGeneral(parsed.general);
        setTests(parsed.tests);
        setSecurity(parsed.security);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const saveGeneral = async () => {
    setSaving(true);
    try {
      await api.put('/settings', { org_name: general.org, contact_email: general.email, contact_phone: general.phone });
      toast('Настройки сохранены', 'ok');
    } catch { toast('Ошибка сохранения', 'bad'); }
    finally { setSaving(false); }
  };

  const saveTests = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        daily_pass_pct:      tests.dailyPass,
        daily_duration_min:  tests.dailyDur,
        annual_pass_pct:     tests.annualPass,
        annual_duration_min: tests.annualDur,
        daily_deadline:      tests.dailyDeadline,
        daily_attempts:      tests.dailyAttempts,
      });
      toast('Параметры тестов сохранены', 'ok');
    } catch { toast('Ошибка сохранения', 'bad'); }
    finally { setSaving(false); }
  };

  const saveSecurity = async () => {
    setSaving(true);
    try {
      await api.put('/settings', {
        security_2fa:     String(security.twofa),
        security_min_pwd: String(security.minPwd),
        security_rotate:  String(security.rotatePwd),
        security_audit:   String(security.audit),
      });
      toast('Параметры безопасности сохранены', 'ok');
    } catch { toast('Ошибка сохранения', 'bad'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'general',      l: 'Общие' },
    { id: 'tests',        l: 'Параметры тестов' },
    { id: 'categories',   l: 'Категории' },
    { id: 'sections',     l: 'Участки и должности' },
    { id: 'integrations', l: 'Интеграции' },
    { id: 'security',     l: 'Безопасность' },
  ];

  return (
    <AdminLayout active="settings" onNav={onNav} onLogout={onLogout} title="Настройки" subtitle="Конфигурация системы">

      <Card padding={0}>
        <div style={{ display: 'flex', borderBottom: '1px solid #EEF1F6', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              style={{
                padding: '14px 20px', border: 'none', background: 'transparent',
                color: tab === t.id ? '#1B4B7A' : '#475060',
                borderBottom: `3px solid ${tab === t.id ? '#1B4B7A' : 'transparent'}`,
                fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t.id ? 600 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 140ms ease',
              }}>{t.l}</button>
          ))}
        </div>
        <div style={{ padding: 28 }}>
          {tab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Название организации
                <input value={general.org} onChange={e => setGeneral(p => ({ ...p, org: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Контактный e-mail
                <input value={general.email} onChange={e => setGeneral(p => ({ ...p, email: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Телефон поддержки
                <input value={general.phone} onChange={e => setGeneral(p => ({ ...p, phone: e.target.value }))} style={{ padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
              </label>
              <Button onClick={saveGeneral} loading={saving}>Сохранить</Button>
            </div>
          )}
          {tab === 'tests' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 720 }}>
              {[
                { t: 'Ежедневная — проходной балл', key: 'dailyPass', u: '%' },
                { t: 'Ежедневная — длительность',   key: 'dailyDur',  u: 'мин' },
                { t: 'Ежегодная — проходной балл',  key: 'annualPass', u: '%' },
                { t: 'Ежегодная — длительность',    key: 'annualDur',  u: 'мин' },
                { t: 'Ежедневная — крайний срок',   key: 'dailyDeadline', u: '' },
                { t: 'Кол-во попыток ежедневной',   key: 'dailyAttempts', u: 'раза' },
              ].map((s, i) => (
                <label key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  {s.t}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={tests[s.key]} onChange={e => setTests(p => ({ ...p, [s.key]: e.target.value }))} style={{ flex: 1, padding: '10px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' }}/>
                    {s.u && <span style={{ fontSize: 13, color: '#5B6778' }}>{s.u}</span>}
                  </div>
                </label>
              ))}
              <div style={{ gridColumn: '1 / -1' }}><Button onClick={saveTests} loading={saving}>Сохранить</Button></div>
            </div>
          )}
          {tab === 'categories' && (
            <div>
              <div style={{ fontSize: 13, color: '#475060', marginBottom: 14 }}>Управление направлениями проверки.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CATEGORIES.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: c.color }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#5B6778' }}>id: {c.id}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast(`Редактор категории «${c.name}»: доступен только через конфиг`, 'info')}>Изменить</Button>
                  </div>
                ))}
              </div>
              <Button style={{ marginTop: 14 }} onClick={() => toast('Добавление категорий: доступно через конфиг categories.js', 'info')}>Добавить направление</Button>
            </div>
          )}
          {tab === 'sections' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 12px' }}>Участки</h4>
                {sections.map(s => (
                  <div key={s} style={{ padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    {s}
                    <Button variant="danger" size="sm" onClick={() => { setSections(prev => prev.filter(x => x !== s)); toast('Участок удалён', 'ok'); }}>Удалить</Button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder="Название участка" style={{ flex: 1, padding: '8px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 13 }}/>
                  <Button size="sm" onClick={() => { if (!newSection.trim()) return; setSections(prev => [...prev, newSection]); setNewSection(''); toast('Участок добавлен', 'ok'); }}>Добавить</Button>
                </div>
              </div>
              <div>
                <h4 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 12px' }}>Должности</h4>
                {positions.map(s => (
                  <div key={s} style={{ padding: '10px 14px', border: '1px solid #E4E8EF', borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    {s}
                    <Button variant="danger" size="sm" onClick={() => { setPositions(prev => prev.filter(x => x !== s)); toast('Должность удалена', 'ok'); }}>Удалить</Button>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="Название должности" style={{ flex: 1, padding: '8px 12px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 13 }}/>
                  <Button size="sm" onClick={() => { if (!newPosition.trim()) return; setPositions(prev => [...prev, newPosition]); setNewPosition(''); toast('Должность добавлена', 'ok'); }}>Добавить</Button>
                </div>
              </div>
            </div>
          )}
          {tab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { t: '1С: Зарплата и Управление Персоналом', d: 'Синхронизация табельных номеров и должностей', s: 'pending' },
                { t: 'Active Directory', d: 'Единый вход через корпоративный AD', s: 'connected' },
                { t: 'Кадровая система ВТС', d: 'Импорт штатного расписания и приказов', s: 'pending' },
                { t: 'API внешних систем', d: 'REST API для интеграций', s: 'connected' },
              ].map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 18px', border: '1px solid #E4E8EF', borderRadius: 10, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="settings" size={20} color="#1B4B7A"/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{it.t}</div>
                    <div style={{ fontSize: 12, color: '#5B6778' }}>{it.d}</div>
                  </div>
                  <Chip tone={it.s === 'connected' ? 'ok' : 'neutral'}>{it.s === 'connected' ? 'Подключено' : 'Не подключено'}</Chip>
                  <Button variant="ghost" size="sm" onClick={() => toast(`${it.t}: настройки интеграции`, 'info')}>{it.s === 'connected' ? 'Настройки' : 'Подключить'}</Button>
                </div>
              ))}
            </div>
          )}
          {tab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
              {[
                { key: 'twofa',     title: 'Двухфакторная аутентификация для админов', desc: 'SMS-код или приложение-аутентификатор' },
                { key: 'minPwd',    title: 'Минимум 8 символов в пароле', desc: 'Цифры + буквы + спецсимвол' },
                { key: 'rotatePwd', title: 'Принудительная смена пароля каждые 90 дней', desc: 'Для всех ролей кроме «слушатель»' },
                { key: 'audit',     title: 'Лог всех изменений базы вопросов (audit)', desc: '' },
              ].map(item => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: '1px solid #E4E8EF', borderRadius: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={security[item.key]} onChange={e => setSecurity(p => ({ ...p, [item.key]: e.target.checked }))}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
                    {item.desc && <div style={{ fontSize: 12, color: '#5B6778' }}>{item.desc}</div>}
                  </div>
                </label>
              ))}
              <Button onClick={saveSecurity} loading={saving}>Сохранить</Button>
            </div>
          )}
        </div>
      </Card>
      <ToastContainer />
    </AdminLayout>
  );
};

export default AdminSettingsScreen;
