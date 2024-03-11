import { ReactNode } from 'react'
import { EventType } from '../App'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import { openModal, startEvent } from '@renderer/store/actions'

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
    eventModified.actualStartsHour = now.getHours()
    eventModified.actualStartsMinute = now.getMinutes()
    eventModified.actualEndsHour =
      now.getHours() +
      eventModified.endsHour -
      eventModified.startsHour +
      Math.floor((now.getMinutes() + (eventModified.endsMinute - eventModified.startsMinute)) / 60)
    eventModified.actualEndsMinute =
      (now.getMinutes() + (eventModified.endsMinute - eventModified.startsMinute)) % 60
    await dispatch(startEvent({ eventData: eventModified }))
  }
  const actualStartsHour = eventData.actualStartsHour ?? eventData.startsHour
  const actualEndsHour = eventData.actualEndsHour ?? eventData.endsHour
  const actualStartsMinute = eventData.actualStartsMinute ?? eventData.startsMinute
  const actualEndsMinute = eventData.actualEndsMinute ?? eventData.endsMinute
  const isEndsInPast =
    timeCoef === -1 ||
    actualEndsHour < now.getHours() ||
    (actualEndsHour === now.getHours() && actualEndsMinute <= now.getMinutes())
  const isStartInFuture =
    timeCoef === 1 ||
    actualStartsHour > now.getHours() ||
    (actualStartsHour === now.getHours() && actualStartsMinute > now.getMinutes())
  const handleShowDialog = (): void => {
    dispatch(openModal(eventData))
  }
  return (
    <div className=" h-[110px] w-fit flex border-b border-b-black relative">
      <div
        onClick={handleShowDialog}
        className="flex items-center w-[352px] h-full border-r border-black sticky left-0 bg-white z-10 hover:bg-slate-200 transition"
      >
        {isStartInFuture && !state.eventState.loading ? (
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
        <p className=" text-left ml-14 mr-auto font-medium text-3xl max-w-[220px] break-words">
          {eventData.name.length > 30 ? eventData.name.slice(0, 30) + '...' : eventData.name}
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
                      ((eventData.actualEndsHour! - now.getHours()) * 60 +
                        eventData.actualEndsMinute! -
                        now.getMinutes()) /
                        ((eventData.actualEndsHour! - eventData.actualStartsHour) * 60 +
                          eventData.actualEndsMinute! -
                          eventData.actualStartsMinute!)) *
                      100
                  )}%`}
        </p>
      </div>
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
  )
}

export default EventComponent
