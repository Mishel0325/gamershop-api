/*********************************************************
 * CONFIG
 *********************************************************/
const API_URL   = 'http://127.0.0.1:8000/api/products';
const LOGIN_URL = 'http://127.0.0.1:8000/api/login';

/*********************************************************
 * AUTH
 *********************************************************/
let TOKEN = localStorage.getItem('token');
let ROLE  = localStorage.getItem('role');

/*********************************************************
 * ELEMENTOS PRINCIPALES
 *********************************************************/
const gamesGrid   = document.getElementById('games');
const searchInput = document.getElementById('search');
const storeSelect = document.getElementById('store');
const orderSelect = document.getElementById('order');
const offerCheck  = document.getElementById('offer');

/*********************************************************
 * LOGIN ELEMENTOS
 *********************************************************/
const loginModal = document.getElementById('login-modal');
const loginOpen  = document.getElementById('login-open');
const loginClose = document.getElementById('login-close');
const loginBtn   = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const loginEmail = document.getElementById('login-email');
const loginPass  = document.getElementById('login-password');
const togglePass = document.getElementById('toggle-password');

/*********************************************************
 * ADMIN UI
 *********************************************************/
const adminBadge = document.getElementById('admin-badge');
const logoutBtn  = document.getElementById('logout-btn');
const createBtn  = document.getElementById('create-product-btn');

/*********************************************************
 * ADMIN MODAL
 *********************************************************/
const adminModal = document.getElementById('admin-modal');
const adminTitle = document.getElementById('admin-modal-title');
const adminSave  = document.getElementById('admin-save-btn');
const adminError = document.getElementById('admin-error');
const imgPreview = document.getElementById('product-image-preview');

/*********************************************************
 * INIT
 *********************************************************/
document.addEventListener('DOMContentLoaded', () => {
  // limpiar buscador siempre
  if (searchInput) {
    searchInput.value = '';
    searchInput.setAttribute('autocomplete', 'off');
  }

  // Estado sesión
  if (TOKEN) {
    loginOpen.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
  }

  if (ROLE === 'admin') {
    adminBadge.classList.remove('hidden');
    createBtn.classList.remove('hidden');
  }

  loadProducts();
});

/*********************************************************
 * LOGIN MODAL
 *********************************************************/
loginOpen.addEventListener('click', () => {
  loginModal.classList.remove('hidden');
  loginModal.classList.add('flex');
});

loginClose.addEventListener('click', closeLogin);

function closeLogin() {
  loginModal.classList.add('hidden');
  loginModal.classList.remove('flex');
  loginError.classList.add('hidden');
}

/*********************************************************
 * VER CONTRASEÑA
 *********************************************************/
togglePass.addEventListener('click', () => {
  loginPass.type = loginPass.type === 'password' ? 'text' : 'password';
  togglePass.textContent = loginPass.type === 'password' ? '👁' : '🙈';
});

/*********************************************************
 * LOGIN API
 *********************************************************/
loginBtn.addEventListener('click', async () => {
  const email    = loginEmail.value.trim();
  const password = loginPass.value.trim();

  if (!email || !password) {
    loginError.textContent = 'Completa todos los campos';
    loginError.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      // mostrar mensaje que venga del backend si existe
      loginError.textContent = data.message || 'Credenciales incorrectas';
      loginError.classList.remove('hidden');
      console.error('Error login:', data);
      return;
    }

    // Guardar sesión
    localStorage.setItem('token', data.token);
    localStorage.setItem('role',  data.role);
    localStorage.setItem('name',  data.name);

    TOKEN = data.token;
    ROLE  = data.role;

    closeLogin();
    location.reload();
  } catch (e) {
    console.error('Error de servidor en login:', e);
    loginError.textContent = 'Error de servidor';
    loginError.classList.remove('hidden');
  }
});

/*********************************************************
 * LOGOUT
 *********************************************************/
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  location.reload();
});

/*********************************************************
 * PRODUCTOS (LISTAR)
 *********************************************************/
async function loadProducts() {
  try {
    const paramsObj = {
      search: searchInput ? (searchInput.value || '') : '',
      store:  storeSelect ? (storeSelect.value || '') : '',
      order:  orderSelect ? (orderSelect.value || '') : ''
    };

    if (offerCheck && offerCheck.checked) {
      paramsObj.offer = 1;
    }

    const params = new URLSearchParams(paramsObj);
    const res    = await fetch(`${API_URL}?${params}`);

    if (!res.ok) {
      throw new Error('Respuesta no OK de la API');
    }

    const data = await res.json();

    gamesGrid.innerHTML = '';

    // API paginada: { data: [...] }
    const products = data.data ?? data;

    if (!products || products.length === 0) {
      gamesGrid.innerHTML = `
        <p class="col-span-full text-center text-gray-500 font-semibold">
          No hay productos disponibles
        </p>
      `;
      return;
    }

    products.forEach(p => {
      const div = document.createElement('div');
      div.className = 'bg-slate-900 text-white rounded-xl shadow overflow-hidden';

      div.innerHTML = `
        <img src="${getImage(p)}" class="h-64 w-full object-cover">
        <div class="p-4 space-y-2">
          <h4 class="font-bold">${p.name}</h4>
          <span class="text-emerald-400 font-black">$${p.price}</span>

          <button class="w-full bg-emerald-500 py-2 rounded">
            Detalles
          </button>

          ${ROLE === 'admin' ? `
            <div class="flex gap-2 mt-2">
              <button class="flex-1 bg-blue-500 py-1 rounded"
                onclick='openEdit(${JSON.stringify(p)})'>
                Editar
              </button>
              <button class="flex-1 bg-red-600 py-1 rounded"
                onclick='deleteProduct(${p.id})'>
                Eliminar
              </button>
            </div>
          ` : ''}
        </div>
      `;

      gamesGrid.appendChild(div);
    });

  } catch (e) {
    console.error('Error cargando productos:', e);
    gamesGrid.innerHTML = `
      <p class="col-span-full text-center text-red-600 font-semibold">
        Error al cargar productos
      </p>
    `;
  }
}

