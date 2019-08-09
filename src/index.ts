import {
  app as electron,
} from 'electron';
import MainWindow from './windows/main';

electron.on('ready', () => {
  const mainWindow = new MainWindow();
  mainWindow.setTitle('Electron Test');
  mainWindow.on('close', () => {
    electron.quit();
  });

  // Menu.setApplicationMenu(null);
});
