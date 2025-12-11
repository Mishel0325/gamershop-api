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

        // Juegos base con IMÁGENES DE FIREBASE
        $games = [
            'God of War' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/god-of-war.jpg?alt=media',
            'Elden Ring' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/elden-ring.jpg?alt=media',
            'Red Dead Redemption 2' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/red-dead-2.jpg?alt=media',
            'Cyberpunk 2077' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/cyberpunk-2077.jpg?alt=media',
            'The Witcher 3' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/witcher-3.jpg?alt=media',
            'GTA V' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/gta-v.jpg?alt=media',
            'Resident Evil 4' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/resident-evil-4.jpg?alt=media',
            'Sekiro' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/sekiro.jpg?alt=media',
            'Hogwarts Legacy' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/hogwarts-legacy.jpg?alt=media',
            'Assassins Creed Valhalla' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/ac-valhalla.jpg?alt=media',
            'Dark Souls III' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/dark-souls-3.jpg?alt=media',
            'DOOM Eternal' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/doom-eternal.jpg?alt=media',
            'Forza Horizon 5' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/forza-horizon-5.jpg?alt=media',
            'Halo Infinite' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/halo-infinite.jpg?alt=media',
            'Mortal Kombat 1' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/mortal-kombat-1.jpg?alt=media',
            'The Witcher 3' => 'https://firebasestorage.googleapis.com/v0/b/gamer-shop-5c45e.firebasestorage.app/o/Witcher_3_cover.jpg?alt=media&token=a9e17f3a-9d11-4148-b09a-3bbcbd15a95b',
        ];

        $stores = ['Steam', 'Epic', 'GOG'];
        $i = 1;

        // Generar EXACTAMENTE 200 juegos
        while ($i <= 200) {
            foreach ($games as $name => $imageUrl) {

                if ($i > 200) break;

                Product::create([
                    'name' => "{$name} Edition #{$i}",
                    'description' => "Edición digital de {$name} disponible en tienda oficial.",
                    'price' => number_format(rand(1000, 7000) / 100, 2),
                    'store' => $stores[array_rand($stores)],
                    'discount' => rand(0, 1) ? rand(10, 70) : 0,

                    // Imagen desde Firebase
                    'image_url' => $imageUrl,
                ]);

                $i++;
            }
        }
    }
}
