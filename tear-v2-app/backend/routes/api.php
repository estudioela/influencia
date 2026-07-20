<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CadastroPublicoController;
use App\Http\Controllers\Api\ParceiraController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
    ]);
});

Route::post('/login', [AuthController::class, 'login']);

Route::post('/parceiras/cadastro', [CadastroPublicoController::class, 'store'])
    ->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::patch('/parceiras/{parceira}/aprovar', [ParceiraController::class, 'aprovar'])
        ->middleware('role:ADMIN');

    Route::apiResource('parceiras', ParceiraController::class)->except(['destroy']);
});
