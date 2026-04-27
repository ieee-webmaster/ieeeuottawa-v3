import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260215_170902 from './20260215_170902';
import * as migration_20260307_215259_i18n_schema_sync from './20260307_215259_i18n_schema_sync';
import * as migration_20260402_154329 from './20260402_154329';
import * as migration_20260415_161459 from './20260415_161459';
import * as migration_20260427_045818 from './20260427_045818';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260215_170902.up,
    down: migration_20260215_170902.down,
    name: '20260215_170902',
  },
  {
    up: migration_20260307_215259_i18n_schema_sync.up,
    down: migration_20260307_215259_i18n_schema_sync.down,
    name: '20260307_215259_i18n_schema_sync',
  },
  {
    up: migration_20260402_154329.up,
    down: migration_20260402_154329.down,
    name: '20260402_154329',
  },
  {
    up: migration_20260415_161459.up,
    down: migration_20260415_161459.down,
    name: '20260415_161459',
  },
  {
    up: migration_20260427_045818.up,
    down: migration_20260427_045818.down,
    name: '20260427_045818'
  },
];
