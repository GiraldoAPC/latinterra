<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Catalogo generico para los selects fijos del sistema (tipo de documento,
 * genero, estado SCTR, ...), editable por el admin desde /admin/catalogos
 * en vez de estar hardcodeado en el codigo. Ver GROUPS para los grupos
 * conocidos y sus metadatos (label, si usa pattern/error_message).
 */
class SelectOption extends Model
{
    protected $fillable = [
        'group',
        'code',
        'label',
        'pattern',
        'error_message',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Grupos de catalogo conocidos por el sistema. `withPattern` indica si
     * ese grupo necesita los campos pattern/error_message (validacion de
     * formato) en el formulario del admin, o si solo es una lista simple.
     */
    public const GROUPS = [
        'document_type' => ['label' => 'Tipo de documento', 'withPattern' => true],
        'gender' => ['label' => 'Genero', 'withPattern' => false],
        'sctr_status' => ['label' => 'Estado SCTR', 'withPattern' => false],
    ];

    public function scopeGroup(Builder $query, string $group): Builder
    {
        return $query->where('group', $group);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('label');
    }

    /** Opciones activas de un grupo, listas para pasar a un <Select>. */
    public static function optionsFor(string $group): array
    {
        return static::group($group)->active()->ordered()->get()
            ->map(fn (self $o) => ['value' => $o->code, 'label' => $o->label])
            ->values()
            ->all();
    }

    /**
     * Valida un valor contra el pattern de la opcion (si tiene). Devuelve
     * null si es valido, o el mensaje de error si no cumple el formato.
     */
    public function validateValue(string $value): ?string
    {
        if (!$this->pattern) {
            return null;
        }

        $matches = @preg_match($this->pattern, $value);
        if ($matches === false) {
            return null; // regex invalido guardado por error: no bloquear
        }

        return $matches === 1 ? null : ($this->error_message ?: 'El valor no tiene un formato valido.');
    }
}
