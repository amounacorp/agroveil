import client from './client';
import type {
  DashboardStats,
  FarmerGrowthPoint,
  AlertWeekData,
  PlanDistribution,
  AIModelMetric,
} from '../types';
import { MOCK_MODE } from '../utils/constants';
import {
  mockDashboardStats,
  mockGrowthData,
  mockAlertWeekData,
  mockPlanDistribution,
  mockAIMetrics,
} from './mockData';

export async function getDashboardStats(): Promise<DashboardStats> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return mockDashboardStats;
  }
  const { data } = await client.get<DashboardStats>('/analytics/dashboard');
  return data;
}

export async function getFarmerGrowth(): Promise<FarmerGrowthPoint[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockGrowthData;
  }
  const { data } = await client.get<FarmerGrowthPoint[]>('/analytics/farmer-growth');
  return data;
}

export async function getAlertDistribution(): Promise<AlertWeekData[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockAlertWeekData;
  }
  const { data } = await client.get<AlertWeekData[]>('/analytics/alert-distribution');
  return data;
}

export async function getPlanDistribution(): Promise<PlanDistribution[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockPlanDistribution;
  }
  const { data } = await client.get<PlanDistribution[]>('/analytics/plan-distribution');
  return data;
}

export async function getAIMetrics(): Promise<AIModelMetric[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    return mockAIMetrics;
  }
  const { data } = await client.get<AIModelMetric[]>('/analytics/ai-metrics');
  return data;
}
