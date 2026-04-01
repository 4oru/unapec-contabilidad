"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { createMoneda, updateMoneda } from "@/lib/monedaService";
import { Moneda, CreateMonedaPayload } from "@/types";

// ─── Zod Schema (mirrors Jakarta validations) ──────────────────────────────────
const schema = z.object({
  codigoIso: z
    .string()
    .length(3, "El código ISO debe tener exactamente 3 caracteres")
    .toUpperCase(),
  simbolo: z.string().min(1, "El símbolo es obligatorio").max(10),
  nombre: z.string().min(1, "El nombre es obligatorio").max(100),
  descripcion: z.string().min(1, "La descripción es obligatoria").max(255),
  tasaCambio: z
    .number({ invalid_type_error: "La tasa de cambio debe ser un número" })
    .positive("La tasa de cambio debe ser positiva"),
  estado: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface MonedaFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (moneda: Moneda) => void;
  initialData?: Moneda | null;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-black/[0.10] bg-white text-sm text-apple-text " +
  "placeholder:text-apple-secondary/60 outline-none transition-all " +
  "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-black/20";

const labelClass = "block text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-1.5";

const errorClass = "mt-1 text-xs text-red-500";

export default function MonedaFormModal({ open, onClose, onSuccess, initialData }: MonedaFormModalProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { estado: true },
  });

  const estadoValue = watch("estado");

  // Auto-uppercase codigoIso
  const codigoIsoValue = watch("codigoIso");
  useEffect(() => {
    if (codigoIsoValue) setValue("codigoIso", codigoIsoValue.toUpperCase());
  }, [codigoIsoValue, setValue]);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setApiError(null);
      if (initialData) {
        reset({
          codigoIso: initialData.codigoIso,
          simbolo: initialData.simbolo,   // ← agregar
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          tasaCambio: initialData.tasaCambio,
          estado: initialData.estado,
        });
      } else {
        reset({ estado: true });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null);
      let moneda: Moneda;
      if (initialData) {
        moneda = await updateMoneda(initialData.id, data as CreateMonedaPayload);
      } else {
        moneda = await createMoneda(data as CreateMonedaPayload);
      }
      onSuccess(moneda);
      onClose();
    } catch (error: any) {
      setApiError(error.message || "Error al guardar la moneda.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Editar Moneda" : "Nueva Moneda"}
      subtitle={initialData ? "Modifica los datos de la divisa" : "Ingrese los datos de la divisa a registrar"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {apiError && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {apiError}
          </div>
        )}
        {/* Row: codigoIso + estado */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Código ISO</label>
            <input
              {...register("codigoIso")}
              placeholder="USD"
              maxLength={3}
              className={inputClass}
              style={{ textTransform: "uppercase" }}
            />
            {errors.codigoIso && <p className={errorClass}>{errors.codigoIso.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <button
              type="button"
              onClick={() => setValue("estado", !estadoValue)}
              className={`relative inline-flex h-[42px] w-20 items-center justify-center rounded-xl border transition-colors font-medium text-sm ${
                estadoValue
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-500"
              }`}
            >
              <span className={`mr-1 w-2 h-2 rounded-full ${estadoValue ? "bg-green-500" : "bg-gray-400"}`} />
              {estadoValue ? "Activo" : "Inactivo"}
            </button>
          </div>
        </div>

        {/* Símbolo */}
        <div>
          <label className={labelClass}>Símbolo</label>
          <input
            {...register("simbolo")}
            placeholder="RD$"
            maxLength={10}
            className={inputClass}
          />
          {errors.simbolo && <p className={errorClass}>{errors.simbolo.message}</p>}
        </div>

        {/* Nombre */}
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            {...register("nombre")}
            placeholder="Dólar Estadounidense"
            className={inputClass}
          />
          {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register("descripcion")}
            placeholder="Moneda oficial de los Estados Unidos de América"
            rows={2}
            className={`${inputClass} resize-none`}
          />
          {errors.descripcion && <p className={errorClass}>{errors.descripcion.message}</p>}
        </div>

        {/* Tasa de cambio */}
        <div>
          <label className={labelClass}>Tasa de Cambio</label>
          <input
            {...register("tasaCambio", { valueAsNumber: true })}
            type="number"
            step="0.0001"
            placeholder="58.50"
            className={inputClass}
          />
          {errors.tasaCambio && <p className={errorClass}>{errors.tasaCambio.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-black/[0.10] text-sm font-medium text-apple-secondary hover:bg-black/[0.04] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? "Guardando…" : "Guardar Moneda"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
