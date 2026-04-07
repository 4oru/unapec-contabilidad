import apiClient from "@/lib/apiClient";
import { CuentaContable, CreateCuentaPayload, UpdateCuentaPayload } from "@/types";

const BASE = "/api/cuentas-contables";

export async function getCuentas(): Promise<CuentaContable[]> {
  const { data } = await apiClient.get<CuentaContable[]>(BASE);
  return data;
}

export async function getCuentaById(id: number): Promise<CuentaContable> {
  const { data } = await apiClient.get<CuentaContable>(`${BASE}/${id}`);
  return data;
}

export async function createCuenta(payload: CreateCuentaPayload): Promise<CuentaContable> {
  const { data } = await apiClient.post<CuentaContable>(BASE, payload);
  return data;
}

export async function updateCuenta(id: number, payload: UpdateCuentaPayload): Promise<CuentaContable> {
  const { data } = await apiClient.put<CuentaContable>(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteCuenta(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export function buildCuentaPayload(formData: {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoId: number;      // Changed from 'tipo: string'
  nivel: number;
  permiteMovimiento: boolean;
  estado: boolean;
  cuentaMayorId?: number | null;
}): CreateCuentaPayload {
  return {
    codigo: formData.codigo,
    nombre: formData.nombre,
    descripcion: formData.descripcion || "",
    tipo: { id: Number(formData.tipoId) },
    nivel: formData.nivel,
    permiteMovimiento: formData.permiteMovimiento,
    estado: formData.estado,
    cuentaMayor: formData.cuentaMayorId ? { id: Number(formData.cuentaMayorId) } : null,
  };
}
