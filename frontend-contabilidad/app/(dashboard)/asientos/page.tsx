"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, RefreshCw, CheckCircle, XCircle, Eye } from "lucide-react";
import Header from "@/components/layout/Header";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { TableColumn, Asiento, Moneda, CuentaContable, getDebeHaber } from "@/types";
import { getAsientos } from "@/lib/asientoService";
import { getCuentas } from "@/lib/cuentaService";
import { useTenant } from "@/lib/tenantService";
import { getAuxiliares, Auxiliar } from "@/lib/auxiliarService";
import AsientoFormModal from "./components/AsientoFormModal";
import { getMonedas } from "@/lib/monedaService";

function saldoStr(n: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(n);
}

function EstadoBadge({ estado }: { estado: boolean }) {
  const isActive = estado === true;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
      {isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {isActive ? "Activo" : "Anulado"}
    </span>
  );
}

export default function AsientosPage() {
  const { activeTenant } = useTenant();
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailAsiento, setDetailAsiento] = useState<Asiento | null>(null);

  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);

  const fetchAsientosAndCuentas = useCallback(async () => {
    setLoading(true);
    try {
      const [dataAsientos, dataCuentas, dataAuxiliares, dataMonedas] = await Promise.all([
        getAsientos(),
        getCuentas(),
        getAuxiliares(),
        getMonedas()
      ]);
      setAsientos(dataAsientos);
      setCuentas(dataCuentas);
      setAuxiliares(dataAuxiliares);
      setMonedas(dataMonedas);
    } catch (e: any) {
      console.error(e);
      setAsientos([]);
      setCuentas([]);
      setAuxiliares([]);
      setMonedas([]);
    } finally {
      setLoading(false);
    }
  }, [activeTenant.id]);

  useEffect(() => { fetchAsientosAndCuentas(); }, [fetchAsientosAndCuentas]);

  const columns: TableColumn<Asiento>[] = [
    {
      header: "Número",
      accessor: (a) => <code className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg">{`ASI-${a.id}`}</code>,
      exportValue: (a) => `ASI-${a.id}`,
      width: "140px",
    },
    {
      header: "Fecha",
      accessor: (a) => new Date(a.fechaAsiento || "").toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }),
      width: "110px",
    },
    {
      header: "Descripción",
      accessor: (a) => (
        <div>
          <p className="font-medium text-apple-text">{a.descripcion}</p>
          {a.referencia && <p className="text-xs text-apple-secondary">Ref: {a.referencia}</p>}
        </div>
      ),
      exportValue: (a) => a.descripcion + (a.referencia ? ` (Ref: ${a.referencia})` : ""),
    },
    {
      header: "Debe",
      accessor: (a) => <span className="font-mono text-right">{saldoStr(Number(a.montoTotal) || 0)}</span>,
      exportValue: (a) => (Number(a.montoTotal) || 0).toFixed(2),
      align: "right",
      width: "130px",
    },
    {
      header: "Haber",
      accessor: (a) => <span className="font-mono text-right">{saldoStr(Number(a.montoTotal) || 0)}</span>,
      exportValue: (a) => (Number(a.montoTotal) || 0).toFixed(2),
      align: "right",
      width: "130px",
    },
    {
      header: "Estado",
      accessor: (a) => <EstadoBadge estado={a.estado} />,
      exportValue: (a) => a.estado ? "Activo" : "Anulado",
      align: "center",
      width: "110px",
    },
    {
      header: "",
      accessor: (a) => (
        <button onClick={() => setDetailAsiento(a)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <Eye size={13} /> Ver
        </button>
      ),
      align: "right",
      width: "60px",
      excludeFromExport: true,
    },
  ];

  const totalMonto = asientos.reduce((s, a) => s + (Number(a.montoTotal) || 0), 0);
  const activos = asientos.filter(a => a.estado === true).length;
  const anulados = asientos.filter(a => a.estado === false).length;

  return (
    <div className="flex flex-col h-full">
      <Header title="Asientos Contables" subtitle="Registro de movimientos de doble entrada" />

      <div className="flex-1 p-8 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Asientos", value: asientos.length, color: "text-apple-text" },
            { label: "Activos",         value: activos,         color: "text-green-600" },
            { label: "Anulados",        value: anulados,        color: "text-red-600" },
            { label: "Movimiento Total", value: saldoStr(totalMonto), color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-black/[0.06] shadow-apple px-4 py-3">
              <p className="text-xs text-apple-secondary font-medium">{label}</p>
              <p className={`text-lg font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-2">
          <button onClick={fetchAsientosAndCuentas} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button id="btn-nuevo-asiento" onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={15} /> Nuevo Asiento
          </button>
        </div>

        <DataTable<Asiento>
          columns={columns}
          data={asientos}
          isLoading={loading}
          emptyMessage="No hay asientos registrados."
          keyExtractor={(a) => a.id}
          exportable
          tableName="Catálogo de Asientos Contables"
        />
      </div>

      {/* Create modal */}
      <AsientoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(a) => setAsientos((prev) => [a, ...prev])}
        cuentas={cuentas}
        monedas={monedas}
      />

      {/* Detail modal */}
      <Modal open={!!detailAsiento} onClose={() => setDetailAsiento(null)} title={`Asiento ASI-${detailAsiento?.id || ""}`} subtitle={detailAsiento?.descripcion} maxWidth="640px">
        {detailAsiento && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-xs text-apple-secondary font-semibold uppercase tracking-wider mb-0.5">Fecha</p><p>{new Date(detailAsiento.fechaAsiento || "").toLocaleDateString("es-DO", { day:"2-digit", month:"long", year:"numeric"})}</p></div>
              <div><p className="text-xs text-apple-secondary font-semibold uppercase tracking-wider mb-0.5">Referencia</p><p>{detailAsiento.referencia || "—"}</p></div>
              <div><p className="text-xs text-apple-secondary font-semibold uppercase tracking-wider mb-0.5">Estado</p><EstadoBadge estado={detailAsiento.estado} /></div>
            </div>

            <div className="rounded-xl border border-black/[0.08] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-apple-gray/60">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-apple-secondary uppercase">Cuenta</th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-apple-secondary uppercase">Movimiento</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold text-apple-secondary uppercase">Debe</th>
                    <th className="px-3 py-2 text-right text-[11px] font-semibold text-apple-secondary uppercase">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {detailAsiento.detalles.map((d, i) => {
                    const { debe, haber } = getDebeHaber(d);
                    return (
                      <tr key={i} className="border-b border-black/[0.04] last:border-0">
                        <td className="px-3 py-2.5">
                          <p className="font-mono text-xs text-blue-600">{d.cuenta?.codigo}</p>
                          <p className="text-xs text-apple-secondary">{d.cuenta?.nombre}</p>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-apple-secondary">{d.tipoMovimiento}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-sm">{debe > 0 ? saldoStr(debe) : "—"}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-sm">{haber > 0 ? saldoStr(haber) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black/[0.06] bg-apple-gray/40">
                    <td colSpan={2} className="px-3 py-2 text-xs font-bold text-apple-secondary text-right">Totales</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-green-700">{saldoStr(Number(detailAsiento.montoTotal) || 0)}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-green-700">{saldoStr(Number(detailAsiento.montoTotal) || 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
