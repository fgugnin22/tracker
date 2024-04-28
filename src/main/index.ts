import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import sqlite3 from 'sqlite3'

const db = new (sqlite3.verbose().Database)(join(__dirname, '../../resources/data.sqlite3'))

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS "tasks" (
    "id"	INTEGER NOT NULL UNIQUE,
    "duration"	INTEGER,
    "s_hour"	INTEGER,
    "s_minute"	INTEGER,
    "e_hour"	INTEGER,
    "e_minute"	INTEGER,
    "as_hour"	INTEGER,
    "as_minute"	INTEGER,
    "ae_hour" INTEGER,
    "ae_minute" INTEGER,
    "date"	TEXT,
    "desc"	TEXT,
    "name"	TEXT,
    "group_name"	TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
  );`)
})

function createWindow(): void {
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('db-query', async (_event, sqlQuery) => {
    const res = await new Promise((res) => {
      db.all(sqlQuery, (err, rows) => {
        if (err) {
          res([])
        }

        res(rows)
      })
    })

    return res
  })

  ipcMain.handle('db-exec', async (_event, sqlQuery) => {
    const res = await new Promise((res) => {
      db.exec(sqlQuery, (err) => {
        if (err) {
          res('bad')
        }

        res('good')
      })
    })

    return res
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
