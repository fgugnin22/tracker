export const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
]

export const datePickOptions = {
  autoHide: true,
  todayBtn: true,
  clearBtn: true,
  clearBtnText: 'Сбросить',
  todayBtnText: 'Сегодня',
  theme: {
    background: 'bg-[#333333] transition w-full',
    todayBtn: 'transition bg-blue-400 hover:opacity-90 hover:bg-blue-500',
    clearBtn: 'transition',
    icons: 'transition',
    text: ' text-white hover:bg-[#777777] transition',
    disabledText: 'bg-gray-300 text-black transition',
    input: 'transition text-center !hidden',
    inputIcon: 'transition !hidden',
    selected: ' bg-[#666666]'
  },
  datepickerClassNames: ' !static !gap-4 ',
  defaultDate: new Date(),
  language: 'ru',
  disabledDates: [],
  weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  inputNameProp: 'date',
  inputIdProp: 'date',
  inputPlaceholderProp: 'Выбрать дату'
}
