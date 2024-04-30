import { AppDispatch } from '@renderer/store'
import { addEvent } from '@renderer/store/actions'
import { EventType } from '@renderer/types'
import readXlsxFile from 'read-excel-file'
import { Row } from 'read-excel-file/types'

export const importEvents = (fileName: File, dispatch: AppDispatch): void => {
  readXlsxFile(fileName).then((rows) => {
    // `rows` is an array of rows
    // each row being an array of cells.
    for (let i = 1; i < rows.length; i++) {
      createEventFromRow(rows[i], dispatch)
    }
  })
}

const createEventFromRow = (row: Row, dispatch: AppDispatch): void => {
  const groupName = row[0] as string
  const eventName = row[1] as string
  const date = row[2] as unknown as Date | null
  const start = row[3] as string | null
  const end = row[4] as string | null
  const duration = row[5] as number | null
  const desc = row[6] as string

  const newEvent = {} as unknown as EventType
  newEvent.name = eventName
  newEvent.group_name = groupName
  newEvent.desc = desc

  if (date) {
    newEvent.date = date.toLocaleDateString()
  } else {
    newEvent.date = ''
  }

  if (duration) {
    newEvent.duration = duration
  } else {
    const [s_hour, s_minute] = start?.split('-').map(Number) ?? [0, 0]
    const [e_hour, e_minute] = end?.split('-').map(Number) ?? [0, 0]

    newEvent.s_hour = s_hour
    newEvent.s_minute = s_minute
    newEvent.e_hour = e_hour
    newEvent.e_minute = e_minute
    newEvent.duration = (e_hour - s_hour) * 60 + e_minute - s_minute
  }

  console.log(newEvent)

  dispatch(addEvent(newEvent))
}
