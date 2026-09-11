<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Correlativo del documento segun su tipo: "LT-000001" para ticket interno
 * (via ReceiptNumber, compartido con cuotas/pedidos), o serie propia
 * "B001-00000001" / "F001-00000001" para boleta/factura simuladas.
 */
class DocumentNumber
{
    public static function next(string $documentType): string
    {
        return match ($documentType) {
            'boleta' => self::fromSequence('boleta_sequence', 'B001'),
            'factura' => self::fromSequence('factura_sequence', 'F001'),
            default => ReceiptNumber::next(),
        };
    }

    private static function fromSequence(string $table, string $series): string
    {
        $id = DB::table($table)->insertGetId(['created_at' => now()]);

        return $series . '-' . str_pad((string) $id, 8, '0', STR_PAD_LEFT);
    }
}
