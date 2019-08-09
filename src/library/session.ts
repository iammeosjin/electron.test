/* eslint-disable import/no-dynamic-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import fs from 'fs';
import R from 'ramda';

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

  public savePreferences(directory?: string) {
    const path = directory || this.preferences.workspace;
    fs.writeFileSync(
      `${path}\\${this.preferences.name}.session`,
      JSON.stringify(this.preferences),
      { encoding: 'UTF-8' },
    );
  }

  public loadPreferences(directory?: string) {
    const path = directory || this.preferences.workspace;
    const rawPreference = fs.readFileSync(`${path}\\${this.preferences.name}.session`, {
      encoding: 'UTF-8',
    });

    this.preferences = JSON.parse(rawPreference);
    this.loadFunctions();
  }


  public addFunction(params: { name: string; path: string }) {
    const id = `${this.preferences.sessionId}${params.name}`;
    this.preferences.functions.push({
      id,
      ...params,
    });
    this.functions.push({
      id,
      content: require(`${params.path}\\${params.name}`),
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

  public toString() {
    return JSON.stringify(this.preferences);
  }

  public get id() {
    return this.preferences.sessionId;
  }
}
