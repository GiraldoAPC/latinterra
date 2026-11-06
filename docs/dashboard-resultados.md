# Dashboard de resultados

El dashboard de administración usa registros existentes de ventas, pagos, aula, certificados e inventario. Sustituye el menú de accesos por indicadores, un gráfico diario interactivo y pendientes que llevan al registro correspondiente. Acceso exclusivo de administración y gerencia mediante la ruta protegida `/admin`.

## Resultados por período

Selector de 7, 30 o 90 días, con 30 días por defecto. Cada período empieza a las 00:00 del primer día en `America/Lima` y termina en el momento de la consulta. Las fechas se convierten a la zona de la aplicación al consultar timestamps; el gráfico vuelve a agruparlos por día de Perú. Se incluyen días sin movimientos con importe cero.

El período anterior corresponde a los mismos días calendario inmediatamente anteriores. El período actual puede incluir un día todavía incompleto; comparar con esa consideración. Si el importe anterior es cero, no se inventa un porcentaje de variación.

| Indicador | Fuente y criterio |
|---|---|
| Cobros registrados | `other_payments` sin anulación, `course_installments` con estado `paid` y `course_orders` con estado `paid`, según `paid_at` |
| Matrículas nuevas | Matrículas creadas dentro del período, con estado actual `active` o `completed`; se excluyen canceladas |
| Certificados emitidos | Suma de certificados virtuales y presenciales según `issued_at` |
| Cotizaciones creadas | Cotizaciones según `created_at`; el subtítulo cuenta las de ese mismo grupo que tienen una venta pagada sin anulación |
| Compras registradas | Importe de compras por su fecha `purchased_at`; no implica que exista un registro separado de pago de la compra |
| Costo de auspicios | Costo asumido por entregas registradas dentro del período, según `created_at` |

Una cotización convertida ya genera un `other_payment`: no se vuelve a sumar su importe desde `quotes`. Un pedido dividido queda en `split`: se cuentan únicamente sus cuotas efectivamente pagadas. Se excluyen pedidos pendientes/rechazados, pagos futuros y ventas anuladas. La distribución y el gráfico usan las mismas tres fuentes y concilian con el total; las sumas de pagos se acumulan en centavos.

Estos indicadores describen cobros registrados y movimientos operativos. No calculan utilidad, saldo bancario ni facturación tributaria. Las compras y auspicios se muestran separados de los cobros.

## Estado actual

Los pendientes no dependen del selector histórico. Muestran la situación al consultar:

- Cuotas pendientes vencidas o con vencimiento hoy, de matrículas activas/completadas. Total de importe y cantidad; se muestran las cinco más antiguas con enlace al perfil del estudiante.
- Pedidos en línea pendientes de confirmar, para coincidir con el módulo de pedidos.
- Cotizaciones aprobadas sin venta y vigentes hasta el final de su fecha en Perú, o sin vencimiento. Hasta cinco documentos con enlace al detalle.
- Productos activos con control de stock y existencias de ventas menores o iguales al mínimo. El mínimo por defecto es cinco y se respeta el mínimo cero. Hasta cinco productos con menos unidades. Si está activo el modo almacén, se muestra también su cantidad disponible allí.
- Certificados virtuales/presenciales que vencen en los próximos treinta días; se excluyen los ya vencidos. Para certificados virtuales antiguos sin vencimiento explícito, se aplica el aniversario existente sin desbordamiento en año bisiesto. Se muestran los cinco vencimientos más cercanos.
- Hasta cinco grupos presenciales que empiezan dentro de catorce días, con cupo y participantes registrados.
- Estudiantes activos, cursos publicados y matrículas en curso/completadas. Una matrícula activa con certificado ya emitido cuenta como completada.

Los listados son resumidos y los contadores reflejan el total. No se cargan datos médicos ni claves de evaluación.

## Actualización y despliegue

«Actualizar» solicita un nuevo resumen. La pantalla actualiza cada minuto mientras la pestaña esté visible; no ejecuta escrituras, envíos de correo ni certificaciones. El filtro conserva el período en la URL y usa una respuesta parcial de Inertia. El gráfico admite puntero, toque y flechas del teclado.

No requiere migraciones, dependencias adicionales ni tareas programadas. Desplegar PHP, rutas y `public/build` juntos, y limpiar cachés con `php artisan optimize:clear`. No se ha confirmado este despliegue en producción.

## Verificación

`php tests/manual/dashboard.php`: 29 comprobaciones en SQLite en memoria. Incluye estado vacío, conciliación de cobros/gráfico, anulaciones, cuotas, pedidos divididos, límites UTC/Perú, pagos futuros, comparación, certificados de ambas modalidades y aniversario bisiesto, fechas y prioridad de cotizaciones, deuda, inventario, grupos, controles administrativos y ausencia de escrituras. `--preview` genera datos ficticios de muestra en `storage/app/previews/dashboard-fixture.json`, sin tocar la base configurada.

Revisión local en Chrome a 1920 y 390 px: datos poblados/vacíos, cambio de período con recálculo, gráfico por teclado, actualización manual y automática, pausa con pestaña oculta y ausencia de errores/desbordamiento de página. Las solicitudes de prueba fueron únicamente GET.


## Diseño del dashboard — 5 de noviembre de 2026

Se adaptó la referencia visual con menú administrativo claro, navegación activa azul/celeste, cabecera con ondas, cuatro indicadores con iconos y acentos azul/violeta/verde/naranja, tarjetas con bordes y sombras suaves y títulos más destacados. El gráfico y el desglose usan azul para ventas, celeste para cuotas y verde para pedidos pagados. Se conservan las fuentes, importes, períodos y reglas del reporte.

El menú y la barra superior se comparten con las demás pantallas administrativas. La temática del dashboard está limitada a su contenedor y a pantalla; no cambia certificados ni documentos de impresión. El buscador mantiene su alcance de estudiantes y ahora admite Ctrl + K o Cmd + K. La selección del menú permanece activa al cambiar el período por parámetros de URL.

Revisión en Chrome con datos locales reales: filtros, actualización, gráfico por teclado, atajo de búsqueda, navegación activa, menú plegable, menú móvil y productos. Se comprobó el diseño a 1768, 1280, 768 y 390 px; en celular las tarjetas ocupan una columna legible. También se revisó el estado vacío con la respuesta de la prueba aislada, sin modificar datos de la aplicación. Sin errores de ejecución. La prueba de reporte conserva sus 29 comprobaciones correctas. Compilación de producción verificada. No agrega migraciones; producción no verificada.


Preferencia posterior del usuario: el menú lateral administrativo recupera el fondo azul original `#024A7D`, textos claros y selección celeste. Se conserva el nuevo diseño de tarjetas, cabecera y gráficos. Se aplica también al menú móvil y no requiere migración adicional.
