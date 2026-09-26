import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createTray } from './tray';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = !app.isPackaged;

function assetPath(...segments: string[]): string {
  if (isDev) {
    return join(__dirname, '..', '..', 'assets', ...segments);
  }
  return join(process.resourcesPath, 'assets', ...segments);
}

app.setAppUserModelId('com.bizos.desktop');

let mainWindow: BrowserWindow | null = null;

function rendererEntry(): string | null {
  const candidates = [
    join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'),
    join(__dirname, '..', 'renderer', 'index.html'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1366,
    height: 820,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    icon: assetPath('icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.on('closed', () => {
    mainWindow = null;
  });

  const entry = rendererEntry();

  if (entry) {
    win.loadFile(entry, { hash: '/app' });
    if (isDev) win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadURL(
      'data:text/html,<h1 style="font-family:sans-serif;padding:24px">' +
        'Renderer build missing. Run <code>npm run electron:build</code> first, then relaunch.' +
        '</h1>'
    );
  }

  return win;
}

function registerIpc(): void {
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-platform', () => process.platform);
  ipcMain.handle('app:get-app-path', () => app.getPath('userData'));
  ipcMain.handle('app:open-external', (_e, url: string) => {
    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      shell.openExternal(url);
      return true;
    }
    return false;
  });
}

app.whenReady().then(() => {
  registerIpc();
  mainWindow = createWindow();
  createTray(() => mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

process.on('uncaughtException', (err) => {
  console.error('[main] uncaughtException', err);
});

process.on('unhandledRejection', (err) => {
  console.error('[main] unhandledRejection', err);
});