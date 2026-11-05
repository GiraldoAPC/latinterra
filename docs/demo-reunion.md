# Demostración para la reunión

La carga `demo:preparar` agrega datos ficticios identificados con `DEMO`, sin eliminar registros existentes ni cambiar sus cuentas o contraseñas. No envía correos ni realiza cobros externos. Los movimientos sí se guardan en la base seleccionada y aparecen en sus reportes y dashboard.

## Carga en el servidor que se presentará

Los datos locales no se transfieren con Git. Ejecutar en el servidor de la reunión:

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan demo:preparar --almacen
```

El comando usa una cuenta administradora activa existente para registrar las operaciones. Puede elegirse con `--admin=correo@dominio.com`. No crea administradores nuevos. `--almacen` activa explícitamente el modo almacén para mostrar compras y transferencias; sin esa opción se conserva la configuración anterior.

Guardar la contraseña inicial que imprime el comando: es aleatoria para cada instalación y común a sus cuentas DEMO. Solo se almacena su hash. Repetir la carga no duplica registros, renueva fechas, regenera contraseñas ni borra interacciones realizadas durante la presentación. Las cantidades del resumen corresponden a la carga inicial. El registro de carga e IDs queda en la configuración `meeting_demo_v1`, sin contraseñas. No borrar ese marcador para intentar reiniciar.

Si detecta un conflicto con el espacio DEMO antes de una primera carga, se detiene sin sobrescribir cuentas o productos. La escritura de datos es transaccional. Los PDF, miniaturas y firmas de muestra se generan en `storage/app/public/demo-reunion-v1`; mantener operativo `public/storage`. No hay migraciones nuevas en esta entrega; se requieren las migraciones anteriores del proyecto. El comando se ejecuta expresamente y no forma parte de `DatabaseSeeder`.

## Datos disponibles

| Área | Datos de muestra |
| --- | --- |
| Inventario | 20 productos, 4 marcas, 13 categorías, 3 proveedores, 21 compras y 20 transferencias |
| Comercial | 6 clientes, 19 cotizaciones, 13 ventas, 2 otros pagos y 3 auspicios |
| Aula | 4 cursos, 8 módulos, 24 clases y sus PDF de dos páginas, 32 evaluaciones |
| Personas y pagos | 16 alumnos, 18 matrículas, 39 cuotas y 6 pedidos de cursos |
| Seguimiento | Avance parcial, módulo desaprobado con avance reiniciado, acceso vencido y 4 convalidaciones |
| Certificación | 4 certificados virtuales (vigentes, vencido y próximo a vencer), 3 certificados presenciales |
| Presenciales | 3 grupos: abierto, cupo completo y finalizado; 16 participantes |
| Roles | Instructor asignado a los cuatro cursos, coordinadora y auditoría de sus altas |

Se tomaron código, nombre, marca, color y precio de los tres productos del Excel `SISTEMA VENTAS VS INVENTARIO.xlsx`: Indy, Aeroteam IV y BE SAFE. Los demás productos provienen del catálogo BEAL ya incluido en el proyecto. Los SKU de prueba tienen prefijo `DEMO-`. Los costos y operaciones posteriores son simulados; no se importan como contabilidad histórica las operaciones del Excel. Las categorías y marcas DEMO se mantienen separadas de las existentes.

El stock se genera mediante compras y transferencias reales del modelo; ventas y auspicios lo descuentan. Incluye existencias bajas y una segunda compra de BE SAFE que demuestra costo promedio ponderado. La suma de almacén y ventas cuadra con compras menos ventas y auspicios. Los recibos de muestra llevan códigos `DEMO`; no tienen validez tributaria. La conversión de cotizaciones utiliza el servicio habitual y reserva sus correlativos internos antes de asignar el código DEMO: puede dejar saltos en dichos correlativos.

Los cursos son muestras comerciales, con PDF ficticio, preguntas de ejemplo y video público de muestra sin relación con capacitación profesional. No utilizarlos como formación real. Las firmas tienen el texto «FIRMA DE MUESTRA / SIN VALIDEZ». Los certificados y códigos QR de prueba quedan identificados como DEMO. Los correos pertenecen al dominio de prueba `demo.latinterra.test`; no son buzones de recepción. Para demostrar un envío real, editar una cotización DEMO con un destinatario autorizado y enviarla desde la aplicación durante la reunión.

## Recorrido sugerido de 15–20 minutos

1. **Dashboard** (`/admin`): revisar cobros, gráfico diario, comparación 7/30/90 días, cuotas pendientes, stock bajo, certificados por vencer y próximos grupos. Los ingresos del pedido pagado no se duplican con cuotas; los servicios anulados no suman.
2. **Inventario** (`/admin/products`): buscar `DEMO`, revisar Indy, Aeroteam IV y BE SAFE. Abrir `/admin/inventario/movimientos` y mostrar compras, costo promedio y transferencia a ventas. Los productos conservan reserva en almacén para realizar otra transferencia en vivo.
3. **Cotizaciones** (`/admin/quotes`): hay borradores, aprobadas, cancelada, vencida y vendidas. Abrir un borrador, editar cantidades, descargar su PDF y aprobarlo. Convertir una aprobada en venta y comprobar el descuento de stock. La cotización de Indy tiene existencias para este recorrido.
4. **Ventas y clientes** (`/admin/ventas/otros-pagos`, `/admin/clientes`): mostrar ticket, medios de pago, el servicio de inspección y el servicio anulado. En `/admin/inventario/auspicios`, mostrar entregas y costo asumido.
5. **Alumnos** (`/admin/cursos/estudiantes`): buscar `DEMO`. Abrir Ana Torres para avance inicial y cuotas; mostrar un recibo. El alumno 09 muestra un módulo desaprobado con avance reiniciado; el alumno 16 tiene acceso vencido. Hay cuotas pendientes para cobrar y una ampliación de vencimiento ya registrada.
6. **Cursos** (`/admin/cursos`): abrir un curso DEMO, revisar módulos, clases, PDF, quiz por tema y examen aleatorio de diez preguntas desde un banco de veinte. Cada módulo conserva seis intentos y veinte minutos.
7. **Aula como estudiante**, en otra ventana: ingresar con `alumno01@demo.latinterra.test` o DNI `99000001`, usando la contraseña generada. En `/aula-virtual/mis-cursos`, continuar el curso. La primera clase ya está completada para mostrar avance y la siguiente está disponible. Abrir el PDF, observar doce segundos por página, cerrar y reabrir para mostrar reanudación. El video de muestra conserva el control normal de reproducción completa; no se acortó su duración para saltarlo.
8. **Pedidos** (`/admin/ventas/pedidos`): mostrar pendientes, pagado, rechazado y dividido en cuotas. Un pendiente puede confirmarse en vivo para habilitar otro curso.
9. **Presenciales** (`/admin/cursos/presenciales`): abrir el grupo con cupos y su QR; luego mostrar el grupo completo. En el finalizado hay certificados emitidos, una persona aprobada pendiente de emitir, una sin asistencia y otra desaprobada.
10. **Certificados** (`/admin/cursos/certificados`): mostrar firmas de muestra, vencimiento y enlace de verificación. Ejemplos públicos: `/certificado/verificar/LT-DEMO-0005`, `LT-DEMO-0007` (vencido), `LT-DEMO-0008` (próximo a vencer) y `LT-P-DEMO-0001` (presencial).
11. **Roles** (`/admin/usuarios/roles`) y panel `/academico`: usar `instructor@demo.latinterra.test` o `coordinacion@demo.latinterra.test` con la contraseña inicial. Se muestran cursos/alumnos asignados sin concederles acceso administrativo de pagos.

La carga no desactiva reglas del aula ni crea una pasarela o facturación electrónica. La configuración general sigue disponible con el modo almacén activo. Los catálogos generales de países/ubigeo y opciones mantienen sus datos existentes.

## Verificación

`php tests/manual/meeting-demo.php` ejecuta 55 comprobaciones con la carga completa en SQLite en memoria y almacenamiento temporal: conciliación de todos los productos, costo ponderado, cotizaciones y pagos relacionados, ingresos del dashboard, certificados, notas/respuestas, preservación de cuentas/inventario anteriores e idempotencia. La base de la aplicación no se usa en esa prueba.

Se verificaron las respuestas de los listados administrativos, el panel académico, los cursos del alumno y las páginas públicas de verificación. Chrome renderizó dashboard, productos, cotizaciones, cursos, certificados, presenciales y aula sin errores de ejecución; productos se revisó también a 390 px. La descarga de una cotización DEMO devuelve un PDF válido. No se enviaron correos de prueba.

La carga se ejecutó en MySQL local. El despliegue y la ejecución en producción requieren los comandos indicados; subir el código a GitHub no carga automáticamente los datos del servidor.
