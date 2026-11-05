# Avance del checklist — 3 de noviembre de 2026

Fuente: Checklist_de_requerimientos_con_respuestas.docx. Este registro distingue implementación de validación funcional con usuarios.

## Aula virtual y exámenes

El código incluye requisitos previos y convalidaciones registradas por administración, plazo de acceso por curso, seguimiento de videos/materiales, preguntas por tema, evaluación por módulo, nota mínima 13 y pagos manuales con división en cuotas. Falta una revisión funcional completa de estos flujos contra el documento antes de dar el bloque por cerrado.

Primera corrección tras la revisión: las pantallas del alumno usan datos explícitos que excluyen indicadores de respuesta correcta, claves de texto corto, videos/materiales de clases futuras y configuración interna de firmas. Los envíos de evaluación y avance comparten comprobaciones de curso, secuencia, matrícula activa, deuda y vencimiento. Las respuestas solo pueden referirse a preguntas/opciones del examen; los envíos ordinarios posteriores a una aprobación no revierten su progreso.

Prueba: `php tests/manual/learning-access.php` (31 comprobaciones en SQLite aislado). La primera corrección no agregó migraciones ni cambió las claves de administración. La segunda entrega incorpora intentos, sorteo y tiempo de examen en servidor; la tercera parte descrita abajo cierra los cursos completados. El control de video se implementó en la entrega del 5 de noviembre; el seguimiento por página de PDF también está implementado; para PowerPoint se requiere exportar a PDF. Ver `docs/revision-pendientes-checklist.md` para el detalle actualizado.

### Segunda corrección: intentos y tiempo de examen de módulo

- [x] Inicio explícito: abrir la pantalla no consume un intento ni entrega el banco de preguntas.
- [x] Máximo inicial de seis intentos por examen/matrícula. Se cuentan los intentos históricos y los abandonados que vencen. Los exámenes de tema mantienen intentos ilimitados.
- [x] Selección aleatoria de 10, 15 o 20 preguntas, con opciones mezcladas. Si el banco es menor, se usa completo.
- [x] Preguntas, opciones y claves de corrección congeladas por intento en el servidor. Recargar/reabrir reanuda el mismo intento y no vuelve a sortear ni reinicia el plazo.
- [x] Duración inicial de veinte minutos, vencimiento guardado en servidor y cronómetro general en pantalla.
- [x] Guardado automático de respuestas. Al vencer se corrigen las recibidas antes del límite; las respuestas nuevas fuera de plazo no se aceptan. El intento vencido se finaliza al recibir el envío o al volver a abrirlo, sin requerir un proceso programado.
- [x] Envíos repetidos de un intento finalizado devuelven el resultado existente. Las sesiones se limitan a su matrícula/examen y no exponen claves al alumno.
- [x] Al desaprobar se reinicia el módulo, se conserva el historial de intentos y se informa si se agotó el cupo.
- [x] Condiciones configurables desde la edición del curso, dentro de cada módulo: máximo de intentos (1–20), preguntas (10/15/20), duración (1–180 minutos). La configuración inicial elegida es seis intentos y veinte minutos; cambios de duración/banco solo afectan nuevos intentos. El máximo se aplica en cada nuevo inicio y puede ampliarse por administración.
- [ ] Verificación de simultaneidad real con múltiples conexiones MySQL y de conexiones intermitentes en dispositivos reales.

La migración `2026_11_03_000008_add_module_exam_sessions.php` agrega configuración a `exams` y la tabla de sesiones; se aplicó en MySQL local. Esta entrega sí requiere `php artisan migrate --force` en producción antes de usar el nuevo código. Incluye los archivos compilados.

Prueba: `php tests/manual/module-exams.php` (59 comprobaciones en SQLite en memoria, incluidas las 31 de la primera corrección). Cubre reanudación, selección persistida, claves ocultas, guardado, vencimiento exacto, respuestas tardías, cambios de banco/configuración, intentos históricos, límite agotado, envío repetido, aislamiento entre matrículas y requisitos de avance. Sintaxis PHP y compilación verificadas.

### Tercera corrección (primera parte): cierre del curso completado

