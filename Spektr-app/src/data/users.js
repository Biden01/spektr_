// Демо-аккаунты для прототипа
export const USERS = [
  {
    id: 'ivanov',
    fullName: 'Иванов Иван Петрович',
    initials: 'ИП',
    tabNumber: '48213',
    role: 'employee',
    position: 'Электромонтёр 5 разряда',
    section: 'Участок № 3',
    accessGroup: 'IV',
    phone: '+7 (777) 123-45-67',
    email: 'ivanov@vts.kz',
    state: 'all_ok', // все проверки в норме
    dailyDoneToday: false,
    annualDueDays: 87, // дней до ежегодной
    medicalDueDays: 142,
    achievements: [
      { t: 'Электробезопасность IV', d: '15.03.2026' },
      { t: 'Охрана труда', d: '02.02.2026' },
      { t: 'Пожарная безопасность', d: '20.01.2026' },
    ],
  },
  {
    id: 'sidorov',
    fullName: 'Сидоров Алексей Викторович',
    initials: 'АС',
    tabNumber: '48156',
    role: 'employee',
    position: 'Слесарь-ремонтник 4 разряда',
    section: 'Участок № 1',
    accessGroup: 'III',
    phone: '+7 (777) 234-56-78',
    email: 'sidorov@vts.kz',
    state: 'overdue', // главный сценарий демо
    dailyDoneToday: false,
    annualDueDays: -3, // просрочено на 3 дня
    medicalDueDays: 5, // истекает через 5 дней
    achievements: [
      { t: 'Охрана труда', d: '12.04.2025' },
      { t: 'Пожарная безопасность', d: '08.03.2025' },
    ],
  },
  {
    id: 'petrova',
    fullName: 'Петрова Мария Сергеевна',
    initials: 'МП',
    tabNumber: '47002',
    role: 'master', // мастер участка
    position: 'Мастер участка',
    section: 'Участок № 3',
    accessGroup: 'V',
    phone: '+7 (777) 345-67-89',
    email: 'petrova@vts.kz',
    state: 'all_ok',
    dailyDoneToday: true,
    annualDueDays: 142,
    medicalDueDays: 89,
    subordinates: ['ivanov', 'sidorov', 'emp_004', 'emp_005', 'emp_006'],
  },
  {
    id: 'kuznetsov',
    fullName: 'Кузнецов Дмитрий Анатольевич',
    initials: 'ДК',
    tabNumber: 'A-001',
    role: 'admin',
    position: 'Администратор системы',
    section: 'Управление',
    phone: '+7 (777) 456-78-90',
    email: 'admin@vts.kz',
    state: 'all_ok',
  },
  {
    id: 'akhmetov',
    fullName: 'Ахметов Канат',
    initials: 'КА',
    tabNumber: '—',
    role: 'student', // внешний слушатель
    position: 'Слушатель',
    section: 'Учебный центр',
    phone: '+7 (777) 567-89-01',
    email: 'akhmetov@external.kz',
    state: 'all_ok',
    enrolledCourse: 'electro',
  },
];

export const getUserById = (id) => USERS.find(u => u.id === id);
