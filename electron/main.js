const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: 'public/icon-512.png',
    webPreferences: {
      nodeIntegration: false,
    },
  });
  win.loadURL('https://psychiatrists.nishantsoftwares.in');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});