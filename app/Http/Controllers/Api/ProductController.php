<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        // 🔍 Buscar por nombre
        if ($request->filled('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        // 💰 Ordenar por precio
        if ($request->filled('order')) {
            $query->orderBy('price', $request->order); // asc | desc
        }

        // 🔥 Solo ofertas
        if ($request->boolean('offer')) {
            $query->whereNotNull('discount')
                  ->where('discount', '>', 0);
        }

        return response()->json(
            $query->paginate(20)
        );
    }
}


