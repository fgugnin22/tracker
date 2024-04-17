import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readFileSync, writeFileSync } from 'fs'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: true,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
export type EventType = {
  name: string
  date: string
  startsHour: number
  startsMinute: number
  endsHour: number
  endsMinute: number
  detail: string
  actualStartsHour: number | null
  actualStartsMinute: number | null
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.handle('save_events', async (_event, args: { payload: string }) => {
    try {
      writeFileSync(join(__dirname, '../../resources/events.json'), args.payload, {
        encoding: 'utf8'
      })
      return { isSuccess: true }
    } catch (err) {
      console.log(err, args)
      return { isSuccess: false }
    }
  })
  ipcMain.handle('get_events', async () => {
    try {
      const fileContent = readFileSync(join(__dirname, '../../resources/events.json'), 'utf8')
      let eventsData: EventType[] = []
      try {
        eventsData = JSON.parse(fileContent)
      } catch (err) {
        eventsData = []
      }
      return { data: eventsData, isSuccess: true }
    } catch (err) {
      console.log(err)
      return { data: null, isSuccess: false }
    }
  })

  ipcMain.handle('delete_event', async (_event, { eventData }: { eventData: EventType }) => {
    try {
      const fileContent = readFileSync(join(__dirname, '../../resources/events.json'), 'utf8')
      const eventsData: EventType[] = JSON.parse(fileContent)

      writeFileSync(
        join(__dirname, '../../resources/events.json'),
        JSON.stringify(
          eventsData.filter(
            (ev: EventType) =>
              !(
                ev.date === eventData.date &&
                ev.name === eventData.name &&
                ev.detail === eventData.detail &&
                ev.startsHour === eventData.startsHour &&
                ev.startsMinute === eventData.startsMinute
              )
          )
        ),
        {
          encoding: 'utf8'
        }
      )
      return { isSuccess: true }
    } catch (err) {
      console.log(err, eventData)
      return { isSuccess: false }
    }
  })
  ipcMain.handle('start_event', async (_event, args: { eventData: EventType }) => {
    try {
      const fileContent = readFileSync(join(__dirname, '../../resources/events.json'), 'utf8')
      const eventsData: EventType[] = JSON.parse(fileContent)
      eventsData[
        eventsData.findIndex(
          (ev) =>
            (ev.date === args.eventData.date || ev.date === '') &&
            ev.name === args.eventData.name &&
            ev.detail === args.eventData.detail &&
            ev.startsHour === args.eventData.startsHour &&
            ev.startsMinute === args.eventData.startsMinute
        )
      ] = args.eventData
      writeFileSync(join(__dirname, '../../resources/events.json'), JSON.stringify(eventsData), {
        encoding: 'utf8'
      })
      return { isSuccess: true }
    } catch (err) {
      console.log(err, args)
      return { isSuccess: false }
    }
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
