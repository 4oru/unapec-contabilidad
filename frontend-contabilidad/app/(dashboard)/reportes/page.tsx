"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Scale, Download, RefreshCw, Calendar } from "lucide-react";
import Header from "@/components/layout/Header";
import { BentoCard } from "@/components/ui/BentoCard";
import { FilaBalanza, TipoCuenta, CuentaContable, Asiento, getTipoNombre, getDebeHaber } from "@/types";
import { useTenant } from "@/lib/tenantService";
import { getCuentas } from "@/lib/cuentaService";
import { getAsientos } from "@/lib/asientoService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const TIPO_COLORS: Record<TipoCuenta, string> = {
  ACTIVO:     "bg-blue-50 text-blue-700",
  PASIVO:     "bg-red-50 text-red-700",
  PATRIMONIO: "bg-purple-50 text-purple-700",
  INGRESO:    "bg-green-50 text-green-700",
  GASTO:      "bg-orange-50 text-orange-700",
};

function money(n: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(n);
}

function buildBalanza(cuentasDb: CuentaContable[], asientosDb: Asiento[]): FilaBalanza[] {
  return cuentasDb
    .filter((c) => c.permiteMovimiento)
    .map((c) => {
      // Flatten all details from all asientos and find matching ones for this cuenta
      let debe = 0;
      let haber = 0;
      for (const a of asientosDb) {
        for (const d of a.detalles) {
          if (d.cuenta?.codigo === c.codigo || d.cuenta?.id === c.id) {
            const dh = getDebeHaber(d);
            debe += dh.debe;
            haber += dh.haber;
          }
        }
      }

      // Determine naturaleza from tipo.origen
      const origen = (c.tipo && typeof c.tipo === "object" ? c.tipo.origen : "")?.toUpperCase();
      const esDeudora = origen === "DEBITO";

      // Normalize tipo to match the TipoCuenta enum values exactly
      const rawTipo = (getTipoNombre(c.tipo) || "ACTIVO").toString().toUpperCase().trim();
      // Map plurals / aliases coming from the API to the canonical singular form
      const TIPO_MAP: Record<string, TipoCuenta> = {
        ACTIVO: "ACTIVO", ACTIVOS: "ACTIVO",
        PASIVO: "PASIVO", PASIVOS: "PASIVO",
        PATRIMONIO: "PATRIMONIO",
        INGRESO: "INGRESO", INGRESOS: "INGRESO",
        GASTO: "GASTO",   GASTOS: "GASTO", COSTO: "GASTO", COSTOS: "GASTO",
      };
      const tipoNormalizado: TipoCuenta = TIPO_MAP[rawTipo] ?? "ACTIVO";

      return {
        cuentaId: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        tipo: tipoNormalizado,
        saldoAnterior: 0,
        movimientosDebe: debe,
        movimientosHaber: haber,
        saldoFinal: esDeudora ? debe - haber : haber - debe,
      };
    })
    .filter((f) => f.movimientosDebe > 0 || f.movimientosHaber > 0 || f.saldoFinal !== 0);
}

