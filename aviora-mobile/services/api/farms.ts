import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { FarmStats, WeeklyActivity } from '../../types';

export const farmsApi = {
  getStats() { return apiClient.get<FarmStats>(Endpoints.farmStats); },
  getWeeklyActivity() { return apiClient.get<WeeklyActivity[]>(Endpoints.weeklyActivity); },
};
