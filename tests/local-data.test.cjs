/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const { QueryClient, QueryObserver, onlineManager } = require('@tanstack/react-query');

// Run the production repositories against real SQLite without an Expo device.
// Only the native platform/UUID APIs are adapted for Node.
const sourceCache = new Map();
function loadSource(relativePath) {
  const filename = path.resolve(__dirname, '..', relativePath);
  if (sourceCache.has(filename)) return sourceCache.get(filename).exports;
  const module = { exports: {} };
  sourceCache.set(filename, module);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const load = (name) => {
    if (name === 'react-native') return { Platform: { OS: 'android' } };
    if (name === 'expo-crypto') return { randomUUID };
    if (name.startsWith('@/')) return loadSource(`src/${name.slice(2)}.ts`);
    return require(name);
  };
  vm.runInThisContext(`(function(require, module, exports) {${compiled}\n})`, { filename })(
    load,
    module,
    module.exports,
  );
  return module.exports;
}

const { localKeys, localQueryOptions, refreshLocalData } = loadSource('src/database/localData.ts');
const { RoutineRepository } = loadSource('src/database/repositories/routineRepository.ts');
const { WorkoutRepository } = loadSource('src/database/repositories/workoutRepository.ts');
const { ExerciseRepository } = loadSource('src/database/repositories/exerciseRepository.ts');
const { initialSchemaMigration } = loadSource('src/database/migrations/001_initial_schema.ts');

function setup(t) {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys = ON');
  sql.exec(initialSchemaMigration.up);
  let inTransaction = false;
  const db = {
    runAsync: async (query, ...args) => sql.prepare(query).run(...args.flat()),
    getFirstAsync: async (query, ...args) => sql.prepare(query).get(...args.flat()) ?? null,
    getAllAsync: async (query, ...args) => sql.prepare(query).all(...args.flat()),
    withExclusiveTransactionAsync: async (task) => {
      sql.exec('BEGIN');
      inTransaction = true;
      try {
        await task(db);
        sql.exec('COMMIT');
      } catch (error) {
        sql.exec('ROLLBACK');
        throw error;
      } finally {
        inTransaction = false;
      }
    },
  };
  for (const id of ['squat', 'press']) {
    sql
      .prepare(
        `INSERT INTO exercises (id, name, muscle_group, created_at, updated_at)
      VALUES (?, ?, 'legs', '2026-01-01', '2026-01-01')`,
      )
      .run(id, id);
  }
  const client = new QueryClient({
    defaultOptions: { queries: { ...localQueryOptions, gcTime: Infinity } },
  });
  const notifications = [];
  const changed = (domain) => async () => {
    assert.equal(inTransaction, false, 'publish only after the transaction commits');
    notifications.push(domain);
    await refreshLocalData(client, domain);
  };
  const routines = new RoutineRepository(db, changed('routines'));
  const workouts = new WorkoutRepository(db, changed('workouts'));
  const exercises = new ExerciseRepository(db);
  const subscriptions = [];
  async function observe(queryKey, queryFn) {
    const options = { ...localQueryOptions, queryKey, queryFn };
    const observer = new QueryObserver(client, options);
    const updates = [];
    subscriptions.push(observer.subscribe((result) => updates.push(result)));
    await client.fetchQuery(options);
    updates.length = 0;
    return { data: () => observer.getCurrentResult().data, updates };
  }
  t.after(() => {
    subscriptions.forEach((unsubscribe) => unsubscribe());
    client.clear();
    sql.close();
    onlineManager.setOnline(true);
  });
  return { client, routines, workouts, exercises, observe, notifications };
}

