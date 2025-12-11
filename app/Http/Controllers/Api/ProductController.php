<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    // ========================================================
    // LISTADO + FILTROS (PÚBLICO)
    // ========================================================
    public function index(Request $request)
    {
        $query = Product::query();

        /* =========================
         * 🔍 BUSCAR POR NOMBRE
         * ========================= */
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        /* =========================
         * 🏪 FILTRAR POR TIENDA
         * (Steam, Epic o GOG)
         * ========================= */
        if ($request->filled('store')) {
            $query->where('store', $request->store);
        }

        /* =========================
         * 🔥 SOLO OFERTAS
         * ========================= */
        if ($request->boolean('offer')) {
            $query->where('discount', '>', 0);
        }

        /* =========================
         * 💲 ORDENAR POR PRECIO
         * (asc = menor→mayor, desc = mayor→menor)
         * ========================= */
        if ($request->filled('order')) {

            if ($request->order === 'asc') {
                $query->orderBy('price', 'asc');
            }

            if ($request->order === 'desc') {
                $query->orderBy('price', 'desc');
            }

        } else {
            // Orden por defecto
            $query->orderBy('id', 'asc');
        }

        /* =========================
         * 📦 PAGINACIÓN
         * ========================= */
        $perPage = $request->input('per_page', 20);
        return $query->paginate($perPage);
    }

    // ========================================================
    // VALIDACIÓN DE ADMIN
    // ========================================================
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

    // ========================================================
    // CREAR PRODUCTO
    // ========================================================
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

    // ========================================================
    // ACTUALIZAR PRODUCTO
    // ========================================================
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

    // ========================================================
    // ELIMINAR PRODUCTO
    // ========================================================
    public function destroy(Request $request, Product $product)
    {
        $this->checkAdmin($request);

        $product->delete();

        return response()->json([
            'message' => 'Producto eliminado correctamente'
        ]);
    }

    // ========================================================
    // LISTAR IMÁGENES
    // ========================================================
    public function listImages()
    {
        $imagesPath = public_path('images/games');

        if (!is_dir($imagesPath)) {
            return response()->json([
                'images' => []
            ]);
        }

        $files = scandir($imagesPath);
        $images = [];

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;

            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $images[] = [
                    'name' => $file,
                    'url'  => url('images/games/' . $file)
                ];
            }
        }

        return response()->json([
            'images' => $images
        ]);
    }
}