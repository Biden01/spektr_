import Icon from '../components/Icon.jsx';
import { Button, Card, TopBar, MARK, LOGO_WHITE } from '../components/Primitives.jsx';

// Enterprise Gateway pattern (UI/UX Pro Max):
// 1. Hero (mission) — 2. Path selection (I am a...) — 3. Solutions by role
// 4. Trust signals / certificates — 5. How it works — 6. Stats — 7. Footer
const LandingScreen = ({ onLogin, onStudy, onAbout, onCenter, onCatalog, onDocs }) => (
  <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
    <TopBar onLogin={onLogin} onRegister={onStudy} onHome={() => {}} onAbout={onAbout} onCenter={onCenter} onDocs={onDocs} />

    {/* === HERO === */}
    <section className="s-hero-section" style={{ position: 'relative', overflow: 'hidden', padding: '88px 40px 80px', background: 'linear-gradient(180deg, #F7F9FC 0%, #fff 100%)' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'><polygon points='40,2 76,23 76,69 40,90 4,69 4,23' fill='none' stroke='%231B4B7A' stroke-width='1.5' opacity='0.05'/></svg>")`, backgroundSize: '80px 92px' }} />
      <div className="s-hero" style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 18, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF3F8', padding: '6px 12px', borderRadius: 999 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: '#1F7A3D' }}/>
            НТЦ «Востоктехносервис» · Система проверки знаний
          </div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 60, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0 }}>
            Единая система проверки знаний и тестирования <span style={{ color: '#1B4B7A' }}>работников</span>
          </h1>
          <p className="s-hero-sub" style={{ fontSize: 18, color: '#475060', lineHeight: 1.6, margin: '24px 0 32px', maxWidth: 580 }}>
            Ежедневные и ежегодные проверки, видеоуроки, теоретические экзамены и протоколы смертельных опасностей — в едином промышленном контуре.
          </p>

          {/* Trust signals row — required for Trust & Authority pattern */}
          <div className="s-hero-trust" style={{ display: 'flex', gap: 18, marginBottom: 32, flexWrap: 'wrap' }}>
            {[
              { ic: 'shield', t: 'ISO 27001 защита данных' },
              { ic: 'check',  t: 'Лицензия Министерства образования РК' },
              { ic: 'users',  t: 'Корпоративная платформа НТЦ ВТС' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475060', fontWeight: 500 }}>
                <Icon name={s.ic} size={16} color="#1B4B7A"/>
                {s.t}
              </div>
            ))}
          </div>

          <div className="s-hero-cta" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Button size="lg" onClick={onLogin} iconRight="arrow">Вход для сотрудников ВТС</Button>
            <Button size="lg" variant="success" icon="graduation" onClick={onStudy}>Учебный центр</Button>
          </div>
        </div>

        {/* Path selection — "I am a..." per Enterprise Gateway pattern */}
        <Card padding={28} style={{ borderTop: '4px solid #1B4B7A' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 14 }}>Я хочу</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { ic: 'clipboard', t: 'Пройти ежедневную проверку',   s: 'Допуск к смене за 10 минут',         action: onLogin, tone: '#1B4B7A', bg: '#EEF3F8' },
              { ic: 'target',    t: 'Сдать ежегодную аттестацию',   s: '50 вопросов, 5 направлений',          action: onLogin, tone: '#1F7A3D', bg: '#EAF5EE' },
              { ic: 'film',      t: 'Изучить видеоуроки',            s: '12 уроков по охране труда',           action: onLogin, tone: '#C77A0F', bg: '#FDF4E7' },
              { ic: 'graduation',t: 'Записаться в Учебный центр',    s: '6 курсов с удостоверениями',          action: onStudy, tone: '#1F7A3D', bg: '#EAF5EE' },
            ].map((p, i) => (
              <button key={i} type="button" onClick={p.action}
                className="s-path-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', background: '#fff',
                  border: '1px solid #E4E8EF', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  transition: 'all 180ms cubic-bezier(.2,0,0,1)',
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: p.bg, color: p.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={p.ic} size={20} color={p.tone}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 14, color: '#1A2332' }}>{p.t}</div>
                  <div style={{ fontSize: 12, color: '#5B6778', marginTop: 1 }}>{p.s}</div>
                </div>
                <Icon name="arrow" size={16} color="#5B6778"/>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>

    {/* === SOLUTIONS BY ROLE — кому подходит === */}
    <section className="s-feature-section" style={{ padding: '72px 40px', background: '#F7F9FC' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>Решения по ролям</div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Каждой роли — свой инструмент</h2>
        <p style={{ fontSize: 16, color: '#475060', maxWidth: 720, margin: '0 0 48px' }}>
          СПЕКТР заменяет бумажные журналы и Excel-таблицы единым контуром, удобным сразу четырём категориям пользователей.
        </p>
        <div className="s-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { ic: 'user',      tone: '#1B4B7A', bg: '#EEF3F8', t: 'Сотрудник', d: 'Ежедневная и ежегодная проверки, видеоуроки, личная история результатов.', list: ['Допуск к смене', 'Уведомления о сроках', 'Прозрачные результаты'] },
            { ic: 'users',     tone: '#1F7A3D', bg: '#EAF5EE', t: 'Мастер участка', d: 'Контроль подчинённых, статусы проверок, оперативные действия.', list: ['Дашборд участка', 'Просрочки в реальном времени', 'Карточки сотрудников'] },
            { ic: 'settings',  tone: '#C77A0F', bg: '#FDF4E7', t: 'Администратор', d: 'Управление базой вопросов, отчёты, настройки правил оповещений.', list: ['База тестов', 'KPI и отчёты', 'Audit log'] },
            { ic: 'graduation',tone: '#B8242D', bg: '#FBECEC', t: 'Внешний слушатель', d: 'Курсы Учебного центра, тесты, удостоверения государственного образца.', list: ['Каталог курсов', 'Онлайн и очно', 'Удостоверения'] },
          ].map((r, i) => (
            <Card key={i} padding={24}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: r.bg, color: r.tone, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon name={r.ic} size={24} color={r.tone} />
              </div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 8px', lineHeight: 1.25 }}>{r.t}</h3>
              <p style={{ fontSize: 14, color: '#475060', margin: '0 0 14px', lineHeight: 1.55 }}>{r.d}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {r.list.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#3A4657' }}>
                    <Icon name="check" size={14} color={r.tone}/>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* === KEY MODULES === */}
    <section style={{ padding: '72px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>Что внутри</div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', margin: '0 0 48px' }}>Семь модулей в едином контуре</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { ic: 'clipboard', t: 'Ежедневная проверка', d: '10 вопросов · 10 минут. Допуск к смене.' },
            { ic: 'target',    t: 'Ежегодная аттестация', d: '50 вопросов · 60 минут. Подтверждение квалификации.' },
            { ic: 'film',      t: 'Видеоуроки',           d: '12 уроков по 5 направлениям с тестом после.' },
            { ic: 'shield',    t: 'Безопасный труд',      d: '6 протоколов смертельных опасностей.' },
            { ic: 'book',      t: 'Теоретический экзамен', d: '8 узлов и механизмов. Сборка по этапам.' },
            { ic: 'chart',     t: 'История и аналитика',  d: 'Личные результаты, графики динамики, экспорт.' },
            { ic: 'graduation',t: 'Учебный центр',         d: '6 курсов повышения квалификации.' },
          ].map((f, i) => (
            <Card key={i} padding={20} hoverable>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EEF3F8', color: '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={f.ic} size={20} color="#1B4B7A" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.t}</div>
                  <p style={{ fontSize: 13, color: '#5B6778', margin: 0, lineHeight: 1.5 }}>{f.d}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* === HOW IT WORKS === */}
    <section style={{ padding: '72px 40px', background: '#F7F9FC' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>Как это работает</div>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', margin: '0 0 48px' }}>Четыре шага до результата</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="s-howit-grid">
          {[
            { n: '01', t: 'Регистрация', d: 'Сотрудник входит по табельному номеру. Слушатель регистрируется по e-mail.' },
            { n: '02', t: 'Проверка',     d: 'Тест по случайным вопросам с автоматическим таймером и подсчётом.' },
            { n: '03', t: 'Результаты',   d: 'Мгновенный отчёт с разбивкой по категориям и объяснениями.' },
            { n: '04', t: 'Допуск',       d: 'При успешной сдаче — автоматический допуск к смене или удостоверение.' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, color: '#C7DAEB', lineHeight: 1, marginBottom: 12 }}>{s.n}</div>
              <h3 style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: 20, margin: '0 0 8px' }}>{s.t}</h3>
              <p style={{ fontSize: 14, color: '#475060', margin: 0, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* === STATS === */}
    <section style={{ padding: '64px 40px' }}>
      <div className="s-stat-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderTop: '1px solid #E4E8EF', borderBottom: '1px solid #E4E8EF' }}>
        {[
          { n: '5',     l: 'направлений проверки' },
          { n: '100+',  l: 'сотрудников в системе' },
          { n: '60+',   l: 'тестов в базе' },
          { n: '12',    l: 'видеоуроков' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '36px 24px', borderLeft: i ? '1px solid #E4E8EF' : 'none' }}>
            <div className="s-stat-num" style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 48, letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums', color: '#1B4B7A' }}>{s.n}</div>
            <div style={{ fontSize: 14, color: '#5B6778', marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>

    {/* === FINAL CTA === */}
    <section style={{ padding: '72px 40px 96px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', background: 'linear-gradient(135deg, #1B4B7A 0%, #0F2D4A 100%)', borderRadius: 20, padding: '56px 56px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'><polygon points='40,2 76,23 76,69 40,90 4,69 4,23' fill='none' stroke='white' stroke-width='1.5' opacity='0.08'/></svg>")`, backgroundSize: '80px 92px' }}/>
        <h2 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', margin: '0 0 16px', position: 'relative', color: '#fff' }}>Готовы заменить бумажные журналы?</h2>
        <p style={{ fontSize: 17, color: '#C7DAEB', maxWidth: 640, margin: '0 auto 32px', lineHeight: 1.6, position: 'relative' }}>
          Войдите в портал по табельному номеру или зарегистрируйтесь во внешнем Учебном центре.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Button size="lg" onClick={onLogin} iconRight="arrow">Войти как сотрудник</Button>
          <Button size="lg" variant="secondary" onClick={onStudy} icon="graduation">В Учебный центр</Button>
        </div>
      </div>
    </section>

    {/* === FOOTER === */}
    <footer className="s-footer" style={{ background: '#0F2D4A', color: '#fff', padding: '56px 40px 32px' }}>
      <div className="s-footer-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, alignItems: 'start' }}>
        <div>
          <img src={LOGO_WHITE} style={{ height: 44, marginBottom: 14 }} alt=""/>
          <p style={{ fontSize: 13, color: '#A8C0D6', lineHeight: 1.5, margin: '0 0 14px' }}>Система Проверки Единых Компетенций и Тестирования Работников.<br/>Разработано НТЦ «Востоктехносервис».</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: '#A8C0D6' }}>
            <Icon name="shield" size={14} color="#A8C0D6"/>ISO 27001 · Защищённое соединение
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Продукт</div>
          {[
            { l: 'О системе',       a: onAbout   },
            { l: 'Учебный центр',   a: onCenter  },
            { l: 'Каталог курсов',  a: onCatalog },
            { l: 'Документы',       a: onDocs    },
          ].map(x => (
            <a key={x.l} href="#" onClick={(e)=>{e.preventDefault(); x.a && x.a();}} style={{ display:'block', fontSize:13, color:'#A8C0D6', marginBottom:8, textDecoration:'none' }}>{x.l}</a>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Поддержка</div>
          {['Инструкции','FAQ','Связаться с мастером','Техподдержка'].map(x => (
            <a key={x} href="#" onClick={(e)=>e.preventDefault()} style={{ display:'block', fontSize:13, color:'#A8C0D6', marginBottom:8, textDecoration:'none' }}>{x}</a>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#fff' }}>Контакты</div>
          <div style={{ fontSize:13, color:'#A8C0D6', lineHeight:1.7 }}>
            support@spektr.kz<br/>
            +7 (7232) 00-00-00<br/>
            г. Усть-Каменогорск
          </div>
        </div>
      </div>
      <div className="s-footer-bottom" style={{ maxWidth: 1280, margin: '32px auto 0', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8A95A5' }}>
        <span>© 2026 НТЦ «Востоктехносервис». Все права защищены.</span>
        <span>v 1.0.0</span>
      </div>
    </footer>
  </div>
);

export default LandingScreen;
