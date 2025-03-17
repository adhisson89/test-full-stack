# Test Full-Stack
Este proyecto consiste en una aplicación full-stack con frontend en Angular, backend en Spring Boot y base de datos SQL Server.

## Requisitos previos
Para ejecutar este proyecto necesitas:

- Docker
- Docker Compose (incluido en Docker Desktop para Windows y Mac)

## Estructura del proyecto

El proyecto está estructurado de la siguiente manera:

```
.
├── frontend/        # Aplicación Angular
├── backend/         # API con Spring Boot
└── docker-compose.yml  # Configuración de Docker Compose
```


## Instrucciones para ejecutar
1. Clonar el repositorio

```bash

git clone git@github.com:adhisson89/test-full-stack.git
cd test-full-stack

```

2. Iniciar los servicios con Docker Compose

```bash
docker-compose up
```

Este comando construirá las imágenes necesarias e iniciará los contenedores. La primera ejecución puede tomar varios minutos mientras se descargan las dependencias y se construyen las imágenes.

3. Acceder a la aplicación
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Base de datos: Accesible en localhost:1434
    - Usuario: sa
    - Contraseña: #PassSQL#

## Detener la aplicación

Para detener la aplicación, ejecuta el siguiente comando:

```bash
docker-compose down
```

Para eliminar también los volúmenes (esto borrará los datos de la base de datos):

```bash
docker-compose down -v
```

## Detalles técnicos
- Frontend: Angular que se ejecuta en Nginx
- Backend: API con GraphQL desarrollada en Spring Boot
- Base de datos: SQL Server 2022
- Red: Todos los servicios están en una red dedicada con IPs estáticas

## Documentación de la API
La API cuenta con documentación generada automáticamente con GraphiQL.
Para probar la documentación, visita:
- http://localhost:3000/graphiql para GraphiQL

## Notas adicionales
- La base de datos está configurada con un healthcheck para asegurar que esté lista antes de iniciar el backend
- Se utiliza un volumen para persistir los datos de la base de datos
- Los servicios se reiniciarán automáticamente en caso de fallos
