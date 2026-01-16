import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260116_183904 from './20260116_183904';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260116_183904.up,
    down: migration_20260116_183904.down,
    name: '20260116_183904'
  },
];
