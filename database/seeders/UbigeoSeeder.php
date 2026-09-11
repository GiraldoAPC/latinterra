<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Llena departamentos/provincias/distritos a partir de los JSON en
 * database/data/ubigeo/ (dataset publico de ubigeos-peru, con Callao
 * agregado a mano porque ese dataset especifico no lo trae). Mapea los
 * id_ubigeo del dataset a ids autoincrementales propios via $deptMap/$provMap.
 */
class UbigeoSeeder extends Seeder
{
    public function run(): void
    {
        $base = database_path('data/ubigeo');
        $departamentos = json_decode(file_get_contents($base . '/departamentos.json'), true);
        $provincias = json_decode(file_get_contents($base . '/provincias.json'), true);
        $distritos = json_decode(file_get_contents($base . '/distritos.json'), true);

        DB::table('distritos')->delete();
        DB::table('provincias')->delete();
        DB::table('departamentos')->delete();

        $deptMap = []; // id_ubigeo (dataset) => id real en la tabla
        foreach ($departamentos as $d) {
            $id = DB::table('departamentos')->insertGetId(['nombre' => $d['nombre_ubigeo']]);
            $deptMap[$d['id_ubigeo']] = $id;
        }

        $provMap = [];
        foreach ($provincias as $deptUbigeoId => $rows) {
            if (!isset($deptMap[$deptUbigeoId])) {
                continue;
            }
            foreach ($rows as $p) {
                $id = DB::table('provincias')->insertGetId([
                    'departamento_id' => $deptMap[$deptUbigeoId],
                    'nombre' => $p['nombre_ubigeo'],
                ]);
                $provMap[$p['id_ubigeo']] = $id;
            }
        }

        $buffer = [];
        foreach ($distritos as $provUbigeoId => $rows) {
            if (!isset($provMap[$provUbigeoId])) {
                continue;
            }
            foreach ($rows as $d) {
                $buffer[] = [
                    'provincia_id' => $provMap[$provUbigeoId],
                    'nombre' => $d['nombre_ubigeo'],
                ];
                if (count($buffer) >= 500) {
                    DB::table('distritos')->insert($buffer);
                    $buffer = [];
                }
            }
        }
        if ($buffer) {
            DB::table('distritos')->insert($buffer);
        }

        $this->command?->info(sprintf(
            'Ubigeo: %d departamentos, %d provincias, %d distritos.',
            count($deptMap),
            count($provMap),
            DB::table('distritos')->count()
        ));
    }
}
