import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function assetPath(...segments: string[]): string {
  if (!app.isPackaged) {
    return join(__dirname, '..', '..', 'assets', ...segments);
  }
  return join(process.resourcesPath, 'assets', ...segments);
}

let tray: Tray | null = null;

export function createTray(getMainWindow: () => BrowserWindow | null): Tray | null {
  const iconPath = assetPath('tray.png');

  if (!existsSync(iconPath)) {
    console.warn('[tray] icon not found at', iconPath);
    return null;
  }

  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('BizOS');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show BizOS',
      click: () => {
        const win = getMainWindow();
        if (win) {
          if (win.isMinimized()) win.restore();
          win.show();
          win.focus();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);

  tray.on('click', () => {
    const win = getMainWindow();
    if (win) {
      win.isVisible() ? win.hide() : win.show();
    }
  });

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}