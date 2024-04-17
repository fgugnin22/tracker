import { useAppDispatch, useAppSelector } from '@renderer/store'
import { ReactNode, useState } from 'react'
import EventComponent from './EventComponent'
import { closeEventsModal } from '@renderer/store/actions'

const EventsModal = (): ReactNode => {
  const dispatch = useAppDispatch()

  const events = useAppSelector((state) => state.main.events.data).filter(
    (event) => event.date === ''
  )

  const [query, setQuery] = useState('')

  return (
    <div
      className="absolute top-7 z-[99] py-8 left-[30px] bg-white w-[450px] min-h-[800px] max-h-[900px] border border-gray-500
    rounded-xl overflow-y-scroll scrollbar-none flex flex-col items-center"
    >
      <input
        className="p-1 text-lg border-2 border-gray-400 w-[352px] rounded-xl mb-4 focus:border-blue-600 outline-none"
        type="text"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={() => dispatch(closeEventsModal())}
        className="absolute top-0 right-0 w-16 hover:bg-red-600 transition text-center bg-black h-7 text-white font-bold text-3xl flex items-center justify-center"
      >
        <span className="rotate-45">+</span>
      </button>
      <div>
        {events
          .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()))
          .map((e) => (
            <EventComponent key={JSON.stringify(e)} eventData={e} timeCoef={1} />
          ))}
      </div>
    </div>
  )
}

export default EventsModal
