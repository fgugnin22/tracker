import { useAppDispatch, useAppSelector } from '@renderer/store'
import { ReactNode } from 'react'
import EventComponent from './EventComponent'
import { closeEventsModal } from '@renderer/store/actions'

const EventsModal = (): ReactNode => {
  const dispatch = useAppDispatch()

  const events = useAppSelector((state) => state.main.events.data).filter(
    (event) => event.date === ''
  )

  return (
    <div
      className="absolute top-7 z-[99] py-8 left-[30px] bg-white w-[450px] min-h-[800px] border 
    rounded-xl overflow-y-scroll scrollbar-none flex flex-col items-center flex-wrap"
    >
      <button
        onClick={() => dispatch(closeEventsModal())}
        className="absolute top-0 right-0 w-16 hover:bg-red-600 transition text-center bg-black h-7 text-white font-bold text-3xl flex items-center justify-center"
      >
        <span className="rotate-45">+</span>
      </button>
      {events.map((e) => (
        <EventComponent key={JSON.stringify(e)} eventData={e} timeCoef={1} />
      ))}
    </div>
  )
}

export default EventsModal
