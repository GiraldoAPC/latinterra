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
- [ ] Configurar firmas reales de empresa e instructores por curso.
- [ ] Definir revocación y flujo de recertificación; el documento no responde la pregunta de revocación.
- [ ] Avisos de próximo vencimiento y recertificación.
- [ ] Validación visual de impresión/PDF y lectura del QR en un dispositivo real.

Los certificados anteriores no tienen nota guardada: se muestra «No registrada». No se reconstruyen notas históricas con contenidos que pudieron cambiar. Los cursos sin módulos evaluados tampoco reciben una nota inventada.

## Siguientes bloques

- Certificaciones presenciales: registro de participantes por QR/código de grupo, notas y firmas.
- Inventario: revisar cotización → venta, alertas de stock y auspicios al costo.
- Roles: administración, estudiante, instructor y coordinador; permisos de gerencia/administración.
- Pasarela y facturación SUNAT: etapas futuras según el checklist.

## Publicación

Esta entrega requiere ejecutar `php artisan migrate --force` en producción antes de activar el código y desplegar `public/build` junto con los archivos PHP. La migración agrega `expires_at` y `final_score` sin modificar registros existentes. No se ha ejecutado en producción; no hay un mecanismo de despliegue documentado en el repositorio.

La migración específica se aplicó en la base local. Se verificó sintaxis PHP, compilación y seis comprobaciones directas de fechas (límite exacto, aniversario bisiesto, preservación de emisión, fecha explícita y ausencia de fechas). Se agregaron pruebas para PHPUnit, pero no se ejecutaron porque las dependencias de desarrollo de PHP no están instaladas en este entorno.
