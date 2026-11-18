import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const stableTag = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const conventionalHeader = /^([a-z]+)(?:\([^)]+\))?(!)?: \S/;

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

export function nextVersion(baseTag, messages) {
  const match = stableTag.exec(baseTag);
  if (!match) throw new Error(`Tag base inválido: ${baseTag}`);

  let increment = 0;
  for (const message of messages) {
    const header = conventionalHeader.exec(message.split('\n', 1)[0]);
    if (!header) continue;

    if (header[2] || /(?:^|\n)BREAKING[ -]CHANGE: \S/.test(message)) {
      increment = 3;
    } else if (header[1] === 'feat') {
      increment = Math.max(increment, 2);
    } else if (['fix', 'perf', 'revert'].includes(header[1])) {
      increment = Math.max(increment, 1);
    }
  }

  if (!increment) return '';
  const [major, minor, patch] = match.slice(1).map(BigInt);
  if (increment === 3) return `${major + 1n}.0.0`;
  if (increment === 2) return `${major}.${minor + 1n}.0`;
  return `${major}.${minor}.${patch + 1n}`;
}

function prepareRelease() {
  const [initialCommit] = process.argv.slice(2);
  const config = JSON.parse(readFileSync('app.json', 'utf8'));
  const taggedVersion = git('tag', '--sort=-version:refname')
    .split('\n')
    .find((tag) => stableTag.test(tag));
  const base = taggedVersion || initialCommit;
  if (!base) throw new Error('Falta un tag de release o un commit base para el primer build.');

  const baseCommit = git('rev-list', '-1', base);
  const commonCommit = git('merge-base', baseCommit, 'HEAD');
  if (commonCommit !== baseCommit) {
    if (taggedVersion && commonCommit === git('rev-parse', 'HEAD')) {
      console.log('Este commit es anterior a la última versión compilada.');
      return '';
    }
    throw new Error('El commit base debe pertenecer al historial de main.');
  }

  const baseTag = taggedVersion || `v${JSON.parse(git('show', `${baseCommit}:app.json`)).expo.version}`;
  const messages = git('log', '--no-merges', '--format=%B%x00', `${baseCommit}..HEAD`).split('\0');
  const version = nextVersion(baseTag, messages.map((message) => message.trim()));
  if (!version) {
    console.log('Sin cambios que requieran una versión nueva.');
    return '';
  }

  config.expo.version = version;
  writeFileSync('app.json', `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Versión del build Android: ${version}`);
  return version;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const version = prepareRelease();
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  }
}
