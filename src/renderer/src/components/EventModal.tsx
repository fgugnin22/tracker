import { useAppDispatch, useAppSelector } from '@renderer/store'
import { closeModal, deleteEvent } from '@renderer/store/actions'
import { useEffect, useState } from 'react'
import CreateEventForm from './CreateEventForm'

const EventModal: React.FC = () => {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const [isFormOpen, setIsFormOpen] = useState(false)

  const actualStartsHour =
    state.modalState.details?.as_hour ?? state.modalState.details?.s_hour ?? -1
  const actualEndsHour = state.modalState.details?.ae_hour ?? state.modalState.details?.e_hour ?? -1
  const actualStartsMinute =
    state.modalState.details?.as_minute ?? state.modalState.details?.s_minute ?? -1
  const actualEndsMinute =
    state.modalState.details?.ae_minute ?? state.modalState.details?.e_minute ?? -1

  useEffect(() => {
    setIsFormOpen(false)
  }, [state.modalState.details?.id])

  return (
    <dialog
      open={state.modalState.isOpen}
      className="w-[500px] h-[600px] px-6 pt-6 pb-3 rounded-[10px] shadow-md shadow-gray-100
 fixed left-[890px] top-[120px] ml-1 mt-1 z-50 bg-white border border-black open:flex flex-col gap-2 z-[102]"
    >
      {isFormOpen ? (
        <>
          <h2 className="text-xl font-medium -mb-2">Редактирование события</h2>
          <CreateEventForm action="update" key={'updateform'} />
        </>
      ) : (
        <>
          <p className="text-xl max-w-72 break-words">
            <span className="font-semibold">Название:</span> {state.modalState.details?.name}
          </p>

          {state.modalState.details?.s_hour !== null ? (
            <>
              {state.modalState.details?.date && (
                <p key={'fourthp'} className="text-xl max-w-72 break-words">
                  {' '}
                  <span className="font-semibold">Дата:</span> {state.modalState.details?.date}
                </p>
              )}
              <p key={'firstp'} className="text-xl max-w-72 break-words">
                <span className="font-semibold">Начало:</span>{' '}
                {`${actualStartsHour > 9 ? actualStartsHour : `0${actualStartsHour}`}:${
                  actualStartsMinute > 9 ? actualStartsMinute : `0${actualStartsMinute}`
                }`}
              </p>
              <p key={'secondp'} className="text-xl max-w-72 break-words">
                <span className="font-semibold">Конец:</span>{' '}
                {`${actualEndsHour > 9 ? actualEndsHour : `0${actualEndsHour}`}:${
                  actualEndsMinute > 9 ? actualEndsMinute : `0${actualEndsMinute}`
                }`}
              </p>
            </>
          ) : (
            <p key={'thirdp'} className="text-xl max-w-72 break-words">
              <span className="font-semibold">Продолжительность:</span>{' '}
              {`${Math.floor(Number(state.modalState.details?.duration) / 60) > 9 ? Math.floor(Number(state.modalState.details?.duration) / 60) : `0${Math.floor(Number(state.modalState.details?.duration) / 60)}`}:${Number(state.modalState.details?.duration) % 60 > 9 ? Number(state.modalState.details?.duration) % 60 : `0${Number(state.modalState.details?.duration) % 60}`}`}
            </p>
          )}
          <p className="text-xl max-w-[352px] break-words">
            <span className="font-semibold">Описание:</span> {state.modalState.details?.desc}
          </p>
        </>
      )}

      <button
        className="text-3xl absolute top-2 right-2 rotate-45 w-10 h-10 hover:bg-slate-300 rounded-full flex items-center justify-center transition border"
        onClick={() => dispatch(closeModal())}
      >
        +
      </button>
      <div className="flex flex-col gap-2 mt-auto">
        {isFormOpen ? (
          <>
            <button
              onClick={async (e) => {
                ;(e.target as HTMLButtonElement).disabled = true
                const ev = state.events.data.find((e) => e.id === state.modalState.details?.id)

                if (!ev) {
                  ;(e.target as HTMLButtonElement).disabled = false
                  return
                }

                await dispatch(deleteEvent(ev.id))
                ;(e.target as HTMLButtonElement).disabled = false
                dispatch(closeModal())
              }}
              className=" bg-red-500 hover:bg-red-600 transition py-3 rounded-[10px] text-lg font-semibold text-white mt-auto"
            >
              Удалить
            </button>
            <button
              onClick={() => setIsFormOpen(false)}
              className=" bg-orange-400 hover:bg-orange-500 transition py-3 rounded-[10px] text-lg font-semibold text-white mt-auto"
            >
              Закрыть редактирование
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsFormOpen(true)}
            className=" bg-neutral hover:bg-blue-600 transition py-3 rounded-[10px] text-lg font-semibold text-white mt-auto"
          >
            Редактировать
          </button>
        )}
      </div>
    </dialog>
  )
}

export default EventModal
