const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printToPrinter: (options) => ipcRenderer.invoke('print-to-printer', options),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  isElectron: true,
});
