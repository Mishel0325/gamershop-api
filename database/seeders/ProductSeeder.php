<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Juegos base con portadas REALES
        $games = [
            'God of War' => 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg',
            'Elden Ring' => 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
            'Red Dead Redemption 2' => 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
            'Cyberpunk 2077' => 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
            'The Witcher 3' => 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
            'GTA V' => 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_V.png',
            'Resident Evil 4' => 'https://upload.wikimedia.org/wikipedia/en/d/d9/Resident_Evil_4_remake_cover_art.jpg',
            'Sekiro' => 'https://upload.wikimedia.org/wikipedia/en/6/6e/Sekiro_art.jpg',
            'Hogwarts Legacy' => 'https://upload.wikimedia.org/wikipedia/en/1/1e/Hogwarts_Legacy_cover_art.jpg',
            'Assassin’s Creed Valhalla' => 'https://upload.wikimedia.org/wikipedia/en/2/29/Assassin%27s_Creed_Valhalla_cover.jpg',
            'Dark Souls III' => 'https://upload.wikimedia.org/wikipedia/en/b/bb/Dark_Souls_III_cover_art.jpg',
            'DOOM Eternal' => 'https://upload.wikimedia.org/wikipedia/en/9/9d/Cover_Art_of_DOOM_Eternal.png',
            'Forza Horizon 5' => 'https://upload.wikimedia.org/wikipedia/en/8/86/Forza_Horizon_5_cover_art.jpg',
            'Halo Infinite' => 'https://upload.wikimedia.org/wikipedia/en/1/13/Halo_Infinite.png',
            'Mortal Kombat 1' => 'https://upload.wikimedia.org/wikipedia/en/2/25/Mortal_Kombat_1_cover_art.png',
        ];

        $stores = ['Steam', 'Epic', 'GOG'];

        $i = 1;

        // Generar 200 juegos únicos
        while ($i <= 200) {

            foreach ($games as $name => $image) {

                if ($i > 200) break;

                Product::updateOrCreate(
                    [
                        // Nombre único (NO se repite)
                        'name' => $name . " Edition #{$i}"
                    ],
                    [
                        'description' => "Edición digital de {$name} disponible en tienda oficial.",
                        'price' => rand(10, 70),
                        'store' => $stores[array_rand($stores)],
                        'discount' => rand(0, 1) ? rand(10, 70) : null,
                        'image_url' => $image, // ✅ SIEMPRE hay imagen
                    ]
                );

                $i++;
            }
        }
    }
}
