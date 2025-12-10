<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'store',
        'discount',
        'image_url',
    ];

    // ACCESSOR CLAVE
    public function getImageUrlAttribute($value)
    {
        // Si existe imagen → devuelve URL completa
        if ($value) {
            return url($value);
        }

        // Imagen por defecto SIEMPRE
        return url('images/games/default.jpg');
    }
}
