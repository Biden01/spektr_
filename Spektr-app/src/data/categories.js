// 5 направлений проверки знаний
export const CATEGORIES = [
  { id: 'specifics',  name: 'Специфика производства',  short: 'Специфика',           color: '#1B4B7A', bg: '#EEF3F8' },
  { id: 'medical',    name: 'Медицинская подготовка',  short: 'Медицина',            color: '#1F7A3D', bg: '#EAF5EE' },
  { id: 'fire',       name: 'Пожарная безопасность',   short: 'Пожарная',            color: '#B8242D', bg: '#FBECEC' },
  { id: 'labour',     name: 'Охрана труда и ТБ',       short: 'ТБ и ОТ',             color: '#C77A0F', bg: '#FDF4E7' },
  { id: 'electro',    name: 'Электробезопасность',     short: 'Электро',             color: '#2F3B4D', bg: '#EEF1F6' },
];

export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id);
