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

    public function getImageUrlAttribute($value)
{
    // (Firebase)
    if ($value && str_starts_with($value, 'http')) {
        return $value;
    }

    // Si es ruta local
    if ($value) {
        return asset($value);
    }

    // Imagen por defecto
    return asset('images/default.jpg');
}

}
