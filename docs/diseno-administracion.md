# Diseño compartido del panel administrativo

Referencia aprobada: pantalla de cotizaciones, con azul `#024A7D` y celeste `#00ADEE`. Usar esta base en los registros y tablas del proyecto. No crear una variante visual independiente para cada módulo.

## Componentes

Archivo: `resources/js/Components/Admin/AdminPage.jsx`.

- `AdminPageHeader`: título, descripción, icono centrado, ondas decorativas y acciones. Los botones se adaptan al ancho del celular.
- `AdminIcon`: contenedor e icono centrados explícitamente en ambos ejes. Usarlo también dentro de encabezados de modales; `small` reduce su tamaño.
- `AdminPanel`: superficie blanca, borde suave, esquinas redondeadas y sombra del listado.
- `AdminEmptyState`: icono, mensaje y acción para crear el primer registro.
- `AdminFormModal`: formulario de registro con encabezado común, área desplazable, errores en el formulario y cierre bloqueado durante el envío.
- `adminInput` y `adminPrimaryButton`: estilos para controles y acciones cuando se necesiten clases explícitas.

Los listados deben mostrar una acción «Nuevo…», abrir el registro en modal y conservar la tabla visible debajo. Mantener la validación del servidor y cerrar el modal solo después de guardar correctamente. Los formularios complejos por etapas, como la edición de contenido de un curso, conservan su navegación y usan la misma base visual.

## Estilos compartidos y alcance

`resources/css/admin-design.css` unifica tablas nativas y componentes `Table`, campos, botones, tarjetas y modales. Se activa desde `AdminLayout` con la clase `lt-admin-design` en el cuerpo, por lo que también alcanza los modales que se renderizan en portales. Se retira al salir del panel.

Los componentes `Button`, `Card` y `Dialog` exponen atributos `data-ui` para aplicar el estilo sin depender de su contenido. Los botones destructivos conservan el rojo y los controles deshabilitados conservan su comportamiento.

La temática se limita a pantallas administrativas. Los recibos, fichas, récord de notas y certificados imprimibles mantienen su formato; los estilos compartidos solo se aplican en pantalla, nunca en impresión. El sitio público y el aula del estudiante conservan su diseño.

Aplicado a cabeceras de cotizaciones, productos, categorías, marcas, clientes, proveedores, movimientos, cursos, estudiantes, ventas, pedidos, catálogos, configuración, certificados, presenciales y roles. Presenciales, auspicios y creación de personal usan registro en modal; sus listados mantienen las acciones y restricciones existentes.

Esta entrega no requiere migraciones ni modifica los contratos de las rutas del servidor.
