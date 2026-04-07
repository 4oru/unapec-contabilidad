# 🚀 Guía de Despliegue en Producción (Windows Server)

Este manual detalla los pasos exactos para llevar este proyecto de tu entorno local a una VPS con Windows Server.

---

## 🛠️ Fase 1: Preparación de la VPS

Antes de clonar el código, asegúrate de que la VPS tenga lo siguiente:
1.  **Windows Server 2022** (Recomendado) o 2019.
2.  **Docker Desktop** instalado con soporte para **WSL2**.
3.  **Git** para Windows.

---

## 🏗️ Fase 2: Configuración de Seguridad e Infraestructura

1.  **Clonar el repositorio**:
    ```powershell
    git clone https://github.com/tu-usuario/unapec-contabilidad.git
    cd unapec-contabilidad
    ```

2.  **Abrir Puertos en el Firewall**:
    Ejecuta nuestro script automatizado como **Administrador** para abrir los puertos 3000, 8080 y 5434:
    ```powershell
    # Desde la raíz del proyecto
    ./docs/vps-setup.ps1
    ```

---

## 🐳 Fase 3: Despliegue del Sistema Completo

Navega a la carpeta de orquestación y levanta todos los servicios:

```powershell
cd Docker
docker-compose up --build -d
```

### **¿Qué está sucediendo internamente?**
*   **Base de Datos**: Se levanta PostgreSQL 16 y crea el volumen persistente nombrado `accounting-db-data`.
*   **Backend**: Se compila el código Java 21, se empaqueta el `.jar` y se levanta en el puerto 8080. El servicio esperará hasta que la DB esté lista (*Healthcheck*).
*   **Frontend**: Se construye Next.js en modo producción y se sirve en el puerto 3000.

---

## 🔍 Fase 4: Verificación y Monitoreo

1.  **Verificar contenedores**:
    ```powershell
    docker ps
    ```
    *Asegúrate de que 'backend-unapec' diga '(healthy)'.*

2.  **Probar Endpoints (Acceso Centralizado)**:
    -   🚀 **Dashboard**: [http://151.242.194.24/](http://151.242.194.24/)
    -   📘 **Swagger UI**: [http://151.242.194.24/api/swagger-ui.html](http://151.242.194.24/api/swagger-ui.html)

### **🗄️ Acceso Remoto de Base de Datos (DBeaver)**:
- **Host**: `151.242.194.24`
- **Port**: `5434`
- **Database**: `contabilidad_db`
- **User/Pass**: `USER_DB` / `2026DB`

---

## 🛡️ Mejores Prácticas de Mantenimiento

*   **Ver Logs**: `docker logs -f backend-unapec`
*   **Bajar el sistema**: `docker-compose down` (esto no borra los datos de la DB gracias al volumen persistente).
*   **Actualizar Código**:
    ```powershell
    git pull
    docker-compose up --build -d
    ```

---

## ⚠️ Consideraciones de Seguridad Avanzadas
Para una producción real, te sugerimos:
1.  **Nginx/IIS como Proxy**: No expongas los puertos directos; usa un proxy inverso con certificados SSL (HTTPS).
2.  **Seguridad de DB**: No expongas el puerto `5434` al exterior si no es estrictamente necesario para administración remota.

> [!TIP]
> **Dashboard Vacío**: Al iniciar, el sistema estará vacío. Usa el Swagger para registrar un Asiento Contable inicial y verás cómo el Dashboard cobra vida automáticamente.
