<?php

namespace App\Services;

use App\Models\Ventas\Quote;
use App\Models\Ventas\Product;
use App\Models\Ventas\OtherPayment;
use App\Models\Ventas\SaleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QuoteOperations
{
    public function create(array $data, int $adminId): Quote
    {
        return DB::transaction(function () use ($data, $adminId) {
            $items = []; $totalCents = 0; $seen = [];
            foreach ($data['items'] as $row) {
                $product = Product::active()->findOrFail($row['product_id']);
                if (isset($seen[$product->id])) {
                    throw ValidationException::withMessages(['items' => 'Agrega cada producto una sola vez y ajusta su cantidad.']);
                }
                $seen[$product->id] = true;
                $cents = (int) round((float) $row['unit_price'] * 100);
                $qty = (int) $row['qty'];
                if ($cents < 0 || $qty < 1) {
                    throw ValidationException::withMessages(['items' => 'Revisa cantidades y precios.']);
                }
                $totalCents += $cents * $qty;
                $items[] = ['product_id' => $product->id, 'name' => $product->name, 'qty' => $qty, 'unit_price' => $cents / 100];
            }
            if ($totalCents > 9999999999 || !$items) {
                throw ValidationException::withMessages(['items' => 'La cotización no tiene productos o supera el importe permitido.']);
            }

            return Quote::create([
                'code' => 'COT-'.strtoupper(Str::random(12)), 'buyer_name' => $data['buyer_name'],
                'buyer_document' => $data['buyer_document'] ?? null, 'valid_until' => $data['valid_until'] ?? null,
                'buyer_email' => $data['buyer_email'] ?? null,
                'notes' => $data['notes'] ?? null, 'items' => $items, 'amount' => $totalCents / 100,
                'registered_by' => $adminId, 'status' => 'draft',
            ]);
        });
    }

    public function approve(Quote $quote, int $adminId): void
    {
        DB::transaction(function () use ($quote, $adminId) {
            $locked = Quote::whereKey($quote->id)->lockForUpdate()->firstOrFail();
            if ($locked->status !== 'draft' || $locked->isExpired()) {
                throw ValidationException::withMessages(['quote' => 'Solo puedes aprobar una cotización pendiente y vigente.']);
            }
            $locked->update(['status' => 'approved', 'approved_by' => $adminId, 'approved_at' => now()]);
        });
    }

    public function cancel(Quote $quote): void
    {
        DB::transaction(function () use ($quote) {
            $locked = Quote::whereKey($quote->id)->lockForUpdate()->firstOrFail();
            if (!in_array($locked->status, ['draft', 'approved'], true)) {
                throw ValidationException::withMessages(['quote' => 'La cotización ya fue cancelada o convertida en venta.']);
            }
            $locked->update(['status' => 'cancelled']);
        });
    }

    public function sell(Quote $quote, array $paymentData, int $adminId): OtherPayment
    {
        return DB::transaction(function () use ($quote, $paymentData, $adminId) {
            $locked = Quote::whereKey($quote->id)->lockForUpdate()->firstOrFail();
            if ($locked->other_payment_id) return $locked->payment;
            if ($locked->status !== 'approved' || $locked->isExpired()) {
                throw ValidationException::withMessages(['quote' => 'Aprueba una cotización vigente antes de registrar su venta.']);
            }
            $products = Product::whereIn('id', collect($locked->items)->pluck('product_id'))->orderBy('id')->lockForUpdate()->get()->keyBy('id');
            foreach ($locked->items as $item) {
                $product = $products->get($item['product_id']);
                if (!$product || !$product->is_active || ($product->tracksStock() && $product->stock < $item['qty'])) {
                    throw ValidationException::withMessages(['quote' => 'No hay stock de ventas suficiente o un producto fue desactivado. Revisa el inventario antes de vender.']);
                }
            }
            $payment = OtherPayment::register([
                'type' => 'producto', 'document_type' => 'ticket', 'concept' => 'Venta de cotización '.$locked->code,
                'description' => collect($locked->items)->map(fn ($item) => $item['qty'].' x '.$item['name'].' (S/ '.number_format($item['unit_price'], 2).' c/u)')->implode("\n"),
                'amount' => $locked->amount, 'buyer_name' => $locked->buyer_name,
                'payment_method' => $paymentData['payment_method'], 'payment_reference' => $paymentData['payment_reference'] ?? null,
                'registered_by' => $adminId,
            ]);
            foreach ($locked->items as $item) {
                $product = $products->get($item['product_id']);
                SaleItem::create($item + ['other_payment_id' => $payment->id, 'unit_cost' => $product->avg_cost]);
                if ($product->tracksStock()) {
                    $product->stock -= $item['qty']; $product->save();
                }
            }
            $locked->update(['status' => 'sold', 'other_payment_id' => $payment->id]);

            return $payment;
        });
    }
}
