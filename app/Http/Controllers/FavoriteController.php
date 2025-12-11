<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index($user_id)
    {
        return Favorite::where('user_id', $user_id)->pluck('product_id');
    }

    public function store(Request $request)
    {
        return Favorite::firstOrCreate([
            'user_id' => $request->user_id,
            'product_id' => $request->product_id
        ]);
    }

    public function destroy(Request $request)
    {
        Favorite::where('user_id', $request->user_id)
            ->where('product_id', $request->product_id)
            ->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}

