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
import SearchModal from './components/SearchModal'
import { importEvents } from './util/importEvents'

function App(): JSX.Element {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const [date, setDate] = useState(new Date())
  const [now, setNow] = useState(new Date())
  const [showLeftPanel, setShowLeftPanel] = useState(false)
  const [showDP, setShowDP] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)

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
        { label: 'Описание', value: 'описание' },
        { label: 'Процент выполнения', value: 'процент выполнения', format: '#"%"' },
        { label: 'Группа', value: 'группа' }
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

  const handleImportButtonClick = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target
    if (!input.files || !input.files[0]) {
      return
    }

    const fileName = input.files[0]

    importEvents(fileName, dispatch)
  }

  return (
    <div className={' flex min-h-screen border border-t-black'}>
      {isSearchModalVisible && <SearchModal setState={setIsSearchModalVisible} />}
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
              {isFormVisible ? 'Скрыть форму' : '+Добавить событие'}
            </button>
          </div>

          {isFormVisible ? (
            <CreateEventForm action="create" key={'createform'} />
          ) : (
            <div className=" w-full flex flex-col gap-4 grow mt-1">
              <p className=" text-[20px]">
                Нажатие на кнопку рядом с событием в таблице запускает событие мгновенно с текущим
                временем, не меняя его продолжительность!
              </p>
              <label
                htmlFor="import"
                className=" bg-zinc-500 hover:bg-zinc-600 transition py-3 w-full rounded-[10px] text-lg font-semibold text-white mt-auto text-center cursor-pointer"
              >
                <span>Импорт</span>
                <input
                  hidden
                  onChange={handleImportButtonClick}
                  type="file"
                  name="import"
                  id="import"
                />
              </label>
              <button
                className=" bg-green-600 hover:bg-green-700 transition py-3 w-full rounded-[10px] text-lg font-semibold text-white"
                onClick={handleExportButtonClick}
              >
                Экспорт
              </button>
            </div>
          )}
        </div>
      )}
      <div
        className={
          'flex flex-col min-h-full z-[99] border-r border-black ' +
          (showLeftPanel ? '' : '!left-0')
        }
      >
        <button
          onClick={() => setIsSearchModalVisible((p) => !p)}
          className="hover:bg-gray-200 flex items-center justify-center h-24 w-12"
        >
          <svg className="w-10 h-10" viewBox="0 0 32 32" fill="#000000">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <title>search</title> <desc>Created with Sketch Beta.</desc> <defs> </defs>
              <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Icon-Set" transform="translate(-256.000000, -1139.000000)" fill="#000000">
                  <path
                    d="M269.46,1163.45 C263.17,1163.45 258.071,1158.44 258.071,1152.25 C258.071,1146.06 263.17,1141.04 269.46,1141.04 C275.75,1141.04 280.85,1146.06 280.85,1152.25 C280.85,1158.44 275.75,1163.45 269.46,1163.45 L269.46,1163.45 Z M287.688,1169.25 L279.429,1161.12 C281.591,1158.77 282.92,1155.67 282.92,1152.25 C282.92,1144.93 276.894,1139 269.46,1139 C262.026,1139 256,1144.93 256,1152.25 C256,1159.56 262.026,1165.49 269.46,1165.49 C272.672,1165.49 275.618,1164.38 277.932,1162.53 L286.224,1170.69 C286.629,1171.09 287.284,1171.09 287.688,1170.69 C288.093,1170.3 288.093,1169.65 287.688,1169.25 L287.688,1169.25 Z"
                    id="search"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        </button>
        <button
          className={'flex items-center h-24 hover:bg-gray-200 transition z-[99]'}
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
      </div>

      {state.modalEventsState.isOpen && <EventsModal />}
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={'overflow-y-scroll max-h-[99.5vh] relative w-full'}
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
                hover:bg-blue-500 transition-all whitespace-nowrap px-4
                 text-ellipsis overflow-clip hover:w-[650px] duration-500 ` +
                (groupName === name ? 'bg-neutral' : '')
              }
              key={name + 'adsfmasd'}
              onClick={() => setGroupName(name)}
            >
              {name}
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
                inModal={false}
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
