import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, TopBar } from '../components/Primitives.jsx';
import { api } from '../api/client.js';

const ForgotPasswordScreen = ({ onLogin, onHome, onAbout, onCenter, onDocs }) => {
  const [tab, setTab] = useState('employee');
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (v) => {
    if (!v) return 'Поле обязательно';
    if (tab === 'employee' && !/^\d{3,8}$/.test(v)) return 'Только цифры (3–8 знаков)';
    if (tab === 'study' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Некорректный e-mail';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate(val);
    setErr(e2);
    if (e2) return;
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password', {
        identifier: val,
        type: tab,
      });
    } catch {
      // Always show success — backend never reveals whether account exists
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '13px 14px',
    border: `1px solid ${err ? '#B8242D' : '#E4E8EF'}`,
    borderRadius: 8, fontFamily: 'inherit', fontSize: 16,
    minHeight: 48, outline: 'none',
  };

  return (
    <div style={{ background: '#F7F9FC', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
      <TopBar onLogin={onLogin} onHome={onHome} onAbout={onAbout} onCenter={onCenter} onDocs={onDocs} />
      <section style={{ padding: '60px 40px' }}>
        <Card padding={36} style={{ maxWidth: 480, margin: '0 auto' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 18, background: '#EAF5EE', color: '#1F7A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Icon name="check" size={40} color="#1F7A3D" />
              </div>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 12px' }}>Ссылка отправлена</h2>
              <p style={{ fontSize: 14, color: '#475060', lineHeight: 1.6, margin: '0 0 24px' }}>
                Если {tab === 'employee' ? 'табельный номер' : 'e-mail'} <strong>{val}</strong> зарегистрирован — придёт сообщение с инструкциями для смены пароля.
              </p>
              <Button variant="primary" iconRight="arrow" onClick={onLogin}>Вернуться ко входу</Button>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 24, margin: '0 0 8px' }}>Восстановление пароля</h2>
              <p style={{ fontSize: 14, color: '#475060', margin: '0 0 24px' }}>Укажите ваш {tab === 'employee' ? 'табельный номер' : 'e-mail'} — пришлём инструкции по сбросу.</p>

              <div style={{ display: 'flex', background: '#EEF1F6', borderRadius: 10, padding: 4, marginBottom: 24 }}>
                {[{id:'employee',l:'Сотрудник ВТС'},{id:'study',l:'Учебный центр'}].map(t => (
                  <button key={t.id} type="button" onClick={() => { setTab(t.id); setVal(''); setErr(''); }}
                    style={{
                      flex: 1, padding: '10px 14px', border: 'none', borderRadius: 8,
                      fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      background: tab === t.id ? '#fff' : 'transparent',
                      color: tab === t.id ? '#1A2332' : '#475060',
                      boxShadow: tab === t.id ? '0 2px 8px rgba(26,35,50,.05)' : 'none',
                      transition: 'all 180ms ease',
                    }}>{t.l}</button>
                ))}
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                  {tab === 'employee' ? 'Табельный номер' : 'E-mail'}
                  <input value={val} onChange={(e) => { setVal(e.target.value); if (err) setErr(''); }}
                    onBlur={() => setErr(validate(val))} aria-invalid={!!err}
                    inputMode={tab === 'employee' ? 'numeric' : 'email'} style={inputStyle} />
                  {err && <div role="alert" style={{ fontSize: 12, color: '#B8242D', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="alert" size={12} color="#B8242D"/>{err}
                  </div>}
                </label>
                <Button type="submit" size="lg" fullWidth loading={submitting} iconRight={submitting ? undefined : 'arrow'}>
                  {submitting ? 'Отправка…' : 'Отправить ссылку'}
                </Button>
                <div style={{ marginTop: 16, fontSize: 13, color: '#475060', textAlign: 'center' }}>
                  Вспомнили пароль? <a href="#" onClick={(e)=>{e.preventDefault(); onLogin && onLogin();}} style={{ color: '#1B4B7A', fontWeight: 500 }}>Войти</a>
                </div>
              </form>
            </>
          )}
        </Card>
      </section>
    </div>
  );
};

export default ForgotPasswordScreen;
