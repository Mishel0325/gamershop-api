<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    // Listar comentarios de un producto
    public function index($productId)
    {
        return Comment::where('product_id', $productId)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Crear comentario
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'content' => 'required|string|max:200',
        ]);

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'content' => $request->content,
        ]);

        return response()->json([
            'message' => 'Comentario agregado',
            'comment' => $comment
        ], 201);
    }
}
