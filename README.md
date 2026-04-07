# 📊 Sistema de Contabilidad Central - UNAPEC

Este proyecto representa el **núcleo del sistema de integración** para la asignatura de Integración de Aplicaciones. Su función principal es actuar como un "Libro Mayor" centralizado, exponiendo servicios REST para que módulos externos (**Nómina, Facturación, Inventario**, etc.) registren sus movimientos contables de forma estandarizada, además de proveer un **Dashboard Administrativo** para la gestión visual.

---

## 🛠️ Stack Tecnológico

### ☕ Back-end & Datos
* **Lenguaje:** Java 21
* **Framework:** Spring Boot 3.4.x
* **Base de Datos:** PostgreSQL 16
* **Persistencia:** Spring Data JPA (Hibernate `ddl-auto=update`)
* **Documentación API:** SpringDoc OpenAPI (Swagger UI)
* **Contenedores:** Docker & Docker Compose

### ⚛️ Front-end (Dashboard)
* **Lenguaje:** TypeScript + React 19
* **Framework:** Next.js 16 (App Router / Turbopack)
* **Estilos:** Tailwind CSS 3.4
* **Librerías Clave:** React Hook Form, Zod, Axios, Recharts, jsPDF, Lucide React

---

## 📋 Prerequisitos

Antes de empezar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Verificar con |
|---|---|---|
| **Java JDK** | 21 | `java -version` |
| **Docker Desktop** | 4.x | `docker --version` |
| **Node.js** | 18+ | `node -v` |
| **npm** | 9+ | `npm -v` |

---

## 🚀 Guía de Inicio Rápido

### 1. Infraestructura (Docker)
El proyecto utiliza una instancia de PostgreSQL aislada en el puerto **5434** para evitar conflictos.

```bash
# Desde la raíz del proyecto
cd Docker
docker-compose up -d
```
> **Conexión:** `localhost:5434` | DB: `contabilidad_db` | User: `USER_DB` | Pass: `2026DB`

---

### 2. Ejecución del Backend
Desde la carpeta `backend-contabilidad`:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / Mac
./mvnw spring-boot:run
```

> **API REST:** [http://localhost:8080/api](http://localhost:8080/api)
> **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

*Nota: Hibernate creará las tablas automáticamente con `ddl-auto=update` la primera vez que se ejecute.*

---

### 3. Ejecución del Frontend
Desde la carpeta `frontend-contabilidad`:

```bash
npm install
npm run dev
```

> **Dashboard:** [http://localhost:3000](http://localhost:3000)

---

## 🔌 Guía de Integración (API REST)

Para los equipos de módulos externos (**Nómina, Facturación, Inventario, Compras**), el punto de entrada principal es el registro de asientos contables.

### Registro de Asientos (Journal Entries)
Este endpoint permite registrar movimientos contables. El sistema validará automáticamente que el asiento esté cuadrado.

*   **Método:** `POST`
*   **Endpoint:** `http://localhost:8080/api/asientos`
*   **Content-Type:** `application/json`

#### Estructura del JSON (Payload)

| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :---: | :--- |
| `descripcion` | `String` | ✅ | Concepto o motivo del asiento contable. |
| `auxiliar` | `Object` | ❌ | Objeto con el `id` del auxiliar que genera el asiento (ej: Facturación = 1). |
| `moneda` | `Object` | ❌ | Objeto con el `id` de la moneda. Si se omite, se asume moneda base (id: 1). |
| `detalles` | `Array` | ✅ | Lista de movimientos (mínimo 2). |
| `detalles[].cuenta` | `Object` | ✅ | Objeto con el `id` de la cuenta contable (Ej: `{ "id": 1 }`). |
| `detalles[].tipoMovimiento` | `String` | ✅ | Debe ser exactamente `"Debito"` o `"Credito"`. |
| `detalles[].monto` | `Number` | ✅ | Valor numérico positivo del movimiento. |

#### Ejemplo de Cuerpo (Body):
```json
{
  "descripcion": "Registro de nómina mensual - Marzo 2026",
  "auxiliar": { "id": 2 },
  "moneda": { "id": 1 },
  "detalles": [
    {
      "cuenta": { "id": 1 },
      "tipoMovimiento": "Debito",
      "monto": 150000.00
    },
    {
      "cuenta": { "id": 3 },
      "tipoMovimiento": "Credito",
      "monto": 150000.00
    }
  ]
}
```

#### 🛡️ Reglas de Validación
1.  **Cuadre**: El total de montos marcados como `Debito` debe ser **idéntico** al total de `Credito`.
2.  **Detalles**: Debe haber al menos un detalle de débito y uno de crédito.
3.  **Cuentas**: Las cuentas proporcionadas por ID deben existir en el sistema.

#### 🟢 Respuesta Exitosa (201 Created)
Devuelve el objeto `Asiento` creado con su `id` generado y el `montoTotal` calculado automáticamente.

#### 🔴 Respuesta de Error (400 Bad Request)
Ocurre si el asiento está descuadrado o si faltan campos obligatorios. 
*   **Ejemplo**: `{ "message": "Asiento descuadrado: Debito (1500) != Credito (1400)" }`

---

## 📖 Documentación Completa
Puedes explorar todos los endpoints y esquemas de datos (CuentaContable, Moneda, Auxiliar, etc.) en el Swagger interactivo:
👉 [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 📂 Estructura del Proyecto

```text
📂 unapec-contabilidad/
├── 📂 backend-contabilidad/     # API REST — Spring Boot 3.4
│   ├── 📂 src/main/java/       # Código fuente (model, controller, service, repository)
│   ├── 📂 src/main/resources/  # application.properties
│   ├── pom.xml                 # Dependencias Maven
│   └── mvnw / mvnw.cmd        # Maven Wrapper
├── 📂 frontend-contabilidad/   # Dashboard — Next.js 16
│   ├── 📂 app/                 # Páginas (App Router)
│   ├── 📂 components/          # Componentes reutilizables
│   ├── 📂 lib/                 # Servicios API y utilidades
│   └── 📂 types/               # Definiciones TypeScript
├── 📂 DB Scripts/              # Scripts SQL de referencia (no se ejecutan automáticamente)
├── 📂 Docker/                  # docker-compose.yml para PostgreSQL
└── 📄 .gitignore
```

---

## 👨‍💻 Autor

* **Alan Roman**
* *Estudiante de Ingeniería de Software - UNAPEC*
* **ID:** A00116751
