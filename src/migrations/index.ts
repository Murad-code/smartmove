import * as migration_20260906_111931_initial from './20260906_111931_initial';

export const migrations = [
  {
    up: migration_20260906_111931_initial.up,
    down: migration_20260906_111931_initial.down,
    name: '20260906_111931_initial'
  },
];
