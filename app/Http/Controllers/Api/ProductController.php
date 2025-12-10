<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // =========================
    // LISTADO + FILTROS (PÚBLICO)
    // =========================
    public function index(Request $request)
    {
        $query = Product::query();

        // 🔍 BUSCAR POR NOMBRE
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 🏪 FILTRAR POR TIENDA
        if ($request->filled('store')) {
            $query->where('store', $request->store);
        }

        // 🔥 SOLO OFERTAS
        if ($request->boolean('offer')) {
            $query->where('discount', '>', 0);
        }

        // 💲 ORDENAR POR PRECIO
        if (in_array($request->order, ['asc', 'desc'])) {
            $query->orderBy('price', $request->order);
        } else {
            $query->orderBy('id', 'asc');
        }

        // 📦 PAGINACIÓN
        return $query->paginate(20);
    }

    // =========================
    // FUNCIÓN AUXILIAR (ADMIN)
    // =========================
    private function checkAdmin(Request $request)
{
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json([
            'message' => 'Token requerido'
        ], 401);
    }

    $user = User::where('api_token', $token)->first();

    if (!$user) {
        return response()->json([
            'message' => 'Token inválido'
        ], 401);
    }

    if ($user->role !== 'admin') {
        return response()->json([
            'message' => 'Acceso denegado: solo administradores'
        ], 403);
    }

    return $user;
}

    // =========================
    // CREAR PRODUCTO (ADMIN)
    // =========================
    public function store(Request $request)
    {
        $this->checkAdmin($request);

        $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'price'       => 'required|numeric',
            'store'       => 'required|string',
            'discount'    => 'nullable|integer|min:0|max:100',
            'image_url'   => 'nullable|string',
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'message' => 'Producto creado correctamente',
            'product' => $product
        ], 201);
    }

    // =========================
    // ACTUALIZAR PRODUCTO (ADMIN)
    // =========================
    public function update(Request $request, Product $product)
    {
        $this->checkAdmin($request);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric',
            'store'       => 'sometimes|string',
            'discount'    => 'sometimes|integer|min:0|max:100',
            'image_url'   => 'sometimes|string',
        ]);

        $product->update($request->all());

        return response()->json([
            'message' => 'Producto actualizado correctamente',
            'product' => $product
        ]);
    }

    // =========================
    // ELIMINAR PRODUCTO (ADMIN)
    // =========================
    public function destroy(Request $request, Product $product)
    {
        $this->checkAdmin($request);

        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente'
        ]);
    }
}
