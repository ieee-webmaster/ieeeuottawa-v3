import * as migration_20260427_173319_baseline from './20260427_173319_baseline'

export const migrations = [
  {
    up: migration_20260427_173319_baseline.up,
    down: migration_20260427_173319_baseline.down,
    name: '20260427_173319_baseline',
  },
]
