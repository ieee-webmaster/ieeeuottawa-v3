import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260121_205528 from './20260121_205528';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260121_205528.up,
    down: migration_20260121_205528.down,
    name: '20260121_205528'
  },
];
