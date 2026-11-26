/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/store/restTimerStore.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const timerModule = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, timerModule, timerModule.exports);
const timer = timerModule.exports.useRestTimerStore;

test('restarting after a pause and resume uses the original duration', () => {
  const originalNow = Date.now;
  let now = 100000;
  Date.now = () => now;
  try {
    timer.getState().start(90);
    now += 30000;
    timer.getState().pause();
    assert.equal(timer.getState().remainingSeconds, 60);
    now += 10000;
    timer.getState().resume();
    now += 5000;
    timer.getState().tick();
    assert.equal(timer.getState().remainingSeconds, 55);
    timer.getState().start(timer.getState().durationSeconds);
    assert.equal(timer.getState().remainingSeconds, 90);
  } finally {
    Date.now = originalNow;
    timer.getState().cancel();
  }
});
