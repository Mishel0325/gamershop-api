const API_URL = 'http://127.0.0.1:8000/api/products';

let currentPage = 1;
let isLoading = false;

// ===== ELEMENTOS =====
const grid = document.getElementById('games');
const searchInput = document.getElementById('search');
const storeSelect = document.getElementById('store');
const priceOrder = document.getElementById('order');
const offerCheck = document.getElementById('offer');
const loadMoreBtn = document.getElementById('load-more');

const resultsCount = document.getElementById('results-count');
const loadingIndicator = document.getElementById('loading-indicator');
const errorIndicator = document.getElementById('error-indicator');

// ===== MODAL =====
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalClose = document.getElementById('modal-close');

// ====================
// INIT
// ====================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts(1);
});

// ====================
// EVENTOS FILTROS
// ====================
searchInput.addEventListener('input', debounce(() => loadProducts(1), 400));
storeSelect.addEventListener('change', () => loadProducts(1));
priceOrder.addEventListener('change', () => loadProducts(1));
offerCheck.addEventListener('change', () => loadProducts(1));

loadMoreBtn.addEventListener('click', () => {
  if (!isLoading) loadProducts(currentPage + 1);
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// ====================
// FETCH PRODUCTS
// ====================
async function loadProducts(page = 1) {
  if (isLoading) return;

  isLoading = true;
  loadingIndicator.classList.remove('hidden');
  errorIndicator.classList.add('hidden');

  if (page === 1) {
    grid.innerHTML = '';
    currentPage = 1;
    loadMoreBtn.disabled = false;
  }

  const params = new URLSearchParams({
    page,
    search: searchInput.value,
    store: storeSelect.value,
    order: priceOrder.value,
    offer: offerCheck.checked ? 1 : 0
  });

  try {
    const res = await fetch(`${API_URL}?${params.toString()}`);

    if (!res.ok) throw new Error('Error HTTP');

    const data = await res.json();

    renderProducts(data.data);

    currentPage = data.current_page;

    resultsCount.textContent = `Mostrando ${data.to ?? 0} de ${data.total} juegos`;

    if (!data.next_page_url) {
      loadMoreBtn.disabled = true;
    }

  } catch (err) {
    console.error(err);
    errorIndicator.classList.remove('hidden');
  } finally {
    loadingIndicator.classList.add('hidden');
    isLoading = false;
  }
}

// ====================
// RENDERIZAR CARDS
// ====================
function renderProducts(products) {
  products.forEach(p => {
    const card = document.createElement('div');
    card.className =
      'bg-slate-900 rounded-xl overflow-hidden shadow-lg hover:scale-105 transition text-white';

    card.innerHTML = `
      <img
        src="${p.image_url}"
        onerror="this.src='https://via.placeholder.com/300x400?text=Sin+Imagen'"
        class="h-64 w-full object-cover"
      />

      <div class="p-4 space-y-2">
        <h4 class="font-bold text-sm line-clamp-2">${p.name}</h4>

        <div class="flex items-center justify-between">
          <span class="font-black text-emerald-400">$${p.price}</span>
          ${
            p.discount
              ? `<span class="text-xs bg-red-500 px-2 py-1 rounded-full">
                    -${p.discount}%
                 </span>`
              : ''
          }
        </div>

        <button
          class="w-full mt-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-sm font-bold hover:opacity-90"
        >
          Detalles
        </button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => {
      openModal(p);
    });

    grid.appendChild(card);
  });
}

// ====================
// MODAL
// ====================
function openModal(product) {
  modalTitle.textContent = product.name;
  modalImage.src = product.image_url;
  modalDesc.textContent =
    product.description || 'Juego disponible en tienda digital.';
  modalPrice.textContent = `$${product.price}`;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// ====================
// UTIL: DEBOUNCE
// ====================
function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}
