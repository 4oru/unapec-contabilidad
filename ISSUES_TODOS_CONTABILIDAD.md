# Backlog de Issues - TODOs Contabilidad

Repositorio: `4oru/unapec-contabilidad`

---

## 1) Seed data pendiente para tablas contables
**Título sugerido:** `DB: completar inserts de tablas faltantes (cuentas, asientos y detalle)`

**Descripción**
Completar script de datos iniciales con inserts para las tablas faltantes:
- `cuentas_contables_t`
- `asientos_t`
- `asientos_detalle_t`

Asegurar orden de inserción por dependencias (FK) y datos mínimos para pruebas funcionales.

**Criterios de aceptación**
- Script ejecuta sin errores de FK.
- Existen al menos 5 cuentas contables activas.
- Existen asientos de prueba balanceados (débito = crédito).
- `asientos_detalle_t` referencia cuentas y asientos válidos.

**Labels sugeridos**
`backend`, `database`, `good first issue`

---

## 2) Definir lógica de reportes con moneda base
**Título sugerido:** `Reportes: definir cálculo en moneda base del sistema (DOP)`

**Descripción**
Definir e implementar cómo se calcularán reportes cuando exista más de una moneda, usando la moneda base del sistema como referencia para consolidar montos.

**Criterios de aceptación**
- Documento de decisión técnica (regla de conversión y tasa aplicada).
- Reportes muestran montos consolidados en moneda base.
- Se contemplan casos sin tasa disponible.

**Labels sugeridos**
`backend`, `reportes`, `analysis`

---

## 3) Gestión de Monedas: registrar símbolo de moneda
**Título sugerido:** `Monedas: agregar soporte de símbolo (ej. RD$, $)`

**Descripción**
Agregar campo para símbolo en gestión de monedas y exponerlo en frontend/backend para visualización de montos.

**Criterios de aceptación**
- Persistencia de símbolo en BD.
- CRUD de monedas incluye símbolo.
- Vistas de montos muestran símbolo correctamente.

**Labels sugeridos**
`backend`, `frontend`, `database`

---

## 4) Descripción con RNC ficticio y datos de equipo
**Título sugerido:** `Configuración: permitir RNC ficticio y datos de contacto en descripción`

**Descripción**
Habilitar uso de texto descriptivo con RNC ficticio, nombres de integrantes y teléfonos para fines académicos/demostración.

**Criterios de aceptación**
- Campo acepta el formato requerido.
- Validaciones no bloquean datos ficticios de prueba.
- Se documenta que es uso no productivo.

**Labels sugeridos**
`frontend`, `backend`, `enhancement`

---

## 5) Fix de RD$NaN en Plan de Cuenta y resumen superior
**Título sugerido:** `Bug: corregir RD$NaN cuando cuenta no tiene tipo/valor válido`

**Descripción**
Corregir visualización `RD$NaN` en módulo Plan de Cuenta y encabezados superiores cuando faltan datos o tipos en cuentas.

**Criterios de aceptación**
- Nunca se muestra `NaN` en UI.
- Fallbacks definidos para valores nulos/undefined.
- Se valida tipo numérico antes de formatear moneda.

**Labels sugeridos**
`bug`, `frontend`, `high priority`

---

## 6) Nuevo Asiento: no carga cuentas activas en selector
**Título sugerido:** `Bug: selector de cuentas no muestra cuentas activas en Nuevo Asiento`

**Descripción**
En módulo “Nuevo Asiento Contable”, el dropdown `---Cuenta---` no lista cuentas disponibles y activas.

**Criterios de aceptación**
- Endpoint devuelve cuentas activas esperadas.
- Frontend consume y renderiza lista correctamente.
- Se maneja estado vacío y de error.

**Labels sugeridos**
`bug`, `frontend`, `backend`, `high priority`

---

## 7) Configurar moneda base del sistema = DOP
**Título sugerido:** `Configuración: establecer DOP como moneda base del sistema`

**Descripción**
Formalizar DOP como moneda base configurable y asegurar que todas las vistas/servicios consulten esta configuración.

**Criterios de aceptación**
- Moneda base se guarda en configuración.
- Módulos leen moneda base desde configuración central.
- Pruebas manuales confirman consistencia de formato.

**Labels sugeridos**
`backend`, `frontend`, `configuration`

---

## 8) Dashboard dinámico con moneda base
**Título sugerido:** `Dashboard: mostrar métricas en moneda base configurada dinámicamente`

**Descripción**
Actualizar dashboard para que refleje automáticamente la moneda base configurada en sistema.

**Criterios de aceptación**
- KPIs respetan moneda base actual.
- Cambio de moneda base impacta dashboard sin hardcode.
- Sin regresiones visuales en tablero.

**Labels sugeridos**
`frontend`, `dashboard`, `enhancement`

---

## 9) Integración tasa USD vía Web Service público
**Título sugerido:** `Integración: actualizar tasa USD desde servicio público`

**Descripción**
Consumir endpoint público para actualizar periódicamente tasa USD y usarla en conversiones/reportes.

**Criterios de aceptación**
- Job o flujo manual de actualización funcional.
- Manejo de fallo de API y fallback.
- Fecha/hora de última actualización visible.

**Labels sugeridos**
`backend`, `integrations`, `enhancement`

---

## 10) Rediseño de dashboard financiero
**Título sugerido:** `Dashboard: reemplazar "Monedas Recientes" por gráficos financieros mensuales`

**Descripción**
Eliminar bloque “Monedas Recientes” y agregar panel gráfico con:
- cambio de moneda,
- gastos del mes,
- ingresos del mes,
- balance del mes,
y mantener módulos en la parte inferior.

**Criterios de aceptación**
- Se elimina componente “Monedas Recientes”.
- Gráficos muestran datos mensuales correctos.
- Layout final conserva módulos debajo.

**Labels sugeridos**
`frontend`, `dashboard`, `ui/ux`

---

## Orden sugerido de ejecución
1. #7 Moneda base DOP
2. #3 Símbolo de moneda
3. #5 Fix RD$NaN
4. #6 Nuevo Asiento sin cuentas
5. #1 Seed data DB
6. #2 Reportes moneda base
7. #9 Integración WS tasa USD
8. #8 Dashboard moneda base
9. #10 Rediseño dashboard
10. #4 Descripción con datos ficticios
