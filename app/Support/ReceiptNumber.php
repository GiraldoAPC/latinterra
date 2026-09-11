<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/** Correlativo unico "LT-000001" para cualquier ticket interno del sistema. */
class ReceiptNumber
{
    public static function next(): string
    {
        $id = DB::table('receipt_sequence')->insertGetId(['created_at' => now()]);

        return 'LT-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}
