<?php

namespace App\Models;

use Database\Factories\BriefingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'participacao_id',
    'tipo',
    'orientacoes',
    'prazo',
    'referencias',
    'entregaveis_esperados',
    'observacoes',
])]
class Briefing extends Model
{
    /** @use HasFactory<BriefingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'prazo' => 'date',
            'referencias' => 'array',
        ];
    }

    public function participacao(): BelongsTo
    {
        return $this->belongsTo(ParticipacaoNaCampanha::class, 'participacao_id');
    }
}
