"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { CuentaContable, getTipoNombre, getNaturalezaByType, TipoCuentaEntity } from "@/types";
import { createCuenta, updateCuenta, buildCuentaPayload } from "@/lib/cuentaService";
import { getTiposCuenta, TipoCuentaDto } from "@/lib/tipoCuentaService";

const NATURALEZAS = ["DEUDORA", "ACREEDORA"] as const;

const schema = z.object({
  codigo: z.string().min(1, "El código es obligatorio").max(20),
  nombre: z.string().min(1, "El nombre es obligatorio").max(150),
  descripcion: z.string().optional(),
  tipoId: z.number().min(1, "El tipo es obligatorio"),
  nivel: z.number().min(1).max(4),
  permiteMovimiento: z.boolean(),
  estado: z.boolean(),
  cuentaMayorId: z.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (c: CuentaContable) => void;
  cuentas: CuentaContable[];
  initialData?: CuentaContable | null;
}

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-black/[0.10] bg-white text-sm text-apple-text placeholder:text-apple-secondary/60 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-1.5";
const errClass  = "mt-1 text-xs text-red-500";

export default function CuentaFormModal({ open, onClose, onSuccess, cuentas, initialData }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [tiposFetched, setTiposFetched] = useState<TipoCuentaDto[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoId: 1, nivel: 3, permiteMovimiento: true, estado: true },
  });

  // Fetch types on mount
  useEffect(() => {
    getTiposCuenta().then(setTiposFetched).catch(console.error);
  }, []);

  // Auto-set naturaleza label based on tipo (cosmetic only)
  const tipoId = watch("tipoId");
  const selectedTipo = tiposFetched.find(t => t.id === Number(tipoId));

  useEffect(() => { 
    if (open) {
      setApiError(null);
      if (initialData) {
        reset({
          codigo: initialData.codigo,
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          tipoId: initialData.tipo?.id || 1,
          cuentaMayorId: initialData.cuentaMayor?.id || null,
          nivel: initialData.nivel,
          permiteMovimiento: initialData.permiteMovimiento,
          estado: initialData.estado,
        });
      } else {
        reset({ tipoId: tiposFetched[0]?.id || 1, nivel: 3, permiteMovimiento: true, estado: true, cuentaMayorId: null });
      }
    }
  }, [open, initialData, reset, tiposFetched]);

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null);
      const payload = buildCuentaPayload(data);
      let saved: CuentaContable;
      if (initialData) {
        saved = await updateCuenta(initialData.id, payload);
      } else {
        saved = await createCuenta(payload);
      }
      onSuccess(saved);
      onClose();
    } catch (e: any) {
      setApiError(e.message || "Error al guardar la cuenta.");
    }
  };

  const padresDisponibles = cuentas.filter((c) => !c.permiteMovimiento && c.id !== initialData?.id);

  return (
    <Modal open={open} onClose={onClose} title={initialData ? "Editar Cuenta" : "Nueva Cuenta Contable"} subtitle={initialData ? "Modifica los datos de la cuenta" : "Agrega una cuenta al plan contable"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {apiError && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {apiError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Código</label>
            <input {...register("codigo")} placeholder="1.1.01" className={inputClass} />
            {errors.codigo && <p className={errClass}>{errors.codigo.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Nivel</label>
            <select {...register("nivel", { valueAsNumber: true })} className={inputClass}>
              <option value={1}>1 — Grupo</option>
              <option value={2}>2 — Subgrupo</option>
              <option value={3}>3 — Cuenta</option>
              <option value={4}>4 — Subcuenta</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Nombre</label>
          <input {...register("nombre")} placeholder="Caja General" className={inputClass} />
          {errors.nombre && <p className={errClass}>{errors.nombre.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Descripción (opcional)</label>
          <input {...register("descripcion")} placeholder="Descripción de la cuenta" className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipo</label>
            <select {...register("tipoId", { valueAsNumber: true })} className={inputClass}>
              {tiposFetched.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            {errors.tipoId && <p className={errClass}>{errors.tipoId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Naturaleza <span className="normal-case text-[10px] text-apple-secondary/60">(auto)</span></label>
            <input
              readOnly
              value={getNaturalezaByType(selectedTipo?.nombre || "")}
              className={`${inputClass} bg-apple-gray/40 cursor-not-allowed`}
            />
          </div>
        </div>

        {padresDisponibles.length > 0 && (
          <div>
            <label className={labelClass}>Cuenta padre (opcional)</label>
            <select {...register("cuentaMayorId", { valueAsNumber: true })} className={inputClass}>
              <option value="">— Sin padre —</option>
              {padresDisponibles.map((c) => (
                <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("permiteMovimiento")} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm text-apple-text">Acepta movimientos</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("estado")} className="w-4 h-4 rounded accent-blue-600" />
            <span className="text-sm text-apple-text">Activa</span>
          </label>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/[0.10] text-sm font-medium text-apple-secondary hover:bg-black/[0.04] transition-colors">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {isSubmitting ? "Guardando…" : "Guardar Cuenta"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
