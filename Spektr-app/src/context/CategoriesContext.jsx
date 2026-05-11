import { createContext, useContext, useState, useEffect } from 'react';
import { listCategories } from '../api/categories.js';

// Fallback used before API responds or when unauthenticated
const FALLBACK = [
  { id: 'specifics', name: 'Специфика производства', short: 'Специфика', color: '#1B4B7A', bg: '#EEF3F8' },
  { id: 'medical',   name: 'Медицинская подготовка',  short: 'Медицина',  color: '#1F7A3D', bg: '#EAF5EE' },
  { id: 'fire',      name: 'Пожарная безопасность',   short: 'Пожарная',  color: '#B8242D', bg: '#FBECEC' },
  { id: 'labour',    name: 'Охрана труда и ТБ',        short: 'ТБ и ОТ',   color: '#C77A0F', bg: '#FDF4E7' },
  { id: 'electro',   name: 'Электробезопасность',     short: 'Электро',   color: '#2F3B4D', bg: '#EEF1F6' },
];

function normalize(c) {
  return { id: c.id, name: c.name, short: c.short || c.name, color: c.color || '#1B4B7A', bg: c.bg_color || c.bg || '#EEF3F8' };
}

const CategoriesContext = createContext({ categories: FALLBACK, reload: () => {} });

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState(FALLBACK);

  const load = () => {
    listCategories()
      .then(data => { if (Array.isArray(data) && data.length) setCategories(data.map(normalize)); })
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  return (
    <CategoriesContext.Provider value={{ categories, reload: load }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoriesContext);
  const getCategoryById = (id) =>
    ctx.categories.find(c => c.id === id) || { id, name: id, short: id, color: '#5B6778', bg: '#EEF1F6' };
  return { categories: ctx.categories, reload: ctx.reload, getCategoryById };
};

// Kept for direct usage (e.g. outside components)
export const getCategoryById = (cats, id) =>
  cats.find(c => c.id === id) || { id, name: id, short: id, color: '#5B6778', bg: '#EEF1F6' };
