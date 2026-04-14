"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Plus, RefreshCw, Search, TreePine, Pencil, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CuentaContable, TipoCuenta, getTipoNombre } from "@/types";
import { getCuentas, deleteCuenta } from "@/lib/cuentaService";
import { useTenant } from "@/lib/tenantService";
import CuentaFormModal from "./components/CuentaFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const DEFAULT_TIPO_COLORS: Record<string, string> = {
  ACTIVO:     "bg-blue-50 text-blue-700",
  PASIVO:     "bg-red-50 text-red-700",
  PATRIMONIO: "bg-purple-50 text-purple-700",
  INGRESO:    "bg-green-50 text-green-700",
  GASTO:      "bg-orange-50 text-orange-700",
};

const getTipoColor = (name: string) => DEFAULT_TIPO_COLORS[name.toUpperCase()] || "bg-gray-50 text-gray-700";

function saldoStr(saldo: number) {
  const val = typeof saldo === "number" && !isNaN(saldo) ? saldo : 0;
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2 }).format(val);
}

/**
 * Reads the leaf-account balance using a safe fallback chain:
 * c.balance (canonical) → c.saldo → c.saldoActual → 0
 * For parent accounts, sums children recursively.
 */
function getRecursiveSaldo(cuenta: CuentaContable, allCuentas: CuentaContable[]): number {
  if (cuenta.permiteMovimiento) {
    const raw = (cuenta as any).balance ?? (cuenta as any).saldo ?? (cuenta as any).saldoActual ?? 0;
    return Number(raw) || 0;
  }
  const children = allCuentas.filter((c) => c.cuentaMayor?.id === cuenta.id);
  return children.reduce((sum, c) => sum + getRecursiveSaldo(c, allCuentas), 0);
}

