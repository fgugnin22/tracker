export type EventExport = {
  название: string
  дата: string | null
  начало: string
  конец: string
  длительность: string
  описание: string | null
}

export type EventType = {
  id: number
  duration: number
  s_hour?: number | null
  s_minute?: number | null
  e_hour?: number | null
  e_minute?: number | null
  as_hour?: number | null
  as_minute?: number | null
  ae_hour?: number | null
  ae_minute?: number | null
  date?: string
  desc?: string
  name: string
  group_name: string
}
