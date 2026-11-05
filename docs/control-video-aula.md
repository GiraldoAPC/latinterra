# Control de avance del video del aula

La aprobación del video requiere una sesión de seguimiento y el evento final después del tiempo validado. Enviar únicamente el antiguo POST `video-visto` ya no crea un avance.

## Funcionamiento

- El inicio crea un token para la matrícula/clase, conserva el último punto validado y registra el video y su duración administrativa. Abrir otra sesión para esa clase invalida el token anterior.
- El navegador informa posición y estado de reproducción cada cinco segundos y al cambiar de estado. Las solicitudes se envían en orden. El servidor bloquea la fila de matrícula durante cada actualización y acredita como máximo el tiempo realmente transcurrido desde el último control.
- La posición validada no retrocede ni se duplica al repetir solicitudes. Saltos, reproducción que avanza más rápido que el reloj del servidor y más de quince segundos sin controles durante reproducción requieren retomar el último punto validado. Una pausa larga correctamente registrada no gana tiempo ni obliga a reiniciar la sesión.
- El final debe llegar cerca de la duración registrada y con el tiempo acreditado suficiente. Se admite únicamente una tolerancia de 500 a 1000 milisegundos para redondeo de duración/fracciones de segundo; nunca se omite por completo un video corto.
- El reproductor mantiene velocidad 1x y desplazamiento bloqueado hasta aprobar. Ocultar la pestaña pausa el video. Después de aprobar se permite repasar con los controles habituales, mientras el curso siga abierto.
- Recargar reanuda desde el último punto confirmado; no se acredita el tiempo fuera de la página. Un fallo de conexión pausa y muestra un aviso. Puede perderse el pequeño tramo posterior al último control recibido.
- Al desaprobar un módulo, el reinicio de progreso existente también elimina la sesión de video. Cambiar el video/duración invalida una sesión no aprobada y el siguiente inicio comienza desde cero.

Las rutas conservan los controles compartidos de pertenencia de clase al curso, matrícula, secuencia, deuda, vencimiento y cierre de curso certificado. El servicio también comprueba matrícula, pertenencia, token y versión del contenido. El token no aparece al serializar ordinariamente `LessonProgress`.

## Duración y datos anteriores

La duración proviene de administración, nunca se sustituye por una duración enviada por el alumno. Al crear/editar una clase se requiere un entero positivo en segundos. Se obtiene del reproductor de YouTube cuando es posible y se puede corregir manualmente. Cambiar el ID del video borra la duración anterior y descarta respuestas automáticas antiguas. El envío administrativo aplica el valor calculado mediante la transformación real del formulario de Inertia.

Una clase pendiente con duración cero no puede iniciar seguimiento: se informa que administración debe configurarla. No se inventan duraciones. Los videos que ya tenían `video_watched_at` se conservan aprobados, incluidos los anteriores a esta entrega; no se reinician cursos certificados.

El navegador sigue siendo quien informa el estado/posición del reproductor. Esta implementación impide aprobar por un aviso aislado o adelantar más rápido que el tiempo del servidor; no constituye una prueba independiente de atención humana ni DRM.

## Despliegue

Migración nueva: `2026_11_05_000009_add_video_tracking_to_lesson_progress.php`, aplicada en MySQL local. Añade metadatos de sesión/posición a `lesson_progress`, sin borrar avances existentes. Es necesario ejecutar `php artisan migrate --force` en producción y desplegar los archivos compilados. No requiere credenciales nuevas, dependencias ni procesos programados.

Revisar en producción que las clases pendientes tengan una duración válida, desde la edición del curso. La revisión de datos locales no encontró clases con video y duración cero; no se consultó la base de producción.

## Verificación

- `php tests/manual/video-progress.php`: 64 comprobaciones con SQLite en memoria, incluidas las 31 de acceso existentes. Cubre evento falso, tiempo, pausa larga, doble velocidad, reanudación, cambio de token/video/duración, pérdida de controles, contenido actualizado, avances antiguos, aislamiento, cierre/vencimiento y validación administrativa.
- Las suites de exámenes y cierre conservan sus resultados: `php tests/manual/module-exams.php` y `php tests/manual/course-closure.php`.
- Chrome con reproductor simulado de la API de YouTube y el servicio PHP real, sobre un archivo SQLite temporal: apertura sin aprobación, velocidad 1x, pausa al ocultar, rechazo de salto al final, persistencia/reanudación y aprobación solo al terminar el tiempo. Capturas de escritorio y celular; sin errores de ejecución. No se modificaron alumnos reales.
- Compilación de producción y sintaxis PHP verificadas. Sigue pendiente comprobar el reproductor con videos reales/redes y la concurrencia entre conexiones MySQL en producción.

El siguiente requisito del aula es el seguimiento por página de los materiales. Los archivos públicos también conservan la limitación de acceso mediante URL conocida hasta su migración a almacenamiento privado.
