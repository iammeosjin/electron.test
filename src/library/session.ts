/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import fs from 'fs';
import R from 'ramda';

import loadFunction from './load-function';

export default class Session {
  private preferences: {
    sessionId: string;
    workspace: string;
    name: string;
    functions: {
      id: string;
      name: string;
      path: string;
    }[];
  } & Record<string, any>;

  private functions: {
    id: string;
    content: any;
  }[];

  public constructor(params: { name: string; path: string }) {
    this.preferences = {
      sessionId: new Date().getTime().toString(),
      name: params.name,
      workspace: params.path,
      functions: [],
    };

    this.functions = [];
  }

  public get name() {
    return this.preferences.name;
  }

  public preSave(directory?: string) {
    const path = directory || this.preferences.workspace;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    const sessions = fs.readdirSync(path);
    if (sessions.indexOf(`${this.preferences.name}.session`) >= 0) {
      return { status: 201 };
    }
    return { status: 200 };
  }

  public savePreferences(directory?: string) {
    const path = directory || this.preferences.workspace;
    fs.writeFileSync(
      `${path}\\${this.preferences.name}.session`,
      JSON.stringify(this.preferences),
      { encoding: 'UTF-8' },
    );
    return { status: 200, message: 'Success' };
  }

  public loadPreferences(directory?: string) {
    const path = directory || this.preferences.workspace;
    if (!fs.existsSync(`${path}\\${this.preferences.name}.session`)) {
      return { status: 400, message: 'Session does not exists', meta: { path, name: this.preferences.name } };
    }
    const rawPreference = fs.readFileSync(`${path}\\${this.preferences.name}.session`, {
      encoding: 'UTF-8',
    });

    this.preferences = JSON.parse(rawPreference);
    this.loadFunctions();

    return { status: 200 };
  }


  public addFunction(params: { name: string; path: string }) {
    loadFunction();
    const name = params.name.replace('.ts', '');
    const id = `${this.preferences.sessionId}-${name}`;
    this.preferences.functions.push({
      id,
      ...params,
    });
    this.functions.push({
      id,
      content: require(`${params.path}\\${
        name
      }`),
    });
  }

  private loadFunctions() {
    this.functions = this.preferences.functions.map((func: any) => ({
      id: func.id as string,
      content: require(`${func.path}\\${func.name}`),
    }));
  }

  public removeFunction(functionId: string) {
    this.preferences.functions = R.filter<any>(R.identity)(
      R.map((func: any) => (func.id !== functionId ? func : null))(this.preferences.functions),
    );
    this.savePreferences(this.preferences.workspace);
    this.loadFunctions();
  }

  public functionList() {
    return this.preferences.functions;
  }

  public toString() {
    return JSON.stringify(this.preferences);
  }

  public toJSON() {
    return this.preferences;
  }

  public get id() {
    return this.preferences.sessionId;
  }
}
