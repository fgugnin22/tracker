import { useEffect, useState } from 'react'
import Datepicker from 'tailwind-datepicker-react'
import EventComponent from './EventComponent'
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
}
type EventsRes = { data: EventType[]; isSuccess: boolean }
function App(): JSX.Element {
  const windowObj: Window & { appRerender?: boolean } = window
  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [events, setEvents] = useState<EventsRes>({
    data: [],
    isSuccess: false
  })
  const [isFormVisible, setIsFormVisible] = useState(false)
  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  const show = true
  const handleChange = (selectedDate: Date): void => {
    setDate(selectedDate)
  }
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 10000)
    try {
      window.electron.ipcRenderer.invoke('get_events').then((data: EventsRes) => setEvents(data))
    } catch (error) {
      console.log(error)
    }
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    window.electron.ipcRenderer.invoke('get_events').then((data: EventsRes) => setEvents(data))
  }, [windowObj.appRerender])

  const handleSaveClick = async (): Promise<undefined> => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form.reportValidity()) {
      form.reportValidity
      return
    }
    const formData = new FormData(form)
    const body: EventType = events[0] ?? {}
    body.actualStartsHour = null
    body.actualStartsMinute = null
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
    const newEventsData = [...events.data, body]
    await window.electron.ipcRenderer.invoke('save_events', {
      payload: JSON.stringify(newEventsData)
    })

    try {
      await window.electron.ipcRenderer
        .invoke('get_events')
        .then((data: EventsRes) => setEvents(data))
    } catch (error) {
      console.log(error)
    }
    setIsFormVisible(false)
  }
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
            show={show}
            setShow={() => true}
          />
          <button
            className=" bg-main hover:bg-indigo-400 transition py-3 grow rounded-[10px] text-lg font-semibold text-white"
            onClick={() => setIsFormVisible(true)}
          >
            +Добавить
          </button>
        </div>
        {isFormVisible && (
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
                Заканчивается в
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
                Описание
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
              Сохранить
            </button>
          </form>
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

        {events.isSuccess &&
          events.data
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
