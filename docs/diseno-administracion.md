# Diseño compartido del sistema

Referencia aprobada: pantalla de cotizaciones, con azul `#024A7D` y celeste `#00ADEE`. Usar esta base en los registros y tablas del proyecto. No crear una variante visual independiente para cada módulo.

## Componentes

Archivo principal: `resources/js/Components/Shared/PageDesign.jsx`. `resources/js/Components/Admin/AdminPage.jsx` conserva los nombres anteriores como alias compatibles.

- `PageHeader`: título, descripción, icono centrado, ondas decorativas y acciones. Los botones se adaptan al ancho del celular.
- `PageIcon`: contenedor e icono centrados explícitamente en ambos ejes. Usarlo también dentro de encabezados de modales; `small` reduce su tamaño.
- `Surface`: superficie blanca, borde suave, esquinas redondeadas y sombra del listado.
- `EmptyState`: icono, mensaje y acción para crear el primer registro.
- `FormModal`: formulario de registro con encabezado común, área desplazable, errores en el formulario y cierre bloqueado durante el envío.
- `inputClass` y `primaryButtonClass`: estilos para controles y acciones cuando se necesiten clases explícitas.

Los listados deben mostrar una acción «Nuevo…», abrir el registro en modal y conservar la tabla visible debajo. Mantener la validación del servidor y cerrar el modal solo después de guardar correctamente. Los formularios complejos por etapas, como la edición de contenido de un curso, conservan su navegación y usan la misma base visual.

## Estilos compartidos y alcance

`resources/css/admin-design.css` unifica tablas nativas y componentes `Table`, campos, botones, tarjetas y modales. Se activa desde `app.jsx` con la clase `lt-app-design` en el cuerpo, por lo que también alcanza los modales y selectores que se renderizan en portales. Abarca administración, aula, panel académico, acceso, perfil y formularios públicos. El sitio público conserva sus contenidos y composiciones comerciales, con superficies y controles de la misma familia visual.

Los componentes `Button`, `Card` y `Dialog` exponen atributos `data-ui` para aplicar el estilo sin depender de su contenido. Los botones destructivos conservan el rojo y los controles deshabilitados conservan su comportamiento.

Los recibos, fichas, récord de notas y certificados imprimibles mantienen su formato. Sus páginas usan `lt-document-page`, y los estilos compartidos solo se aplican en pantalla, nunca en impresión.

Aplicado a cabeceras de cotizaciones, productos, categorías, marcas, clientes, proveedores, movimientos, cursos, estudiantes, ventas, pedidos, catálogos, configuración, certificados, presenciales y roles. Presenciales, auspicios y creación de personal usan registro en modal; sus listados mantienen las acciones y restricciones existentes.

La continuación completa las cabeceras de creación/edición de cursos y estudiantes, perfiles de estudiante y alumno, detalles de cotización y grupo, panel académico, exámenes, catálogo y cursos del alumno, acceso y perfil de cuenta. El dashboard muestra [resultados dinámicos](dashboard-resultados.md), con cobros, tendencias y pendientes operativos. Los listados académicos y de certificados usan tablas; firmas, correo/pago de cotización, correcciones/evaluación presencial y asignación docente usan modales compartidos.

## Selectores

Usar `SmartSelect` de `resources/js/Components/ui/smart-select.jsx` con `options`, `value` y `onValueChange`. Incluye menú propio, opción activa/seleccionada, búsqueda sin distinción de tildes para listas de más de seis opciones, estado sin resultados, opciones deshabilitadas y navegación por teclado. `searchable` permite exigir búsqueda en listas pequeñas, como países y cursos. El menú se limita al espacio disponible y admite desplazamiento en celular.

`NativeSelect` es un adaptador compatible con los antiguos hijos `<option>` y callbacks `onChange(event.target.value)`; `select.jsx` conserva la API compuesta `Select`/`SelectTrigger`/`SelectContent`/`SelectItem`. Ambos renderizan el mismo componente. No introducir selectores visibles del navegador: el único `<select>` existente está oculto dentro de `SmartSelect` para conservar `required`, envío mediante `FormData`, autofill y reinicio del formulario. Países, ubigeo y requisito de curso también usan esta implementación.

Escape cierra primero el menú y conserva el formulario padre. Tab avanza al siguiente control. Se mantienen identificadores, valores y restricciones del servidor; las búsquedas filtran opciones que el usuario ya puede ver.

## Verificación local

Chrome con datos ficticios: 29 pantallas a 1440 y 390 px (58 vistas), sin excepciones ni desbordamiento horizontal de página. Nueve comprobaciones funcionales del selector: validación obligatoria, filtro sin tildes, actualización de producto/precio, apertura con flechas, Escape/foco, compatibilidad de la API anterior, país, cuenta deshabilitada y serialización/reinicio del formulario público. Comprobaciones adicionales de menú móvil, búsqueda vacía, identificación del producto y avance con Tab; apertura/cierre de seis modales adicionales. No se enviaron formularios ni correos reales. Compilación de producción incluida. Pendiente únicamente la comprobación del despliegue en el servidor de producción y pruebas con lectores de pantalla/dispositivos físicos.

Esta entrega no requiere migraciones ni modifica los contratos de las rutas del servidor.
