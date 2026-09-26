import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
  getPlatform: (): Promise<string> => ipcRenderer.invoke('app:get-platform'),
  getAppPath: (): Promise<string> => ipcRenderer.invoke('app:get-app-path'),
  openExternal: (url: string): Promise<boolean> =>
    ipcRenderer.invoke('app:open-external', url),
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;