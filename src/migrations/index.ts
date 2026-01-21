import * as migration_20260105_201500_initial from './20260105_201500_initial';
import * as migration_20260121_225713 from './20260121_225713';

export const migrations = [
  {
    up: migration_20260105_201500_initial.up,
    down: migration_20260105_201500_initial.down,
    name: '20260105_201500_initial',
  },
  {
    up: migration_20260121_225713.up,
    down: migration_20260121_225713.down,
    name: '20260121_225713'
  },
];
