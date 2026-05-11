import Icon from '../components/Icon.jsx';
import { Button, Card, Sidebar, BottomNav, Chip, Alert, useToast } from '../components/Primitives.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SafetyProtocolScreen = ({ protocol, onStartTest, onBack, onNav, onLogout }) => {
  const { user } = useAuth();
  const { show: toast, ToastContainer } = useToast();
  if (!user || !protocol) return null;
  const tones = { bad: { bg: '#FBECEC', fg: '#B8242D', border: '#F2CFD1' }, warn: { bg: '#FDF4E7', fg: '#C77A0F', border: '#F2DEB6' } };
  const t = tones[protocol.tone];

  return (
    <div className="s-dashboard" style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F7F9FC', color: '#1A2332' }}>
      <Sidebar active="safe" user={{ name: user.fullName.split(' ').slice(0, 2).join(' '), id: user.tabNumber }} onNav={onNav} />
      <main className="s-main" style={{ flex: 1, padding: '28px 40px 60px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
          <Button variant="ghost" size="sm" icon="chevron" onClick={onBack} style={{ flexDirection: 'row-reverse' }}>К каталогу</Button>
          <Button variant="ghost" icon="logout" onClick={onLogout}>Выход</Button>
        </header>

        {/* Hero */}
        <Card padding={32} style={{ borderTop: `4px solid ${t.fg}`, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: t.bg, color: t.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={protocol.icon} size={32} color={t.fg}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: t.fg }}>Смертельная опасность</span>
                <Chip tone={protocol.status === 'done' ? 'ok' : 'neutral'}>{protocol.status === 'done' ? 'Пройдено' : 'Не пройдено'}</Chip>
              </div>
              <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: '0 0 10px' }}>{protocol.title}</h1>
              <p style={{ fontSize: 15, color: '#475060', lineHeight: 1.6, margin: 0 }}>{protocol.short}</p>
            </div>
          </div>
        </Card>

        <Alert tone={protocol.tone} title="Что является смертельной опасностью" description="Игнорирование любого из перечисленных правил может привести к необратимой травме или гибели. Соблюдение всех требований обязательно для каждого работника независимо от стажа." />

        {/* Правила */}
        <div className="s-card-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginTop: 20 }}>
          <Card padding={28}>
            <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 18px' }}>Ключевые правила</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {protocol.rules.map((r, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#F7F9FC', borderRadius: 10, fontSize: 14, lineHeight: 1.5 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 999, background: t.fg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700 }}>{i + 1}</div>
                  <span style={{ flex: 1 }}>{r}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div>
            {/* Видео-инструктаж */}
            <Card padding={0} style={{ marginBottom: 16 }}>
              <div style={{ aspectRatio: '16/9', background: `linear-gradient(135deg, ${t.bg}, #fff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '12px 12px 0 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(26,35,50,.1)' }}>
                  <Icon name="play" size={24} color={t.fg}/>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 4 }}>Видео-инструктаж</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Безопасные методы работ — 8 минут</div>
              </div>
            </Card>

            {/* Документы */}
            <Card padding={0} style={{ marginBottom: 16 }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #EEF1F6', fontSize: 13, fontWeight: 700, color: '#5B6778', textTransform: 'uppercase', letterSpacing: '.06em' }}>Документы</div>
              {[
                { t: 'Инструкция по охране труда.pdf', s: '0.8 МБ' },
                { t: 'Чек-лист безопасности.pdf', s: '0.3 МБ' },
              ].map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: i === 1 ? 'none' : '1px solid #EEF1F6' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: '#FBECEC', color: '#B8242D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, fontWeight: 700 }}>PDF</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.t}</div>
                  </div>
                  <Button variant="ghost" size="sm" icon="download" onClick={() => toast('Протокол добавлен в загрузки', 'info')}/>
                </div>
              ))}
            </Card>

            {/* Тест */}
            <Card padding={20} style={{ borderTop: '4px solid #1F7A3D' }}>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, margin: '0 0 6px' }}>Пройдите проверку</h3>
              <p style={{ fontSize: 13, color: '#475060', margin: '0 0 14px' }}>5 вопросов · проходной балл 80%</p>
              <Button variant="success" fullWidth iconRight="arrow" onClick={() => onStartTest && onStartTest(protocol)}>Начать тест</Button>
            </Card>
          </div>
        </div>
      </main>
      <BottomNav active="home" onNav={onNav} />
      <ToastContainer />
    </div>
  );
};

export default SafetyProtocolScreen;
