import { useEffect, useState } from 'react'
import Datepicker from 'tailwind-datepicker-react'
import EventComponent from './components/EventComponent'
import { useAppDispatch, useAppSelector } from './store'
import { addEvent, closeModal, getEvents } from './store/actions'
import xlsx, { IJsonSheet, ISettings } from 'json-as-xlsx'

type EventExport = {
  название: string
  дата: string
  начало: string
  конец: string
  длительность: string
  описание: string
}

const sortEvents = (events: EventType[]): EventType[] => {
  return events.toSorted((a, b) => {
    const yearA = Number(a.date.slice(6, undefined))
    const yearB = Number(b.date.slice(6, undefined))
    if (yearA !== yearB) {
      return yearA - yearB
    }

    const monthA = Number(a.date.slice(3, 5))
    const monthB = Number(b.date.slice(3, 5))
    if (monthA !== monthB) {
      return monthA - monthB
    }

    const dayA = Number(a.date.slice(0, 2))
    const dayB = Number(b.date.slice(0, 2))
    return dayA - dayB
  })
}

const transformEvents = (events: EventType[]): EventExport[] => {
  return sortEvents(events).map((ev) => {
    const durationInMinutes = (ev.endsHour - ev.startsHour) * 60 + (ev.endsMinute - ev.startsMinute)
    const evExport = {
      название: ev.name,
      дата: ev.date,
      начало:
        ev.actualStartsHour !== null
          ? `${ev.actualStartsHour}:${ev.actualStartsMinute}`
          : `${ev.startsHour}:${ev.startsMinute}`,
      конец:
        ev.actualEndsHour !== null
          ? `${ev.actualEndsHour}:${ev.actualEndsMinute}`
          : `${ev.endsHour}:${ev.endsMinute}`,
      длительность: `${Math.floor(durationInMinutes / 60)} часов, ${durationInMinutes % 60} минут`,
      описание: ev.details
    }
    return evExport
  })
}

