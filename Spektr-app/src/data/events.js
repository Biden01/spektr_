// Лента событий для админки и audit log
export const EVENTS = [
  { id: 'ev-01', dt: '28.04.2026 09:14', userId: 'emp_004', type: 'test_passed',  text: 'сдал ежедневную проверку (100%)', tone: 'ok' },
  { id: 'ev-02', dt: '28.04.2026 09:08', userId: 'ivanov',  type: 'login',         text: 'вошёл в систему', tone: 'info' },
  { id: 'ev-03', dt: '28.04.2026 08:52', userId: 'emp_011', type: 'test_failed',   text: 'не сдал ежегодную проверку (70%)', tone: 'bad' },
  { id: 'ev-04', dt: '28.04.2026 08:31', userId: 'sidorov', type: 'overdue',       text: 'ежегодная проверка просрочена', tone: 'bad' },
  { id: 'ev-05', dt: '27.04.2026 17:42', userId: 'kuznetsov', type: 'question_added', text: 'добавил вопрос в категорию «Электробезопасность»', tone: 'info' },
  { id: 'ev-06', dt: '27.04.2026 16:20', userId: 'emp_006', type: 'medical_warning', text: 'медосмотр истекает через 5 дней', tone: 'warn' },
  { id: 'ev-07', dt: '27.04.2026 15:08', userId: 'emp_018', type: 'test_passed',  text: 'сдал ежедневную проверку (100%)', tone: 'ok' },
  { id: 'ev-08', dt: '27.04.2026 14:35', userId: 'petrova', type: 'login',         text: 'вошла в систему', tone: 'info' },
  { id: 'ev-09', dt: '27.04.2026 11:18', userId: 'emp_024', type: 'overdue',       text: 'ежедневная проверка не пройдена 3 дня подряд', tone: 'warn' },
  { id: 'ev-10', dt: '27.04.2026 10:42', userId: 'kuznetsov', type: 'lesson_added', text: 'добавил видеоурок «Шаговое напряжение»', tone: 'info' },
  { id: 'ev-11', dt: '26.04.2026 16:00', userId: 'emp_007', type: 'test_passed',   text: 'сдал ежегодную проверку (94%)', tone: 'ok' },
  { id: 'ev-12', dt: '26.04.2026 14:11', userId: 'akhmetov', type: 'enrollment',   text: 'записался на курс «Электробезопасность»', tone: 'info' },
  { id: 'ev-13', dt: '26.04.2026 12:30', userId: 'kuznetsov', type: 'user_added',  text: 'добавил пользователя «Шакенов М.»', tone: 'info' },
  { id: 'ev-14', dt: '25.04.2026 15:18', userId: 'emp_011', type: 'overdue',       text: 'требуется пересдача ежегодной', tone: 'bad' },
  { id: 'ev-15', dt: '25.04.2026 11:08', userId: 'emp_004', type: 'lesson_done',   text: 'просмотрел урок «СЛР»', tone: 'info' },
];