/*********************************************************
 * IMÁGENES
 *********************************************************/
function getImage(p) {
  if (!p.image_url) {
    return `https://source.unsplash.com/400x600/?video-game&sig=${p.id}`;
  }
  return p.image_url.startsWith('http')
    ? p.image_url
    : `http://127.0.0.1:8000${p.image_url}`;
}

/*********************************************************
 * ABRIR MODAL ADMIN (CREAR / EDITAR)
 *********************************************************/
function openEdit(product = null) {
  if (!TOKEN || ROLE !== 'admin') {
    alert('Debes iniciar sesión como admin para gestionar productos.');
    return;
  }

  adminModal.classList.remove('hidden');
  adminModal.classList.add('flex');
  adminError.classList.add('hidden');

  const idInput    = document.getElementById('product-id');
  const nameInput  = document.getElementById('product-name');
  const descInput  = document.getElementById('product-description');
  const priceInput = document.getElementById('product-price');
  const storeInput = document.getElementById('product-store');
  const discInput  = document.getElementById('product-discount');
  const imgInput   = document.getElementById('product-image');

  if (product) {
    adminTitle.textContent = 'Editar Producto';

    idInput.value    = product.id;
    nameInput.value  = product.name ?? '';
    descInput.value  = product.description ?? '';
    priceInput.value = product.price ?? '';
    storeInput.value = product.store ?? '';
    discInput.value  = product.discount ?? 0;
    imgInput.value   = product.image_url ?? '';

    if (product.image_url) {
      imgPreview.src = getImage(product);
      imgPreview.classList.remove('hidden');
    } else {
      imgPreview.classList.add('hidden');
    }
  } else {
    adminTitle.textContent = 'Nuevo Producto';
    idInput.value = '';
    nameInput.value = '';
    descInput.value = '';
    priceInput.value = '';
    storeInput.value = '';
    discInput.value = '';
    imgInput.value = '';
    imgPreview.classList.add('hidden');
  }
}

// hacer accesible a los botones inline
window.openEdit = openEdit;

/*********************************************************
 * CERRAR MODAL ADMIN
 *********************************************************/
function closeAdminModal() {
  adminModal.classList.add('hidden');
  adminModal.classList.remove('flex');
}
document.getElementById('admin-close-btn')
  .addEventListener('click', closeAdminModal);

/*********************************************************
 * GUARDAR PRODUCTO (POST / PUT)
 *********************************************************/
adminSave.addEventListener('click', async () => {
  if (!TOKEN || ROLE !== 'admin') {
    adminError.textContent = 'Debes iniciar sesión como admin.';
    adminError.classList.remove('hidden');
    return;
  }

  const id = document.getElementById('product-id').value;

  const payload = {
    name:        document.getElementById('product-name').value,
    description: document.getElementById('product-description').value,
    price:       document.getElementById('product-price').value,
    store:       document.getElementById('product-store').value,
    discount:    document.getElementById('product-discount').value || 0,
    image_url:   document.getElementById('product-image').value
  };

  try {
    const url    = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Error guardando producto:', data);
      adminError.textContent = data.message || 'Error al guardar producto';
      adminError.classList.remove('hidden');
      return;
    }

    closeAdminModal();
    loadProducts();
  } catch (e) {
    console.error('Error de red guardando producto:', e);
    adminError.textContent = 'Error de red al guardar producto';
    adminError.classList.remove('hidden');
  }
});

/*********************************************************
 * ELIMINAR PRODUCTO
 *********************************************************/
async function deleteProduct(id) {
  if (!TOKEN || ROLE !== 'admin') {
    alert('Debes iniciar sesión como admin para eliminar productos.');
    return;
  }

  if (!confirm('¿Estás seguro de eliminar este producto?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {})
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Error eliminando producto:', data);
      alert(data.message || 'Error al eliminar producto');
      return;
    }

    loadProducts();
  } catch (e) {
    console.error('Error de red eliminando producto:', e);
    alert('Error de red al eliminar producto');
  }
}

// accesible desde el HTML inline
window.deleteProduct = deleteProduct;

/*********************************************************
 * BOTÓN NUEVO PRODUCTO
 *********************************************************/
createBtn.addEventListener('click', () => openEdit());

/*********************************************************
 * FILTROS
 *********************************************************/

// Buscar mientras escribe (debounce)
let searchTimer = null;

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadProducts(), 300);
  });
}

// Selects y checkbox
[storeSelect, orderSelect, offerCheck].forEach(el => {
  if (el) el.addEventListener('change', loadProducts);
});

// limpiar buscador al volver / recargar desde caché
window.addEventListener('pageshow', () => {
  if (searchInput) {
    searchInput.value = '';
  }
});
