/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import vm from 'vm';
import fs from 'fs';
import path from 'path';

const tsc = path.join(path.dirname(require.resolve('typescript')), 'tsc.js');
const tscScript = new vm.Script(fs.readFileSync(tsc, 'utf8'));

let tsconfig = {
  target: 'es2017',
  module: 'commonjs',
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  outDir: './temp',
  strict: true,
  strictNullChecks: true,
  strictFunctionTypes: true,
  strictPropertyInitialization: true,
  noImplicitAny: true,
  removeComments: true,
  noImplicitThis: true,
  alwaysStrict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  moduleResolution: 'node',
  esModuleInterop: true,
  lib: ['es2018', 'dom', 'esnext.asynciterable'],
};

function merge(obj1: any, obj2: any) {
  if (obj1 && obj2) {
    for (const key in obj2) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

function clean(array: any[]) {
  const temp: any[] = [];
  array.forEach((data) => {
    if (data) temp.push(data);
  });
  return temp;
}


function isModified(tsname: string, jsname: string) {
  const tsMTime = fs.statSync(tsname).mtimeMs;
  let jsMTime = 0;

  try {
    jsMTime = fs.statSync(jsname).mtimeMs;
  } catch (e) { // catch if file does not exists
  }

  return tsMTime > jsMTime;
}

function toArgs(config: any) {
  const keys = Object.keys(config);
  const result = keys.map((key: string): string[] => {
    if (Array.isArray(config[key])) return [`--${key}`, config[key].join(',')];
    if (typeof config[key] === 'boolean') return [`--${key}`];
    return [`--${key}`, config[key]];
  });
  return ([] as string[]).concat(...result);
}


export default (opts?: any) => {
  tsconfig = merge(tsconfig, opts);
};


function compile(module: NodeModule) {
  let exitCode = 0;
  const tmpDir = path.join(tsconfig.outDir, 'tsreq');
  const basename = path.basename(module.filename, '.ts');
  const jsname = path.join(tmpDir, basename, `${basename}.js`);

  if (!isModified(module.filename, jsname)) {
    return jsname;
  }

  const argv = [
    'node',
    'tsc.js',
    ...toArgs({ ...tsconfig, outDir: path.join(tmpDir, basename) }),
    module.filename,
  ];

  const proc = merge(merge({}, process), {
    argv: clean(argv),
    exit(code: number) {
      if (code !== 0) {
        console.error('Fatal Error. Unable to compile TypeScript file. Exiting.');
        process.exit(code);
      }
      exitCode = code;
    },
  });

  const sandbox = {
    process: proc,
    require,
    module,
    Buffer,
    setTimeout,
    clearTimeout,
    __filename: tsc,
  };

  tscScript.runInNewContext(sandbox);
  if (exitCode !== 0) {
    throw new Error('Unable to compile TypeScript file.');
  }

  return jsname;
}

function runJS(jsname: string, module: NodeModule) {
  const content = fs.readFileSync(jsname, 'utf8');

  const sandbox: any = {};
  for (const k in global) {
    sandbox[k] = (global as any)[k];
  }
  sandbox.require = module.require.bind(module);
  sandbox.exports = module.exports;
  sandbox.__filename = jsname;
  sandbox.__dirname = path.dirname(module.filename);
  sandbox.module = module;
  sandbox.global = sandbox;
  sandbox.root = process.cwd();

  return vm.runInNewContext(content, sandbox, { filename: jsname });
}

require.extensions['.ts'] = (module) => {
  const jsname = compile(module);
  runJS(jsname, module);
};
