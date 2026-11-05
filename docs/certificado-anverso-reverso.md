# Certificado formal de dos caras

Actualización del 5 de noviembre de 2026. Plantilla compartida del aula, presenciales y modelo administrativo: anverso y reverso en A4 horizontal, fondo de matiz suave, marco doble azul/celeste, acentos de esquina, tipografía sobria y logo institucional. El nombre, el título y el curso tienen mayor presencia visual.

El anverso contiene entidad emisora, estudiante/documento, curso, modalidad, emisión, nota y firmas. El reverso muestra temario, duración total, vencimiento, código y QR. Ambas caras repiten el código. La impresión genera dos páginas, para guardar como PDF o imprimir a doble cara.

## Configuración

En **Administración → Cursos → Editar → Información general → Contenido y duración del certificado**:

- **Duración total (horas):** hasta dos decimales. Representa la capacitación completa; es independiente del tiempo de videos, mensualidades y plazo de acceso al aula.
- **Temario para el reverso:** un tema por línea, con numeración y sangría para subtemas. Máximo 4000 caracteres y 45 líneas para mantener una página de reverso.

Desde **Cursos → Certificados**, seleccionar un curso permite ver sus dos caras, abrir «Editar contenido y duración» y gestionar firmas. El mismo temario se usa para modalidad virtual y presencial. Configurar los datos definitivos antes de emitir certificados nuevos; si faltan, se muestran pendientes de configurar.

Los certificados nuevos guardan título, temario y duración en `course_details` al emitirse. Cambiar el curso después no reescribe esa copia, incluidas sus casillas vacías. Los certificados anteriores a esta actualización, con copia nula, usan la configuración actual del curso, como antes sucedía con su título. Sus códigos, fechas, notas y firmas se conservan.

## QR

El QR aparece únicamente en el reverso y apunta al enlace individual existente `/certificado/verificar/{codigo-del-certificado}`. La ficha pública conserva titular, curso, código, nota y vigencia, y añade contenido y duración. Para emisiones nuevas se usa su copia de emisión. No se publican DNI, contactos ni imágenes de firmas. El enlace también se imprime como texto y es clicable en el PDF.

Las firmas usan rutas relativas del mismo servidor para funcionar con los distintos dominios y puertos locales. El QR creado en `127.0.0.1` permite revisar el certificado en esa computadora; una emisión desde el dominio publicado apunta a ese dominio.

## Demostración y validación

El temario de 23 puntos y subtemas de las imágenes se transcribió a `resources/data/certificate-height-course.txt` y se cargó en el curso DEMO de trabajo en altura. No sustituye los contenidos de cursos reales. La carga de demostración futura también lo utiliza en su primer curso.

El certificado existente de DEMO Ana se revisa en `/aula/certificado/10` desde su cuenta local. Por ser anterior al cambio, refleja la configuración del curso. La duración exacta del ejemplo queda pendiente de confirmación.

La impresión monta las hojas fuera de las áreas con scroll. Sus estilos se activan solo mientras se muestra un certificado y se retiran al navegar; no cambian la impresión de tickets o recibos. Las cabeceras/pies generales no alteran el documento y el QR conserva fondo blanco.

- `php tests/manual/certificate-details.php`: 45 comprobaciones, incluidas 31 de acceso. Copia virtual de emisión, conservación tras edición, compatibilidad anterior, información pública y validación de campos.
- `php tests/manual/in-person-certification.php`: 27 comprobaciones, incluidas copia de temario/duración y verificación pública después de editar el curso.
- Regresiones de firmas/vigencia, exámenes, cierre y carga DEMO.
- Chrome con acceso real del alumno: dos caras, documento, firmas cargadas, temario y QR solo en reverso. El QR decodificado coincide con el enlace de DEMO Ana.
- PDF real de dos páginas, con texto y contenido completos. Sin desbordamiento en impresión, también con título/nombre largos, seis firmas y 45 líneas. Vista a 390 px sin desbordamiento de página ni errores de ejecución. En celular las hojas se desplazan horizontalmente.

## Despliegue

Requiere `2026_11_05_000011_add_certificate_course_details.php`, aplicada en MySQL local. Agrega temario/duración al curso y copia de emisión a certificados virtuales/presenciales. Las columnas son opcionales y los valores anteriores se mantienen.

```bash
git pull origin main
php artisan migrate --force
php artisan optimize:clear
```

Recursos compilados incluidos en Git. Producción no verificada.


### Refinamiento del marco

El marco compartido se dibuja con SVG vectorial para pantalla e impresión y se aplica a ambas caras, también en el modelo administrativo. Se comprobó el PDF de dos páginas, nombres/títulos largos, seis firmas, 45 líneas de temario y vista móvil. Conserva el QR solo en el reverso y no agrega otra migración.
