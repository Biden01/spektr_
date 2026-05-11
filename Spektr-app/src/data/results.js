// 30+ исторических результатов разных пользователей за 3 месяца — для графиков
export const RESULTS = [
  // Ivanov — стабильный, 8 результатов
  { id: 'r-001', userId: 'ivanov', date: '22.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 9, total: 10, pct: 90, status: 'ok', durationMin: 7 },
  { id: 'r-002', userId: 'ivanov', date: '20.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 6, total: 10, pct: 60, status: 'bad', durationMin: 11 },
  { id: 'r-003', userId: 'ivanov', date: '18.04.2026', testType: 'daily',  testName: 'Охрана труда',         score: 10, total: 10, pct: 100, status: 'ok', durationMin: 6 },
  { id: 'r-004', userId: 'ivanov', date: '15.04.2026', testType: 'lesson', testName: 'СИЗ: правильное применение', score: 8, total: 10, pct: 80, status: 'ok', durationMin: 5 },
  { id: 'r-005', userId: 'ivanov', date: '12.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 8, total: 10, pct: 80, status: 'ok', durationMin: 9 },
  { id: 'r-006', userId: 'ivanov', date: '08.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 9, total: 10, pct: 90, status: 'ok', durationMin: 8 },
  { id: 'r-007', userId: 'ivanov', date: '15.03.2026', testType: 'annual', testName: 'Ежегодная проверка', score: 44, total: 50, pct: 88, status: 'ok', durationMin: 47 },
  { id: 'r-008', userId: 'ivanov', date: '20.02.2026', testType: 'protocol', testName: 'Электробезопасность', score: 9, total: 10, pct: 90, status: 'ok', durationMin: 12 },

  // Sidorov — нестабильный, есть проблемы
  { id: 'r-009', userId: 'sidorov', date: '21.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 7, total: 10, pct: 70, status: 'ok', durationMin: 12 },
  { id: 'r-010', userId: 'sidorov', date: '19.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 5, total: 10, pct: 50, status: 'bad', durationMin: 14 },
  { id: 'r-011', userId: 'sidorov', date: '14.04.2026', testType: 'protocol', testName: 'Работа на высоте',  score: 8, total: 10, pct: 80, status: 'ok', durationMin: 11 },
  { id: 'r-012', userId: 'sidorov', date: '10.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 4, total: 10, pct: 40, status: 'bad', durationMin: 15 },
  { id: 'r-013', userId: 'sidorov', date: '05.04.2026', testType: 'daily',  testName: 'Ежедневная проверка',  score: 8, total: 10, pct: 80, status: 'ok', durationMin: 10 },
  { id: 'r-014', userId: 'sidorov', date: '12.04.2025', testType: 'annual', testName: 'Ежегодная проверка', score: 39, total: 50, pct: 78, status: 'ok', durationMin: 58 }, // прошлогодняя

  // Другие сотрудники — для лент админки/мастера
  { id: 'r-015', userId: 'emp_004', date: '22.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 10, total: 10, pct: 100, status: 'ok', durationMin: 7 },
  { id: 'r-016', userId: 'emp_005', date: '22.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 8, total: 10, pct: 80, status: 'ok', durationMin: 9 },
  { id: 'r-017', userId: 'emp_006', date: '21.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 6, total: 10, pct: 60, status: 'bad', durationMin: 13 },
  { id: 'r-018', userId: 'emp_007', date: '21.04.2026', testType: 'annual', testName: 'Ежегодная проверка', score: 47, total: 50, pct: 94, status: 'ok', durationMin: 42 },
  { id: 'r-019', userId: 'emp_008', date: '20.04.2026', testType: 'protocol', testName: 'Газоопасные работы', score: 9, total: 10, pct: 90, status: 'ok', durationMin: 14 },
  { id: 'r-020', userId: 'emp_009', date: '19.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 9, total: 10, pct: 90, status: 'ok', durationMin: 8 },
  { id: 'r-021', userId: 'emp_010', date: '18.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 7, total: 10, pct: 70, status: 'ok', durationMin: 11 },
  { id: 'r-022', userId: 'emp_004', date: '15.04.2026', testType: 'lesson', testName: 'СЛР', score: 9, total: 10, pct: 90, status: 'ok', durationMin: 6 },
  { id: 'r-023', userId: 'emp_011', date: '14.04.2026', testType: 'annual', testName: 'Ежегодная проверка', score: 35, total: 50, pct: 70, status: 'bad', durationMin: 60 },
  { id: 'r-024', userId: 'emp_012', date: '12.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 10, total: 10, pct: 100, status: 'ok', durationMin: 6 },
  { id: 'r-025', userId: 'emp_013', date: '10.04.2026', testType: 'protocol', testName: 'Замкнутые пространства', score: 8, total: 10, pct: 80, status: 'ok', durationMin: 12 },
  { id: 'r-026', userId: 'emp_014', date: '08.04.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 8, total: 10, pct: 80, status: 'ok', durationMin: 9 },
  { id: 'r-027', userId: 'emp_005', date: '05.04.2026', testType: 'lesson', testName: 'Эвакуация при пожаре', score: 7, total: 10, pct: 70, status: 'ok', durationMin: 5 },
  { id: 'r-028', userId: 'emp_015', date: '02.04.2026', testType: 'annual', testName: 'Ежегодная проверка', score: 41, total: 50, pct: 82, status: 'ok', durationMin: 51 },
  { id: 'r-029', userId: 'emp_007', date: '28.03.2026', testType: 'daily', testName: 'Ежедневная проверка', score: 9, total: 10, pct: 90, status: 'ok', durationMin: 7 },
  { id: 'r-030', userId: 'emp_006', date: '25.03.2026', testType: 'protocol', testName: 'Огневые работы', score: 6, total: 10, pct: 60, status: 'bad', durationMin: 14 },
  { id: 'r-031', userId: 'emp_009', date: '20.03.2026', testType: 'annual', testName: 'Ежегодная проверка', score: 45, total: 50, pct: 90, status: 'ok', durationMin: 44 },
  { id: 'r-032', userId: 'emp_010', date: '15.03.2026', testType: 'lesson', testName: 'Работы на высоте', score: 8, total: 10, pct: 80, status: 'ok', durationMin: 11 },
];

export const getResultsByUser = (userId) => RESULTS.filter(r => r.userId === userId);
