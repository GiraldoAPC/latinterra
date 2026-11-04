# Avance del checklist — 3 de noviembre de 2026

Fuente: Checklist_de_requerimientos_con_respuestas.docx. Este registro distingue implementación de validación funcional con usuarios.

## Aula virtual y exámenes

El código incluye requisitos previos y convalidaciones registradas por administración, plazo de acceso por curso, seguimiento de videos/materiales, preguntas por tema, evaluación por módulo, nota mínima 13 y pagos manuales con división en cuotas. Falta una revisión funcional completa de estos flujos contra el documento antes de dar el bloque por cerrado.

## Certificación con aula virtual — bloque actual

- [x] Modelo imprimible y vista previa administrativa.
- [x] Vigencia de un año desde la emisión; certificados antiguos usan su fecha original como base. En años bisiestos se usa el último día de febrero, sin saltar a marzo.
- [x] Guardar nota al emitir: promedio con igual peso de la mejor nota aprobada de cada módulo evaluado; no incluye preguntas por tema. Criterio provisional pendiente de validación del negocio.
- [x] Consulta pública con alumno, curso, nota, emisión, vencimiento y estado vigente/vencido.
- [x] QR generado en el navegador, sin servicios externos, que abre la consulta pública.
- [x] Consulta pública entrega únicamente los datos del certificado, sin serializar el perfil completo del estudiante.
- [x] Configuración de firmas por curso: un representante de empresa y hasta cinco instructores, con nombres e imágenes PNG/JPG de hasta 2 MB. Los certificados nuevos conservan una copia de su configuración de firmas; cambiar el curso no modifica certificados anteriores.
- [ ] Cargar las firmas reales de los responsables desde Administración → Certificados; no se inventaron firmas.
- [ ] Definir revocación y flujo de recertificación; el documento no responde la pregunta de revocación.
- [x] Avisos dentro del sistema desde 30 días antes del vencimiento y después de vencer: estudiante en «Mis cursos» y administración en el listado paginado de certificados. Orientan a coordinar la recertificación; no reinscriben ni reabren cursos automáticamente.
- [ ] Avisos externos por correo, si se requieren: pendiente configurar canal y frecuencia.
- [ ] Validación visual de impresión/PDF y lectura del QR en un dispositivo real.

Los certificados anteriores no tienen nota guardada: se muestra «No registrada». No se reconstruyen notas históricas con contenidos que pudieron cambiar. Los cursos sin módulos evaluados tampoco reciben una nota inventada.

## Siguientes bloques

- Certificaciones presenciales: registro, evaluación y emisión implementados; falta validación operativa y definir recertificación/revocación.
- Inventario: cotización → venta, alertas de stock y auspicios al costo implementados; pendiente validación operativa.
- Roles: administración, estudiante, instructor y coordinador; permisos de gerencia/administración.
- Pasarela y facturación SUNAT: etapas futuras según el checklist.

## Publicación

Esta entrega requiere ejecutar `php artisan migrate --force` en producción antes de activar el código y desplegar `public/build` junto con los archivos PHP. La migración agrega `expires_at` y `final_score` sin modificar registros existentes. No se ha ejecutado en producción; no hay un mecanismo de despliegue documentado en el repositorio.

La migración específica se aplicó en la base local. Se verificó sintaxis PHP, compilación y seis comprobaciones directas de fechas (límite exacto, aniversario bisiesto, preservación de emisión, fecha explícita y ausencia de fechas). Se agregaron pruebas para PHPUnit, pero no se ejecutaron porque las dependencias de desarrollo de PHP no están instaladas en este entorno.

### Entrega de firmas y avisos

También se requiere la migración `2026_11_03_000002_add_certificate_signatories.php`, aplicada únicamente en local. Las imágenes usan el disco público de Laravel: el servidor necesita `public/storage` enlazado mediante `php artisan storage:link` y permisos de escritura en `storage`. Conservar las imágenes anteriores, ya que los certificados emitidos las referencian.

Verificación reproducible sin PHPUnit: `php tests/manual/certificate-workflow.php`. Usa SQLite en memoria y un directorio temporal propio, sin alterar la base de datos configurada. Comprueba avisos, carga y conservación de firmas, validación y middleware de administrador. La compilación de producción está incluida; sigue pendiente revisar el PDF impreso y las firmas/QR desde un dispositivo real.

