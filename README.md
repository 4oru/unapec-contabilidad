# 📊 Sistema de Contabilidad Central - UNAPEC

Este proyecto es el **núcleo de integración** para la asignatura de Integración de Aplicaciones. Actúa como un "Libro Mayor" centralizado, exponiendo servicios REST para que módulos externos (**Nómina, Facturación, Inventario, etc.**) registren movimientos contables estandarizados, y proveyendo un **Dashboard Administrativo** de alto nivel.

---

## 🌎 Despliegue en Producción (Live Demo)

El sistema se encuentra desplegado y operativo en una VPS dedicada. Puedes acceder mediante los siguientes enlaces:

| Servicio | URL de Acceso |
| :--- | :--- |
| **📊 Dashboard (Web)** | [http://151.242.194.24/](http://151.242.194.24/) |
| **📘 Documentación API (Swagger)** | [http://151.242.194.24/api/swagger-ui.html](http://151.242.194.24/api/swagger-ui.html) |

---

### 🗄️ Acceso Remoto a Base de Datos (DBeaver/Navicat)
Para gestionar los datos directamente desde tu PC personal, utiliza esta configuración:
- **Host**: `151.242.194.24`
- **Port**: `5434` (Puerto externo mapeado)
- **Database**: `contabilidad_db`
- **User**: `USER_DB` | **Pass**: `2026DB`

---

## 🛠️ Stack Tecnológico

### ☕ Back-end & Datos
*   **Lenguaje:** Java 21
*   **Framework:** Spring Boot 3.4.x
*   **Base de Datos:** PostgreSQL 16
*   **Documentación API:** SpringDoc OpenAPI (Swagger UI)
*   **Contenedores:** Docker & Docker Compose

### ⚛️ Front-end (Dashboard)
*   **Framework:** Next.js 16 (App Router)
*   **Estilos:** Tailwind CSS 3.4 + Apple Design Aesthetics
*   **Gráficos:** Recharts (Real-time integration)

---

## 📚 Base de Conocimientos (Documentación Avanzada)

Para obtener detalles técnicos profundos, consulta las siguientes guías:

*   **[🏛️ Arquitectura del Sistema](./docs/architecture.md)**: Diagramas C4, Stack Tecnológico y flujos.
*   **[🔌 Protocolo de Integración API](./docs/api-integration.md)**: Cómo registrar asientos desde otros módulos.
*   **[📊 Modelo de Datos y Lógica](./docs/data-model.md)**: Diagrama ER y reglas de negocio contables.
*   **[🐳 Operaciones y Despliegue](./docs/deployment.md)**: Docker, volúmenes y mantenimiento.

---

## 🚀 Guía de Inicio Rápido

La forma más sencilla de ejecutar todo el sistema (Base de Datos + Backend + Frontend) es usando Docker Compose.

1.  **Clonar el repositorio** y navegar a la carpeta raíz.
2.  **Levantar los contenedores**:
    ```bash
    cd Docker
    docker-compose up --build -d
    ```
3.  **Acceder a las aplicaciones**:
    -   **Frontend (Dashboard)**: [http://localhost:3000](http://localhost:3000)
    -   **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
    -   **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
    -   **Base de Datos**: `localhost:5434` (User: `USER_DB`, Pass: `2026DB`)

---

## 💻 Desarrollo Local (Sin Docker para Apps)

Si deseas modificar el código y ver los cambios en tiempo real:

### 1. Solo la Base de Datos (Docker)
```bash
cd Docker
docker-compose up -d db-contabilidad
```

### 2. Backend (Spring Boot)
Desde `backend-contabilidad`:
```bash
# Windows
.\mvnw.cmd spring-boot:run
# Linux/Mac
./mvnw spring-boot:run
```

### 3. Frontend (Next.js)
Desde `frontend-contabilidad`:
```bash
npm install
npm run dev
```

---

## 🔌 Guía de Integración para Módulos Externos

Para registrar transacciones desde otros sistemas (Nómina, etc.):

### Registro de Asientos (Journal Entries)
*   **Método:** `POST`
*   **Endpoint:** `/api/asientos`
*   **Payload Ejemplo:**
```json
{
  "descripcion": "Pago de nómina - Marzo",
  "detalles": [
    { "cuenta": { "id": 1 }, "tipoMovimiento": "Debito", "monto": 5000 },
    { "cuenta": { "id": 3 }, "tipoMovimiento": "Credito", "monto": 5000 }
  ]
}
```

> [!TIP]
> **Dashboard Inteligente**: El dashboard clasifica automáticamente los movimientos según el código de la cuenta:
> - **Ingresos**: Cuentas que inician con **4**.
> - **Gastos**: Cuentas que inician con **5** o **6**.

---

## ⚙️ Variables de Entorno (Personalización)

El sistema utiliza las siguientes variables (configuradas por defecto en `docker-compose.yml`):

| Variable | Descripción | Valor Defecto |
| :--- | :--- | :--- |
| `DB_HOST` | Host de la base de datos | `db-contabilidad` (Docker) / `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` (Docker) / `5434` |
| `DB_NAME` | Nombre de la base de datos | `contabilidad_db` |
| `DB_USER` | Usuario DB | `USER_DB` |
| `DB_PASS` | Password DB | `2026DB` |

---

## 👨‍💻 Autor
* **Alan Roman** - UNAPEC (ID: A00116751)
* **Desplegado por**: Antigravity (AI DevOps Engineer)
