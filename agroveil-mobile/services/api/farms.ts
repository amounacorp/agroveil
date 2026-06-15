import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { FarmStats, WeeklyActivity } from '../../types';

export const farmsApi = {
  getStats: () =>
    apiClient.get<FarmStats>(Endpoints.farmStats),

  getWeeklyActivity: () =>
    apiClient.get<WeeklyActivity[]>(Endpoints.weeklyActivity),
};
