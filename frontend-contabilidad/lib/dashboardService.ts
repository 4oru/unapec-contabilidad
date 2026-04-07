export interface DashboardStats {
  mes: string;
  ingresos: number;
  gastos: number;
  balance: number;
}

export const fetchMonthlyStats = async (): Promise<DashboardStats[]> => {
  try {
    const response = await fetch('http://localhost:8080/api/dashboard/stats/monthly');
    if (!response.ok) {
      throw new Error(`Error fetching dashboard stats: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return [];
  }
};
