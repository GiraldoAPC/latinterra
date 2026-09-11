<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaisSeeder extends Seeder
{
    public function run(): void
    {
        $paises = json_decode(file_get_contents(database_path('data/ubigeo/paises.json')), true);

        DB::table('paises')->delete();

        $rows = [];
        foreach ($paises as $codigo => $nombre) {
            $rows[] = ['codigo' => $codigo, 'nombre' => $nombre];
        }
        DB::table('paises')->insert($rows);

        $this->command?->info(count($rows) . ' paises sembrados.');
    }
}
