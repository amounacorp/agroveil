import client from './client';
import { mockReports } from './mockData';
import { MOCK_MODE } from '../utils/constants';
import type { MonthlyReport } from '../types';

export async function getReports(farmId: string): Promise<MonthlyReport[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 400));
    return mockReports;
  }
  const { data } = await client.get<MonthlyReport[]>(`/farms/${farmId}/reports`);
  return data;
}

export async function getReport(reportId: string): Promise<MonthlyReport> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 300));
    const report = mockReports.find((r) => r.id === reportId);
    if (!report) throw new Error('Rapport introuvable');
    return report;
  }
  const { data } = await client.get<MonthlyReport>(`/reports/${reportId}`);
  return data;
}

export async function generateReport(farmId: string): Promise<MonthlyReport> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return mockReports[0];
  }
  const { data } = await client.post<MonthlyReport>(`/farms/${farmId}/reports/generate`);
  return data;
}
