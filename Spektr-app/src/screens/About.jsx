import Icon from '../components/Icon.jsx';
import { Button, Card, TopBar } from '../components/Primitives.jsx';

// «О системе» — расшифровка СПЕКТР, для кого, возможности, безопасность данных
const AboutScreen = ({ onLogin, onStudy, onHome, onAbout, onCenter, onDocs }) => (
  <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
    <TopBar onLogin={onLogin} onRegister={onStudy} onHome={onHome} onAbout={onAbout} onCenter={onCenter} onDocs={onDocs} />

    {/* Hero */}
    <section style={{ padding: '72px 40px 56px', background: 'linear-gradient(180deg, #F7F9FC 0%, #fff 100%)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 14 }}>О системе</div>
        <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 52, lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 24px', maxWidth: 900 }}>
          СПЕКТР — <span style={{ color: '#1B4B7A' }}>С</span>истема <span style={{ color: '#1B4B7A' }}>П</span>роверки <span style={{ color: '#1B4B7A' }}>Е</span>диных <span style={{ color: '#1B4B7A' }}>К</span>омпетенций и <span style={{ color: '#1B4B7A' }}>Т</span>естирования <span style={{ color: '#1B4B7A' }}>Р</span>аботников
        </h1>
        <p style={{ fontSize: 18, color: '#475060', lineHeight: 1.6, margin: 0, maxWidth: 760 }}>
          Промышленный портал для НТЦ «Востоктехносервис», который заменяет Excel-таблицы и бумажные журналы единым цифровым контуром проверки знаний.
        </p>
      </div>
    </section>

    {/* Для кого */}
    <section style={{ padding: '64px 40px', background: '#F7F9FC' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 36px' }}>Для кого СПЕКТР</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="s-feature-grid">
          {[
            { ic: 'user',     t: 'Сотрудники предприятия',          d: 'Электромонтёры, слесари, сварщики, операторы. Ежедневный допуск к смене и ежегодная аттестация.' },
            { ic: 'users',    t: 'ИТР и мастера',                   d: 'Контроль участка, оперативное реагирование на просрочки, отчётность.' },
            { ic: 'graduation', t: 'Внешние слушатели',             d: 'Курсы повышения квалификации с удостоверениями государственного образца.' },
          ].map((x,i) => (
            <Card key={i} padding={28}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon name={x.ic} size={24} color="#1B4B7A" />
              </div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>{x.t}</h3>
              <p style={{ fontSize: 14, color: '#475060', margin: 0, lineHeight: 1.6 }}>{x.d}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Возможности */}
    <section style={{ padding: '64px 40px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 32px' }}>Основные возможности</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { ic: 'clipboard', t: 'Ежедневная проверка знаний',     d: '10 случайных вопросов из 5 категорий. Допуск к смене за 10 минут.' },
            { ic: 'target',    t: 'Ежегодная аттестация',           d: '50 вопросов, обратный отсчёт, разбивка результатов по направлениям.' },
            { ic: 'film',      t: 'Видеоуроки с тестом',            d: '12 уроков, прикреплённые материалы, проверка усвоения после просмотра.' },
            { ic: 'shield',    t: 'Протоколы смертельных опасностей', d: '6 направлений: высота, электробезопасность, газ, грузы, замкнутые пространства, огневые работы.' },
            { ic: 'book',      t: 'Теоретический экзамен по узлам', d: '8 механизмов с расстановкой шагов сборки в правильном порядке.' },
            { ic: 'chart',     t: 'История и аналитика',            d: 'Личные результаты, графики динамики, экспорт в Excel и PDF.' },
            { ic: 'bell',      t: 'Автоматические оповещения',       d: 'Напоминания о сроках проверок, медосмотров, удостоверений.' },
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: i === 6 ? 'none' : '1px solid #EEF1F6' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={x.ic} size={22} color="#1B4B7A" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>{x.t}</h3>
                <p style={{ fontSize: 14, color: '#475060', margin: 0, lineHeight: 1.6 }}>{x.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Безопасность данных */}
    <section style={{ padding: '64px 40px', background: '#F7F9FC' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <Card padding={40} style={{ borderTop: '4px solid #1F7A3D' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 32, alignItems: 'center' }} className="s-about-security">
            <div>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: '#EAF5EE', color: '#1F7A3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield" size={40} color="#1F7A3D" />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1F7A3D', marginTop: 20, marginBottom: 8 }}>Безопасность данных</div>
              <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', margin: 0 }}>Корпоративный уровень защиты</h2>
            </div>
            <div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  'Все данные хранятся на серверах НТЦ «Востоктехносервис» в Казахстане',
                  'Шифрование трафика TLS 1.3 на всех соединениях',
                  'Соответствие стандарту ISO 27001 по информационной безопасности',
                  'Журнал аудита всех действий в системе (audit log)',
                  'Двухфакторная аутентификация для администраторов',
                  'Ролевая модель доступа: сотрудник / мастер / администратор',
                ].map(x => (
                  <li key={x} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 15, color: '#1A2332' }}>
                    <Icon name="check" size={18} color="#1F7A3D" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: '64px 40px 96px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', margin: '0 0 16px' }}>Готовы попробовать?</h2>
        <p style={{ fontSize: 16, color: '#475060', margin: '0 0 32px', lineHeight: 1.6 }}>
          Войдите по табельному номеру или свяжитесь с нами для развёртывания на вашем предприятии.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={onLogin} iconRight="arrow">Войти в систему</Button>
          <Button size="lg" variant="ghost" onClick={() => window.location.href = 'mailto:support@spektr.kz'}>Связаться с нами</Button>
        </div>
      </div>
    </section>
  </div>
);

export default AboutScreen;
