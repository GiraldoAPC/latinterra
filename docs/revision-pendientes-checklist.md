# Revisión de pendientes del checklist

Revisión de código y contraste con `Checklist_de_requerimientos_con_respuestas.docx`, al 3 de noviembre de 2026. Base revisada: commit `0992b8c`. No se realizaron pruebas contra producción ni se modificó la lógica de la aplicación en esta revisión.

## Actualización posterior: primera corrección de aula

Los hallazgos 1 y 2 de la revisión original se atendieron con datos de respuesta específicos para alumnos y comprobaciones compartidas de pertenencia, secuencia, matrícula, deuda y acceso vencido en GET/POST. Se eliminaron claves de corrección (incluido texto corto), videos y archivos de clases futuras del temario, y firmas internas del detalle público del curso. Las opciones enviadas se validan contra su pregunta; un examen ya aprobado no puede degradarse mediante un nuevo envío ordinario.

Prueba: `php tests/manual/learning-access.php`, con SQLite en memoria, cubre 31 comprobaciones de ausencia de claves, acceso cruzado, avance fuera de orden, requisitos de contenido, corrección, reinicio de módulo, deuda y vencimiento. No se requirió una migración nueva.

Esto no comprueba tiempo real de reproducción ni lectura por página: esos puntos siguen pendientes, junto con intentos, sorteo y tiempo de examen en servidor. Los materiales existentes siguen servidos desde almacenamiento público; migrarlos a descargas privadas autenticadas requiere una entrega adicional si se necesita impedir acceso directo al archivo mediante una URL conocida. Las pruebas de simultaneidad de envíos y la validación de producción también siguen pendientes.

### Segunda corrección aplicada

Los hallazgos originales 3, 4 y 5 ahora tienen implementación: límite configurable con seis intentos iniciales, muestra aleatoria persistida de preguntas/opciones y vencimiento de veinte minutos controlado por servidor. Hay inicio explícito, reanudación, guardado de respuestas y corrección de las respuestas recibidas a tiempo. Los envíos tardíos no reemplazan respuestas guardadas y los reenvíos no duplican el resultado. Las condiciones se configuran por módulo en la edición administrativa del curso.

La migración `2026_11_03_000008_add_module_exam_sessions.php` se aplicó localmente; requiere despliegue y migración en producción. La suite `php tests/manual/module-exams.php` pasa 59 comprobaciones, incluidas las 31 de acceso. Se conserva como pendiente probar conexiones concurrentes y escenarios de conectividad real.

El siguiente bloque de correcciones es seguimiento por diapositiva, duración real del video y cierre del curso certificado. Las secciones siguientes conservan los hallazgos de la revisión original para mantener el contexto.

## Prioridad 1: completar y corregir aula/exámenes

1. **Respuestas correctas en datos del alumno.** `moduleQuizShow` devuelve el módulo con `exam.questions.options`; `lesson` y `lessonQuizShow` también cargan opciones. `ExamQuestionOption` serializa `is_correct` sin ocultarlo. Se confirmó con una instancia de prueba, sin datos reales. Preparar respuestas específicas para alumnos que excluyan indicadores y claves de corrección, incluidas respuestas de texto corto. Conservar la corrección solo en servidor y los datos completos en administración.
2. **Validaciones de acceso en servidor incompletas.** Los POST de envío de quiz no repiten todos los requisitos que comprueban sus pantallas GET. `moduleQuizSubmit` no exige que todas las clases estén completas; `lessonQuizSubmit` no repite los requisitos de video/material. `markVideoWatched` y `completeLesson` no aplican todos los controles de acceso, secuencia o pertenencia de clase al curso. Las rutas no usan vinculación anidada restringida. Centralizar estas comprobaciones para que no dependan de los botones o la navegación del alumno. Hallazgo de revisión estática, sin explotación contra usuarios reales.
3. **Máximo de intentos por módulo.** Hoy se cuentan intentos, pero no hay límite. El documento indica cinco o seis. Agregar configuración y bloqueo del lado del servidor; decidir el valor definitivo dentro de ese rango.
4. **Banco y selección aleatoria.** Se envían todas las preguntas en orden. Implementar selección de 10/15/20 desde el banco, orden aleatorio y conjunto de preguntas persistido por intento, para que recargar no cambie la evaluación ni permita repetir el sorteo.
5. **Tiempo de examen.** Actualmente el navegador asigna 45 segundos por pregunta. El checklist plantea aproximadamente 20 minutos para el examen de módulo. Hace falta inicio, vencimiento y validación en servidor, con duración configurable y comportamiento definido al agotar tiempo.
6. **Material por diapositiva/sección.** Hoy se controla una permanencia de 12 segundos por archivo, no por página del PDF. El visor muestra páginas con desplazamiento continuo. El documento pide 10–15 segundos por diapositiva/sección: faltan seguimiento y desbloqueo por página.
7. **Video completo.** Existe bloqueo visual del desplazamiento, pero el endpoint marca el video como visto sin medir duración transcurrida. Revisar también la velocidad de reproducción habilitada. El criterio del documento exige completar el tiempo del video antes de avanzar.
8. **Cierre después de certificar.** El sistema impide una segunda matrícula ordinaria al detectar la existente, pero permite revisar contenido de cursos completados y exime esos cursos del vencimiento de acceso. El documento pide cerrar por completo el curso después de certificar. Ajustar esa política conservando acceso al certificado.

