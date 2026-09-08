import * as migration_20260906_111931_initial from './20260906_111931_initial';
import * as migration_20260907_211528_key_features_as_text_list from './20260907_211528_key_features_as_text_list';
import * as migration_20260908_003007_add_services_autosave from './20260908_003007_add_services_autosave';
import * as migration_20260908_003158_add_media_folders from './20260908_003158_add_media_folders';
import * as migration_20260908_114505_home_page_carousel_stats_testimonials from './20260908_114505_home_page_carousel_stats_testimonials';

export const migrations = [
  {
    up: migration_20260906_111931_initial.up,
    down: migration_20260906_111931_initial.down,
    name: '20260906_111931_initial',
  },
  {
    up: migration_20260907_211528_key_features_as_text_list.up,
    down: migration_20260907_211528_key_features_as_text_list.down,
    name: '20260907_211528_key_features_as_text_list',
  },
  {
    up: migration_20260908_003007_add_services_autosave.up,
    down: migration_20260908_003007_add_services_autosave.down,
    name: '20260908_003007_add_services_autosave',
  },
  {
    up: migration_20260908_003158_add_media_folders.up,
    down: migration_20260908_003158_add_media_folders.down,
    name: '20260908_003158_add_media_folders',
  },
  {
    up: migration_20260908_114505_home_page_carousel_stats_testimonials.up,
    down: migration_20260908_114505_home_page_carousel_stats_testimonials.down,
    name: '20260908_114505_home_page_carousel_stats_testimonials'
  },
];
