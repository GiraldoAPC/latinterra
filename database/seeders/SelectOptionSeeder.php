<?php

namespace Database\Seeders;

use App\Models\SelectOption;
use Illuminate\Database\Seeder;

class SelectOptionSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            // Tipo de documento
            ['group' => 'document_type', 'code' => 'dni', 'label' => 'DNI', 'pattern' => '/^\d{8}$/', 'error_message' => 'El DNI debe tener exactamente 8 digitos.', 'sort_order' => 1],
            ['group' => 'document_type', 'code' => 'ce', 'label' => 'Carne de extranjeria', 'pattern' => '/^[A-Za-z0-9]{6,20}$/', 'error_message' => 'El carne de extranjeria debe tener entre 6 y 20 caracteres alfanumericos.', 'sort_order' => 2],
            ['group' => 'document_type', 'code' => 'pasaporte', 'label' => 'Pasaporte', 'pattern' => '/^[A-Za-z0-9]{5,20}$/', 'error_message' => 'El pasaporte debe tener entre 5 y 20 caracteres alfanumericos.', 'sort_order' => 3],
            ['group' => 'document_type', 'code' => 'ruc', 'label' => 'RUC', 'pattern' => '/^\d{11}$/', 'error_message' => 'El RUC debe tener exactamente 11 digitos.', 'sort_order' => 4],

            // Genero
            ['group' => 'gender', 'code' => 'm', 'label' => 'Masculino', 'sort_order' => 1],
            ['group' => 'gender', 'code' => 'f', 'label' => 'Femenino', 'sort_order' => 2],
            ['group' => 'gender', 'code' => 'otro', 'label' => 'Otro', 'sort_order' => 3],

            // Estado SCTR
            ['group' => 'sctr_status', 'code' => 'vigente', 'label' => 'Vigente', 'sort_order' => 1],
            ['group' => 'sctr_status', 'code' => 'no_vigente', 'label' => 'No vigente', 'sort_order' => 2],
            ['group' => 'sctr_status', 'code' => 'no_aplica', 'label' => 'No aplica', 'sort_order' => 3],
        ];

        foreach ($rows as $row) {
            SelectOption::updateOrCreate(['group' => $row['group'], 'code' => $row['code']], $row);
        }
    }
}
