"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Asiento, CuentaContable, CreateAsientoPayload, Moneda } from "@/types";
import { createAsiento } from "@/lib/asientoService";

const detalleSchema = z.object({
  cuentaId: z.number({ invalid_type_error: "Seleccione una cuenta" }).min(1, "Seleccione una cuenta"),
  debe: z.number({ invalid_type_error: "Ingrese un número" }).min(0),
  haber: z.number({ invalid_type_error: "Ingrese un número" }).min(0),
});

const schema = z.object({
  fechaAsiento: z.string().min(1, "La fecha es obligatoria"),
  descripcion: z.string().min(1, "La descripción es obligatoria"),
  monedaId: z.number({ invalid_type_error: "Seleccione una moneda" }).min(1, "Seleccione una moneda"),
  tasaCambio: z.number({ invalid_type_error: "Ingrese la tasa" }).positive("La tasa debe ser positiva"),
  detalles: z.array(detalleSchema).min(2, "Se requieren al menos 2 líneas"),
}).refine((d) => {
  const totalDebe = d.detalles.reduce((s, l) => s + (l.debe || 0), 0);
  const totalHaber = d.detalles.reduce((s, l) => s + (l.haber || 0), 0);
  return Math.abs(totalDebe - totalHaber) < 0.001;
}, { message: "El asiento debe estar cuadrado (Debe = Haber)", path: ["detalles"] });

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (a: Asiento) => void;
  cuentas: CuentaContable[];
  monedas: Moneda[];
}

const inputClass = "w-full px-3 py-2 rounded-xl border border-black/[0.10] bg-white text-sm text-apple-text placeholder:text-apple-secondary/60 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";
const labelClass = "block text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-1.5";
const errClass  = "mt-1 text-xs text-red-500";
const thClass   = "text-[10px] font-semibold text-apple-secondary uppercase tracking-wider text-left py-1.5 px-2";

export default function AsientoFormModal({ open, onClose, onSuccess, cuentas, monedas }: Props) {
  const movibles = cuentas.filter(c => c.permiteMovimiento !== false && c.estado !== false);
  const today = new Date().toISOString().slice(0, 10);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fechaAsiento: today,
      detalles: [
        { cuentaId: 0, debe: 0, haber: 0 },
        { cuentaId: 0, debe: 0, haber: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "detalles" });
  const detalles = watch("detalles") || [];
  const totalDebe = detalles.reduce((s, l) => s + (Number(l.debe) || 0), 0);
  const totalHaber = detalles.reduce((s, l) => s + (Number(l.haber) || 0), 0);
  const cuadrado = Math.abs(totalDebe - totalHaber) < 0.001;

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null);

      // Transform form data → backend payload
      const payload: CreateAsientoPayload = {
        descripcion: data.descripcion,
        fechaAsiento: data.fechaAsiento,
        moneda: { id: data.monedaId },
        tasaCambio: data.tasaCambio,
        estado: true,
        detalles: data.detalles
          .filter(d => d.debe > 0 || d.haber > 0)
          .map(d => ({
            cuenta: { id: d.cuentaId },
            tipoMovimiento: (d.debe > 0 ? "Debito" : "Credito") as "Debito" | "Credito",
            monto: d.debe > 0 ? d.debe : d.haber,
          })),
      };

      const saved = await createAsiento(payload);
      onSuccess(saved);
      reset();
      onClose();
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Error guardando el asiento. Favor verificar en la consola.");
      console.error(err);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Asiento Contable" subtitle="Registra un asiento de doble entrada" maxWidth="700px">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {apiError && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" {...register("fechaAsiento")} className={inputClass} />
            {errors.fechaAsiento && <p className={errClass}>{errors.fechaAsiento.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Descripción</label>
            <input {...register("descripcion")} placeholder="Concepto general del asiento" className={inputClass} />
            {errors.descripcion && <p className={errClass}>{errors.descripcion.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Moneda</label>
            <select {...register("monedaId", { valueAsNumber: true })} className={inputClass}
              onChange={(e) => {
                const m = monedas.find(m => m.id === Number(e.target.value));
                if (m) setValue("tasaCambio", m.tasaCambio);
              }}>
              <option value={0}>— Seleccione —</option>
              {monedas.filter(m => m.estado).map(m => (
                <option key={m.id} value={m.id}>{m.simbolo} — {m.nombre}</option>
              ))}
            </select>
            {errors.monedaId && <p className={errClass}>{errors.monedaId.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Tasa de Cambio</label>
            <input type="number" step="0.0001" {...register("tasaCambio", { valueAsNumber: true })}
              placeholder="1.0000" className={inputClass} />
            {errors.tasaCambio && <p className={errClass}>{errors.tasaCambio.message}</p>}
          </div>
        </div>

        {/* Detalle lines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Líneas del Asiento</label>
            <button type="button" onClick={() => append({ cuentaId: 0, debe: 0, haber: 0 })}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
              <Plus size={12} /> Agregar línea
            </button>
          </div>

          <div className="rounded-xl border border-black/[0.08] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] bg-apple-gray/60">
                  <th className={thClass} style={{width:"45%"}}>Cuenta</th>
                  <th className={thClass} style={{width:"100px"}}>Debe</th>
                  <th className={thClass} style={{width:"100px"}}>Haber</th>
                  <th className={thClass} style={{width:"32px"}} />
                </tr>
              </thead>
              <tbody>
                {fields.map((field, idx) => (
                  <tr key={field.id} className="border-b border-black/[0.04] last:border-0">
                    <td className="px-1 py-1">
                      <select {...register(`detalles.${idx}.cuentaId`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 rounded-lg border border-black/[0.08] text-xs bg-white outline-none focus:ring-1 focus:ring-blue-400">
                        <option value={0}>— Cuenta —</option>
                        {movibles.map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
                      </select>
                    </td>
                    <td className="px-1 py-1">
                      <input type="number" step="0.01" {...register(`detalles.${idx}.debe`, { valueAsNumber: true })} placeholder="0.00" className="w-full px-2 py-1.5 rounded-lg border border-black/[0.08] text-xs bg-white outline-none focus:ring-1 focus:ring-blue-400 text-right" />
                    </td>
                    <td className="px-1 py-1">
                      <input type="number" step="0.01" {...register(`detalles.${idx}.haber`, { valueAsNumber: true })} placeholder="0.00" className="w-full px-2 py-1.5 rounded-lg border border-black/[0.08] text-xs bg-white outline-none focus:ring-1 focus:ring-blue-400 text-right" />
                    </td>
                    <td className="px-1 py-1 text-center">
                      {fields.length > 2 && (
                        <button type="button" onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.06] bg-apple-gray/40">
                  <td className="px-3 py-2 text-xs font-semibold text-apple-secondary text-right">Totales:</td>
                  <td className="px-2 py-2 text-xs font-bold text-right font-mono">{totalDebe.toFixed(2)}</td>
                  <td className={`px-2 py-2 text-xs font-bold text-right font-mono ${cuadrado ? "text-green-600" : "text-red-500"}`}>{totalHaber.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
          {(errors.detalles as { message?: string })?.message && <p className={errClass}>{(errors.detalles as { message?: string }).message}</p>}
          {!cuadrado && totalDebe > 0 && <p className={errClass}>⚠ El asiento no está cuadrado (diferencia: {Math.abs(totalDebe - totalHaber).toFixed(2)})</p>}
        </div>

        <div className="flex gap-2.5 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/[0.10] text-sm font-medium text-apple-secondary hover:bg-black/[0.04] transition-colors">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
            {isSubmitting ? "Guardando…" : "Guardar Asiento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
