"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign, TrendingUp, Building2, ArrowRight,
  Activity, BookOpen, FileText, BarChart3,
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
import { Moneda } from "@/types";

import { fetchMonthlyStats, DashboardStats } from "@/lib/dashboardService";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function DashboardPage() {
  const { activeTenant } = useTenant();
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [monedaBase, setMonedaBase] = useState<string>("DOP");
  const [mensual, setMensual] = useState<DashboardStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getMonedas(),
      getConfiguraciones().catch(() => MOCK_CONFIG),
      fetchMonthlyStats()
    ]).then(([dataMonedas, dataConfig, dataMensual]) => {
      setMonedas(dataMonedas);
      const base = dataConfig.find(c => c.clave === "contabilidad.moneda_base")?.valor || "DOP";
      setMonedaBase(base);
      
      // Mapear meses cortos para el gráfico si es necesario
      const stats = dataMensual.map(s => ({
        ...s,
        mes: s.mes.substring(0, 3) 
      }));
      setMensual(stats);
    }).catch((err) => {
      console.error("Dashboard init error:", err);
      setMonedas([]);
    }).finally(() => setLoading(false));
  }, [activeTenant.id]);

  const monedasActivas = monedas.filter((m) => m.estado).length;
  const monedaBaseObj = monedas.find((m) => m.codigoIso?.trim().toUpperCase() === monedaBase?.trim().toUpperCase());

  const tasasData = monedas.map(m => ({ name: m.codigoIso, tasa: m.tasaCambio }));

  const quickLinks = [
    { href: "/monedas",  label: "Monedas",         icon: DollarSign, desc: "Gestión de divisas y tasas" },
    { href: "/cuentas",  label: "Plan de Cuentas", icon: BookOpen,   desc: "Catálogo de cuentas contables" },
    { href: "/asientos", label: "Asientos",        icon: FileText,   desc: "Registro de transacciones" },
    { href: "/reportes", label: "Reportes",        icon: BarChart3,  desc: "Estados financieros" },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" subtitle={`Resumen ejecutivo — ${activeTenant.name}`} />

      <div className="flex-1 p-8 space-y-6">

        {/* ── KPI Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-5">
            <BentoCard
              accent
              title="Empresa activa"
              value={activeTenant.name}
              subtitle="Tenant seleccionado actualmente"
              icon={Building2}
              className="h-full"
            />
          </div>
          <div className="col-span-6 md:col-span-3">
            <BentoCard
              title="Monedas Activas"
              value={loading ? "—" : monedasActivas}
              subtitle="divisas registradas"
              icon={DollarSign}
              iconColor="#34c759"
              className="h-full"
            />
          </div>
          <div className="col-span-6 md:col-span-2">
            <BentoCard
              title="Moneda Base"
              value={loading ? "—" : monedaBase}
              subtitle={monedaBaseObj ? monedaBaseObj.nombre : "No configurada"}
              icon={TrendingUp}
              iconColor="#ff9f0a"
              className="h-full"
            />
          </div>
          <div className="col-span-6 md:col-span-2">
            <BentoCard
              title="Tasa de Cambio"
              value={loading ? "—" : monedaBaseObj ? `${monedaBaseObj.tasaCambio}` : "N/A"}
              subtitle="tasa actual"
              icon={Activity}
              iconColor="#0071e3"
              className="h-full"
            />
          </div>
        </div>

        {/* ── Gráficos ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Ingresos vs Gastos del mes */}
          <div className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5 relative min-h-[280px]">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Ingresos vs Gastos — {new Date().getFullYear()}</h2>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl">
                <Activity className="animate-spin text-blue-500" size={24} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mensual}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34c759" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#34c759" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => `RD$ ${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="ingresos" stroke="#34c759" fill="url(#colorIngresos)" strokeWidth={2} name="Ingresos" />
                  <Area type="monotone" dataKey="gastos"   stroke="#ff3b30" fill="url(#colorGastos)"   strokeWidth={2} name="Gastos" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tasas de cambio */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Tasas de Cambio</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tasasData.filter(t => t.name !== "DOP")} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={35} />
                <Tooltip formatter={(v: any) => `${v} ${monedaBase}`} />
                <Bar dataKey="tasa" fill="#0071e3" radius={[0, 6, 6, 0]} name="Tasa" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Balance del mes */}
          <div className="col-span-12 bg-white rounded-2xl border border-black/[0.06] shadow-apple p-5 relative min-h-[220px]">
            <h2 className="text-sm font-semibold text-apple-text mb-4">Balance Mensual — {new Date().getFullYear()}</h2>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl">
                <BarChart3 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={mensual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => `RD$ ${Number(v).toLocaleString()}`} />
                  <Bar dataKey="balance" fill="#0071e3" radius={[6, 6, 0, 0]} name="Balance" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* ── Módulos ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-apple-text mb-3">Módulos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map(({ href, label, icon: Icon, desc }) => (
              <Link key={href} href={href} className="group flex flex-col gap-3 p-5 bg-white rounded-2xl border border-black/[0.06] shadow-apple card-hover hover:border-blue-200 transition-all">
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
  );
}
