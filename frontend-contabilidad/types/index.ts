import type React from "react";

// ─── Moneda ───────────────────────────────────────────────────────────────────
export interface Moneda {
  id: number;
  codigoIso: string;
  simbolo: string;
  nombre: string;
  descripcion: string;
  tasaCambio: number;
  estado: boolean;
  fechaCreacion?: string;
}
export type CreateMonedaPayload = Omit<Moneda, "id" | "fechaCreacion">;
export type UpdateMonedaPayload = Partial<CreateMonedaPayload>;

// ─── Tipo de Cuenta (entidad del backend) ─────────────────────────────────────
export interface TipoCuentaEntity {
  id: number;
  nombre: string;        // "Activos", "Pasivos", etc.
  descripcion?: string;
  origen?: string;       // "DEBITO" | "CREDITO"
  estado?: boolean;
}

// Union type for flexibility: backend sends object, some UI code uses string
export type TipoCuenta = "ACTIVO" | "PASIVO" | "PATRIMONIO" | "INGRESO" | "GASTO";

/** Extract the uppercase tipo name from either a TipoCuentaEntity or a string */
export function getTipoNombre(tipo: TipoCuentaEntity | string | null | undefined): string {
  if (!tipo) return "";
  if (typeof tipo === "string") return tipo.toUpperCase();
  return (tipo.nombre || "").toUpperCase();
}

/** 
 * Helper to determine account nature based on type ID or name.
 * 1 (ACTIVO), 5 (GASTO) -> DEUDORA
 * 2 (PASIVO), 3 (PATRIMONIO), 4 (INGRESO) -> ACREEDORA
 */
export function getNaturalezaByType(tipo: TipoCuentaEntity | string | null | undefined): "DEUDORA" | "ACREEDORA" {
  const name = getTipoNombre(tipo);
  const deudoras = ["ACTIVO", "GASTO", "COSTO"];
  return deudoras.includes(name) ? "DEUDORA" : "ACREEDORA";
}

// ─── Cuenta Contable ─────────────────────────────────────────────────────────
export interface CuentaContable {
  id: number;
  codigo: string;           // e.g. "1.1.01"
  nombre: string;
  descripcion?: string;
  tipo: TipoCuentaEntity | null;  // Backend sends nested object
  nivel: number;            // 1=grupo, 2=subgrupo, 3=cuenta, 4=subcuenta
  permiteMovimiento: boolean;
  balance: number;          // Backend field name (was "saldo")
  cuentaMayor: CuentaContable | null;  // Backend field name (was "cuentaPadreId")
  estado: boolean;
}

export interface CreateCuentaPayload {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: { id: number };
  nivel: number;
  permiteMovimiento: boolean;
  estado: boolean;
  cuentaMayor?: { id: number } | null;
}
export type UpdateCuentaPayload = Partial<CreateCuentaPayload>;

// ─── Asiento Contable ────────────────────────────────────────────────────────
/**
 * Refleja la forma del AsientoResponseDTO del backend.
 * Los detalles usan campos planos (cuentaCodigo / cuentaNombre) en lugar del
 * objeto CuentaContable anidado para evitar dependencias circulares en el DTO.
 */
export interface AsientoDetalle {
  id?: number;
  // Campos planos que vienen del DTO (DetalleResumen)
  cuentaCodigo?: string;
  cuentaNombre?: string;
  // Compatibilidad con el objeto anidado que puede llegar en otros contextos
  cuenta?: CuentaContable | null;
  tipoMovimiento: "Debito" | "Credito";
  monto: number;
}

/** UI helper: extract debe/haber from a detail row */
export function getDebeHaber(d: AsientoDetalle): { debe: number; haber: number } {
  const monto = Number(d.monto) || 0;
  return {
    debe:  d.tipoMovimiento === "Debito" ? monto : 0,
    haber: d.tipoMovimiento === "Credito" ? monto : 0,
  };
}

export interface Asiento {
  id: number;
  descripcion: string;
  fechaAsiento: string;              // Backend field name (was "fecha")
  montoTotal: number;                // Sum of all Debitos (= sum of Creditos)
  montoTotalDop?: number;
  estado: boolean;                   // Backend uses boolean (true=active, false=anulado)
  detalles: AsientoDetalle[];
  tasaCambio?: number;
  referencia?: string;               // Not in backend model, kept for form compatibility
  // ── Objetos anidados enriquecidos (vienen del AsientoResponseDTO) ──────────
  auxiliar?: {
    id: number;
    nombre: string;
    descripcion?: string;
  } | null;
  moneda?: {
    id: number;
    codigoIso: string;
    nombre: string;
    simbolo: string;
    tasaCambio?: number;
  } | null;
}

export interface CreateAsientoPayload {
  descripcion: string;
  fechaAsiento: string;
  moneda?: { id: number };
  auxiliar?: { id: number };
  tasaCambio?: number;
  estado?: boolean;
  detalles: {
    cuenta: { id: number };
    tipoMovimiento: "Debito" | "Credito";
    monto: number;
  }[];
}

// ─── Configuración ────────────────────────────────────────────────────────────
export interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string;
  grupo: string;            // e.g. "GENERAL", "CONTABILIDAD", "NOTIFICACIONES"
  tipo: "TEXT" | "NUMBER" | "BOOLEAN" | "EMAIL";
  editable: boolean;
}

// ─── Reporte — Balanza de Comprobación ──────────────────────────────────────
export interface FilaBalanza {
  cuentaId: number;
  codigo: string;
  nombre: string;
  tipo: TipoCuenta;
  saldoAnterior: number;
  movimientosDebe: number;
  movimientosHaber: number;
  saldoFinal: number;
}

export interface ReporteBalanza {
  periodo: string;          // e.g. "2026-03"
  generadoEn: string;
  filas: FilaBalanza[];
  totales: {
    saldoAnterior: number;
    debe: number;
    haber: number;
    saldoFinal: number;
  };
}

// ─── Generic API Response ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// ─── Tenant ───────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

// ─── Table Column Definition ─────────────────────────────────────────────────
export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  /** Plain-text value used for PDF/CSV export instead of the JSX accessor */
  exportValue?: (row: T) => string | number;
  /** If true, this column is excluded from PDF/CSV exports (e.g. action buttons) */
  excludeFromExport?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}