const months = [
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
const options = {
  autoHide: true,
  todayBtn: true,
  clearBtn: true,
  clearBtnText: 'Сбросить',
  todayBtnText: 'Сегодня',
  theme: {
    background: 'bg-[#333333] transition w-full',
    todayBtn: 'transition bg-main hover:opacity-90 hover:bg-main',
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
export type EventType = {
  name: string
  date: string
  startsHour: number
  startsMinute: number
  endsHour: number
  endsMinute: number
  details: string
  actualStartsHour: number | null
  actualStartsMinute: number | null
  actualEndsHour: number | null
  actualEndsMinute: number | null
}
function App(): JSX.Element {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.main)
  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [customError, setCustomError] = useState('')
  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  const handleChange = (selectedDate: Date): void => {
    setDate(selectedDate)
  }
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 5000)
    dispatch(getEvents())
    return () => clearInterval(id)
  }, [])

  const handleSaveClick = async (): Promise<undefined> => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form.reportValidity()) {
      return
    }
    const formData = new FormData(form)
    const body: EventType = (state.events.data[0] && { ...state.events.data[0] }) ?? {}
    body.actualStartsHour = null
    body.actualStartsMinute = null
    body.actualEndsHour = null
    body.actualEndsMinute = null
    for (const [key, value] of formData.entries()) {
      if (key === 'starts' || key === 'ends') {
        body[key + 'Hour'] = Number(String(value).split(':')[0])
        body[key + 'Minute'] = Number(String(value).split(':')[1])
      } else if (key === 'date') {
        const arr = String(value).split('-')
        body[key] = `${arr[2]}.${arr[1]}.${arr[0]}`
      } else {
        body[key] = value
      }
    }
    if (
      body.endsHour < body.startsHour ||
      (body.endsHour === body.startsHour && body.endsMinute <= body.startsMinute)
    ) {
      setCustomError('Начало должно быть раньше конца!')
      setTimeout(() => setCustomError(''), 3000)
      return
    }
    const events = [...state.events.data]
    events.push(body)
    await dispatch(addEvent(events))
    setIsFormVisible(false)
  }

  const handleExportButtonClick = (): void => {
    const sheet: IJsonSheet = {
      columns: [
        { label: 'Название', value: 'название' },
        { label: 'Дата', value: 'дата', format: '# "date"' },
        { label: 'Начало', value: 'начало', format: '# "time"' },
        { label: 'Конец', value: 'конец', format: '# "time"' },
        { label: 'Длительность', value: 'длительность' },
        { label: 'Описание', value: 'описание' }
      ],
      content: transformEvents(state.events.data)
    }

    const settings: ISettings = {
      fileName: 'События',
      writeOptions: { type: 'file' }
    }
    xlsx([sheet], settings)
  }

  const actualStartsHour =
    state.modalState.details?.actualStartsHour ?? state.modalState.details?.startsHour ?? -1
  const actualEndsHour =
    state.modalState.details?.actualEndsHour ?? state.modalState.details?.endsHour ?? -1
  const actualStartsMinute =
    state.modalState.details?.actualStartsMinute ?? state.modalState.details?.startsMinute ?? -1
  const actualEndsMinute =
    state.modalState.details?.actualEndsMinute ?? state.modalState.details?.endsMinute ?? -1
  return (
    <div className=" flex min-h-screen border border-t-black ">
      <div
        className="min-w-[512px] max-w-[512px] border border-r-black
                      flex flex-col items-start justify-start py-14 px-10"
      >
        <p className=" font-normal text-[40px] leading-10 mb-4">Дата:</p>
        <p className=" font-bold text-[40px] leading-10 mb-9">{dateStr}</p>
        <div className="flex flex-col gap-8 w-full">
          <Datepicker
            classNames=""
            options={options}
            onChange={handleChange}
            show={true}
            setShow={() => true}
          />
          <button
            className=" bg-main hover:bg-indigo-400 transition py-3 grow rounded-[10px] text-lg font-semibold text-white"
            onClick={() => setIsFormVisible((p) => !p)}
          >
            {isFormVisible ? 'Скрыть' : '+Добавить'}
          </button>
        </div>

        {isFormVisible ? (
          <form className="flex flex-col gap-2 w-full mt-8 text-lg font-medium">
            <div className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="">
                Название:{' '}
              </label>
              <input
                required
                name="name"
                className="border rounded-[10px] p-[5px] text-base"
                type="text"
                placeholder="Название"
              />
            </div>
            <div className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="">
                Дата:{' '}
              </label>
              <input
                required
                defaultValue={`${date.getFullYear()}-${date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`}`}
                name="date"
                className="border rounded-[10px] p-[5px] text-base"
                type="date"
              />
            </div>
            <div className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="timeFrom">
                Начинается в:
              </label>
              <input
                required
                name="starts"
                className="border rounded-[10px] p-[5px] text-base"
                type="text"
                id="timeFrom"
                placeholder="09:00"
                pattern="[0-9]{2}:[0-9]{2}"
              />
            </div>
            <div className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="timeTo">
                Заканчивается в:
              </label>
              <input
                required
                name="ends"
                className="border rounded-[10px] p-[5px] text-base"
                type="text"
                id="timeTo"
                placeholder="23:59"
                pattern="[0-9]{2}:[0-9]{2}"
              />
            </div>
            <div className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="details">
                Описание:
              </label>
              <textarea
                name="details"
                className="border rounded-[10px] p-[5px] text-base grow"
                id="details"
              />
            </div>
            <button
              className=" bg-gray-500 hover:bg-slate-600 transition py-3 grow rounded-[10px] text-lg font-semibold text-white"
              type="button"
              onClick={handleSaveClick}
            >
              {customError.length > 0 ? customError : 'Сохранить'}
            </button>
          </form>
        ) : (
          <div className=" w-full flex flex-col gap-4 grow pt-4">
            <p className=" text-[20px]">
              Нажатие на кнопку рядом с событием в таблице запускает событие мгновенно с текущим
              временем, не меняя его продолжительность!
            </p>
            <button
              className=" bg-green-600 hover:bg-green-700 transition py-3 w-full rounded-[10px] text-lg font-semibold text-white mt-auto"
              onClick={handleExportButtonClick}
            >
              Экспорт
            </button>
          </div>
        )}
      </div>
      <div className="overflow-y-scroll max-h-[99.5vh] relative">
        <div className="flex h-[105px]">
          <div className="h-[105px] left-[513px] w-[352px] bg-white border-r border-r-black border-b border-b-black fixed z-10"></div>
          <div className="h-full flex items-center border-b border-b-black pr-[40px] relative left-[352px] z-0">
            {Array(25)
              .fill(1)
              .map((_v, i) => {
                return (
                  <p
                    className="w-[87px] font-bold text-2xl text-center last-of-type:-mr-[40px]"
                    key={`hour-${i}`}
                  >
                    {i % 24}
                  </p>
                )
              })}
          </div>
        </div>

        {state.events.isSuccess &&
          state.events.data &&
          state.events.data
            .filter((ev) => {
              return (
                ev.date ===
                `${date.getDate() < 9 ? `0${date.getDate()}` : date.getDate()}.${date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}.${date.getFullYear()}`
              )
            })
            .map((ev, index) => {
              return (
                <EventComponent
                  timeCoef={
                    date.toDateString() === now.toDateString()
                      ? 0
                      : date.getTime() > now.getTime()
                        ? 1
                        : -1
                  }
                  eventData={ev}
                  key={`event-${index}`}
                />
              )
            })}
        <dialog
          open={state.modalState.isOpen}
          className="w-96 min-h-96 pl-4 pt-2 pb-3 rounded-[10px] shadow-md shadow-gray-100
         fixed left-[890px] top-[120px] ml-1 mt-1 z-50 bg-white border border-black open:flex flex-col gap-2"
        >
          <p className="text-xl max-w-72 break-words">
            <span className="font-semibold">Название:</span> {state.modalState.details?.name}
          </p>
          <p className="text-xl max-w-72 break-words">
            {' '}
            <span className="font-semibold">Дата:</span> {state.modalState.details?.date}
          </p>
          <p className="text-xl max-w-72 break-words">
            <span className="font-semibold">Начало:</span>{' '}
            {`${actualStartsHour > 9 ? actualStartsHour : `0${actualStartsHour}`}:${
              actualStartsMinute > 9 ? actualStartsMinute : `0${actualStartsMinute}`
            }`}
          </p>
          <p className="text-xl max-w-72 break-words">
            <span className="font-semibold">Конец:</span>{' '}
            {`${actualEndsHour > 9 ? actualEndsHour : `0${actualEndsHour}`}:${
              actualEndsMinute > 9 ? actualEndsMinute : `0${actualEndsMinute}`
            }`}
          </p>
          <p className="text-xl max-w-[352px] break-words">
            <span className="font-semibold">Описание:</span> {state.modalState.details?.details}
          </p>
          <button
            className="text-3xl absolute top-2 right-2 rotate-45 w-10 h-10 hover:bg-slate-300 rounded-full flex items-center justify-center transition border"
            onClick={() => dispatch(closeModal())}
          >
            +
          </button>
        </dialog>
        {date.toDateString() === now.toDateString() && (
          <div
            className="absolute w-[2px] bg-upcoming h-full top-0 -z-10"
            style={{
              left: `${38 + 352 + now.getHours() * 87 + Math.floor((now.getMinutes() * 87) / 60)}px`
            }}
          ></div>
        )}
      </div>
    </div>
  )
}

export default App