export default function ReportesPage() {
  const { activeTenant } = useTenant();
  const [periodo, setPeriodo] = useState("2026-03");
  const [filas, setFilas] = useState<FilaBalanza[]>([]);
  const [loading, setLoading] = useState(true);

  const [clientDate, setClientDate] = useState("");

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const [dataCuentas, dataAsientos] = await Promise.all([getCuentas(), getAsientos()]);
      setFilas(buildBalanza(dataCuentas, dataAsientos));
    } catch (e: any) {
      console.error(e);
      setFilas([]);
    } finally {
      setLoading(false); 
    }
  }, [activeTenant.id, periodo]);

  useEffect(() => { 
    generate(); 
    setClientDate(new Date().toLocaleString("es-DO"));
  }, [generate]);

  /**
   * Converts any value coming from the API to a safe number.
   * Handles: number, string with currency symbols ("RD$ 1,234.56"), null, undefined.
   */
  const toNum = (v: unknown): number => {
    if (typeof v === "number") return isNaN(v) ? 0 : v;
    if (typeof v === "string") {
      // Strip currency symbols, thousand separators, and spaces; replace comma-decimal to dot
      const clean = v.replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3})/g, "").replace(",", ".");
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // ── useMemo: recalculates only when `filas` reference changes ─────────────
  const { totalDebe, totalHaber, totalActivos, totalIngresos, totalGastos, utilidad } = useMemo(() => {
    const totalDebe     = filas.reduce((s, f) => s + toNum(f.movimientosDebe),  0);
    const totalHaber    = filas.reduce((s, f) => s + toNum(f.movimientosHaber), 0);
    const totalActivos  = filas
      .filter(f => f.tipo === "ACTIVO")
      .reduce((s, f) => s + toNum(f.saldoFinal), 0);
    const totalIngresos = filas
      .filter(f => f.tipo === "INGRESO")
      .reduce((s, f) => s + toNum(f.saldoFinal), 0);
    const totalGastos   = filas
      .filter(f => f.tipo === "GASTO")          // COSTO/COSTOS already normalized to GASTO in buildBalanza
      .reduce((s, f) => s + toNum(f.saldoFinal), 0);
    const utilidad      = totalIngresos - totalGastos;

    return { totalDebe, totalHaber, totalActivos, totalIngresos, totalGastos, utilidad };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filas]);

  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    
    // Título
    doc.setFontSize(16);
    doc.text(`Balanza de Comprobación - ${activeTenant.name}`, 40, 40);
    doc.setFontSize(10);
    doc.text(`Línea de tiempo: ${periodo} | Generado: ${new Date().toLocaleString("es-DO")}`, 40, 60);

    // Tabla
    const tableData = filas.map(f => [
      f.codigo,
      f.nombre,
      f.tipo,
      money(f.movimientosDebe),
      money(f.movimientosHaber),
      money(f.saldoFinal)
    ]);

    tableData.push([
      "TOTALES",
      "",
      "",
      money(totalDebe),
      money(totalHaber),
      money(totalDebe - totalHaber)
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Código", "Cuenta", "Tipo", "Debe", "Haber", "Saldo Final"]],
      body: tableData,
      theme: "striped",
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" }
      }
    });

    doc.save(`Balanza_${periodo}_${activeTenant.name}.pdf`);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Reportes" subtitle="Balanza de comprobación y estados financieros" />

      <div className="flex-1 p-8 space-y-6">

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-black/[0.08] rounded-xl px-3 py-2">
            <Calendar size={14} className="text-apple-secondary" />
            <input type="month" value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="text-sm text-apple-text outline-none bg-transparent" />
          </div>
          <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Generar
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white transition-all ml-auto">
            <Download size={14} /> Exportar PDF
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            <BentoCard accent title="Total Activos" value={money(totalActivos)} subtitle={`Período ${periodo}`} icon={BarChart3} />
          </div>
          <div className="col-span-6 md:col-span-3">
            <BentoCard title="Ingresos" value={money(totalIngresos)} subtitle="Total del período" icon={TrendingUp} iconColor="#34c759" />
          </div>
          <div className="col-span-6 md:col-span-3">
            <BentoCard title="Gastos" value={money(totalGastos)} subtitle="Total del período" icon={TrendingDown} iconColor="#ff3b30" />
          </div>
          <div className="col-span-12 md:col-span-3">
            <BentoCard
              title="Resultado Neto"
              value={money(utilidad)}
              subtitle={utilidad >= 0 ? "Ganancia" : "Pérdida"}
              icon={Scale}
              iconColor={utilidad >= 0 ? "#34c759" : "#ff3b30"}
            />
          </div>
        </div>

        {/* Balanza table */}
        <div>
          <h2 className="text-sm font-semibold text-apple-text mb-3">Balanza de Comprobación — {periodo}</h2>

          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-apple overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-apple-gray/60">
                    {["Código","Cuenta","Tipo","Debe","Haber","Saldo Final"].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-apple-secondary uppercase tracking-wider ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({length: 6}).map((_, i) => (
                      <tr key={i} className="border-b border-black/[0.04]">
                        {Array.from({length: 6}).map((__, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 rounded-full bg-black/[0.06] animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filas.map((f) => (
                    <tr key={f.cuentaId} className="border-b border-black/[0.04] last:border-0 table-row-hover">
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{f.codigo}</td>
                      <td className="px-4 py-3 font-medium text-apple-text">{f.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIPO_COLORS[f.tipo]}`}>{f.tipo}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{money(f.movimientosDebe)}</td>
                      <td className="px-4 py-3 text-right font-mono">{money(f.movimientosHaber)}</td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${f.saldoFinal >= 0 ? "text-apple-text" : "text-red-500"}`}>{money(f.saldoFinal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black/[0.10] bg-apple-gray/60">
                    <td colSpan={3} className="px-4 py-3 text-xs font-bold text-apple-secondary text-right uppercase tracking-wider">Totales</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-apple-text">{money(totalDebe)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-apple-text">{money(totalHaber)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-700">{money(totalDebe - totalHaber)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <p className="text-xs text-apple-secondary mt-2">
            Generado el {clientDate} — Tenant: {activeTenant.name}
          </p>
        </div>
      </div>
    </div>
  );
}
