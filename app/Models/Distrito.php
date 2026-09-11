<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Distrito extends Model
{
    public $timestamps = false;
    protected $fillable = ['provincia_id', 'nombre'];

    public function provincia(): BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }
}