- [x] Un curso completado o con certificado emitido ya no permite continuar, repasar clases, enviar avances, abrir/confirmar materiales ni iniciar/guardar/enviar evaluaciones desde el aula.
- [x] Las comprobaciones se aplican en el servidor y también dentro del servicio de exámenes. Cambiar únicamente el estado de una matrícula con certificado no reabre el contenido.
- [x] «Mis cursos» conserva el progreso al 100 %, muestra el cierre y ofrece el certificado, sin botón «Revisar».
- [x] Agregar clases posteriormente no retira el certificado ni reabre el curso. El vencimiento del certificado tampoco habilita una repetición automática; la recertificación sigue pendiente de definición.
- [x] El acceso vencido se comprueba antes de la alternativa de repaso al usar «Continuar».
- [x] Seguimiento del tiempo de reproducción del video: [entrega del 5 de noviembre](control-video-aula.md), con sesión, controles de tiempo y reanudación.
- [ ] Lectura por página. Los archivos con URL pública siguen requiriendo una entrega de almacenamiento privado para controlar su descarga directa.

Esta parte no agrega migraciones. Prueba: `php tests/manual/course-closure.php` (51 comprobaciones, incluidas las 31 de acceso). Base SQLite en memoria; cubre las rutas de lectura/escritura del aula, cambios de contenido, certificado vencido, no repetición y conservación de los registros. No se ejecutó en producción.

### Avance de video — 5 de noviembre de 2026

El evento de finalización ya no otorga aprobación por sí solo. Se valida tiempo/posición en servidor, velocidad 1x, pausas y reanudación; se conserva la aprobación de videos anteriores. La duración administrativa es obligatoria y editable, con cálculo automático cuando YouTube lo permite. Ver [reglas y límites](control-video-aula.md).

Esta entrega sí requiere la migración `2026_11_05_000009_add_video_tracking_to_lesson_progress.php`, aplicada solo en local. Pruebas: 64 comprobaciones aisladas y ciclo de reproducción en Chrome con la API del reproductor simulada y el servicio real. Compilación incluida. Material por página y almacenamiento privado continúan pendientes.

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
- Roles: administración, gerencia, estudiante, instructor y coordinador implementados con asignación de cursos; pendiente validación operativa de los permisos.
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

Prueba reproducible: `php tests/manual/inventory-workflow.php` (48 comprobaciones con SQLite en memoria). Incluye valoración de auspicios, ubicación de salida, requisitos de costo, solicitudes repetidas, totales de cotización calculados en servidor, estados, edición/eliminación, vencimiento en horario de Perú, venta y reversión de transacciones fallidas, alertas, acceso administrativo y reversión de la migración. La compilación de producción está incluida.

### Descarga y envío de cotizaciones

En el detalle de cada cotización: «Descargar PDF» entrega un archivo directamente; «Enviar cotización por correo» recibe correo y mensaje y adjunta el PDF generado a partir de los datos guardados. El correo del cliente también puede guardarse al crear la cotización. El envío no aprueba ni convierte la cotización en venta. Ambos accesos requieren administrador, y el envío tiene un límite de diez solicitudes por minuto.

Se agregó `dompdf/dompdf` como dependencia de producción, una plantilla PDF A4 con soporte de múltiples páginas y una plantilla de correo. No se cargan recursos remotos ni se ejecutan scripts del documento. Las pruebas revisan el PDF real, acentos, documento largo y correo simulado, sin enviar mensajes a destinatarios reales.

Publicación de esta entrega: ejecutar `composer install --no-dev --optimize-autoloader`, `php artisan migrate --force` y desplegar los archivos compilados incluidos. La migración `2026_11_03_000006_add_quote_email_fields.php` se aplicó en local. El directorio `storage/framework/cache/dompdf` debe poder escribirse (se crea al generar el PDF).

El envío real depende del correo saliente del servidor (`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`). Usa un transporte real como SMTP; los modos `log` y `array` no se reportan como entrega. Si cambian las variables de entorno, actualizar la caché de configuración. No se verificó SMTP de producción ni se modificaron sus credenciales.

Pruebas: `php tests/manual/quote-delivery.php` (22 comprobaciones sin SMTP real), además de las 48 de inventario. Archivos de muestra generados en `storage/app/previews/cotizacion-modelo.pdf` y `cotizacion-multipagina.pdf` (datos ficticios, no versionados).

