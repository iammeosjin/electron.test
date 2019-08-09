import { BrowserWindow, app } from 'electron';
import url from 'url';
import path from 'path';

export default class MainWindow extends BrowserWindow {
  public constructor() {
    super({
      webPreferences: {
        nodeIntegration: true,
      },
    });
    this.loadURL(
      url.format({
        pathname: path.join(app.getAppPath(), 'html/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  }
}
