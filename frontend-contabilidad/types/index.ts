import React from "react";

// ─── Moneda ───────────────────────────────────────────────────────────────────
export interface Moneda {
  id: number;
  codigoIso: string;
  simbolo: string;        // ← nuevo
  nombre: string;
  descripcion: string;
  tasaCambio: number;
  estado: boolean;
  fechaCreacion?: string;
}
export type CreateMonedaPayload = Omit<Moneda, "id" | "fechaCreacion">;
export type UpdateMonedaPayload = Partial<CreateMonedaPayload>;

// ─── Cuenta Contable ─────────────────────────────────────────────────────────
export type TipoCuenta = "ACTIVO" | "PASIVO" | "PATRIMONIO" | "INGRESO" | "GASTO";
export type NaturalezaCuenta = "DEUDORA" | "ACREEDORA";

export interface CuentaContable {
  id: number;
  codigo: string;           // e.g. "1.1.01"
  nombre: string;
  descripcion?: string;
  tipo: TipoCuenta;
  origen?: string;
  naterialeza?: NaturalezaCuenta; // fallback if any
  cuentaPadreId?: number;
  cuentaPadre?: Pick<CuentaContable, "id" | "codigo" | "nombre">;
  nivel: number;            // 1=grupo, 2=subgrupo, 3=cuenta, 4=subcuenta
  permiteMovimiento: boolean;
  saldo: number;
  estado: boolean;
  fechaCreacion?: string;
}
export type CreateCuentaPayload = Omit<CuentaContable, "id" | "fechaCreacion" | "cuentaPadre" | "saldo">;
export type UpdateCuentaPayload = Partial<CreateCuentaPayload>;

// ─── Asiento Contable ────────────────────────────────────────────────────────
export type EstadoAsiento = "BORRADOR" | "CONFIRMADO" | "ANULADO";

export interface AsientoDetalle {
  id?: number;
  cuentaId: number;
  cuenta?: Pick<CuentaContable, "id" | "codigo" | "nombre">;
  concepto: string;
  debe: number;
  haber: number;
}

export interface Asiento {
  id: number;
  numero: string;
  fecha: string;
  descripcion: string;
  referencia?: string;
  estado: EstadoAsiento;
  detalles: AsientoDetalle[];
  totalDebe: number;
  totalHaber: number;
  monedaId?: number;        // ← nuevo
  tasaCambio?: number;      // ← nuevo
  montoTotalDop?: number;   // ← nuevo
  auxiliarId?: number;
  usuarioId?: string;
  fechaCreacion?: string;
}
export type CreateAsientoPayload = Omit<Asiento, "id" | "numero" | "totalDebe" | "totalHaber" | "montoTotalDop" | "fechaCreacion">;
export type UpdateAsientoPayload = Partial<CreateAsientoPayload>;

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
