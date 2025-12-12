<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\Api\CommentController;


// =====================
// COMENTARIOS (PÚBLICO y AUTENTICADO)
// =====================

Route::middleware('auth:sanctum')->post('/comments', [CommentController::class, 'store']);
Route::get('/comments/{product}', [CommentController::class, 'index']);

// =====================
// AUTENTICACIÓN (PÚBLICO)
// =====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// =====================
// USUARIO AUTENTICADO (token manual)
// =====================
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

// =====================
// PRODUCTOS (PÚBLICO)
// =====================
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// =====================
// IMÁGENES (PÚBLICO)
// =====================
Route::get('/images', [ProductController::class, 'listImages']);

// =====================
// PRODUCTOS (ADMIN - validación en controller)
// =====================
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{product}', [ProductController::class, 'update']);
Route::delete('/products/{product}', [ProductController::class, 'destroy']);

// =====================
// FAVORITOS 
// =====================

Route::get('/favorites/{user_id}', [FavoriteController::class, 'index']);
Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites', [FavoriteController::class, 'destroy']);
