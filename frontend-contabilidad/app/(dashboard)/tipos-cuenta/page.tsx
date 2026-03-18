"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TipoCuentaDto, getTiposCuenta, deleteTipoCuenta } from "@/lib/tipoCuentaService";
import { TableColumn } from "@/types";
import TipoCuentaFormModal from "./components/TipoCuentaFormModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function TiposCuentaPage() {
  const [tipos, setTipos] = useState<TipoCuentaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipoCuentaDto | null>(null);
  
  const [dialog, setDialog] = useState<{ open: boolean; type: "alert"|"confirm"; message: string; onConfirm?: () => void }>({ open: false, type: "alert", message: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTiposCuenta();
      setTipos(data);
    } catch (e: any) {
      console.error(e);
      setTipos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (item: TipoCuentaDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDeleteClick = (item: TipoCuentaDto) => {
    setDialog({
      open: true,
      type: "confirm",
      message: `¿Estás seguro que deseas eliminar el tipo '${item.nombre}'?`,
      onConfirm: async () => {
        setDialog(prev => ({ ...prev, open: false }));
        try {
          await deleteTipoCuenta(item.id);
          setTipos(prev => prev.filter((x) => x.id !== item.id));
        } catch (e: any) {
          setTimeout(() => {
            setDialog({
              open: true,
              type: "alert",
              message: "Error al eliminar el rubro. Es probable que existan cuentas contables asociadas a él."
            });
          }, 300);
        }
      }
    });
  };

  const columns: TableColumn<TipoCuentaDto>[] = [
    { header: "ID", accessor: "id", width: "80px" },
    {
      header: "Nombre",
      accessor: (t) => <span className="font-bold text-apple-text">{t.nombre}</span>,
      exportValue: (t) => t.nombre,
    },
    { header: "Descripción", accessor: "descripcion" },
    {
      header: "Origen (Naturaleza)",
      accessor: (t) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${t.origen === "Debito" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
          {t.origen}
        </span>
      ),
      exportValue: (t) => t.origen,
      width: "150px"
    },
    { header: "Estado", accessor: (t) => <StatusBadge active={t.estado} />, exportValue: (t) => t.estado ? "Activo" : "Inactivo", align: "center", width: "100px" },
    {
      header: "Acciones",
      accessor: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-apple-secondary hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDeleteClick(t)} className="p-1.5 rounded-lg text-apple-secondary hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
      align: "right",
      width: "100px",
      excludeFromExport: true,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Tipos de Cuenta" subtitle="Clasificadores y Tipos Contables base" />

      <div className="flex-1 p-8 space-y-5">
        <div className="flex items-center justify-end gap-2">
          <button onClick={fetchData} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] text-sm text-apple-secondary hover:bg-white transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={() => { setEditingItem(null); setModalOpen(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
            <Plus size={15} /> Nuevo Tipo
          </button>
        </div>

        <DataTable<TipoCuentaDto>
          columns={columns}
          data={tipos}
          isLoading={loading}
          emptyMessage="No hay tipos de cuenta registrados."
          keyExtractor={(t) => t.id}
          exportable
          tableName="Clasificadores de Cuentas"
        />
      </div>

      <TipoCuentaFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingItem}
        onSuccess={(item) => {
          if (editingItem) {
            setTipos(prev => prev.map(x => x.id === item.id ? item : x));
          } else {
            setTipos(prev => [...prev, item]);
          }
        }}
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
