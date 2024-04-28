import { useAppDispatch, useAppSelector } from '@renderer/store'
import { addEvent } from '@renderer/store/actions'
import { EventType } from '@renderer/types'
import { ReactNode, useState } from 'react'

type CreateEventFormProps = {
  setFormVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateEventForm: React.FC<CreateEventFormProps> = (
  props: CreateEventFormProps
): ReactNode => {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const [hasDate, setHasDate] = useState(true)
  const [customError, setCustomError] = useState('')

  const date = new Date()

  const handleSaveClick = async (): Promise<undefined> => {
    const form = document.querySelector('form') as HTMLFormElement
    if (!form.reportValidity()) {
      return
    }

    const formData = new FormData(form)
    const newEvent: EventType = (state.events.data[0] && { ...state.events.data[0] }) ?? {}

    newEvent.as_hour = null
    newEvent.as_minute = null
    newEvent.ae_hour = null
    newEvent.ae_minute = null

    for (const [key, value] of formData.entries()) {
      if (key === 'starts' || key === 'ends') {
        newEvent[(key === 'starts' ? 's_' : 'e_') + 'hour'] = Number(String(value).split(':')[0])
        newEvent[(key === 'starts' ? 's_' : 'e_') + 'minute'] = Number(String(value).split(':')[1])
      } else if (key === 'date' && hasDate) {
        const arr = String(value).split('-')

        newEvent[key] = `${arr[2]}.${arr[1]}.${arr[0]}`
      } else {
        newEvent[key] = value
      }
    }

    if (!hasDate) {
      newEvent.s_hour = 0
      newEvent.s_minute = 0
      newEvent.date = ''
    }

    if (
      newEvent.e_hour! < newEvent.s_hour! ||
      (newEvent.e_hour === newEvent.s_hour && newEvent.e_minute! <= newEvent.s_minute!)
    ) {
      setCustomError('Начало должно быть раньше конца!')

      setTimeout(() => setCustomError(''), 3000)
      return
    }

    await dispatch(addEvent(newEvent))

    props.setFormVisibility(false)
  }
  return (
    <form className="flex flex-col gap-2 w-full mt-8 text-lg font-medium">
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
          <div key={'third'} className="flex gap-2 justify-between items-start">
            <label className="mt-[2px]" htmlFor="timeTo">
              Продолжительность:
            </label>
            <input
              required
              name="ends"
              className="border rounded-[10px] p-[5px] text-base"
              type="text"
              id="timeTo"
              placeholder="02:30"
              pattern="[0-9]{2}:[0-9]{2}"
            />
          </div>
        </>
      )}
      <div className="flex gap-2 justify-between items-start">
        <label className="mt-[2px]" htmlFor="details">
          Описание:
        </label>
        <textarea
          name="details"
          className="border rounded-[10px] p-[5px] text-base grow"
          id="details"
        />
      </div>
      <button
        className=" bg-gray-500 hover:bg-slate-600 transition py-3 grow rounded-[10px] text-lg font-semibold text-white"
        type="button"
        onClick={handleSaveClick}
      >
        {customError.length > 0 ? customError : 'Сохранить'}
      </button>
    </form>
  )
}

export default CreateEventForm
