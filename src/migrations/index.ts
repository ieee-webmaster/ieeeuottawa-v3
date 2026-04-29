import * as migration_20260427_173319_baseline from './20260427_173319_baseline';
import * as migration_20260427_230857 from './20260427_230857';
import * as migration_20260429_000837 from './20260429_000837';

export const migrations = [
  {
    up: migration_20260427_173319_baseline.up,
    down: migration_20260427_173319_baseline.down,
    name: '20260427_173319_baseline',
  },
  {
    up: migration_20260427_230857.up,
    down: migration_20260427_230857.down,
    name: '20260427_230857',
  },
  {
    up: migration_20260429_000837.up,
    down: migration_20260429_000837.down,
    name: '20260429_000837'
  },
];
