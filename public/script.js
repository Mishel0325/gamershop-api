const API_URL = '/api/products';
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});

function cargarProductos() {
  const grid = document.getElementById('grid-videojuegos');
  const loading = document.getElementById('loading-indicator');
  const error = document.getElementById('error-indicator');
  const results = document.getElementById('results-count');

  loading.classList.remove('hidden');
  error.classList.add('hidden');

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      grid.innerHTML = '';
      loading.classList.add('hidden');

      if (data.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-slate-600 font-semibold">
          No hay videojuegos disponibles 🎮
        </p>`;
        return;
      }

      results.textContent = `Mostrando ${data.length} videojuegos`;

      data.forEach(product => {
        const card = document.createElement('div');
        card.className =
          'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 overflow-hidden';

        card.innerHTML = `
          <img src="${product.image_url}" alt="${product.name}"
            class="w-full h-44 object-cover">

          <div class="p-4 space-y-2">
            <h3 class="font-black text-lg text-slate-800">
              ${product.name}
            </h3>

            <p class="text-sm text-slate-600 line-clamp-3">
              ${product.description}
            </p>

            <div class="flex items-center justify-between mt-3">
              <span class="text-emerald-600 font-black text-lg">
                $${product.price}
              </span>

              <button
                class="px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-600 text-white rounded-xl text-xs font-bold hover:scale-105 transition">
                Ver más
              </button>
            </div>
          </div>
        `;

        grid.appendChild(card);
      });
    })
    .catch(err => {
      loading.classList.add('hidden');
      error.classList.remove('hidden');
      console.error(err);
    });
}
