import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260116_183904 from './20260116_183904';
import * as migration_20260121_173752 from './20260121_173752';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260116_183904.up,
    down: migration_20260116_183904.down,
    name: '20260116_183904',
  },
  {
    up: migration_20260121_173752.up,
    down: migration_20260121_173752.down,
    name: '20260121_173752'
  },
];
