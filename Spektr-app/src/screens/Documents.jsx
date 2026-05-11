import { useState, useEffect } from 'react';
import Icon from '../components/Icon.jsx';
import { Button, Card, TopBar, useToast } from '../components/Primitives.jsx';
import { listDocuments } from '../api/documents.js';

const DOC_CATEGORIES = [
  { id: 'all',         label: 'Все документы' },
  { id: 'license',     label: 'Лицензии и сертификаты' },
  { id: 'regulations', label: 'Положения и регламенты' },
  { id: 'samples',     label: 'Образцы удостоверений' },
  { id: 'contracts',   label: 'Договоры' },
];

function normalizeDocument(d) {
  return {
    id: d.id,
    title: d.title,
    category: d.category || 'regulations',
    format: d.format || 'PDF',
    size: d.file_size || d.size || '—',
    date: d.updated_date ? new Date(d.updated_date).toLocaleDateString('ru-RU') : (d.date || '—'),
    fileUrl: d.file_url || null,
  };
}

const DocumentsScreen = ({ onLogin, onStudy, onHome }) => {
  const [cat, setCat] = useState('all');
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { show: toast, ToastContainer } = useToast();

  useEffect(() => {
    listDocuments()
      .then(data => setDocs(Array.isArray(data) ? data.map(normalizeDocument) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = cat === 'all' ? docs : docs.filter(d => d.category === cat);

  const onDownload = (d) => {
    if (d.fileUrl) {
      window.open(d.fileUrl, '_blank');
    } else {
      toast(`«${d.title}» (${d.format} · ${d.size}) добавлен в загрузки`, 'info');
    }
  };

  return (
    <div style={{ background: '#F7F9FC', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1A2332' }}>
      <TopBar onLogin={onLogin} onRegister={onStudy} onHome={onHome} onAbout={() => {}} onCenter={() => {}} onDocs={() => {}} />

      <section style={{ background: '#fff', padding: '40px 40px 32px', borderBottom: '1px solid #E4E8EF' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1B4B7A', marginBottom: 12 }}>Юридические документы</div>
          <h1 style={{ fontFamily: 'Manrope', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', margin: 0 }}>Документы</h1>
          <p style={{ fontSize: 16, color: '#475060', margin: '12px 0 0' }}>Лицензии, регламенты, образцы удостоверений и договоры</p>
        </div>
      </section>

      <section style={{ padding: '32px 40px 80px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }} className="s-catalog-grid">
          <aside>
            <div style={{ position: 'sticky', top: 92 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#5B6778', marginBottom: 14 }}>Категории</div>
              <nav aria-label="Категории документов" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {DOC_CATEGORIES.map(c => {
                  const count = c.id === 'all' ? docs.length : docs.filter(d => d.category === c.id).length;
                  const active = cat === c.id;
                  return (
                    <button key={c.id} type="button" onClick={() => setCat(c.id)}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 12px', border: 'none',
                        background: active ? '#EEF3F8' : 'transparent',
                        color: active ? '#1B4B7A' : '#3A4657',
                        fontWeight: active ? 600 : 500, fontSize: 14,
                        borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'background 140ms ease',
                      }}>
                      <span>{c.label}</span>
                      <span style={{ fontSize: 12, color: active ? '#1B4B7A' : '#8A95A5', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#5B6778' }}>Загрузка документов…</div>
            ) : filtered.length === 0 ? (
              <Card padding={40}>
                <div style={{ textAlign: 'center', color: '#5B6778' }}>
                  <Icon name="search" size={40} color="#B8C0CC" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1A2332', marginBottom: 4 }}>Документов в этой категории пока нет</div>
                </div>
              </Card>
            ) : (
              <Card padding={0}>
                <div className="s-table-wrap">
                  {filtered.map((d, i) => (
                    <div key={d.id} className="s-doc-row" style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 100px 100px 120px',
                      alignItems: 'center', gap: 16,
                      padding: '16px 20px',
                      borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #EEF1F6',
                      transition: 'background 140ms ease',
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: d.format === 'PDF' ? '#FBECEC' : '#EEF3F8', color: d.format === 'PDF' ? '#B8242D' : '#1B4B7A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700 }}>
                        {d.format}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                      </div>
                      <div style={{ fontSize: 13, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{d.date}</div>
                      <div style={{ fontSize: 13, color: '#5B6778', fontFamily: 'JetBrains Mono, monospace' }}>{d.size}</div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" icon="download" onClick={() => onDownload(d)}>Скачать</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>
      <ToastContainer />
    </div>
  );
};

export default DocumentsScreen;