function CuentaRow({ cuenta, nivel, expanded, onToggle, onEdit, onDelete, allCuentas }: { cuenta: CuentaContable; nivel: number; expanded: boolean; onToggle: () => void; onEdit: (c: CuentaContable) => void; onDelete: (c: CuentaContable) => void; allCuentas: CuentaContable[] }) {
  const isParent = !cuenta.permiteMovimiento;
  const saldo = getRecursiveSaldo(cuenta, allCuentas);
  const tipoNombre = getTipoNombre(cuenta.tipo);
  const origen = cuenta.tipo && typeof cuenta.tipo === "object" ? cuenta.tipo.origen : undefined;

  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 border-b border-black/[0.03] table-row-hover cursor-default ${isParent ? "bg-black/[0.02] border-b-black/[0.06] font-semibold" : ""}`}>
      <div className="w-16 flex-shrink-0">
        {cuenta.codigo ? (
          <span className="inline-flex items-center justify-center px-1.5 py-1 rounded-lg bg-blue-50 text-xs font-bold text-blue-600 font-mono text-[10px]">
            {cuenta.codigo}
          </span>
        ) : (
          <span className="text-apple-secondary/40 font-mono text-xs">—</span>
        )}
      </div>

      <div className="flex-1 flex items-center" style={{ paddingLeft: `${nivel * 16}px` }}>
        <span className={`text-sm ${isParent ? "font-bold text-apple-text" : "font-medium text-apple-text/80"}`}>
          {cuenta.nombre}
        </span>
      </div>

      <div className="hidden md:block w-24 text-center flex-shrink-0">
        <span className={`inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full ${getTipoColor(tipoNombre)}`}>
          {tipoNombre || "—"}
        </span>
      </div>

      <span className="hidden lg:block text-xs text-apple-secondary flex-shrink-0 w-20 text-right">
        {origen?.toUpperCase() === "DEBITO" ? "Deudora" : origen?.toUpperCase() === "CREDITO" ? "Acreedora" : origen || "—"}
      </span>

      <span className="text-sm font-mono text-right flex-shrink-0 w-36 hidden md:block">
        {saldoStr(saldo)}
      </span>

      <div className="w-16 flex-shrink-0">
        <StatusBadge active={cuenta.estado} />
      </div>

      <div className="flex-shrink-0 w-20 flex justify-end gap-1 opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(cuenta); }}
          className="p-1.5 rounded-lg text-apple-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Editar cuenta"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(cuenta); }}
          className="p-1.5 rounded-lg text-apple-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar cuenta"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function CuentasPage() {
  const { activeTenant } = useTenant();
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<CuentaContable | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1, 2, 5, 7, 8, 10, 12, 14]));

  const [dialog, setDialog] = useState<{ open: boolean; type: "alert"|"confirm"; message: string; onConfirm?: () => void }>({ open: false, type: "alert", message: "" });

  const fetchCuentas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCuentas();
      setCuentas(data);
    } catch (e: any) {
      console.error(e);
      setCuentas([]);
    } finally {
      setLoading(false);
    }
  }, [activeTenant.id]);

  useEffect(() => { fetchCuentas(); }, [fetchCuentas]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = (c: CuentaContable) => {
    setEditingCuenta(c);
    setModalOpen(true);
  };

  const handleDelete = (c: CuentaContable) => {
    const cuentaIdStr = c.codigo ? `${c.codigo} - ` : "";
    setDialog({
      open: true,
      type: "confirm",
      message: `¿Estás seguro que deseas eliminar la cuenta ${cuentaIdStr}${c.nombre}?`,
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        try {
          await deleteCuenta(c.id);
          setCuentas(prev => prev.filter((x) => x.id !== c.id));
        } catch (e: any) {
          setTimeout(() => {
            setDialog({
              open: true,
              type: "alert",
              message: "Error al eliminar la cuenta. Tal vez tenga registros asociados."
            });
          }, 300);
        }
      }
    });
  };

  const filtered = search
    ? cuentas.filter((c) => c.codigo.includes(search) || c.nombre.toLowerCase().includes(search.toLowerCase()))
    : cuentas;

  function isVisible(cuenta: CuentaContable): boolean {
    if (search) return true;
    if (!cuenta.cuentaMayor) return true;
    const padre = cuentas.find((c) => c.id === cuenta.cuentaMayor?.id);
    if (!padre) return true;
    return expanded.has(padre.id) && isVisible(padre);
  }

  const visibleCuentas = filtered.filter(isVisible);

  const tiposUnicos = Array.from(new Set(cuentas.map(c => getTipoNombre(c.tipo)).filter(Boolean)));

  // ── useMemo: KPIs de tarjetas — se recalcula solo cuando cambia `cuentas` ──
  const { totalActivos, totalPasivos, totalGastos, activosConMovimiento } = useMemo(() => {
    /**
     * Lee el saldo de una cuenta hoja con cadena de fallback:
     * balance (campo canónico del backend) → saldo → saldoActual → 0
     */
    const getSaldo = (c: CuentaContable): number => {
      const raw = (c as any).balance ?? (c as any).saldo ?? (c as any).saldoActual ?? 0;
      return Number(raw) || 0;
    };

    const hojasActivos  = cuentas.filter(c => getTipoNombre(c.tipo) === "ACTIVO"  && c.permiteMovimiento);
    const hojasPasivos  = cuentas.filter(c => getTipoNombre(c.tipo) === "PASIVO"  && c.permiteMovimiento);
    const hojasGastos   = cuentas.filter(c => [
      "GASTO", "GASTOS", "COSTO", "COSTOS",
    ].includes(getTipoNombre(c.tipo)) && c.permiteMovimiento);

    const totalActivos  = hojasActivos.reduce((s, c) => s + getSaldo(c), 0);
    const totalPasivos  = hojasPasivos.reduce((s, c) => s + getSaldo(c), 0);
    const totalGastos   = hojasGastos.reduce((s, c)  => s + getSaldo(c), 0);

    // Activos con movimiento: activos hoja cuyo saldo es != 0
    const activosConMovimiento = hojasActivos.filter(c => getSaldo(c) !== 0).length;

    return { totalActivos, totalPasivos, totalGastos, activosConMovimiento };
  }, [cuentas]);

  return (
    <div className="flex flex-col h-full">
      <Header title="Plan de Cuentas" subtitle="Catálogo de cuentas contables" />

      <div className="flex-1 p-8 space-y-5">
        {/* Summary cards — valores calculados por useMemo */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tiposUnicos.map((tipoNombre) => {
            // Usar los KPIs pre-calculados para los 3 tipos principales;
            // para PATRIMONIO, INGRESO y cualquier otro tipo custom, recalcular recursivamente.
            const KPI_MAP: Record<string, number> = {
              ACTIVO:  totalActivos,
              ACTIVOS: totalActivos,
              PASIVO:  totalPasivos,
              PASIVOS: totalPasivos,
              GASTO:   totalGastos,
              GASTOS:  totalGastos,
              COSTO:   totalGastos,
              COSTOS:  totalGastos,
            };
            const totalSaldo = KPI_MAP[tipoNombre] !== undefined
              ? KPI_MAP[tipoNombre]
              : cuentas
                  .filter(c => getTipoNombre(c.tipo) === tipoNombre && !c.cuentaMayor)
                  .reduce((s, c) => s + getRecursiveSaldo(c, cuentas), 0);
            return (
              <div key={tipoNombre} className="bg-white rounded-2xl border border-black/[0.06] shadow-apple px-4 py-3">
                <p className={`text-[11px] font-bold ${getTipoColor(tipoNombre)} inline-block px-2 py-0.5 rounded-lg`}>{tipoNombre}</p>
                <p className="text-base font-bold text-apple-text mt-1.5">{saldoStr(totalSaldo)}</p>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 max-w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por código o nombre…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-black/[0.08] text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCuentas} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white transition-all">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
            <button id="btn-nueva-cuenta" onClick={() => { setEditingCuenta(null); setModalOpen(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={15} /> Nueva Cuenta
            </button>
          </div>
        </div>

        {/* Tree table */}
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-apple overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.06] bg-apple-gray/60 text-[11px] font-semibold text-apple-secondary uppercase tracking-wider">
            <div className="w-16 flex-shrink-0">Código</div>
            <div className="flex-1">Nombre</div>
            <div className="hidden md:block w-24 text-center flex-shrink-0">Tipo</div>
            <div className="hidden lg:block w-20 text-right flex-shrink-0">Origen</div>
            <div className="hidden md:block w-36 text-right flex-shrink-0">Saldo</div>
            <div className="w-16 flex-shrink-0">Estado</div>
            <div className="w-20 text-right flex-shrink-0">Acciones</div>
          </div>

          {loading ? (
            Array.from({length: 8}).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3 border-b border-black/[0.04]">
                <div className="h-4 rounded bg-black/[0.06] animate-pulse" style={{width: `${30 + i*15}%`}} />
              </div>
            ))
          ) : visibleCuentas.length === 0 ? (
            <div className="py-14 text-center text-sm text-apple-secondary flex flex-col items-center gap-2">
              <TreePine size={28} className="text-apple-secondary/40" />
              No se encontraron cuentas
            </div>
          ) : (
            visibleCuentas.map((c) => (
              <div key={c.id} className="group relative">
                <CuentaRow
                  cuenta={c}
                  nivel={c.nivel - 1}
                  expanded={expanded.has(c.id)}
                  onToggle={() => toggleExpand(c.id)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  allCuentas={cuentas}
                />
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-apple-secondary">
          Total activos con movimiento:{" "}
          <strong>{activosConMovimiento} cuenta{activosConMovimiento !== 1 ? "s" : ""}</strong>{" — "}saldo total:{" "}
          <strong>{saldoStr(totalActivos)}</strong>
        </p>
      </div>

      <CuentaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(c) => {
          if (editingCuenta) {
            setCuentas((prev) => prev.map((x) => (x.id === c.id ? c : x)));
          } else {
            setCuentas((prev) => [...prev, c]);
          }
        }}
        cuentas={cuentas}
        initialData={editingCuenta}
      />

      <ConfirmDialog
        open={dialog.open}
        type={dialog.type}
        message={dialog.message}
        onClose={() => setDialog(prev => ({ ...prev, open: false }))}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
}
