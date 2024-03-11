import { ReactNode, useId } from 'react'
import { EventType } from './App'

const EventComponent = ({
  eventData,
  timeCoef
}: {
  eventData: EventType
  timeCoef: -1 | 0 | 1
}): ReactNode => {
  const id = useId()
  const windowObj: Window & { appRerender?: boolean } = window
  const now = new Date()
  const handleStartButton = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation()
    const eventModified = { ...eventData }
    const now = new Date()
    eventModified.actualStartsHour = now.getHours()
    eventModified.actualStartsMinute = now.getMinutes()

    try {
      await window.electron.ipcRenderer.invoke('start_event', { eventData: eventModified })
      windowObj.appRerender = !windowObj.appRerender
    } catch (error) {
      console.log(error)
    }
  }
  const isEndsInPast =
    eventData.actualStartsHour === null
      ? eventData.endsHour < now.getHours() ||
        (eventData.endsHour === now.getHours() && eventData.endsMinute <= now.getMinutes())
      : eventData.actualStartsHour - eventData.startsHour + eventData.endsHour < now.getHours() ||
        (eventData.actualStartsHour - eventData.startsHour + eventData.endsHour ===
          now.getHours() &&
          eventData.actualStartsMinute! - eventData.startsMinute + eventData.endsMinute <=
            now.getMinutes())
  const isStartInFuture =
    (eventData.actualStartsHour === null && eventData.startsHour > now.getHours()) ||
    (eventData.startsHour === now.getHours() && eventData.startsMinute >= now.getMinutes())
  const handleShowDialog = (): void => {
    const dialog = document.getElementById(id) as HTMLDialogElement
    const dialogs = document.querySelectorAll('dialog')
    dialogs.forEach((dlg) => {
      dlg.close()
    })
    dialog.show()
  }
  const actualStartsHour = eventData.actualStartsHour ?? eventData.startsHour
  const actualEndsHour =
    eventData.actualStartsHour !== null
      ? eventData.actualStartsHour - eventData.startsHour + eventData.endsHour
      : eventData.endsHour
  const actualStartsMinute = eventData.actualStartsMinute ?? eventData.startsMinute
  const actualEndsMinute =
    eventData.actualStartsMinute !== null
      ? eventData.actualStartsMinute - eventData.startsMinute + eventData.endsMinute
      : eventData.endsMinute
  return (
    <>
      <dialog
        className="w-96 min-h-96 pl-4 pt-2 pb-3 rounded-[10px] shadow-md shadow-gray-100
         fixed left-[890px] top-[120px] ml-1 mt-1 z-50 bg-white border border-black open:flex flex-col gap-2"
        id={id}
      >
        <p className="text-xl max-w-72 break-words">
          <span className="font-semibold">Название:</span> {eventData.name}
        </p>
        <p className="text-xl max-w-72 break-words">
          {' '}
          <span className="font-semibold">Дата:</span> {eventData.date}
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
          <span className="font-semibold">Описание:</span> {eventData.details}
        </p>
        <button
          className="text-3xl absolute top-2 right-2 rotate-45 w-10 h-10 hover:bg-slate-300 rounded-full flex items-center justify-center transition border"
          onClick={() => {
            document.querySelectorAll('dialog').forEach((dlg) => dlg.close())
          }}
        >
          +
        </button>
      </dialog>
      <div className=" h-[110px] w-fit flex border-b border-b-black relative">
        <button
          onClick={handleShowDialog}
          className="flex items-center w-[352px] h-full border-r border-black sticky left-0 bg-white z-10 hover:bg-slate-200 transition"
        >
          {isStartInFuture && eventData.actualStartsHour === null && (
            <button onClick={handleStartButton} className="absolute left-5 top-[38px]">
              <svg width="20" height="33" viewBox="0 0 20 33" fill="none">
                <path d="M0 33V0L19.5 16.5L0 33Z" fill="#4E4E4E" />
              </svg>
            </button>
          )}
          <p className=" text-left ml-14 mr-auto font-medium text-3xl max-w-[220px] break-words">
            {eventData.name.length > 30 ? eventData.name.slice(0, 30) + '...' : eventData.name}
          </p>
          <p
            className={
              `text-right ml-auto mr-[9px] font-bold text-xl ` +
              ((timeCoef === -1 && ' text-main') ||
                (timeCoef === 1 && ' text-upcoming') ||
                (isEndsInPast && ' text-main') ||
                (isStartInFuture && ' text-upcoming') ||
                ' text-neutral')
            }
          >
            {timeCoef === -1 || (isEndsInPast && timeCoef === 0)
              ? '100%'
              : timeCoef === 1 || (isStartInFuture && timeCoef === 0)
                ? '0%'
                : eventData.actualStartsHour === null
                  ? `${Math.round(
                      (1 -
                        ((eventData.endsHour - now.getHours()) * 60 +
                          eventData.endsMinute -
                          now.getMinutes()) /
                          ((eventData.endsHour - eventData.startsHour) * 60 +
                            eventData.endsMinute -
                            eventData.startsMinute)) *
                        100
                    )}%`
                  : `${Math.round(
                      (1 -
                        ((eventData.actualStartsHour -
                          eventData.startsHour +
                          eventData.endsHour -
                          now.getHours()) *
                          60 +
                          eventData.actualStartsMinute! -
                          eventData.startsMinute +
                          eventData.endsMinute -
                          now.getMinutes()) /
                          ((eventData.endsHour - eventData.startsHour) * 60 +
                            eventData.endsMinute -
                            eventData.startsMinute)) *
                        100
                    )}%`}
          </p>
        </button>
        <div className="relative h-full w-[calc((87px*24)+87px)]">
          <div
            className={
              `relative h-8 mt-[39px] rounded-full -z-10 ` +
              ((timeCoef === -1 && ' bg-main') ||
                (timeCoef === 1 && ' bg-upcoming') ||
                (isEndsInPast && ' bg-main') ||
                (isStartInFuture && ' bg-upcoming') ||
                ' bg-neutral')
            }
            style={{
              marginLeft: `${
                40 +
                87 *
                  (eventData.actualStartsHour === null
                    ? eventData.startsHour
                    : eventData.actualStartsHour) +
                Math.floor(
                  ((eventData.actualStartsMinute === null
                    ? eventData.startsMinute
                    : eventData.actualStartsMinute) *
                    87) /
                    60
                )
              }px`,
              width: `${87 * (eventData.endsHour - eventData.startsHour) + Math.floor(((eventData.endsMinute - eventData.startsMinute) / 60) * 87)}px`
            }}
          ></div>
        </div>
      </div>
    </>
  )
}

export default EventComponent
