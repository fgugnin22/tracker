import { ReactNode } from 'react'
import { EventType } from './App'

const EventComponent = ({
  eventData,
  timeCoef
}: {
  eventData: EventType
  timeCoef: -1 | 0 | 1
}): ReactNode => {
  const now = new Date()

  // const isStartInPast =
  //   eventData.actualStartsHour === null
  //     ? eventData.startsHour < now.getHours() ||
  //       (eventData.startsHour === now.getHours() && eventData.startsMinute <= now.getMinutes())
  //     : eventData.actualStartsHour! < now.getHours() ||
  //       (eventData.actualStartsHour === now.getHours() &&
  //         eventData.actualStartsMinute! <= now.getMinutes())
  const isEndInPast =
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
  // const isEndInFuture =
  //   eventData.actualStartsHour === null
  //     ? eventData.endsHour > now.getHours() ||
  //       (eventData.endsHour === now.getHours() && eventData.endsMinute >= now.getMinutes())
  //     : eventData.actualStartsHour - eventData.startsHour + eventData.endsHour > now.getHours() ||
  //       (eventData.actualStartsHour - eventData.startsHour + eventData.endsHour ===
  //         now.getHours() &&
  //         eventData.actualStartsMinute! - eventData.startsMinute + eventData.endsMinute >=
  //           now.getMinutes())
  console.log(
    `${
      87 *
        (eventData.actualStartsHour === null ? eventData.startsHour : eventData.actualStartsHour) +
      Math.floor(
        (eventData.actualStartsMinute === null
          ? eventData.startsMinute
          : eventData.actualStartsMinute * 87) / 60
      )
    }px`,
    87 * (eventData.actualStartsHour === null ? eventData.startsHour : eventData.actualStartsHour) +
      Math.floor(
        ((eventData.actualStartsMinute === null
          ? eventData.startsMinute
          : eventData.actualStartsMinute) *
          87) /
          60
      )
  )
  return (
    <div className=" h-[110px] w-fit flex border-b border-b-black relative">
      <div className="flex items-center w-[352px] h-full border-r border-black sticky left-0 bg-white z-10">
        {isStartInFuture && (
          <button className="absolute left-5 top-[38px]">
            <svg width="20" height="33" viewBox="0 0 20 33" fill="none">
              <path d="M0 33V0L19.5 16.5L0 33Z" fill="#4E4E4E" />
            </svg>
          </button>
        )}
        <p className=" text-center ml-14 mr-auto font-medium text-3xl">{eventData.name}</p>
        <p
          className={
            `text-right ml-auto mr-[9px] font-bold text-xl ` +
            ((timeCoef === -1 && ' text-main') ||
              (timeCoef === 1 && ' text-upcoming') ||
              (isEndInPast && ' text-main') ||
              (isStartInFuture && ' text-upcoming') ||
              ' text-neutral')
          }
        >
          {timeCoef === -1 || (isEndInPast && timeCoef === 0)
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
      </div>
      <div className="relative h-full w-[calc((87px*24)+87px)]">
        <div
          className={
            `relative h-8 mt-[39px] rounded-full -z-10 ` +
            ((timeCoef === -1 && ' bg-main') ||
              (timeCoef === 1 && ' bg-upcoming') ||
              (isEndInPast && ' bg-main') ||
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
