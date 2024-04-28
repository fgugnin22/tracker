import { useAppDispatch, useAppSelector } from '@renderer/store'
import { closeModal, deleteEvent } from '@renderer/store/actions'

const EventModal: React.FC = () => {
  const dispatch = useAppDispatch()

  const state = useAppSelector((state) => state.main)

  const actualStartsHour =
    state.modalState.details?.as_hour ?? state.modalState.details?.s_hour ?? -1
  const actualEndsHour = state.modalState.details?.ae_hour ?? state.modalState.details?.e_hour ?? -1
  const actualStartsMinute =
    state.modalState.details?.as_minute ?? state.modalState.details?.s_minute ?? -1
  const actualEndsMinute =
    state.modalState.details?.ae_minute ?? state.modalState.details?.e_minute ?? -1

  return (
    <dialog
      open={state.modalState.isOpen}
      className="w-96 min-h-96 pl-4 pt-2 pb-3 rounded-[10px] shadow-md shadow-gray-100
 fixed left-[890px] top-[120px] ml-1 mt-1 z-50 bg-white border border-black open:flex flex-col gap-2"
    >
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
          {`${Math.floor(state.modalState.details.duration / 60)}:${state.modalState.details.duration % 60}`}
        </p>
      )}
      <p className="text-xl max-w-[352px] break-words">
        <span className="font-semibold">Описание:</span> {state.modalState.details?.desc}
      </p>
      <button
        className="text-3xl absolute top-2 right-2 rotate-45 w-10 h-10 hover:bg-slate-300 rounded-full flex items-center justify-center transition border"
        onClick={() => dispatch(closeModal())}
      >
        +
      </button>
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
        className="mt-auto p-3 rounded-[10px] bg-red-500 mr-4 font-medium text-white text-lg hover:bg-red-600 transition duration-100 active:bg-black"
      >
        Удалить событие!
      </button>
    </dialog>
  )
}

export default EventModal