La pantalla de cotizaciones ahora usa una tabla con búsqueda, filtro de estado y paginación. Crear/editar se realiza en un modal compacto; las filas permiten ver, editar, eliminar, descargar PDF y enviar correo (también en modal). Editar una cotización aprobada exige nueva aprobación y recalcula los importes en servidor. Las cotizaciones con venta no pueden editarse ni eliminarse; eliminar una no vendida requiere confirmación en la interfaz y no modifica inventario ni pagos. Se revisaron capturas de la tabla y el modal en Chrome con datos ficticios y sin solicitudes de escritura. Esta mejora no agrega migraciones.

Actualización visual de cotizaciones: se adaptó la referencia proporcionada a la paleta azul `#024A7D` y celeste `#00ADEE`. Incluye cabecera con ondas, botones con degradado, filtros redondeados, tabla con iconos, estado vacío con acceso a crear y modal con secciones de cliente, productos y notas. Conserva las acciones y restricciones existentes. Revisión visual en Chrome con datos ficticios: escritorio, pantalla pequeña, tabla vacía/con registros y modal. Compilación de producción verificada; no agrega migraciones ni cambios de lógica comercial.

## Diseño administrativo compartido — 4 de noviembre de 2026

El icono de cabecera quedó centrado explícitamente en ambos ejes. El diseño aprobado de cotizaciones se convirtió en componentes compartidos y una temática del panel para cabeceras, tablas, campos, botones, tarjetas y modales. Se aplicó a los listados administrativos; presenciales, auspicios y creación de personal ahora abren sus registros en modal. Los formularios extensos por etapas conservan su navegación. Guía para las siguientes pantallas: [Diseño de administración](diseno-administracion.md).

Verificación en Chrome con datos ficticios y sin escrituras reales: siete pantallas de escritorio, apertura/cierre de seis modales, cuatro vistas a 390 px y sus modales. Iconos de cabecera con desviación de centro de cero píxeles, sin desbordamiento horizontal de página ni errores de ejecución. Revisión visual de tabla con registros, estados vacíos y formularios. Compilación de producción correcta. No requiere nuevas migraciones; producción no verificada.

### Continuación visual del sistema — 4 de noviembre de 2026

La base de formularios, tablas, botones y modales se extendió a administración, aula, panel académico, acceso, perfil y formularios públicos. Se completaron las pantallas de detalle/edición y los registros en modales descritos en [Diseño compartido](diseno-administracion.md). Los selectores visibles del navegador se sustituyeron por un componente común con menú propio, búsqueda para listas largas, navegación por teclado y conservación de la validación/serialización del formulario. Incluye países, ubigeo, cursos y selectores dentro de modales. No cambia reglas comerciales, permisos, rutas ni documentos de impresión.

Verificación: 29 pantallas de escritorio y celular (58 vistas), nueve comprobaciones funcionales del selector, revisión del menú móvil y apertura/cierre de seis modales adicionales. Sin errores de ejecución, desbordamiento horizontal de página ni escrituras/correos reales durante la revisión. Compilación correcta. No requiere nuevas migraciones y aún no se verificó producción.

### Dashboard de resultados — 5 de noviembre de 2026

Se reemplazaron los accesos grandes por indicadores reales de cobros, matrículas, certificados y cotizaciones, gráfico diario y distribución de pagos, con períodos de 7/30/90 días. Incluye deuda actual, pedidos pendientes, cotizaciones aprobadas, stock bajo, próximos vencimientos y grupos presenciales. Se excluyen ventas anuladas y se evitan duplicaciones por cotización convertida o pedido dividido en cuotas. Las compras y los auspicios se muestran separados; no se calcula una utilidad. Actualización manual y automática cada minuto con la pestaña visible.

Reglas, fuentes y despliegue: [Dashboard de resultados](dashboard-resultados.md). Prueba aislada: `php tests/manual/dashboard.php` (29 comprobaciones). Revisión de filtros, gráfico, actualización, estado vacío y adaptación móvil en Chrome. No agrega migraciones; producción pendiente de actualizar/verificar.

## Roles y permisos

