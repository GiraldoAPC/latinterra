<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Config general de la app tipo llave-valor (ej. modo almacen). */
class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function get(string $key, $default = null)
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = static::get($key);

        return $value === null ? $default : in_array($value, ['1', 'true'], true);
    }
}
