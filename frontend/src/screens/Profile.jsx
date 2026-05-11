import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, useToast } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

const ProfileScreen = ({ onBack, onNav, onLogout }) => {
  const { user } = useAuth();
  const { show: toast, ToastContainer } = useToast();
  if (!user) return null;
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const pf = (field) => (e) => setPwdForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSavePwd = async () => {
    if (!pwdForm.current || !pwdForm.next) { toast('Заполните все поля', 'bad'); return; }
    if (pwdForm.next !== pwdForm.confirm) { toast('Пароли не совпадают', 'bad'); return; }
    if (pwdForm.next.length < 4) { toast('Минимум 4 символа', 'bad'); return; }
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: pwdForm.current, new_password: pwdForm.next });
      setShowPwd(false);
      setPwdForm({ current: '', next: '', confirm: '' });
      toast('Пароль успешно изменён', 'ok');
    } catch (e) {
      toast(e.message || 'Неверный текущий пароль', 'bad');
    } finally {
      setPwdSaving(false);
    }
  };

  const annualOverdue = (user.annualDueDays ?? 999) < 0;
  const medOverdue = (user.medicalDueDays ?? 999) < 0;

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="profile" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header className="s-main-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ marginBottom: 12, flexDirection: 'row-reverse' }}>В кабинет</Button>
            <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Профиль</h1>
          </div>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 24 }}>
          {/* Карта пользователя */}
          <Card padding={28} style={{ borderTop: '4px solid #1B4B7A' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 96, height: 96, borderRadius: 999, background: 'linear-gradient(135deg, #1B4B7A, #0F2D4A)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, marginBottom: 18 }}>
                {user.initials}
              </div>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 22, margin: 0 }}>{user.fullName}</h2>
              <div style={{ fontSize: 14, color: '#475060', marginTop: 6 }}>{user.position}</div>
              <div style={{ fontSize: 13, color: '#5B6778', marginTop: 2 }}>{user.section} · Таб. № {user.tabNumber}</div>
              {user.accessGroup && <div style={{ marginTop: 14 }}><Chip tone="info">Группа допуска {user.accessGroup}</Chip></div>}
            </div>
          </Card>

          {/* Контакты */}
          <Card padding={28}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: '0 0 16px' }}>Контактные данные</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="bell" size={18} color="#1B4B7A"/>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#5B6778' }}>Телефон</div>
                  <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{user.phone || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="user" size={18} color="#1B4B7A"/>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#5B6778' }}>E-mail</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{user.email || '—'}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid #EEF1F6' }}>
              <Button variant="ghost" size="sm" onClick={() => toast('Редактирование контактов: обратитесь в отдел кадров', 'info')}>Изменить</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowPwd(true)}>Изменить пароль</Button>
            </div>
          </Card>
        </div>

        {/* Сроки и допуски */}
        <Card padding={0} style={{ marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Сроки и допуски</h3>
          </div>
          <div>
            {[
              { ic: 'target',    t: 'Ежегодная проверка знаний', d: user.annualDueDays !== undefined ? (annualOverdue ? `Просрочена на ${Math.abs(user.annualDueDays)} дней` : `Через ${user.annualDueDays} дней`) : '—', tone: annualOverdue ? 'bad' : (user.annualDueDays ?? 999) <= 14 ? 'warn' : 'ok' },
              { ic: 'help',      t: 'Медицинский осмотр',         d: user.medicalDueDays !== undefined ? (medOverdue ? `Просрочен на ${Math.abs(user.medicalDueDays)} дней` : `Через ${user.medicalDueDays} дней`) : '—', tone: medOverdue ? 'bad' : (user.medicalDueDays ?? 999) <= 7 ? 'warn' : 'ok' },
              { ic: 'shield',    t: 'Группа допуска по электробезопасности', d: user.accessGroup ? `Группа ${user.accessGroup}` : '—', tone: 'info' },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', borderBottom: i === 2 ? 'none' : '1px solid #EEF1F6' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={x.ic} size={18} color="#1B4B7A"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#5B6778' }}>{x.t}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{x.d}</div>
                </div>
                <Chip tone={x.tone}>{x.tone === 'ok' ? 'В норме' : x.tone === 'warn' ? 'Скоро истекает' : x.tone === 'bad' ? 'Просрочено' : 'Активно'}</Chip>
              </div>
            ))}
          </div>
        </Card>

        {/* Достижения */}
        {user.achievements?.length > 0 && (
          <Card padding={0}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF1F6' }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: 0 }}>Достижения и сертификаты</h3>
            </div>
            <div style={{ padding: '8px 0' }}>
              {user.achievements.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 24px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EAF5EE', color: '#1F7A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={18} color="#1F7A3D"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.t}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{a.d}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Modal: смена пароля */}
        {showPwd && (
          <div onClick={() => setShowPwd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,45,74,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%' }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 16px' }}>Изменить пароль</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input type="password" value={pwdForm.current} onChange={pf('current')} placeholder="Текущий пароль" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 15 }}/>
                <input type="password" value={pwdForm.next} onChange={pf('next')} placeholder="Новый пароль" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 15 }}/>
                <input type="password" value={pwdForm.confirm} onChange={pf('confirm')} placeholder="Повторите пароль" style={{ padding: '12px 14px', border: '1px solid #E4E8EF', borderRadius: 8, fontSize: 15 }}/>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <Button variant="ghost" onClick={() => setShowPwd(false)}>Отмена</Button>
                <Button loading={pwdSaving} onClick={handleSavePwd}>Сохранить</Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNav active="home" onNav={onNav} />
      <ToastContainer />
    </div>
  );
};

export default ProfileScreen;
