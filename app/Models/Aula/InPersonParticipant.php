<?php

namespace App\Models\Aula;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InPersonParticipant extends Model
{
    protected $fillable = ['document_type', 'document_number', 'name', 'last_name', 'email', 'phone'];

    public function session(): BelongsTo
    {
        return $this->belongsTo(InPersonSession::class, 'in_person_session_id');
    }
}
