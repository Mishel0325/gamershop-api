<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar tabla
        Product::truncate();

        // Juegos base con IMÁGENES LOCALES
        // Estas rutas existen en: public/images/games/
        $games = [
            'God of War' => 'images/games/god-of-war.jpg',
            'Elden Ring' => 'images/games/elden-ring.jpg',
            'Red Dead Redemption 2' => 'images/games/red-dead-2.jpg',
            'Cyberpunk 2077' => 'images/games/cyberpunk-2077.jpg',
            'The Witcher 3' => 'images/games/witcher-3.jpg',
            'GTA V' => 'images/games/gta-v.jpg',
            'Resident Evil 4' => 'images/games/resident-evil-4.jpg',
            'Sekiro' => 'images/games/sekiro.jpg',
            'Hogwarts Legacy' => 'images/games/hogwarts-legacy.jpg',
            'Assassins Creed Valhalla' => 'images/games/ac-valhalla.jpg',
            'Dark Souls III' => 'images/games/dark-souls-3.jpg',
            'DOOM Eternal' => 'images/games/doom-eternal.jpg',
            'Forza Horizon 5' => 'images/games/forza-horizon-5.jpg',
            'Halo Infinite' => 'images/games/halo-infinite.jpg',
            'Mortal Kombat 1' => 'images/games/mortal-kombat-1.jpg',
        ];

        $stores = ['Steam', 'Epic', 'GOG'];
        $i = 1;

        // Generar EXACTAMENTE 200 juegos
        while ($i <= 200) {
            foreach ($games as $name => $imagePath) {

                if ($i > 200) break;

                Product::create([
                    'name' => "{$name} Edition #{$i}",
                    'description' => "Edición digital de {$name} disponible en tienda oficial.",
                    'price' => number_format(rand(1000, 7000) / 100, 2), // 10.00 – 70.00
                    'store' => $stores[array_rand($stores)],
                    'discount' => rand(0, 1) ? rand(10, 70) : 0,

                    // Si la imagen NO existe, usa default.jpg
                    'image_url' => file_exists(public_path($imagePath))
                        ? $imagePath
                        : 'images/games/default.jpg',
                ]);

                $i++;
            }
        }
    }
}
