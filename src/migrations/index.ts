import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260121_225713 from './20260121_225713';
import * as migration_20260121_231101 from './20260121_231101';
import * as migration_20260206_154616 from './20260206_154616';
import * as migration_20260215_153411 from './20260215_153411';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260121_225713.up,
    down: migration_20260121_225713.down,
    name: '20260121_225713',
  },
  {
    up: migration_20260121_231101.up,
    down: migration_20260121_231101.down,
    name: '20260121_231101',
  },
  {
    up: migration_20260206_154616.up,
    down: migration_20260206_154616.down,
    name: '20260206_154616',
  },
  {
    up: migration_20260215_153411.up,
    down: migration_20260215_153411.down,
    name: '20260215_153411'
  },
];
