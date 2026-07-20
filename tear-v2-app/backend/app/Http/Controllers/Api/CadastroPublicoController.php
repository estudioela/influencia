<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Parceira\StoreParceiraRequest;
use App\Http\Resources\ParceiraResource;
use App\Models\Parceira;

class CadastroPublicoController extends Controller
{
    public function store(StoreParceiraRequest $request): ParceiraResource
    {
        $parceira = Parceira::create($request->validated());

        return new ParceiraResource($parceira);
    }
}
