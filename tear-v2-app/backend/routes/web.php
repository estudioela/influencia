<?php

use Illuminate\Support\Facades\Route;

// Origem única para frontend e backend (ADR-015): o build do frontend
// (Vite → backend/public/build, ver frontend/vite.config.ts) é servido
// pelo Laravel para qualquer rota que não seja /api/*, /up ou um asset
// físico em public/ — essas são resolvidas antes de chegar aqui (rotas de
// API são registradas antes das de web, ver
// Illuminate\Foundation\Configuration\ApplicationBuilder::buildRoutingCallback;
// assets físicos são servidos direto pelo servidor web).
Route::get('/{any?}', function () {
    $index = public_path('build/index.html');

    abort_unless(file_exists($index), 404, 'Build do frontend não encontrado. Rode `npm run build` em frontend/.');

    return response(file_get_contents($index))->header('Content-Type', 'text/html');
})->where('any', '.*');
