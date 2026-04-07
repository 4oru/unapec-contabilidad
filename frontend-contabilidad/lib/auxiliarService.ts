import apiClient from "@/lib/apiClient";

// Adding Auxiliar to the global types inline for simplification, 
// usually it would be in types/index.ts but we can define it here and export it.
export interface Auxiliar {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: boolean;
}

export type CreateAuxiliarPayload = Omit<Auxiliar, "id">;
export type UpdateAuxiliarPayload = Partial<CreateAuxiliarPayload>;

const BASE = "/api/auxiliares";

export async function getAuxiliares(): Promise<Auxiliar[]> {
  const { data } = await apiClient.get<Auxiliar[]>(BASE);
  return data;
}

export async function getAuxiliarById(id: number): Promise<Auxiliar> {
  const { data } = await apiClient.get<Auxiliar>(`${BASE}/${id}`);
  return data;
}

export async function createAuxiliar(payload: CreateAuxiliarPayload): Promise<Auxiliar> {
  const { data } = await apiClient.post<Auxiliar>(BASE, payload);
  return data;
}

export async function updateAuxiliar(id: number, payload: UpdateAuxiliarPayload): Promise<Auxiliar> {
  const { data } = await apiClient.put<Auxiliar>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteAuxiliar(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}