## Certificaciones presenciales — registro de grupos

- [x] Crear un grupo para un curso existente, con lugar, fecha/hora de Perú y cupo de 1 a 1000 participantes.
- [x] Generar enlace exclusivo y QR descargable para el registro de ese grupo.
- [x] Formulario público sin cuenta: documento, nombres, apellidos y contacto opcional, con confirmación de datos.
- [x] Lista administrativa paginada y corrección de datos por administración.
- [x] Rechazar duplicados dentro del grupo, respetar cupo con transacción/bloqueo de la fila del grupo y permitir el mismo participante en otros grupos.
- [x] Cerrar/reabrir registro manualmente y establecer una fecha de cierre opcional. Reabrir no omite el cupo ni la fecha de cierre.
- [x] El enlace público no expone listas, documentos ni contactos de otros participantes; las listas y correcciones requieren administrador.
- [x] Registrar nota presencial de 0 a 20 con máximo dos decimales y confirmar asistencia. Se usa mínima 13/20, igual que el criterio general del checklist.
- [x] Emitir certificados presenciales con firmas del curso, vigencia anual y verificación pública por QR. Requiere asistencia confirmada, nota aprobatoria, capacitación iniciada y firmas con imágenes disponibles.
- [x] Guardar copia del nombre, documento, curso, nota y firmas al emitir, y registrar el administrador que evaluó y emitió. El certificado emitido bloquea cambios de evaluación e identidad del participante; la revocación/reemisión sigue pendiente de definición.
- [x] Impresión/guardado como PDF desde el grupo y listado de certificados presenciales con vigencia/avisos administrativos en «Certificados».
- [ ] Vincular identidades existentes tras validación administrativa; el autorregistro solo llena la lista y no crea cuentas ni sobrescribe personas/usuarios.

Acceso: Administración → Cursos → Capacitaciones presenciales (`/admin/cursos/presenciales`). La migración `2026_11_03_000003_create_in_person_sessions.php` crea dos tablas nuevas y se aplicó localmente. Ejecutar las migraciones al desplegar en producción. Los cursos con grupos registrados no pueden eliminarse; sí pueden despublicarse.

Prueba reproducible: `php tests/manual/in-person-registration.php`, con SQLite en memoria. Comprueba horarios, registro, duplicados, cupo, cierre, validación, correcciones, aislamiento entre grupos, datos públicos, middleware y reversión de la migración. La simultaneidad real de múltiples conexiones MySQL y la lectura del QR en teléfono siguen pendientes de validación.

### Evaluación y certificado presencial

La migración `2026_11_03_000004_add_in_person_certification.php` agrega los campos de evaluación y una tabla de certificados presenciales independiente de las matrículas del aula virtual. Se aplicó en MySQL local. Es necesaria al publicar esta entrega en producción. No crea cuentas ni matrículas del aula virtual. Los códigos presenciales usan el prefijo `LT-P-` y la misma ruta pública de verificación.

Desde el grupo: registrar nota/asistencia → guardar evaluación → emitir certificado → imprimir/guardar PDF. Las firmas se configuran en «Certificados». Repetir la emisión devuelve el mismo certificado, sin duplicarlo. El formato de impresión compartido se ajustó a A4 horizontal; la revisión visual en navegador y lectura de QR siguen pendientes.

Verificación: `php tests/manual/in-person-certification.php` (25 comprobaciones en SQLite aislado) y `php tests/manual/in-person-registration.php` (23 comprobaciones). Cubren requisitos de emisión, límite de nota, archivos de firmas, copia de datos, emisión repetida, privacidad, protección de cambios, verificación de ambos tipos de certificado y middleware. La reversión de claves foráneas de la migración de evaluación requiere MySQL; SQLite no admite esa operación y las pruebas usan una base en memoria desechable.

## Inventario y cotizaciones

