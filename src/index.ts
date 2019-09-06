import {
  app as electron, ipcMain,
} from 'electron';
import MainWindow from './windows/main';
import App from './library/application';

electron.on('ready', () => {
  const app = new App();
  app.start();

  const mainWindow = new MainWindow();
  mainWindow.maximize();
  mainWindow.setTitle('Electron Test');
  mainWindow.on('close', () => {
    electron.quit();
  });

  ipcMain.on('session:create', (_event: any, item: any) => {
    const result = app.createSession({
      name: item.data.fileName,
      path: item.data.filePath || app.preference.sessionFolder,
    });
    if (!app.session) {
      mainWindow.webContents.send('index:message', {
        status: 400,
        message: `Unable to create session: ${result.message}`,
        meta: item.data,
      });
      return;
    }
    mainWindow.webContents.send('index:title:update', app.session.toJSON());
  });

  ipcMain.on('session:read', (_event: any, item: any) => {
    const result = app.loadSession({
      name: item.data.fileName,
      path: item.data.filePath || app.preference.sessionFolder,
    });
    if (!app.session) {
      mainWindow.webContents.send('index:message', {
        status: 400,
        message: `Unable to load session: ${result.message}`,
        meta: item.data,
      });
      return;
    }
    mainWindow.webContents.send('index:title:update', app.session.toJSON());
    mainWindow.webContents.send('index:message', {
      status: 200,
      message: JSON.stringify(
        app.session.functionList(),
      ),
    });
  });

  ipcMain.on('session:save', (_event: any, item: any) => {
    if (!app.session) {
      mainWindow.webContents.send('index:message', {
        status: 400,
        message: 'Invalid session',
        meta: item.data,
      });
      return;
    }
    app.session.savePreferences();
    app.save();
    mainWindow.webContents.send('index:message', {
      status: 200,
      message: 'Saved',
    });
  });


  ipcMain.on('function:read', (_event: any, item: any) => {
    if (!app.session) {
      mainWindow.webContents.send('index:message', {
        status: 400,
        message: 'Invalid session',
        meta: item.data,
      });
      return;
    }
    app.session.addFunction(item.data);
    mainWindow.webContents.send('index:title:update', app.session.toJSON());
    mainWindow.webContents.send('index:message', {
      status: 200,
      message: 'Loaded!',
    });
  });

  // Menu.setApplicationMenu(null);
  app.save();
});
