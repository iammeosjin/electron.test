import {
  app as electron,
} from 'electron';
import MainWindow from './windows/main';
import App from './library/application';

electron.on('ready', () => {
  const app = new App();
  app.start();

  const mainWindow = new MainWindow();
  mainWindow.setTitle('Electron Test');
  mainWindow.on('close', () => {
    electron.quit();
  });

  // Menu.setApplicationMenu(null);
  app.save();
});
