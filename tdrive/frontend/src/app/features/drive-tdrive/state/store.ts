import { atomFamily } from 'recoil';
import { DriveTdriveTab } from '../types';

export const DriveTdriveTabAtom = atomFamily<DriveTdriveTab | null, string>({
  key: 'DriveTdriveTabAtom',
  default: () => null,
});
