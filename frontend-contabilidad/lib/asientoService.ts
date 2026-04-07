import apiClient from "@/lib/apiClient";
import { Asiento, CreateAsientoPayload } from "@/types";

const BASE = "/api/asientos";

export async function getAsientos(): Promise<Asiento[]> {
  const { data } = await apiClient.get<Asiento[]>(BASE);
  return data;
}

export async function getAsientoById(id: number): Promise<Asiento> {
  const { data } = await apiClient.get<Asiento>(`${BASE}/${id}`);
  return data;
}

/**
 * Create a new asiento. The backend expects a single Asiento object with
 * nested detalles — NOT a wrapper object like {asiento, detalles}.
 */
export async function createAsiento(payload: CreateAsientoPayload): Promise<Asiento> {
  const { data } = await apiClient.post<Asiento>(BASE, payload);
  return data;
}

export async function deleteAsiento(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
