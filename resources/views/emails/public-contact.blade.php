<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Nuevo contacto web</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.5;">
    <h2 style="margin: 0 0 12px; color: #14264a;">Nuevo mensaje desde la web - Latin Terra</h2>

    <table cellpadding="8" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%; max-width: 700px;">
        <tr>
            <td style="font-weight: bold; width: 180px;">Nombre</td>
            <td>{{ $data['name'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Telefono</td>
            <td>{{ $data['phone'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Correo</td>
            <td>{{ $data['email'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Empresa</td>
            <td>{{ $data['company'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Segmento</td>
            <td>{{ $data['segment'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold;">Categoria</td>
            <td>{{ $data['topic'] ?? '-' }}</td>
        </tr>
        <tr>
            <td style="font-weight: bold; vertical-align: top;">Mensaje</td>
            <td>{!! nl2br(e($data['message'] ?? '-')) !!}</td>
        </tr>
    </table>
</body>
</html>
