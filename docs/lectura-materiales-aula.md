# Lectura de materiales del aula

Entrega del 5 de noviembre de 2026. Los PDF requieren doce segundos por página dentro del visor del aula. El servidor confirma el material después de todas sus páginas; abrirlo o descargarlo no lo aprueba.

## Funcionamiento

El servidor cuenta las páginas del archivo con `smalot/pdfparser` al subirlo. Los PDF anteriores se inspeccionan al iniciar la lectura. Se guarda el conteo y una huella SHA-256; el navegador no puede declarar un documento de una sola página para evitar leer las demás. El visor contrasta también su conteo con el del servidor.

El lector muestra una página a la vez, permite revisar páginas aprobadas y desbloquea la siguiente después de doce segundos validados. Cada tres segundos envía una actualización con sesión y página. El servidor usa su reloj, conserva el tiempo parcial y rechaza saltos de página, sesiones antiguas y actualizaciones sin autorización. Las solicitudes inmediatas no suman tiempo. Cambiar de página o recibir dos actualizaciones separadas por más de 6,5 segundos no acredita ese intervalo. No se traslada tiempo sobrante de una página a otra.

El contador se pausa si la página todavía no se renderizó, la pestaña está oculta o la ventana pierde el foco. Cerrar y reabrir conserva el avance, renueva el token y vuelve a iniciar el contador pausado. Las solicitudes se envían en orden. Ante un fallo de conexión se suspende el seguimiento y se informa cómo retomar el progreso guardado. Los segundos pendientes se actualizan con cada confirmación del servidor.

Las rutas `POST /aula/material/{material}/lectura/iniciar` y `/lectura/avance` repiten los controles de matrícula, pertenencia, secuencia de clases/módulos, pagos, vencimiento y cierre por certificación. El servicio serializa cambios bloqueando la matrícula. El antiguo `POST /visto` rechaza PDF pendientes. Completar clase o rendir el quiz continúa exigiendo la aprobación persistida de todos los materiales.

Las aprobaciones anteriores se conservan. Cambiar el contenido de un PDF pendiente reinicia su lectura al volver a abrirlo. El reinicio de módulo después de desaprobar elimina las vistas y sus sesiones, igual que el resto del progreso académico. Reemplazar archivos directamente en storage durante una sesión no es un flujo administrativo admitido: eliminar y subir el material desde el curso genera un nuevo registro.

## Archivos admitidos y límites

PDF de hasta 20 MB y 1000 páginas, sin contraseña y con estructura legible. Los archivos dañados o incompatibles se rechazan con un mensaje; no se concede una aprobación alternativa. La descompresión del parser tiene un límite por flujo y se descartan imágenes para reducir memoria. El servidor conserva además su límite de memoria PHP. La implementación usa el parser documentado en su [repositorio oficial](https://github.com/smalot/pdfparser).

PowerPoint, Word, Excel y ZIP conservan el control anterior por archivo. El iframe externo de Office no permite medir qué diapositiva se está viendo. Para exigir tiempo por diapositiva, exportar la presentación a PDF y subir esa versión como material. Se explica también en el formulario administrativo. La conversión automática queda pendiente.

El protocolo mide tiempo de visualización informado y acotado por el servidor; no demuestra atención humana ni evita la automatización deliberada. Los archivos continúan en el disco público: el control académico no protege su descarga por una URL conocida. La entrega autenticada desde almacenamiento privado es un bloque posterior del checklist.

## Validación y despliegue

`php tests/manual/material-reading.php` (63 comprobaciones, incluidas 31 de acceso) utiliza únicamente SQLite en memoria y archivos temporales: PDF real comprimido, archivo inválido/protegido, conteo, tiempo parcial, pausas, saltos, reanudación, tokens, cambios de archivo, confirmación, reinicio, cierre y vencimiento. Incluye la regresión de acceso al aula. También pasan `video-progress.php`, `module-exams.php` y `course-closure.php`.

Revisión en Chrome con PDF real de dos páginas y servicio PHP real sobre SQLite temporal: canvas activo, bloqueo/desbloqueo, pausa de pestaña oculta, avance persistido después de recargar, confirmación final del servidor y adaptación a 390 px, sin errores de ejecución. Compilación de producción verificada. No usa matrículas reales ni servicios de correo.

La migración `2026_11_05_000010_add_material_page_tracking.php` agrega metadatos a materiales y estado de lectura a vistas; aplicada en MySQL local. Desplegar código, dependencia y migración antes de usar el nuevo lector:

```bash
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
```

Los recursos compilados están versionados. Mantener `public/storage` operativo. Esta entrega no confirma el despliegue en producción.
