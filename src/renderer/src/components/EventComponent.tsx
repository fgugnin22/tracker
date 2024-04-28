import { ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { openModal, updateEvent } from '@renderer/store/actions'
import { EventType } from '@renderer/types'

const EventComponent = ({
  eventData,
  timeCoef
}: {
  eventData: EventType
  timeCoef: -1 | 0 | 1
}): ReactNode => {
  const dispatch = useAppDispatch()
  const state = useAppSelector((state) => state.main)

  const now = new Date()

  const handleStartButton = async (event: React.MouseEvent): Promise<void> => {
    event.stopPropagation()
    const eventModified = { ...eventData }
    const now = new Date()

    if (
      !eventModified.date &&
      eventModified.s_hour !== null &&
      eventModified.s_hour !== undefined
    ) {
      eventModified.date = now.toLocaleDateString()
    } else {
      eventModified.as_hour = now.getHours()
      eventModified.as_minute = now.getMinutes()

      const d_hours = Math.floor(eventModified.duration / 60)
      const d_minutes = eventModified.duration % 60

      eventModified.ae_hour =
        now.getHours() + d_hours + Math.floor((now.getMinutes() + d_minutes) / 60)
      eventModified.ae_minute = (now.getMinutes() + d_minutes) % 60

      if (eventModified.date === '') {
        eventModified.date = now.toLocaleDateString()
      }
    }

    eventModified.s_hour ??= eventModified.as_hour
    eventModified.e_hour ??= eventModified.ae_hour
    eventModified.s_minute ??= eventModified.as_minute
    eventModified.e_minute ??= eventModified.ae_minute

    await dispatch(updateEvent(eventModified))
  }

  const actualStartsHour = Number(eventData.as_hour ?? eventData.s_hour)
  const actualEndsHour = Number(eventData.ae_hour ?? eventData.e_hour)
  const actualStartsMinute = Number(eventData.as_minute ?? eventData.s_minute)
  const actualEndsMinute = Number(eventData.ae_minute ?? eventData.e_minute)

  const isEndsInPast =
    timeCoef !== 1 &&
    (timeCoef === -1 ||
      actualEndsHour < now.getHours() ||
      (actualEndsHour === now.getHours() && actualEndsMinute <= now.getMinutes()))

  const isStartInFuture =
    timeCoef !== -1 &&
    (timeCoef === 1 ||
      actualStartsHour > now.getHours() ||
      (actualStartsHour === now.getHours() && actualStartsMinute > now.getMinutes()))

  const handleShowDialog = (): void => {
    dispatch(openModal(eventData))
  }

  return (
    <div
      className={` h-[110px] w-fit flex border-b border-b-black relative ${eventData.date === '' ? 'border-l border-l-black first-of-type:border-t first-of-type:border-t-black' : ''}`}
    >
      <div
        onClick={handleShowDialog}
        className={`flex items-center w-[352px] h-full border-r border-black sticky left-0
        z-50 bg-white hover:bg-slate-200 transition hover:cursor-pointer`}
      >
        {(isStartInFuture && timeCoef === 0 && !state.eventState.loading) ||
        eventData.date === '' ? (
          <button onClick={handleStartButton} className="absolute left-5 top-[38px]">
            <svg width="20" height="33" viewBox="0 0 20 33" fill="none">
              <path d="M0 33V0L19.5 16.5L0 33Z" fill="#4E4E4E" />
            </svg>
          </button>
        ) : state.eventState.loading ? (
          <div className="absolute left-3" role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : null}
        <p className=" text-left ml-14 mr-auto font-medium text-[20px] leading-6 max-w-[220px] break-words">
          {eventData.name.length > 50 ? eventData.name.slice(0, 50) + '...' : eventData.name}
        </p>
        <p
          className={
            `text-right ml-auto mr-[9px] font-bold text-xl ` +
            ((isEndsInPast && ' text-main') ||
              (isStartInFuture && ' text-upcoming') ||
              ' text-neutral')
          }
        >
          {isEndsInPast
            ? '100%'
            : isStartInFuture
              ? '0%'
              : eventData.as_hour === null
                ? `${Math.round(
                    (1 -
                      ((eventData.e_hour! - now.getHours()) * 60 +
                        eventData.e_minute! -
                        now.getMinutes()) /
                        ((eventData.e_hour! - eventData.s_hour!) * 60 +
                          eventData.e_minute! -
                          eventData.s_minute!)) *
                      100
                  )}%`
                : `${Math.round(
                    (1 -
                      ((eventData.ae_hour! - now.getHours()) * 60 +
                        eventData.ae_minute! -
                        now.getMinutes()) /
                        ((eventData.ae_hour! - eventData.as_hour!) * 60 +
                          eventData.ae_minute! -
                          eventData.as_minute!)) *
                      100
                  )}%`}
        </p>
      </div>
      {eventData.date && (
        <div className="relative h-full w-[calc((87px*24)+87px)] overflow-hidden">
          <div
            onClick={handleShowDialog}
            className={
              `relative h-8 mt-[39px] rounded-full duration-100 z-10 hover:cursor-pointer` +
              ((timeCoef === -1 && ' bg-main hover:bg-green-600') ||
                (timeCoef === 1 && ' bg-upcoming hover:bg-gray-600') ||
                (isEndsInPast && ' bg-main hover:bg-green-600') ||
                (isStartInFuture && ' bg-upcoming hover:bg-gray-600') ||
                ' bg-neutral hover:bg-blue-500')
            }
            style={{
              marginLeft: `${
                40 +
                87 * (eventData.as_hour === null ? eventData.s_hour! : eventData.as_hour!) +
                Math.floor(
                  ((eventData.as_minute === null ? eventData.s_minute! : eventData.as_minute!) *
                    87) /
                    60
                )
              }px`,
              width: `${87 * (actualEndsHour - actualStartsHour) + Math.floor(((actualEndsMinute - actualStartsMinute) / 60) * 87)}px`
            }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default EventComponent