- [x] Se conserva el flujo existente compra → almacén → transferencia → ventas. Requiere activar «Modo almacén» en Configuración; no se modificó la preferencia existente.
- [x] Cotización comercial imprimible/PDF con destinatario, documento opcional, productos, precios, cantidades, condiciones y fecha de vigencia opcional.
- [x] Descarga directa del PDF generado en el servidor y envío por correo con ese formato adjunto, destinatario editable y mensaje opcional. Guarda destinatario y fecha del último envío exitoso; los fallos de transporte muestran un error y no actualizan ese registro.
- [x] Aprobar/cancelar cotizaciones y convertir una aprobada y vigente en venta al confirmar el pago. Aprobar no reserva stock. La conversión verifica existencias bajo bloqueo y usa el precio cotizado, con costo promedio actual guardado por renglón.
- [x] La conversión registra un ticket interno en Ventas y no se duplica al repetir la solicitud. La integración de boleta/factura en este nuevo flujo queda pendiente; las ventas directas conservan sus opciones existentes.
- [x] Alertas en la campana de todo el panel administrativo: productos activos con control de stock y cantidad de ventas menor o igual al mínimo (5 si no está configurado). Muestra hasta cinco productos y el total de alertas; si hay existencias en almacén, sugiere revisar una transferencia.
- [x] Auspicios con beneficiario, motivo, ubicación y cantidad. Descuentan ventas o almacén y registran costo promedio de compra y costo total asumido por la empresa, sin generar ingresos ni venta. Requieren costo conocido y existencias suficientes; costo conocido cero se conserva como cero.
- [x] Solicitudes de auspicio con identificador para evitar doble descuento; historial paginado y costo acumulado.
- [x] Venta habitual vuelve a validar existencias bajo bloqueo antes de descontar, incluso si un producto aparece en varios renglones; los fallos revierten pago, detalle y stock.
- [ ] Validación operativa con compras, cotizaciones, ventas y auspicios reales de prueba, impresión de documentos y múltiples conexiones MySQL concurrentes.
- [ ] Alertas externas por correo y distribución por roles de gerencia/inventario, una vez implementados esos roles. Actualmente están disponibles para el rol administrador dentro del sistema.
- [ ] Corrección/reversión administrativa de auspicios: los registros se conservan y no se eliminan desde la interfaz.

Accesos: `/admin/quotes` (Ventas → Cotizaciones), `/admin/inventario/auspicios` (Inventario → Auspicios) y campana del panel. La migración `2026_11_03_000005_add_quotes_and_sponsorships.php` se aplicó en MySQL local; producción sigue pendiente de despliegue y `php artisan migrate --force`.

Prueba reproducible: `php tests/manual/inventory-workflow.php` (38 comprobaciones con SQLite en memoria). Incluye valoración de auspicios, ubicación de salida, requisitos de costo, solicitudes repetidas, totales de cotización calculados en servidor, estados, vencimiento en horario de Perú, venta y reversión de transacciones fallidas, alertas, acceso administrativo y reversión de la migración. La compilación de producción está incluida.

### Descarga y envío de cotizaciones

En el detalle de cada cotización: «Descargar PDF» entrega un archivo directamente; «Enviar cotización por correo» recibe correo y mensaje y adjunta el PDF generado a partir de los datos guardados. El correo del cliente también puede guardarse al crear la cotización. El envío no aprueba ni convierte la cotización en venta. Ambos accesos requieren administrador, y el envío tiene un límite de diez solicitudes por minuto.

Se agregó `dompdf/dompdf` como dependencia de producción, una plantilla PDF A4 con soporte de múltiples páginas y una plantilla de correo. No se cargan recursos remotos ni se ejecutan scripts del documento. Las pruebas revisan el PDF real, acentos, documento largo y correo simulado, sin enviar mensajes a destinatarios reales.

Publicación de esta entrega: ejecutar `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force` y desplegar los archivos compilados incluidos. La migración `2026_11_03_000006_add_quote_email_fields.php` se aplicó en local. El directorio `storage/framework/cache/dompdf` debe poder escribirse (se crea al generar el PDF).

El envío real depende del correo saliente del servidor (`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`). Usa un transporte real como SMTP; los modos `log` y `array` no se reportan como entrega. Si cambian las variables de entorno, actualizar la caché de configuración. No se verificó SMTP de producción ni se modificaron sus credenciales.

Pruebas: `php tests/manual/quote-delivery.php` (22 comprobaciones sin SMTP real), además de las 38 de inventario. Archivos de muestra generados en `storage/app/previews/cotizacion-modelo.pdf` y `cotizacion-multipagina.pdf` (datos ficticios, no versionados).
