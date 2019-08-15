import fs from 'fs';
import { appPath } from './env';
import Session from './session';


export default class App {
  private currentSession: Session | null;

  private appPreference: Record<string, any>;

  public constructor() {
    this.appPreference = {
      path: appPath || process.cwd(),
      fileName: 'app.settings',
    };
    this.currentSession = null;
  }

  public start() {
    try {
      this.appPreference = JSON.parse(
        fs.readFileSync(`${this.appPreference.path}\\${this.appPreference.fileName}`, {
          encoding: 'UTF-8',
        }),
      );
    } catch {
      this.appPreference = {
        name: 'Application Title',
        functionsPath: `${process.cwd()}\\functions`,
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

  public save() {
    try {
      fs.writeFileSync(
        `${this.appPreference.path}\\${this.appPreference.fileName}`,
        JSON.stringify(this.appPreference),
        { encoding: 'UTF-8' },
      );
      if (this.currentSession) this.currentSession.savePreferences();
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  public get title() {
    return this.appPreference.name;
  }
}
