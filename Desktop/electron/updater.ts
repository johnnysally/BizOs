import { app } from 'electron';

// electron-updater is a runtime dependency — import lazily so a missing
// dev setup doesn't break boot.
let updaterModule: typeof import('electron-updater') | null = null;

async function loadUpdater() {
  if (updaterModule) return updaterModule;
  try {
    updaterModule = await import('electron-updater');
    return updaterModule;
  } catch (err) {
    console.warn('[updater] electron-updater not available', err);
    return null;
  }
}

export interface UpdaterOptions {
  enabled?: boolean;
  checkOnStartupDelayMs?: number;
  checkIntervalMs?: number;
}

export async function initUpdater(options: UpdaterOptions = {}): Promise<void> {
  const {
    enabled = false,
    checkOnStartupDelayMs = 10_000,
    checkIntervalMs = 6 * 60 * 60 * 1000,
  } = options;

  if (!enabled) {
    console.log('[updater] disabled (pass enabled: true to activate)');
    return;
  }

  if (!app.isPackaged) {
    console.log('[updater] skipped in dev');
    return;
  }

  const mod = await loadUpdater();
  if (!mod) return;

  const { autoUpdater } = mod;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] checking for update');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] update available', info.version);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] up to date');
  });

  autoUpdater.on('error', (err) => {
    console.warn('[updater] error', err?.message || err);
  });

  autoUpdater.on('download-progress', (p) => {
    console.log(`[updater] ${Math.round(p.percent)}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] downloaded', info.version);
    // Later: emit to renderer to show a toast prompting restart.
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.warn('[updater] check failed', err?.message || err);
    });
  }, checkOnStartupDelayMs);

  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {
      /* silent */
    });
  }, checkIntervalMs);
}