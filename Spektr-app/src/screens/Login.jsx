import { useState } from 'react';
import { Button, LOGO_WHITE } from '../components/Primitives.jsx';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LoginScreen = ({ onEnter, onBack, onForgotPassword, onRegister }) => {
  const { login } = useAuth();
  const [tab, setTab] = useState('employee');
  const [showPwd, setShowPwd] = useState(false);
  const [idValue, setIdValue] = useState(tab === 'employee' ? '48213' : 'ivanov@vts.kz');
  const [pwdValue, setPwdValue] = useState('');
  const [idErr, setIdErr] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchTab = (id) => {
    setTab(id);
    setIdValue(id === 'employee' ? '48213' : 'ivanov@vts.kz');
    setIdErr(''); setPwdErr('');
  };

  // Inline validation per UX guideline "Validate on blur" (severity: medium)
  const validateId = (val) => {
    if (!val) return 'Поле обязательно';
    if (tab === 'employee' && !/^\d{3,8}$/.test(val)) return 'Только цифры (3–8 знаков)';
    if (tab === 'study' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Некорректный e-mail';
    return '';
  };
  const validatePwd = (val) => (!val ? 'Поле обязательно' : val.length < 4 ? 'Минимум 4 символа' : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eId = validateId(idValue);
    const eP = validatePwd(pwdValue);
    setIdErr(eId); setPwdErr(eP);
    if (eId || eP) return;
    setSubmitting(true);
    try {
      const u = await login(idValue, pwdValue);
      onEnter && onEnter(u);
    } catch (err) {
      setPwdErr(err.message || 'Неверный логин или пароль');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = (err) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '13px 14px',
    border: `1px solid ${err ? '#B8242D' : '#E4E8EF'}`,
    borderRadius: 8, fontFamily: 'inherit', fontSize: 16, color: '#1A2332',
    minHeight: 48, outline: 'none',
    transition: 'border-color 140ms ease, box-shadow 140ms ease',
  });

  const errorMsgStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: '#B8242D', marginTop: 4, fontWeight: 500,
  };

  return (
    <div className="s-login" style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: 'Inter, sans-serif', color: '#1A2332', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left brand panel */}
      <div className="s-login-left" style={{ background: 'linear-gradient(160deg, #1B4B7A 0%, #0F2D4A 100%)', color: '#fff', padding: '48px 56px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'><polygon points='40,2 76,23 76,69 40,90 4,69 4,23' fill='none' stroke='white' stroke-width='1.5' opacity='0.08'/></svg>")`, backgroundSize: '80px 92px' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={onBack}>
          <img src={LOGO_WHITE} className="s-login-logo" style={{ height: 40 }} alt=""/>
        </div>
        <div style={{ marginTop: 'auto', position: 'relative' }}>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0, color: '#fff' }}>Вход в корпоративный портал</h1>
          <p className="s-login-left-sub" style={{ fontSize: 16, color: '#C7DAEB', lineHeight: 1.6, marginTop: 16, maxWidth: 440 }}>Используйте табельный номер для входа как сотрудник ВТС или зарегистрируйтесь во внешнем Учебном центре.</p>

          {/* Trust signals (UI/UX Pro Max: "Trust & Authority" style for enterprise login) */}
          <div className="s-login-trust" style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
            {[
              { ic: 'shield', t: 'Защищённое соединение' },
              { ic: 'users', t: '1 247 пользователей' },
              { ic: 'check', t: 'ISO 27001' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#C7DAEB', fontWeight: 500 }}>
                <Icon name={s.ic} size={14} color="#A8C0D6"/>{s.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="s-login-right" style={{ padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', background: '#EEF1F6', borderRadius: 10, padding: 4, marginBottom: 32 }}>
            {[{id:'employee',l:'Сотрудник ВТС'},{id:'study',l:'Учебный центр'}].map(t=>(
              <button key={t.id} type="button" onClick={()=>switchTab(t.id)} style={{ flex:1, padding:'10px 14px', border:'none', borderRadius:8, fontFamily:'inherit', fontSize:13, fontWeight:600, cursor:'pointer', background: tab===t.id?'#fff':'transparent', color: tab===t.id?'#1A2332':'#475060', boxShadow: tab===t.id?'0 2px 8px rgba(26,35,50,.05)':'none', transition: 'all 180ms ease' }}>{t.l}</button>
            ))}
          </div>
          <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 28, margin: '0 0 8px' }}>{tab==='employee'?'Вход по табельному номеру':'Вход для внешнего слушателя'}</h2>
          <p style={{ fontSize: 14, color: '#475060', margin: '0 0 28px' }}>{tab==='employee'?'Данные выдаёт мастер участка или отдел кадров.':'Зарегистрируйтесь или войдите по e-mail.'}</p>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit} noValidate>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
              {tab==='employee'?'Табельный номер':'E-mail'}
              <input
                value={idValue}
                onChange={e => { setIdValue(e.target.value); if (idErr) setIdErr(''); }}
                onBlur={e => setIdErr(validateId(e.target.value))}
                aria-invalid={!!idErr}
                aria-describedby={idErr ? 'id-err' : undefined}
                inputMode={tab === 'employee' ? 'numeric' : 'email'}
                autoComplete={tab === 'employee' ? 'username' : 'email'}
                style={inputBase(idErr)}
              />
              {idErr && <div id="id-err" role="alert" style={errorMsgStyle}><Icon name="alert" size={14} color="#B8242D"/>{idErr}</div>}
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
              Пароль
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwdValue}
                  onChange={e => { setPwdValue(e.target.value); if (pwdErr) setPwdErr(''); }}
                  onBlur={e => setPwdErr(validatePwd(e.target.value || '••••'))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!pwdErr}
                  aria-describedby={pwdErr ? 'pwd-err' : undefined}
                  style={{ ...inputBase(pwdErr), paddingRight: 46 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Скрыть пароль' : 'Показать пароль'}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer',
                    color: '#475060', transition: 'background 140ms ease, color 140ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F7F9FC'; e.currentTarget.style.color = '#1A2332'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475060'; }}
                >
                  <Icon name={showPwd ? 'eye-off' : 'eye'} size={18}/>
                </button>
              </div>
              {pwdErr && <div id="pwd-err" role="alert" style={errorMsgStyle}><Icon name="alert" size={14} color="#B8242D"/>{pwdErr}</div>}
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475060' }}><input type="checkbox" defaultChecked/> Запомнить меня</label>
              <a href="#" onClick={(e) => { e.preventDefault(); onForgotPassword && onForgotPassword(); }} style={{ color: '#1B4B7A', textDecoration: 'none', fontWeight: 500 }}>Забыли пароль?</a>
            </div>
            <Button
              type="submit"
              size="lg"
              variant={tab==='employee'?'primary':'success'}
              fullWidth
              iconRight={submitting ? undefined : 'arrow'}
              loading={submitting}
            >
              {submitting ? 'Проверка...' : 'Войти'}
            </Button>
            {tab==='study' && !submitting && <Button size="lg" variant="secondary" fullWidth onClick={onRegister}>Зарегистрироваться</Button>}
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
