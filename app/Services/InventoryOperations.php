<?php

namespace App\Services;

use App\Models\Inventario\StockSponsorship;
use App\Models\Ventas\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryOperations
{
    public function sponsor(array $data, int $adminId): StockSponsorship
    {
        return DB::transaction(function () use ($data, $adminId) {
            $product = Product::whereKey($data['product_id'])->lockForUpdate()->firstOrFail();
            if ($existing = StockSponsorship::where('request_key', $data['request_key'])->first()) {
                if ($existing->registered_by !== $adminId || $existing->product_id !== $product->id
                    || $existing->quantity !== (int) $data['quantity'] || $existing->source !== $data['source']
                    || $existing->recipient !== $data['recipient'] || $existing->notes !== $data['notes']) {
                    throw ValidationException::withMessages(['request_key' => 'La solicitud ya fue utilizada. Recarga el formulario.']);
                }
                return $existing;
            }
            $qty = (int) $data['quantity'];
            if (!$product->is_active || ($data['source'] === 'sales' && !$product->tracksStock()) || $product->avg_cost === null) {
                throw ValidationException::withMessages(['product_id' => 'El producto debe estar activo, tener control de stock y un costo de compra registrado.']);
            }
            if (!in_array($data['source'], ['sales', 'warehouse'], true) || ($data['source'] === 'warehouse' && !Setting::bool('warehouse_mode'))) {
                throw ValidationException::withMessages(['source' => 'El almacén no está habilitado. Selecciona stock de ventas.']);
            }
            $column = $data['source'] === 'warehouse' ? 'stock_warehouse' : 'stock';
            if ($qty < 1 || $qty > ($product->$column ?? 0)) {
                throw ValidationException::withMessages(['quantity' => 'No hay stock suficiente en la ubicación seleccionada.']);
            }
            $totalCents = (int) round((float) $product->avg_cost * 100) * $qty;
            if ($totalCents > 9999999999) {
                throw ValidationException::withMessages(['quantity' => 'El costo total supera el límite permitido.']);
            }
            $record = StockSponsorship::create([
                'product_id' => $product->id, 'product_name' => $product->name,
                'recipient' => $data['recipient'], 'source' => $data['source'], 'quantity' => $qty,
                'unit_cost' => $product->avg_cost, 'total_cost' => $totalCents / 100,
                'notes' => $data['notes'], 'request_key' => $data['request_key'], 'registered_by' => $adminId,
            ]);
            $product->$column -= $qty;
            $product->save();

            return $record;
        });
    }
}