test('all routine writes update shared lists/details without returning to initial loading', async (t) => {
  const { routines, workouts, observe } = setup(t);
  const home = await observe(localKeys.routineList, () => routines.list());
  const list = await observe(localKeys.routineList, () => routines.list());
  const routine = await routines.create({ name: 'Piernas' });
  assert.equal(home.data()[0].id, routine.id);
  assert.deepEqual(home.data(), list.data());
  const detail = await observe(localKeys.routine(routine.id), () =>
    routines.findWithExercises(routine.id),
  );
  const first = await routines.addExercise(routine.id, { exerciseId: 'squat' });
  const second = await routines.addExercise(routine.id, { exerciseId: 'press' });
  assert.equal(home.data()[0].exerciseCount, 2);
  await routines.moveExercise(second.id, 'up');
  assert.equal(detail.data().exercises[0].id, second.id);
  await routines.removeExercise(first.id);
  assert.equal(detail.data().exercises.length, 1);
  assert.equal(list.data()[0].exerciseCount, 1);
  const session = await workouts.startFromRoutine(routine.id);
  const workout = await observe(localKeys.workout(session.id), () => workouts.findById(session.id));
  await routines.update(routine.id, { name: 'Piernas actualizado', description: 'Nuevo' });
  assert.equal(home.data()[0].name, 'Piernas actualizado');
  assert.equal(detail.data().description, 'Nuevo');
  assert.equal(workout.data().routineName, 'Piernas actualizado');
  assert.ok(home.updates.length > 0);
  assert.ok(
    [...home.updates, ...detail.updates].every((result) => !result.isLoading && result.data),
  );
});

test('workout/exercise/set writes and finishing update active session, history and performance offline', async (t) => {
  const { workouts, exercises, observe } = setup(t);
  onlineManager.setOnline(false);
  const active = await observe(localKeys.activeWorkout, () => workouts.findActive());
  const history = await observe(localKeys.history, () => workouts.listHistory());
  const performance = await observe(localKeys.performance('squat'), () =>
    exercises.findLastPerformance('squat'),
  );
  const created = await workouts.startEmpty();
  assert.equal(active.data().id, created.id);
  const exercise = await workouts.addExerciseToSession(created.id, 'squat');
  assert.equal(active.data().exercises[0].id, exercise.id);
  const set = await workouts.addSet(exercise.id);
  assert.equal(active.data().exercises[0].sets[0].id, set.id);
  await workouts.updateSet(set.id, { weight: 80, repetitions: 10, completed: true });
  assert.equal(active.data().exercises[0].sets[0].weight, 80);
  assert.equal(active.data().exercises[0].sets[0].completed, true);
  const removed = await workouts.addSet(exercise.id);
  await workouts.deleteSet(removed.id);
  assert.equal(active.data().exercises[0].sets.length, 1);
  await workouts.finishSession(created.id);
  assert.equal(active.data(), null);
  assert.equal(history.data()[0].id, created.id);
  assert.equal(history.data()[0].completedSetCount, 1);
  assert.equal(performance.data()[0].weight, 80);
  assert.ok(active.updates.every((result) => !result.isLoading && result.fetchStatus !== 'paused'));
});

test('a failed write rolls back without publishing a cache change', async (t) => {
  t.mock.method(console, 'error', () => {});
  const { routines, notifications } = setup(t);
  const routine = await routines.create({ name: 'Rutina' });
  const count = notifications.length;
  await assert.rejects(routines.addExercise(routine.id, { exerciseId: 'missing' }), /FOREIGN KEY/);
  assert.equal(notifications.length, count);
  assert.equal((await routines.findWithExercises(routine.id)).exercises.length, 0);
});

test('a read started before saving cannot overwrite the new data', async (t) => {
  const { client, routines, observe } = setup(t);
  const routine = await routines.create({ name: 'Original' });
  let releaseOldRead;
  let blockNextRead = false;
  const list = await observe(localKeys.routineList, async () => {
    const snapshot = await routines.list();
    if (blockNextRead) {
      blockNextRead = false;
      await new Promise((resolve) => {
        releaseOldRead = resolve;
      });
    }
    return snapshot;
  });
  blockNextRead = true;
  const oldRead = client.refetchQueries({ queryKey: localKeys.routineList });
  while (!releaseOldRead) await new Promise((resolve) => setImmediate(resolve));
  await routines.update(routine.id, { name: 'Actualizada' });
  assert.equal(list.data()[0].name, 'Actualizada');
  releaseOldRead();
  await oldRead;
  assert.equal(list.data()[0].name, 'Actualizada');
  assert.ok(list.updates.every((result) => !result.isLoading));
});

test('a cached screen sees writes made while it was unmounted', async (t) => {
  const { client, routines, observe } = setup(t);
  await client.fetchQuery({
    ...localQueryOptions,
    queryKey: localKeys.routineList,
    queryFn: () => routines.list(),
  });
  await routines.create({ name: 'Creada desde otra pantalla' });
  assert.equal(client.getQueryState(localKeys.routineList).isInvalidated, true);
  const reopened = await observe(localKeys.routineList, () => routines.list());
  assert.equal(reopened.data()[0].name, 'Creada desde otra pantalla');
});
