<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MeetingDemo;
use Illuminate\Console\Command;

class PrepareMeetingDemo extends Command
{
    protected $signature = 'demo:preparar {--admin= : Correo del administrador que registra los datos} {--almacen : Activar modo almacén para presentar compras y transferencias}';
    protected $description = 'Carga una demostración identificada como DEMO sin borrar datos ni duplicar la carga';

    public function handle(MeetingDemo $demo): int
    {
        $actor = User::where('role', 'admin')->where('is_active', true)
            ->when($this->option('admin'), fn ($q, $email) => $q->where('email', $email))->orderBy('id')->first();
        if (!$actor) {
            $this->error('Se necesita una cuenta administradora activa existente. No se crearán administradores automáticamente.');
            return self::FAILURE;
        }
        try { $result = $demo->prepare($actor, (bool) $this->option('almacen')); }
        catch (\Throwable $error) { report($error); $this->error($error->getMessage()); return self::FAILURE; }
        $this->info($result['created'] ? 'Demostración cargada.' : 'La demostración ya estaba cargada; no se duplicó ni se reinició.');
        $this->line('Entorno: '.app()->environment().' | Conexión: '.config('database.default'));
        $this->table(['Módulo', 'Registros DEMO'], collect($result['counts'])->map(fn ($count, $label) => [$label, $count])->all());
        if ($result['password']) {
            $this->line('Contraseña inicial de las cuentas DEMO creadas: '.$result['password']);
            $this->line('No se modificaron contraseñas de cuentas anteriores. Guarda esta contraseña; no se almacena en texto plano.');
        }
        $this->line('Alumno para mostrar el aula: alumno01@demo.latinterra.test (DNI 99000001).');
        $this->line('Personal: instructor@demo.latinterra.test y coordinacion@demo.latinterra.test.');
        $this->line('Modo almacén: '.(\App\Models\Setting::bool('warehouse_mode') ? 'activo' : 'inactivo'));
        $this->line('Datos ficticios incluidos en reportes. No se enviaron correos ni se registraron pagos externos. Guion: docs/demo-reunion.md');
        return self::SUCCESS;
    }
}