- [x] Roles disponibles: `admin` (administración), `manager` (gerencia), `instructor`, `coordinator` (coordinador) y `student` (estudiante). Cada cuenta mantiene un solo rol, como el modelo existente.
- [x] Administración y gerencia acceden al panel administrativo completo, incluidos pagos, ampliación de cuotas, anulación de ventas y gestión de cuentas. Estos roles son los únicos con esas facultades; no se otorgaron a instructores/coordinadores.
- [x] Crear cuentas de personal con contraseña inicial confirmada y almacenada como hash; buscar cuentas y cambiar rol/estado desde «Usuarios → Roles y permisos».
- [x] Registro de auditoría en `user_role_changes` de altas y cambios realizados desde esta gestión. No se registran contraseñas en la auditoría.
- [x] Se bloquean los cambios del propio rol/estado y la desactivación/democión de la última cuenta administradora activa.
- [x] Instructor: panel académico con sus cursos asignados, nombres de alumnos, porcentaje de avance y mejor nota por módulo.
- [x] Coordinador: consulta académica de todos los cursos y asignación/retiro de instructores activos. Administración y gerencia también pueden coordinar desde ese panel.
- [x] Datos del panel académico limitados al seguimiento: no incluye pagos, contactos ni datos médicos del estudiante. No permite editar contenidos o notas.
- [x] Desactivación de cuentas: impide nuevas sesiones y termina sesiones existentes al siguiente acceso web. El cambio de rol/asignación se comprueba en las solicitudes posteriores.
- [ ] Validación operativa con usuarios de cada rol y múltiples conexiones concurrentes para cambios de privilegios.
- [ ] Ampliar facultades académicas (edición de contenidos, evaluación docente y capacitación presencial) una vez definido el alcance. Esta entrega habilita seguimiento de aula virtual y asignación, sin conceder funciones administrativas adicionales.
- [ ] Otros roles como vendedor o encargado de inventario: pendientes de definición del negocio, según el checklist.

Accesos: `/admin/usuarios/roles` para cuentas y permisos; `/academico` para coordinación/instructores. Las cuentas existentes no cambiaron de rol ni se crearon cuentas reales de personal automáticamente. Se conservan las credenciales actuales de los administradores.

La migración `2026_11_03_000007_add_staff_roles_and_course_assignments.php` agrega tablas de asignación y auditoría; se aplicó en MySQL local. Al desplegar, ejecutar `php artisan migrate --force` antes de usar las nuevas pantallas.

Prueba reproducible: `php tests/manual/roles-workflow.php` (33 comprobaciones en SQLite en memoria). Verifica acceso por rol, aislamiento de cursos, retiro de asignación, ausencia de datos financieros en el seguimiento, protección de última cuenta administradora, auditoría, creación y autenticación de personal y revocación de sesiones. Compilación de producción y sintaxis PHP verificadas.


### Lectura de PDF por página — 5 de noviembre de 2026

- [x] Conteo de páginas en servidor al subir el PDF o iniciar la primera lectura de archivos anteriores. No se acepta el número de páginas enviado por el alumno.
- [x] Doce segundos por página, con desbloqueo secuencial. Volver a páginas ya revisadas no acredita las siguientes.
- [x] Avance parcial persistido por matrícula/material, reanudación y sesión renovada al abrir. Las sesiones antiguas y el endpoint anterior de confirmación no pueden aprobar un PDF pendiente.
- [x] Controles periódicos mientras la página está renderizada y la ventana visible/enfocada. Pausas, cierre del visor y cortes prolongados no suman tiempo de ausencia.
- [x] Aprobación únicamente después de completar todas las páginas en servidor; se conservan las aprobaciones anteriores. Desaprobar el módulo elimina también el progreso de lectura.
- [x] Mismos controles de matrícula, secuencia, deuda, acceso vencido y cierre del curso en ambos endpoints de lectura.
- [ ] Conversión automática de Office a PDF. PowerPoint/Word/Excel conservan el control previo por archivo; para seguimiento por diapositiva se debe subir su versión PDF.
- [ ] Almacenamiento privado y entrega autenticada de los archivos. Los enlaces públicos de storage siguen siendo una limitación independiente.

Detalles y despliegue: [Lectura de materiales](lectura-materiales-aula.md). Requiere nueva dependencia Composer y migración `2026_11_05_000010_add_material_page_tracking.php`, aplicada en MySQL local. Pruebas aisladas de lectura y regresión de video/exámenes/cierre, compilación y revisión en Chrome. Producción pendiente de desplegar/verificar.
