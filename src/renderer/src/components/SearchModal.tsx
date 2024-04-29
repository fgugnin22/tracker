import { useAppSelector } from '@renderer/store'
import { useState } from 'react'
import EventComponent from './EventComponent'

type SearchModalProps = {
  setState: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchModal: React.FC<SearchModalProps> = (props: SearchModalProps) => {
  const [search, setSearch] = useState('')
  const events = useAppSelector((state) => state.main.events.data)

  const filtered = events.filter(
    (e) => !!search && e.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="absolute top-16 left-20 right-96 h-[500px] rounded-xl border border-black z-[101] bg-white flex flex-col py-6 pl-8 pr-14 ">
      <button
        className="text-3xl absolute top-2 right-2 rotate-45 w-10 h-10 hover:bg-slate-300 rounded-full flex items-center justify-center transition border"
        onClick={() => props.setState(false)}
      >
        +
      </button>
      <input
        className="p-2 rounded-xl text-xl border border-black focus:border-blue-700 transition outline-none mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Начните вводить название события"
      />
      {filtered.map((e) => {
        return (
          <EventComponent
            timeCoef={0}
            key={e.id + 'adsfasfd' + e.duration}
            eventData={{ ...e, date: '' }}
          />
        )
      })}
    </div>
  )
}

export default SearchModal
