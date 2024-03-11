import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { EventType } from '@renderer/App'

export interface State {
  events: { data: EventType[]; isSuccess: boolean }
  modalState: {
    isOpen: boolean
    details?: EventType
  }
  eventState: {
    loading: boolean
  }
}

const initialState: State = {
  events: { data: [], isSuccess: false },
  modalState: {
    isOpen: false,
    details: undefined
  },
  eventState: {
    loading: false
  }
}

export const getEvents = createAsyncThunk('get-events', async () => {
  const res: { data: EventType[]; isSuccess: boolean } =
    await window.electron.ipcRenderer.invoke('get_events')
  return res.data
})
export const addEvent = createAsyncThunk('add-event', async (events: EventType[], thunkAPI) => {
  await window.electron.ipcRenderer.invoke('save_events', {
    payload: JSON.stringify(events)
  })
  await thunkAPI.dispatch(getEvents())
  return thunkAPI.fulfillWithValue('')
})
export const startEvent = createAsyncThunk(
  'start-event',
  async ({ eventData }: { eventData: EventType }, thunkAPI) => {
    await window.electron.ipcRenderer.invoke('start_event', { eventData })
    await thunkAPI.dispatch(getEvents())
    return thunkAPI.fulfillWithValue('')
  }
)
// export const exportEvents = createAsyncThunk('add-event', async (args, thunkAPI) => {})

export const slice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<EventType>) => {
      state.modalState.isOpen = true
      state.modalState.details = action.payload
    },
    closeModal: (state) => {
      state.modalState.details = undefined
      state.modalState.isOpen = false
    }
  },
  extraReducers: (builder) =>
    builder
      .addCase(getEvents.pending, (state) => {
        state.eventState.loading = true
      })
      .addCase(getEvents.rejected, (state) => {
        state.eventState.loading = false
        state.events.isSuccess = false
      })
      .addCase(getEvents.fulfilled, (state, action: PayloadAction<EventType[]>) => {
        state.eventState.loading = false
        state.events.data = action.payload
        state.events.isSuccess = true
      })
      .addCase(addEvent.pending, (state) => {
        state.eventState.loading = true
      })
      .addCase(addEvent.rejected, (state) => {
        state.eventState.loading = false
      })
      .addCase(addEvent.fulfilled, (state) => {
        state.eventState.loading = false
      })
      .addCase(startEvent.pending, (state) => {
        state.eventState.loading = true
      })
      .addCase(startEvent.rejected, (state) => {
        state.eventState.loading = false
      })
      .addCase(startEvent.fulfilled, (state) => {
        state.eventState.loading = false
      })
})

// Action creators are generated for each case reducer function
export const { openModal, closeModal } = slice.actions

export default slice.reducer
