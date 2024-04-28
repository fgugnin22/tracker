import { useEffect, useRef, useState } from 'react'
import Datepicker from 'tailwind-datepicker-react'
import EventComponent from './components/EventComponent'
import { useAppDispatch, useAppSelector } from './store'
import { getEvents, openEventsModal } from './store/actions'
import xlsx, { IJsonSheet, ISettings } from 'json-as-xlsx'
import EventsModal from './components/EventsModal'
import CreateEventForm from './components/CreateEventForm'
import { transformEvents } from './util/transformEvents'
import { datePickOptions, months } from './constants'
import EventModal from './components/EventModal'

function App(): JSX.Element {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [showLeftPanel, setShowLeftPanel] = useState(false)
  const [showDP, setShowDP] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)

  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`

  const handleChange = (selectedDate: Date): void => {
    setDate(selectedDate)
  }

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 5000)
    dispatch(getEvents())
    containerRef.current?.scroll({ top: 0, left: (now.getHours() - 3) * 90, behavior: 'smooth' })

    return () => clearInterval(id)
  }, [])

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

  const containerRef = useRef<HTMLElement>(null)

  const groupNames = [...new Set(state.events.data.map((e) => e.group_name))]

  const filteredByGroupName = state.events.data.filter(
    (e) => e.group_name === groupName || !groupName
  )

  return (
    <div className={' flex min-h-screen border border-t-black'}>
      {showLeftPanel && (
        <div
          className={`min-w-[512px] relative max-w-[512px] border border-r-black flex flex-col items-start justify-start py-12 px-10 transition `}
        >
          <p className=" font-normal text-[40px] leading-10 mb-4">Дата:</p>
          <p className=" font-bold text-[40px] leading-10 mb-9">{dateStr}</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => setShowDP((p) => !p)}
              className=" bg-blue-400 hover:bg-blue-500 transition py-3 grow rounded-[10px] text-lg font-semibold text-white -mb-2"
            >
              {showDP ? 'Скрыть' : 'Показать'} выбор даты
            </button>
            {showDP ? (
              <Datepicker
                classNames=""
                options={datePickOptions}
                onChange={handleChange}
                show={true}
                setShow={() => true}
              />
            ) : (
              <div className="h-[401px]"></div>
            )}
            <button
              className=" -mt-1 bg-blue-400 hover:bg-blue-500 transition py-3 grow rounded-[10px] text-lg font-semibold text-white"
              onClick={() => setIsFormVisible((p) => !p)}
            >
              {isFormVisible ? 'Скрыть' : '+Добавить'}
            </button>
          </div>

          {isFormVisible ? (
            <CreateEventForm />
          ) : (
            <div className=" w-full flex flex-col gap-4 grow mt-1">
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
      )}
      <button
        className={
          'flex items-center min-h-full hover:bg-gray-200 transition z-[99] border-r border-black ' +
          (showLeftPanel ? '' : '!left-0')
        }
        onClick={() => setShowLeftPanel((p) => !p)}
      >
        <svg
          className={
            'w-12 h-12 transition duration-300 ' + (showLeftPanel ? 'rotate-180' : 'rotate-0')
          }
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
          <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <path
              d="M6 12H18M18 12L13 7M18 12L13 17"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
        </svg>
      </button>

      {state.modalEventsState.isOpen && <EventsModal />}
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={'overflow-y-scroll max-h-[99.5vh] relative'}
      >
        <div className="h-12 sticky left-0 flex items-center justify-start gap-2">
          <button
            className={
              `w-[340px] text-lg h-9 rounded-lg border font-medium border-black
            hover:bg-gray-200 transition ml-2 ` +
              (groupName === '' ? 'bg-neutral hover:!bg-blue-500' : '')
            }
            key={'adsfmasd'}
            onClick={() => setGroupName('')}
          >
            все
          </button>
          {groupNames.map((name) => (
            <button
              className={
                `w-[340px] text-lg h-9 rounded-lg border font-medium border-black
                hover:bg-blue-500 transition ` + (groupName === name ? 'bg-neutral' : '')
              }
              key={name + 'adsfmasd'}
              onClick={() => setGroupName(name)}
            >
              {name.length > 30 ? name.slice(0, 30) + '...' : name}
            </button>
          ))}
        </div>
        <div
          className={
            'h-[105px] left-0 w-[352px] bg-white border-r border-t border-b border-black sticky z-10 flex items-center justify-center'
          }
        >
          <button
            className="text-2xl font-medium hover:bg-slate-200 transiition duration-100 w-full h-full hover:underline"
            onClick={() => dispatch(openEventsModal())}
          >
            События без даты
          </button>
        </div>
        <div className="flex h-[105px] absolute top-12 left-0">
          <div className="h-full flex items-center border-t border-b border-black pr-[40px] relative left-[352px] z-0">
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

        {filteredByGroupName
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

        <EventModal />
        {date.toDateString() === now.toDateString() && (
          <div
            className="absolute w-[2px] bg-red-500 h-full top-0 -z-10"
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
