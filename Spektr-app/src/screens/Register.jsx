import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, TopBar } from '../components/Primitives.jsx';
import { api } from '../api/client.js';

// Регистрация во внешнем Учебном центре — 1 шаг + экран успеха
const RegisterScreen = ({ onLogin, onHome, onEnter, onAbout, onCenter, onDocs }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', dob: '', email: '', phone: '',
    org: '', position: '', direction: '', password: '', password2: '',
    consent: false,
  });
  const [errors, setErrors] = useState({});

  const validators = {
    fullName: (v) => !v ? 'Введите ФИО' : v.split(' ').length < 2 ? 'Укажите хотя бы имя и фамилию' : '',
    dob:      (v) => !v ? 'Укажите дату рождения' : '',
    email:    (v) => !v ? 'Введите e-mail' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Некорректный e-mail' : '',
    phone:    (v) => !v ? 'Введите телефон' : !/^[+0-9\s()-]{7,}$/.test(v) ? 'Некорректный номер' : '',
    org:      (v) => !v ? 'Укажите организацию' : '',
    position: (v) => !v ? 'Укажите должность' : '',
    direction:(v) => !v ? 'Выберите направление' : '',
    password: (v) => v.length < 8 ? 'Минимум 8 символов' : '',
    password2:(v, all) => v !== all.password ? 'Пароли не совпадают' : '',
    consent:  (v) => !v ? 'Требуется согласие' : '',
  };

  const validateField = (name, value) => {
    const fn = validators[name];
    if (!fn) return '';
    return fn(value, { ...form, [name]: value });
  };

  const validateAll = () => {
    const e = {};
    Object.keys(validators).forEach(k => {
      const v = form[k];
      const err = validateField(k, v);
      if (err) e[k] = err;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleBlur = (name) => {
    const err = validateField(name, form[name]);
    setErrors(e => ({ ...e, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    setSubmitting(true);
    try {
      await api.post('/auth/register', {
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        position: form.position,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors(prev => ({ ...prev, email: err.message || 'Ошибка регистрации. Попробуйте снова.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = (err) => ({
    width: '100%', boxSizing: 'border-box',
    padding: '12px 14px',
    border: `1px solid ${err ? '#B8242D' : '#E4E8EF'}`,
    borderRadius: 8, fontFamily: 'inherit', fontSize: 15, color: '#1A2332',
    minHeight: 48, outline: 'none',
    background: '#fff',
    transition: 'border-color 140ms ease, box-shadow 140ms ease',
  });

  const errorMsg = (err) => err && (
    <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#B8242D', marginTop: 4, fontWeight: 500 }}>
      <Icon name="alert" size={12} color="#B8242D"/>{err}
    </div>
  );

  if (submitted) {
    return (
      <div style={{ background: '#F7F9FC', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
        <TopBar onLogin={onLogin} onHome={onHome} onAbout={onAbout} onCenter={onCenter} onDocs={onDocs} />
        <section style={{ padding: '80px 40px' }}>
          <Card padding={48} style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', borderTop: '4px solid #1F7A3D' }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: '#EAF5EE', color: '#1F7A3D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Icon name="check" size={40} color="#1F7A3D" />
            </div>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 28, margin: '0 0 12px' }}>Заявка отправлена</h1>
            <p style={{ fontSize: 15, color: '#475060', lineHeight: 1.6, margin: '0 0 24px' }}>
              Мы выслали инструкции на <strong>{form.email}</strong>. Менеджер свяжется в течение рабочего дня.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button variant="success" iconRight="arrow" onClick={onEnter}>Войти в кабинет</Button>
              <Button variant="ghost" onClick={onHome}>На главную</Button>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div style={{ background: '#F7F9FC', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
      <TopBar onLogin={onLogin} onHome={onHome} onAbout={onAbout} onCenter={onCenter} onDocs={onDocs} />
      <section style={{ padding: '40px 40px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Button variant="ghost" size="sm" icon="chevron" onClick={onHome} style={{ marginBottom: 16, flexDirection: 'row-reverse' }}>На главную</Button>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1F7A3D', marginBottom: 12 }}>Учебный центр</div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 8px' }}>Регистрация слушателя</h1>
          <p style={{ fontSize: 15, color: '#475060', margin: '0 0 32px' }}>Заполните анкету. Поля со звёздочкой обязательны.</p>

          <Card padding={32}>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* ФИО */}
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                ФИО полностью <span style={{ color: '#B8242D' }}>*</span>
                <input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} onBlur={() => handleBlur('fullName')}
                  aria-invalid={!!errors.fullName} placeholder="Ахметов Канат Маратович"
                  autoComplete="name" style={inputBase(errors.fullName)} />
                {errorMsg(errors.fullName)}
              </label>

              {/* Дата + email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Дата рождения <span style={{ color: '#B8242D' }}>*</span>
                  <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} onBlur={() => handleBlur('dob')}
                    aria-invalid={!!errors.dob} style={inputBase(errors.dob)} />
                  {errorMsg(errors.dob)}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  E-mail <span style={{ color: '#B8242D' }}>*</span>
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} onBlur={() => handleBlur('email')}
                    aria-invalid={!!errors.email} placeholder="ivanov@mail.kz"
                    autoComplete="email" inputMode="email" style={inputBase(errors.email)} />
                  {errorMsg(errors.email)}
                </label>
              </div>

              {/* Телефон + Орг */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Телефон <span style={{ color: '#B8242D' }}>*</span>
                  <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} onBlur={() => handleBlur('phone')}
                    aria-invalid={!!errors.phone} placeholder="+7 (___) ___-__-__"
                    autoComplete="tel" inputMode="tel" style={inputBase(errors.phone)} />
                  {errorMsg(errors.phone)}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Организация <span style={{ color: '#B8242D' }}>*</span>
                  <input value={form.org} onChange={(e) => handleChange('org', e.target.value)} onBlur={() => handleBlur('org')}
                    aria-invalid={!!errors.org} placeholder="ТОО «Пример»"
                    autoComplete="organization" style={inputBase(errors.org)} />
                  {errorMsg(errors.org)}
                </label>
              </div>

              {/* Должность + Направление */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Должность <span style={{ color: '#B8242D' }}>*</span>
                  <input value={form.position} onChange={(e) => handleChange('position', e.target.value)} onBlur={() => handleBlur('position')}
                    aria-invalid={!!errors.position} placeholder="Электромонтёр"
                    autoComplete="organization-title" style={inputBase(errors.position)} />
                  {errorMsg(errors.position)}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Направление обучения <span style={{ color: '#B8242D' }}>*</span>
                  <select value={form.direction} onChange={(e) => handleChange('direction', e.target.value)} onBlur={() => handleBlur('direction')}
                    aria-invalid={!!errors.direction} style={{...inputBase(errors.direction), background: '#fff'}}>
                    <option value="">Выберите…</option>
                    <option>Электробезопасность</option>
                    <option>Охрана труда</option>
                    <option>Пожарная безопасность</option>
                    <option>Работы на высоте</option>
                    <option>Грузоподъёмные работы</option>
                    <option>Первая помощь</option>
                  </select>
                  {errorMsg(errors.direction)}
                </label>
              </div>

              {/* Пароль */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Пароль <span style={{ color: '#B8242D' }}>*</span>
                  <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} onBlur={() => handleBlur('password')}
                    aria-invalid={!!errors.password} placeholder="Минимум 8 символов"
                    autoComplete="new-password" style={inputBase(errors.password)} />
                  {errorMsg(errors.password)}
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                  Повторите пароль <span style={{ color: '#B8242D' }}>*</span>
                  <input type="password" value={form.password2} onChange={(e) => handleChange('password2', e.target.value)} onBlur={() => handleBlur('password2')}
                    aria-invalid={!!errors.password2}
                    autoComplete="new-password" style={inputBase(errors.password2)} />
                  {errorMsg(errors.password2)}
                </label>
              </div>

              {/* Consent */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#475060', padding: '8px 0' }}>
                <input type="checkbox" checked={form.consent} onChange={(e) => handleChange('consent', e.target.checked)} onBlur={() => handleBlur('consent')}
                  style={{ marginTop: 3 }} />
                <span>Я согласен на обработку персональных данных в соответствии с Положением о защите данных НТЦ «Востоктехносервис».</span>
              </label>
              {errorMsg(errors.consent)}

              <Button type="submit" size="lg" variant="success" fullWidth loading={submitting} iconRight={submitting ? undefined : 'arrow'}>
                {submitting ? 'Отправка…' : 'Зарегистрироваться'}
              </Button>
              <div style={{ fontSize: 13, color: '#475060', textAlign: 'center' }}>
                Уже зарегистрированы? <a href="#" onClick={(e)=>{e.preventDefault(); onLogin && onLogin();}} style={{ color: '#1B4B7A', fontWeight: 500 }}>Войти</a>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default RegisterScreen;