No es viable garantizar desde una web que el dispositivo no capture la pantalla o use una cámara. Se puede limitar la copia casual y añadir marcas de agua, pero no prometer protección absoluta.

## Prioridad 2: completar operación de certificaciones

- Cargar firmas reales de empresa/instructores y probar impresión y QR con teléfono.
- Definir revocación y reemisión por error; el documento dejó esa pregunta sin respuesta. Actualmente las correcciones de identidad/nota se bloquean tras emitir un certificado presencial y no existe una alternativa de reemisión.
- Definir recertificación: nueva capacitación/inscripción, vigencia y trazabilidad del certificado anterior. Actualmente solo se muestran avisos para coordinarla.
- Implementar control de pagos de capacitaciones presenciales, con pago único o cuotas por participante. El módulo presencial actual registra lista, notas y certificados, pero no tiene vínculo de cobro o cronograma propio.
- Validar el criterio provisional de nota final online (promedio con igual peso de las mejores notas aprobadas por módulo) y el criterio de evaluación presencial.
- Vincular participantes presenciales con personas existentes únicamente tras validación administrativa, si se requiere historial unificado.

## Prioridad 3: operación administrativa

- Alcance docente/coordinación más allá de consulta: edición de contenidos, evaluación y acceso a capacitación presencial están pendientes de definición. No se concedieron permisos administrativos amplios.
- Definir encargado de inventario/vendedor, y destinatarios de avisos externos. La campana ya está disponible para administración y gerencia.
- Completar correo de alertas de stock y vencimiento si se necesita aviso fuera del sistema.
- Revisar boleta/factura en conversión de cotización: hoy genera ticket interno; la venta directa conserva sus opciones anteriores.
- Definir corrección/reversión de auspicios, conservando historial y devolución de existencias.
- Revisar los cronogramas de pagos online: hay división manual de pedidos en dos o tres cuotas; también permanece el esquema automático de matrícula/mensualidades, que debe contrastarse con la preferencia del checklist por fechas manuales.

## Producción: estado por confirmar

El último registro enviado por el usuario mostraba un `git pull` abortado desde `cd8c7c5`, por un archivo no versionado en `resources/js/Pages/Admin/Quotes/Index.jsx`. `Nothing to migrate` se ejecutó sobre ese código antiguo. Se indicó respaldar el archivo y repetir la actualización, pero no hay una salida posterior que confirme el resultado.

Por tanto, están pendientes de confirmación en el servidor: commit desplegado, `composer install`, migraciones, `public/storage`, permisos de almacenamiento, descarga PDF y SMTP real. El código subido a GitHub y las migraciones locales no prueban el despliegue de producción.

## Etapas futuras expresamente previstas

Pasarela de pagos y conexión de facturación electrónica con SUNAT. El documento las plantea para más adelante; no son equivalentes a los pendientes actuales de aula y exámenes.

## Orden recomendado

Resolver primero exposición de respuestas y controles de acceso del servidor; después intentos, sorteo, tiempo de examen y cumplimiento de video/material/cierre. Seguir con pagos presenciales y revocación/recertificación, y cerrar la validación operativa de producción.
