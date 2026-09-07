import * as migration_20260906_111931_initial from './20260906_111931_initial';
import * as migration_20260907_211528_key_features_as_text_list from './20260907_211528_key_features_as_text_list';

export const migrations = [
  {
    up: migration_20260906_111931_initial.up,
    down: migration_20260906_111931_initial.down,
    name: '20260906_111931_initial',
  },
  {
    up: migration_20260907_211528_key_features_as_text_list.up,
    down: migration_20260907_211528_key_features_as_text_list.down,
    name: '20260907_211528_key_features_as_text_list'
  },
];
