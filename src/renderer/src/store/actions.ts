import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { EventType } from '@renderer/types'

export interface State {
  events: { data: EventType[]; isSuccess: boolean }
  modalState: {
    isOpen: boolean
    details?: EventType
  }
  eventState: {
    loading: boolean
  }
  modalEventsState: {
    isOpen: boolean
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
  },
  modalEventsState: {
    isOpen: false
  }
}

export const getEvents = createAsyncThunk('get-events', async () => {
  const res: EventType[] = await window.electron.ipcRenderer.invoke(
    'db-query',
    'SELECT * FROM tasks;'
  )

  return res
})

export const addEvent = createAsyncThunk('add-event', async (event: EventType, thunkAPI) => {
  const sql = `INSERT INTO tasks 
  (
    duration,
    s_hour,
    s_minute,
    e_hour,
    e_minute,
    as_hour,
    as_minute,
    ae_hour,
    ae_minute,
    date,
    desc,
    name,
    group_name
  )
  VALUES 
  (
    ${event.duration ? `'${event.duration}'` : 'NULL'},
    ${event.s_hour || event.s_hour === 0 ? `'${event.s_hour}'` : 'NULL'},
    ${event.s_minute || event.s_minute === 0 ? `'${event.s_minute}'` : 'NULL'},
    ${event.e_hour || event.e_hour === 0 ? `'${event.e_hour}'` : 'NULL'},
    ${event.e_minute || event.e_minute === 0 ? `'${event.e_minute}'` : 'NULL'},
    NULL,
    NULL,
    NULL,
    NULL,
    ${event.date ? `'${event.date}'` : '""'},
    ${event.desc ? `'${event.desc}'` : 'NULL'},
    ${event.name ? `'${event.name}'` : 'NULL'},
    ${event.group_name ? `'${event.group_name}'` : 'NULL'}
  )`

  console.log(sql)

  await window.electron.ipcRenderer.invoke('db-exec', sql)

  await thunkAPI.dispatch(getEvents())

  return thunkAPI.fulfillWithValue('')
})

export const updateEvent = createAsyncThunk(
  'start-event',
  async (eventData: EventType, thunkAPI) => {
    const sql = `UPDATE tasks SET
      duration = ${eventData.duration ? `'${eventData.duration}'` : 'NULL'}, 
      s_hour = ${eventData.s_hour || eventData.s_hour === 0 ? `'${eventData.s_hour}'` : 'NULL'}, 
      s_minute = ${eventData.s_minute || eventData.s_minute === 0 ? `'${eventData.s_minute}'` : 'NULL'}, 
      e_hour = ${eventData.e_hour || eventData.e_hour === 0 ? `'${eventData.e_hour}'` : 'NULL'}, 
      e_minute = ${eventData.e_minute || eventData.e_minute === 0 ? `'${eventData.e_minute}'` : 'NULL'}, 
      as_hour = ${eventData.as_hour || eventData.as_hour === 0 ? `'${eventData.as_hour}'` : 'NULL'},  
      as_minute = ${eventData.as_minute || eventData.as_minute === 0 ? `'${eventData.as_minute}'` : 'NULL'},  
      ae_hour = ${eventData.ae_hour || eventData.ae_hour === 0 ? `'${eventData.ae_hour}'` : 'NULL'},  
      ae_minute = ${eventData.ae_minute || eventData.ae_minute === 0 ? `'${eventData.ae_minute}'` : 'NULL'},  
      date = ${eventData.date || eventData.date === '' ? `'${eventData.date}'` : "''"}, 
      desc = ${eventData.desc ? `'${eventData.desc}'` : 'NULL'}, 
      name = ${eventData.name ? `'${eventData.name}'` : 'NULL'}, 
      group_name = ${eventData.group_name ? `'${eventData.group_name}'` : 'NULL'}
      WHERE id = '${eventData.id}';
    `
    console.log(sql)

    await window.electron.ipcRenderer.invoke('db-exec', sql)

    await thunkAPI.dispatch(getEvents())

    return thunkAPI.fulfillWithValue('')
  }
)

export const deleteEvent = createAsyncThunk('delete-event', async (id: number, thunkAPI) => {
  await window.electron.ipcRenderer.invoke('db-exec', `DELETE FROM tasks WHERE id = '${id ?? -1}';`)

  await thunkAPI.dispatch(getEvents())
  return thunkAPI.fulfillWithValue('')
})

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
    },
    openEventsModal: (state) => {
      state.modalEventsState.isOpen = true
    },
    closeEventsModal: (state) => {
      state.modalEventsState.isOpen = false
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
      .addCase(updateEvent.pending, (state) => {
        state.eventState.loading = true
      })
      .addCase(updateEvent.rejected, (state) => {
        state.eventState.loading = false
      })
      .addCase(updateEvent.fulfilled, (state) => {
        state.eventState.loading = false
      })
})

// Action creators are generated for each case reducer function
export const { openModal, closeModal, openEventsModal, closeEventsModal } = slice.actions

export default slice.reducer
