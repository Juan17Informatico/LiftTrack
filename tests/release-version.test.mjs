import assert from 'node:assert/strict';
import test from 'node:test';
import { nextVersion } from '../scripts/release-version.mjs';

test('los cambios de CI y documentación no generan un build', () => {
  assert.equal(nextVersion('v1.2.0', ['ci: agrega workflow', 'docs: actualiza guía']), '');
});

test('el cambio de mayor impacto define la versión', () => {
  assert.equal(nextVersion('v1.2.9', ['fix(ui): corrige registro']), '1.2.10');
  assert.equal(nextVersion('v1.9.2', ['fix: corrige registro', 'feat: agrega rutinas']), '1.10.0');
  assert.equal(nextVersion('v1.9.2', ['feat: agrega rutinas', 'fix(db)!: cambia esquema']), '2.0.0');
  assert.equal(nextVersion('v1.9.2', ['fix: limpia datos\n\nBREAKING CHANGE: cambia esquema']), '2.0.0');
});

test('el punto de partida debe ser una versión estable', () => {
  assert.throws(() => nextVersion('v1.0.0-beta.1', ['fix: corrige registro']), /Tag base inválido/);
});
