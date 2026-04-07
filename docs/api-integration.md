# 🔌 Protocolo de Integración API

Esta guía está diseñada para los equipos de desarrollo de módulos externos que necesiten registrar asientos contables en el sistema central.

---

## 🎯 Registro de Asientos (General Ledger Entry)

Este es el endpoint más importante del sistema. Permite la ingesta masiva de movimientos contables.

*   **Método:** `POST`
*   **Endpoint:** `/api/asientos`
*   **URL Base (Local):** `http://localhost:8080`
*   **URL Base (Producción):** `http://151.242.194.24/api`
*   **Content-Type:** `application/json`

---

## 📝 Estructura del JSON (Request Body)

```json
{
  "descripcion": "Registro de nómina - Abril 2026",
  "auxiliar": { "id": 1 },
  "moneda": { "id": 1 },
  "detalles": [
    {
      "cuenta": { "id": 5 },
      "tipoMovimiento": "Debito",
      "monto": 10000.00
    },
    {
      "cuenta": { "id": 1 },
      "tipoMovimiento": "Credito",
      "monto": 10000.00
    }
  ]
}
```

### 📋 Campos Detallados

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `descripcion` | `String` | ✅ | Concepto claro del movimiento contable (Máx 255 caracteres). |
| `auxiliar.id` | `Long` | ✅ | Referencia al sistema de origen (Ej: 1=Nómina, 2=Facturación). |
| `moneda.id` | `Long` | ✅ | Referencia a la moneda (Ej: 1=DOP, 2=USD). |
| `detalles` | `Array` | ✅ | Lista de movimientos (Mínimo 2). |
| `detalles[].cuenta.id` | `Long` | ✅ | ID de la cuenta contable según el catálogo central. |
| `detalles[].tipoMovimiento` | `String` | ✅ | Debe ser exactamente `"Debito"` o `"Credito"`. |
| `detalles[].monto` | `Number` | ✅ | Valor numérico absoluto (Debe ser mayor que 0). |

---

## 🛡️ Reglas de Validación (Business Rules)

El servidor rechazará la solicitud (`400 Bad Request`) si:

1.  **Descuadre**: La suma de montos `Debito` no es igual a la suma de montos `Credito`.
2.  **Integridad**: Las cuentas contables enviadas no existen en el sistema.
3.  **Auxiliar/Moneda**: Los identificadores de auxiliar o moneda son inválidos.
4.  **Balance**: Un asiento no puede tener solo débitos o solo créditos.

---

## 🟢 Respuestas y Errores (HTTP Status)

| Código | Significado | Motivo |
| :--- | :--- | :--- |
| **201 Created** | Éxito | El asiento se guardó y se generó un ID único. |
| **400 Bad Request** | Error de Validación | El JSON está mal formado o el asiento está descuadrado. |
| **404 Not Found** | Recurso Inexistente | Se envió un ID de cuenta o moneda que no existe. |
| **500 Internal Server** | Error Crítico | Fallo inesperado en el servidor o la base de datos. |

---

## 📖 Swagger Interactivo

Para explorar todos los demás endpoints de consulta (`GET /api/cuentas`, `GET /api/monedas`, etc.), utiliza el Swagger UI:

👉 **Local**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
👉 **Producción**: [http://151.242.194.24/api/swagger-ui.html](http://151.242.194.24/api/swagger-ui.html)

> [!TIP]
> Te recomendamos usar Swagger para generar automáticamente los clientes de código en lenguajes como C#, Python o Java.
