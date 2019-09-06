import fs from 'fs';
import { appPath } from './env';
import Session from './session';

const secondaryRootFolder = `${process.cwd()}/appdata`;

export default class App {
  private currentSession: Session | null;

  private appPreference: Record<string, any>;

  public constructor() {
    this.appPreference = {
      path: appPath || secondaryRootFolder,
      fileName: 'app.settings',
    };
    this.currentSession = null;
    try {
      fs.mkdirSync(this.appPreference.path);
    // eslint-disable-next-line no-empty
    } catch {}
  }

  public start() { // where appPreference is load or initialize
    try {
      this.appPreference = JSON.parse(
        fs.readFileSync(`${this.appPreference.path}\\${this.appPreference.fileName}`, {
          encoding: 'UTF-8',
        }),
      );
    } catch {
      this.appPreference = {
        name: 'Application Title',
        sessionsPath: `${this.appPreference.path}/sessions`,
        functionsPath: `${this.appPreference.path}/functions`,
        ...this.appPreference,
      };
    }
  }

  public createSession(params: { name: string; path: string }) {
    this.currentSession = new Session(params);
    const result = this.currentSession.preSave();
    if (result.status !== 200) {
      delete this.currentSession;
      return { status: result.status, message: 'Session already existed' };
    }
    return this.currentSession.savePreferences();
  }

  public loadSession(params: { name: string; path: string }) {
    this.currentSession = new Session(params);
    const result = this.currentSession.loadPreferences();
    if (result.status !== 200) {
      delete this.currentSession;
    }
    return result;
  }


  public get session() {
    return this.currentSession;
  }

  public get preference() {
    return {
      rootFolder: this.appPreference.path,
      title: this.appPreference.name,
      functionFolder: this.appPreference.functionsPath,
      sessionFolder: this.appPreference.sessionsPath,
    };
  }

  public save() { // save the app-settings
    try {
      fs.writeFileSync(
        `${this.appPreference.path}\\${this.appPreference.fileName}`,
        JSON.stringify(this.appPreference),
        { encoding: 'UTF-8' },
      );
      if (this.currentSession) this.currentSession.savePreferences();
    } catch (error) {
      console.log('saving error', error);
      return false;
    }
    return true;
  }
}
