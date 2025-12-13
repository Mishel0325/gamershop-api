<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\FavoriteController;

/*AUTENTICACIÓN (PÚBLICO)*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/logout',   [AuthController::class, 'logout']);
Route::get('/me',        [AuthController::class, 'me']);

/*PRODUCTOS (PÚBLICO)*/
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

/*
 PRODUCTOS (ADMIN)*/
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{product}', [ProductController::class, 'update']);
Route::delete('/products/{product}', [ProductController::class, 'destroy']);

/*IMÁGENES (PÚBLICO)*/
Route::get('/images', [ProductController::class, 'listImages']);

/*FAVORITOS*/
Route::get('/favorites/{user_id}', [FavoriteController::class, 'index']);
Route::post('/favorites', [FavoriteController::class, 'store']);
Route::delete('/favorites', [FavoriteController::class, 'destroy']);

/* COMENTARIOS*/
Route::post('/comments', [CommentController::class, 'store']);
Route::get('/comments/{product_id}', [CommentController::class, 'index']);