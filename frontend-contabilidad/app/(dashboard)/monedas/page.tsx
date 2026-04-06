"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, AlertCircle, Pencil, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableColumn } from "@/types";
import { Moneda } from "@/types";
import { getMonedas, deleteMoneda } from "@/lib/monedaService";
import { useTenant } from "@/lib/tenantService";
import MonedaFormModal from "./components/MonedaFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ─── Column definitions generator ────────────────────────────────────────────────────────
const getColumns = (
  onEdit: (m: Moneda) => void,
  onDeleteClick: (m: Moneda) => void
): TableColumn<Moneda>[] => [
  {
    header: "Código ISO",
    accessor: (m) => (
      <span className="inline-flex items-center justify-center w-11 h-7 rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
        {m.codigoIso}
      </span>
    ),
    exportValue: (m) => m.codigoIso,
    width: "90px",
  },

  {
      header: "Símbolo",
      accessor: (m) => (
        <span className="inline-flex items-center justify-center h-7 px-2 rounded-lg bg-purple-50 text-xs font-bold text-purple-600">
          {m.simbolo}
        </span>
      ),
      exportValue: (m) => m.simbolo,
      width: "80px",
  },

  {
    header: "Nombre",
    accessor: (m) => (
      <div>
        <p className="font-medium text-apple-text">{m.nombre}</p>
      </div>
    ),
    exportValue: (m) => m.nombre,
  },
  {
    header: "Descripción",
    accessor: (m) => (
      <span className="text-apple-secondary">{m.descripcion}</span>
    ),
    exportValue: (m) => m.descripcion || "",
  },
  {
    header: "Tasa de Cambio",
    accessor: (m) => (
      <span className="font-mono font-medium">{m.tasaCambio.toFixed(4)}</span>
    ),
    exportValue: (m) => m.tasaCambio.toFixed(4),
    align: "right" as const,
    width: "130px",
  },
  {
    header: "Estado",
    accessor: (m) => <StatusBadge active={m.estado} />,
    exportValue: (m) => m.estado ? "Activo" : "Inactivo",
    align: "center" as const,
    width: "100px",
  },
  {
    header: "Creado",
    accessor: (m) =>
      m.fechaCreacion
        ? new Date(m.fechaCreacion).toLocaleDateString("es-DO", {
            day: "2-digit", month: "short", year: "numeric",
          })
        : "—",
    align: "right",
    width: "120px",
  },
  {
    header: "Acciones",
    accessor: (m) => (
      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(m); }}
          className="p-1.5 rounded-lg text-apple-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Editar moneda"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteClick(m); }}
          className="p-1.5 rounded-lg text-apple-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar moneda"
        >
          <Trash2 size={14} />
        </button>
      </div>
    ),
    align: "right" as const,
    width: "90px",
    excludeFromExport: true,
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MonedasPage() {
  const { activeTenant } = useTenant();
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMoneda, setEditingMoneda] = useState<Moneda | null>(null);
  
  const [dialog, setDialog] = useState<{ open: boolean; type: "alert"|"confirm"; message: string; onConfirm?: () => void }>({ open: false, type: "alert", message: "" });

  const fetchMonedas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonedas();
      setMonedas(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error al cargar monedas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTenant.id]);

  useEffect(() => { fetchMonedas(); }, [fetchMonedas]);

  const handleEdit = (m: Moneda) => {
    setEditingMoneda(m);
    setModalOpen(true);
  };

  const handleDeleteClick = (m: Moneda) => {
    setDialog({
      open: true,
      type: "confirm",
      message: `¿Estás seguro que deseas eliminar la moneda ${m.codigoIso} - ${m.nombre}?`,
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        try {
          await deleteMoneda(m.id);
          setMonedas(prev => prev.filter((x) => x.id !== m.id));
        } catch (e: any) {
          setTimeout(() => {
            setDialog({
              open: true,
              type: "alert",
              message: "Error al eliminar la moneda. Tal vez tenga registros asociados."
            });
          }, 300);
        }
      }
    });
  };

  const tableColumns = getColumns(handleEdit, handleDeleteClick);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Gestión de Monedas"
        subtitle="Administración de divisas y tasas de cambio"
      />

      <div className="flex-1 p-8 space-y-5">

        {/* ── Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-apple-text">
              {!loading && !error && `${monedas.length} divisa${monedas.length !== 1 ? "s" : ""} registrada${monedas.length !== 1 ? "s" : ""}`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMonedas}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white hover:text-apple-text transition-all disabled:opacity-50"
              aria-label="Recargar"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>

            <button
              id="btn-nueva-moneda"
              onClick={() => { setEditingMoneda(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={15} />
              Nueva Moneda
            </button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error} — ¿El backend está corriendo en <code className="font-mono">:8080</code>?</span>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────── */}
        <DataTable<Moneda>
          columns={tableColumns}
          data={monedas}
          isLoading={loading}
          emptyMessage="No hay monedas registradas. Haz clic en 'Nueva Moneda' para comenzar."
          keyExtractor={(m) => m.id}
          exportable
          tableName="Catálogo de Monedas"
        />
      </div>

      {/* ── Create Modal ─────────────────────────────────────────────── */}
      <MonedaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newMoneda) => {
          if (editingMoneda) {
            setMonedas((prev) => prev.map((x) => (x.id === newMoneda.id ? newMoneda : x)));
          } else {
            setMonedas((prev) => [...prev, newMoneda]);
          }
        }}
        initialData={editingMoneda}
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
