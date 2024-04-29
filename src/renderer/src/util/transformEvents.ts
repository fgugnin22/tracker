import { EventExport, EventType } from '@renderer/types'

const sortEvents = (events: EventType[]): EventType[] => {
  return events.toSorted((a, b) => {
    const yearA = Number(a.date?.slice(6, undefined))
    const yearB = Number(b.date?.slice(6, undefined))
    if (yearA !== yearB) {
      return yearA - yearB
    }

    const monthA = Number(a.date?.slice(3, 5))
    const monthB = Number(b.date?.slice(3, 5))
    if (monthA !== monthB) {
      return monthA - monthB
    }

    const dayA = Number(a.date?.slice(0, 2))
    const dayB = Number(b.date?.slice(0, 2))
    return dayA - dayB
  })
}

export const transformEvents = (events: EventType[]): EventExport[] => {
  const now = new Date()

  return sortEvents(events).map((ev) => {
    const actualSH = ev.s_hour ?? ev.as_hour ?? 0
    const actualSM = ev.s_minute ?? ev.as_minute ?? 0
    const duration = ev.duration

    const [day, month, year] = ev.date?.split('.').map(Number) ?? [0, 0, 0]

    const evStartDate = new Date(
      `${year}-${month > 9 ? month : `0${month}`}-${day > 9 ? day : `0${day}`}T${actualSH > 9 ? actualSH : `0${actualSH}`}:${actualSM > 9 ? actualSM : `0${actualSM}`}:00`
    )

    let percent = Math.round(((now.getTime() - evStartDate.getTime()) / (60000 * duration)) * 100)

    percent = Math.min(100, percent)
    percent = Math.max(0, percent)

    const durationInMinutes = (ev.e_hour! - ev.s_hour!) * 60 + (ev.e_minute! - ev.s_minute!)

    const evExport = {
      название: ev.name,
      дата: ev.date ?? '',
      начало: ev.as_hour !== null ? `${ev.as_hour}:${ev.as_minute}` : `${ev.s_hour}:${ev.s_minute}`,
      конец: ev.ae_hour !== null ? `${ev.ae_hour}:${ev.ae_minute}` : `${ev.e_hour}:${ev.e_minute}`,
      длительность: `${Math.floor(durationInMinutes / 60)} часов, ${durationInMinutes % 60} минут`,
      описание: ev.desc ?? '',
      'процент выполнения': percent
    }
    return evExport
  })
}
