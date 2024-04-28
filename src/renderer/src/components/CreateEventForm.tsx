import { useAppDispatch, useAppSelector } from '@renderer/store'
import { addEvent } from '@renderer/store/actions'
import { EventType } from '@renderer/types'
import { ReactNode, useState } from 'react'

const CreateEventForm: React.FC = (): ReactNode => {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const [hasDate, setHasDate] = useState(true)
  const [hasDuration, setHasDuration] = useState(false)
  const [customError, setCustomError] = useState('')

  const date = new Date()

  const handleSaveClick = async (): Promise<undefined> => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form.reportValidity()) {
      return
    }

    const formData = new FormData(form)
    const newEvent: EventType = {} as unknown as EventType

    newEvent.name = String(formData.get('name'))
    newEvent.desc = String(formData.get('desc'))
    newEvent.group_name = String(formData.get('group_name'))

    const starts = String(formData.get('starts'))
    const ends = String(formData.get('ends'))
    const duration = String(formData.get('duration'))

    if (hasDate) {
      const dateStr = String(formData.get('date'))

      const [year, month, date] = dateStr.split('-').map((v) => Number(v))

      newEvent.date = `${date > 9 ? date : `0${date}`}.${month > 9 ? month : `0${month}`}.${year > 9 ? year : `0${year}`}`
    }

    if (hasDate || (!hasDate && !hasDuration)) {
      const [startsHour, startsMinute] = starts.split(':').map((v) => Number(v))
      const [endsHour, endsMinute] = ends.split(':').map((v) => Number(v))

      newEvent.s_hour = startsHour
      newEvent.s_minute = startsMinute
      newEvent.e_hour = endsHour
      newEvent.e_minute = endsMinute
      newEvent.duration = (endsHour - startsHour) * 60 + (endsMinute - startsMinute)
    }

    if (!hasDate && hasDuration) {
      const [durationHour, durationMinute] = duration.split(':').map((v) => Number(v))

      newEvent.duration = durationHour * 60 + durationMinute
      console.log(123)
    }

    if (
      newEvent.e_hour! < newEvent.s_hour! ||
      (newEvent.e_hour === newEvent.s_hour && newEvent.e_minute! <= newEvent.s_minute!)
    ) {
      setCustomError('Начало должно быть раньше конца!')

      setTimeout(() => setCustomError(''), 3000)
      return
    }

    console.log(newEvent)

    await dispatch(addEvent(newEvent))

    form.reset()
  }
  return (
    <form className="flex flex-col gap-2 w-full mt-4 text-lg font-medium grow">
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
      <div className="flex gap-2 justify-between items-center h-[37px]">
        <label className="mb-1" htmlFor="">
          Дата:{' '}
        </label>
        <div className="mr-auto mb-1 flex items-center">
          <input
            id="checked-checkbox"
            type="checkbox"
            value=""
            onChange={() => setHasDate(!hasDate)}
            className="w-5 h-5 text-blue-600
bg-gray-100 border-gray-300 rounded focus:ring-blue-500 
dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={hasDate}
          />
        </div>
        {hasDate && (
          <input
            required
            defaultValue={`${date.getFullYear()}-${date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`}`}
            name="date"
            className="border rounded-[10px] p-[5px] text-base"
            type="date"
          />
        )}
      </div>
      {hasDate ? (
        <>
          <div key={'first'} className="flex gap-2 justify-between items-start">
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
          <div key={'second'} className="flex gap-2 justify-between items-start">
            <label className="mt-[2px]" htmlFor="timeTo">
              Заканчивается в:
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
        </>
      ) : (
        <>
          <div key="fortharg" className="flex gap-2 justify-between items-start">
            <label htmlFor="whatever">Формат старта события</label>
            <select
              className="border w-40 rounded-[10px] p-[5px] text-base"
              name="whatever"
              id="whatever"
              onChange={(e) => {
                const value = e.target.value
                if (value === 'duration') {
                  setHasDuration(true)
                } else {
                  setHasDuration(false)
                }
              }}
              required
            >
              <option value="" selected></option>
              <option value="duration">Продолжительность</option>
              <option value="startend">Фиксированное время начала и конца</option>
            </select>
          </div>
          {hasDuration ? (
            <div key={'third'} className="flex gap-2 justify-between items-start">
              <label className="mt-[2px]" htmlFor="timeTo">
                Продолжительность:
              </label>
              <input
                required
                name="duration"
                className="border rounded-[10px] p-[5px] text-base"
                type="text"
                id="timeTo"
                placeholder="02:30"
                pattern="[0-9]{2}:[0-9]{2}"
              />
            </div>
          ) : (
            <>
              <div key={'first'} className="flex gap-2 justify-between items-start">
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
              <div key={'second'} className="flex gap-2 justify-between items-start">
                <label className="mt-[2px]" htmlFor="timeTo">
                  Заканчивается в:
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
            </>
          )}
        </>
      )}
      <div key={'afsdasdfasd'} className="flex gap-2 justify-between items-start">
        <label className="mt-[2px]" htmlFor="group_name">
          Название группы
        </label>
        <input
          required
          name="group_name"
          className="border rounded-[10px] p-[5px] text-base"
          type="text"
          id="group_name"
          list="group_names"
        />
        <datalist id="group_names">
          {[...new Set(state.events.data.map((ev) => ev.group_name))].map((group_name) => (
            <option key={group_name} value={group_name} />
          ))}
        </datalist>
      </div>
      <div className="flex gap-2 justify-between items-start">
        <label className="mt-[2px]" htmlFor="desc">
          Описание:
        </label>
        <textarea name="desc" className="border rounded-[10px] p-[5px] text-base grow" id="desc" />
      </div>
      <button
        className=" bg-gray-500 hover:bg-slate-600 transition py-3 rounded-[10px] text-lg font-semibold text-white mt-auto"
        type="button"
        onClick={handleSaveClick}
      >
        {customError.length > 0 ? customError : 'Сохранить'}
      </button>
    </form>
  )
}

export default CreateEventForm
