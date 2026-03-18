"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/ui/Modal";
import { TipoCuentaDto, createTipoCuenta, updateTipoCuenta } from "@/lib/tipoCuentaService";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio."),
  descripcion: z.string().optional(),
  origen: z.enum(["Debito", "Credito"]),
  estado: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (item: TipoCuentaDto) => void;
  initialData: TipoCuentaDto | null;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-black/[0.10] bg-white text-sm text-apple-text " +
  "placeholder:text-apple-secondary/60 outline-none transition-all " +
  "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 hover:border-black/20";
const labelClass = "block text-xs font-semibold text-apple-secondary uppercase tracking-wider mb-1.5";
const errorClass = "mt-1 text-xs text-red-500";

export default function TipoCuentaFormModal({ open, onClose, onSuccess, initialData }: Props) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      origen: "Debito",
      estado: true,
    },
  });

  const estadoValue = watch("estado");

  useEffect(() => {
    if (open) {
      setApiError(null);
      if (initialData) {
        reset({
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          origen: initialData.origen,
          estado: initialData.estado,
        });
      } else {
        reset({
          nombre: "",
          descripcion: "",
          origen: "Debito",
          estado: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError(null);
      let result;
      if (initialData) {
        result = await updateTipoCuenta(initialData.id, data);
      } else {
        result = await createTipoCuenta(data);
      }
      onSuccess(result);
      onClose();
    } catch (e: any) {
      setApiError(e.response?.data?.message || e.message || "Error al guardar el tipo de cuenta.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? "Editar Tipo de Cuenta" : "Nuevo Tipo de Cuenta"}
      subtitle="Definición de tipos contables (Activos, Pasivos, Ingresos...)"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {apiError && (
          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {apiError}
          </div>
        )}

        {/* Row: Nombre + Origen */}
        <div className="flex gap-3">
          <div className="flex-[2]">
            <label className={labelClass}>Nombre del Tipo</label>
            <input
              {...register("nombre")}
              placeholder="Ej. ACTIVO, INGRESOS"
              className={inputClass}
            />
            {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
          </div>

          <div className="flex-1">
            <label className={labelClass}>Naturaleza / Origen</label>
            <select
              {...register("origen")}
              className={`${inputClass} bg-white h-[42px] py-0 cursor-pointer`}
            >
              <option value="Debito">Débito</option>
              <option value="Credito">Crédito</option>
            </select>
            {errors.origen && <p className={errorClass}>{errors.origen.message}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className={labelClass}>Descripción</label>
          <textarea
            {...register("descripcion")}
            placeholder="Opcional..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Estado */}
        <div>
          <label className={labelClass}>Estado</label>
          <button
            type="button"
            onClick={() => setValue("estado", !estadoValue)}
            className={`relative inline-flex h-[42px] px-4 items-center justify-center rounded-xl border transition-colors font-medium text-sm ${
              estadoValue
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
          >
            <span className={`mr-1.5 w-2 h-2 rounded-full ${estadoValue ? "bg-green-500" : "bg-gray-400"}`} />
            {estadoValue ? "Activo (Permite transacciones)" : "Inactivo (No disponible)"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-4">
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
            className="flex-[2] py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {initialData ? "Guardar Cambios" : "Crear Tipo"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
