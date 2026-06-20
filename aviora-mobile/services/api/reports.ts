import { apiClient } from './client';
import { Endpoints } from '../../constants/api';
import type { MonthlyReport } from '../../types';

export const reportsApi = {
  getAll() { return apiClient.get<MonthlyReport[]>(Endpoints.reports); },
};
