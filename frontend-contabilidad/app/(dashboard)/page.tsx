"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign, TrendingUp, TrendingDown, Building2, ArrowRight,
  Activity, BookOpen, FileText, BarChart3, Scale, AlertTriangle,
  CheckCircle, XCircle, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Header from "@/components/layout/Header";
import { BentoCard } from "@/components/ui/BentoCard";
import { useTenant } from "@/lib/tenantService";
import { getMonedas } from "@/lib/monedaService";
import { getConfiguraciones, MOCK_CONFIG } from "@/lib/configuracionService";
import { getCuentas } from "@/lib/cuentaService";
import { getAsientos } from "@/lib/asientoService";
import { Moneda, Asiento, CuentaContable, getTipoNombre } from "@/types";
import { fetchMonthlyStats, DashboardStats } from "@/lib/dashboardService";

// ── Helpers ────────────────────────────────────────────────────────────────────
function money(n: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 }).format(n);
}

function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-black/[0.06] animate-pulse ${className}`} />;
}

function EstadoBadge({ estado }: { estado: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${estado ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
      {estado ? <CheckCircle size={9} /> : <XCircle size={9} />}
      {estado ? "Activo" : "Anulado"}
    </span>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { activeTenant } = useTenant();

  // ── State ──────────────────────────────────────────────────────────────────
  const [monedas,  setMonedas]  = useState<Moneda[]>([]);
  const [monedaBase, setMonedaBase] = useState<string>("DOP");
  const [mensual,  setMensual]  = useState<DashboardStats[]>([]);
  const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [cuentas,  setCuentas]  = useState<CuentaContable[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataMonedas, dataConfig, dataMensual, dataAsientos, dataCuentas] =
        await Promise.all([
          getMonedas(),
          getConfiguraciones().catch(() => MOCK_CONFIG),
          fetchMonthlyStats(),
          getAsientos(),
          getCuentas(),
        ]);

      setMonedas(dataMonedas);
      setMonedaBase(
        dataConfig.find(c => c.clave === "contabilidad.moneda_base")?.valor ?? "DOP"
      );

      // Truncar nombre de mes a 3 letras para los gráficos
      setMensual(dataMensual.map(s => ({ ...s, mes: s.mes.substring(0, 3) })));
      setAsientos(dataAsientos);
      setCuentas(dataCuentas);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [activeTenant.id]);

  // ── Derived / memoized KPIs ────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const toNum = (v: any) => Number(v) || 0;
    const totalIngresos = mensual.reduce((s, m) => s + toNum(m.ingresos), 0);
    const totalGastos   = mensual.reduce((s, m) => s + toNum(m.gastos), 0);
    const resultadoNeto = totalIngresos - totalGastos;

    // Activos dinámicos: sumar movimientos (Debe - Haber) de cuentas tipo ACTIVO
    let totalActivos = 0;
    const codigosActivos = new Set(
      cuentas
        .filter(c => getTipoNombre(c.tipo).toUpperCase().startsWith("ACTIVO") && c.permiteMovimiento)
        .map(c => c.codigo)
    );

    asientos.forEach((a) => {
      // Ignorar asientos inactivos/anulados
      if (a.estado === false) return; 

      (a.detalles || []).forEach((d) => {
        const codigo = d.cuentaCodigo ?? d.cuenta?.codigo;
        if (codigo && codigosActivos.has(codigo)) {
          const monto = toNum(d.monto);
          if (d.tipoMovimiento === "Debito") {
            totalActivos += monto;
          } else if (d.tipoMovimiento === "Credito") {
            totalActivos -= monto;
          }
        }
      });
    });

    return { totalIngresos, totalGastos, resultadoNeto, totalActivos };
  }, [mensual, cuentas, asientos]);

  // Stats secundarias
  const monedasActivas  = monedas.filter(m => m.estado).length;
  const monedaBaseObj   = monedas.find(m => m.codigoIso?.trim().toUpperCase() === monedaBase?.trim().toUpperCase());
  const cuentasActivas  = cuentas.filter(c => c.estado && c.permiteMovimiento).length;
  const asientosActivos = asientos.filter(a => a.estado === true).length;

  // Últimos 5 asientos para la tabla reciente
  const ultimosAsientos = [...asientos]
    .sort((a, b) => new Date(b.fechaAsiento || 0).getTime() - new Date(a.fechaAsiento || 0).getTime())
    .slice(0, 5);

  // Datos para gráfico de tasas (excluye moneda base)
  const tasasData = monedas
    .filter(m => m.codigoIso?.trim().toUpperCase() !== monedaBase?.trim().toUpperCase())
    .map(m => ({ name: m.codigoIso, tasa: m.tasaCambio }));

  const quickLinks = [
    { href: "/monedas",      label: "Monedas",         icon: DollarSign, desc: "Gestión de divisas y tasas" },
    { href: "/cuentas",      label: "Plan de Cuentas", icon: BookOpen,   desc: "Catálogo de cuentas contables" },
    { href: "/asientos",     label: "Asientos",        icon: FileText,   desc: "Registro de transacciones" },
    { href: "/reportes",     label: "Reportes",        icon: BarChart3,  desc: "Estados financieros" },
  ];

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Dashboard" subtitle={`Resumen ejecutivo — ${activeTenant.name}`} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl border border-red-100 shadow-apple p-8 max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="text-base font-bold text-apple-text">Error de conexión</h2>
            <p className="text-sm text-apple-secondary">{error}</p>
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={14} /> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle={`Resumen ejecutivo — ${activeTenant.name}`} />

      <div className="flex-1 p-8 space-y-6">

        {/* ── KPI Row 1: Financieros ─────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-3">
            {loading
              ? <SkeletonBox className="h-[90px]" />
              : <BentoCard accent title="Total Activos" value={money(kpis.totalActivos)} subtitle="Cuentas con movimiento" icon={Building2} className="h-full" />
            }
          </div>
          <div className="col-span-6 md:col-span-3">
            {loading
              ? <SkeletonBox className="h-[90px]" />
              : <BentoCard title="Ingresos Anuales" value={money(kpis.totalIngresos)} subtitle={`${new Date().getFullYear()}`} icon={TrendingUp} iconColor="#34c759" className="h-full" />
            }
          </div>
          <div className="col-span-6 md:col-span-3">
            {loading
              ? <SkeletonBox className="h-[90px]" />
              : <BentoCard title="Gastos Anuales" value={money(kpis.totalGastos)} subtitle={`${new Date().getFullYear()}`} icon={TrendingDown} iconColor="#ff3b30" className="h-full" />
            }
          </div>
          <div className="col-span-12 md:col-span-3">
            {loading
              ? <SkeletonBox className="h-[90px]" />
              : <BentoCard
                  title="Resultado Neto"
                  value={money(kpis.resultadoNeto)}
                  subtitle={kpis.resultadoNeto >= 0 ? "Ganancia del año" : "Pérdida del año"}
                  icon={Scale}
                  iconColor={kpis.resultadoNeto >= 0 ? "#34c759" : "#ff3b30"}
                  className="h-full"
                />
            }
          </div>
        </div>

        {/* ── KPI Row 2: Operacionales ────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Monedas Activas",   value: monedasActivas,  color: "text-blue-600",  icon: DollarSign },
            { label: "Moneda Base",        value: monedaBase,      color: "text-amber-600", icon: Activity   },
            { label: "Cuentas Activas",    value: cuentasActivas,  color: "text-purple-600",icon: BookOpen   },
            { label: "Asientos Activos",   value: asientosActivos, color: "text-green-600", icon: FileText   },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl border border-black/[0.06] shadow-apple px-4 py-3">
              {loading ? (
                <SkeletonBox className="h-10" />
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={13} className="text-apple-secondary" />
                    <p className="text-xs text-apple-secondary font-medium">{label}</p>
                  </div>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── Charts Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Ingresos vs Gastos mensual */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5 min-h-[280px]">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Ingresos vs Gastos — {new Date().getFullYear()}</h2>
            {loading ? (
              <div className="flex flex-col gap-2 pt-2">
                <SkeletonBox className="h-4 w-3/4" />
                <SkeletonBox className="h-48 w-full mt-2" />
              </div>
            ) : mensual.every(m => m.ingresos === 0 && m.gastos === 0) ? (
              <div className="flex items-center justify-center h-48 text-sm text-apple-secondary">
                Sin movimientos registrados este año
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mensual}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#34c759" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff3b30" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => `RD$ ${Number(v).toLocaleString("es-DO")}`} />
                  <Legend />
                  <Area type="monotone" dataKey="ingresos" stroke="#34c759" fill="url(#colorIngresos)" strokeWidth={2} name="Ingresos" />
                  <Area type="monotone" dataKey="gastos"   stroke="#ff3b30" fill="url(#colorGastos)"   strokeWidth={2} name="Gastos" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tasas de cambio */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Tasas de Cambio vs {monedaBase}</h2>
            {loading ? (
              <SkeletonBox className="h-48 w-full" />
            ) : tasasData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-apple-secondary">Sin otras monedas registradas</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={tasasData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={35} />
                  <Tooltip formatter={(v: any) => `${v} ${monedaBase}`} />
                  <Bar dataKey="tasa" fill="#0071e3" radius={[0, 6, 6, 0]} name="Tasa" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Balance mensual */}
          <div className="col-span-12 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5 min-h-[220px]">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Balance Mensual — {new Date().getFullYear()}</h2>
            {loading ? (
              <SkeletonBox className="h-40 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={mensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => `RD$ ${Number(v).toLocaleString("es-DO")}`} />
                  <Bar
                    dataKey="balance"
                    radius={[6, 6, 0, 0]}
                    name="Balance"
                    fill="#0071e3"
                    // Rojo si el balance del mes es negativo
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Últimos Asientos + Módulos ──────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Tabla últimos asientos */}
          <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-black/[0.06] shadow-apple overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-apple-text">Últimos Asientos</h2>
              <Link href="/asientos" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBox key={i} className="h-9" />
                ))}
              </div>
            ) : ultimosAsientos.length === 0 ? (
              <div className="py-12 text-center text-sm text-apple-secondary flex flex-col items-center gap-2">
                <FileText size={24} className="text-apple-secondary/30" />
                Sin asientos registrados aún
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-apple-gray/60 border-b border-black/[0.06]">
                    {["N°", "Fecha", "Descripción", "Monto", "Estado"].map((h, i) => (
                      <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold text-apple-secondary uppercase tracking-wider ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ultimosAsientos.map(a => (
                    <tr key={a.id} className="border-b border-black/[0.04] last:border-0 hover:bg-apple-gray/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <code className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{`ASI-${a.id}`}</code>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-apple-secondary whitespace-nowrap">
                        {a.fechaAsiento ? new Date(a.fechaAsiento).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-apple-text max-w-[180px] truncate">{a.descripcion}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-right">{money(Number(a.montoTotal) || 0)}</td>
                      <td className="px-4 py-2.5 text-right"><EstadoBadge estado={a.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Módulos de acceso rápido */}
          <div className="col-span-12 md:col-span-5">
            <h2 className="text-sm font-semibold text-apple-text mb-3">Módulos</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map(({ href, label, icon: Icon, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-black/[0.06] shadow-apple card-hover hover:border-blue-200 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-apple-text">{label}</p>
                    <p className="text-xs text-apple-secondary mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
