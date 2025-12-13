/*CONFIG*/
const API_URL   = 'http://127.0.0.1:8000/api/products';
const LOGIN_URL = 'http://127.0.0.1:8000/api/login';

let isSavingProduct = false; 
/*ESTADO GLOBAL*/
let currentPage     = 1;
let itemsPerPage    = 20;
let totalProducts   = 0;
let isLoadingMore   = false;
let currentUserId   = localStorage.getItem('user_id') || null;
let favoriteIds     = new Set();

let TOKEN = localStorage.getItem('token');
let ROLE  = localStorage.getItem('role');

/*ELEMENTOS PRINCIPALES*/
const gamesGrid   = document.getElementById('games');
const searchInput = document.getElementById('search');
const storeSelect = document.getElementById('store');
const orderSelect = document.getElementById('order');
const offerCheck  = document.getElementById('offer');
const headerHome  = document.getElementById('header-home');

/*LOGIN / REGISTRO: ELEMENTOS*/
const loginModal = document.getElementById('login-modal');
const loginOpen  = document.getElementById('login-open');
const loginClose = document.getElementById('login-close');
const loginBtn   = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const loginEmail = document.getElementById('login-email');
const loginPass  = document.getElementById('login-password');
const togglePass = document.getElementById('toggle-password');

// Registro
const tabLogin                     = document.getElementById('tab-login');
const tabRegister                  = document.getElementById('tab-register');
const loginForm                    = document.getElementById('login-form');
const registerForm                 = document.getElementById('register-form');
const registerName                 = document.getElementById('register-name');
const registerEmail                = document.getElementById('register-email');
const registerPassword             = document.getElementById('register-password');
const registerPasswordConfirm      = document.getElementById('register-password-confirm');
const toggleRegisterPassword       = document.getElementById('toggle-register-password');
const toggleRegisterPasswordConfirm= document.getElementById('toggle-register-password-confirm');
const registerBtn                  = document.getElementById('register-btn');
const registerError                = document.getElementById('register-error');
const registerClose                = document.getElementById('register-close');

/*ADMIN UI*/
const adminBadge = document.getElementById('admin-badge');
const logoutBtn  = document.getElementById('logout-btn');
const createBtn  = document.getElementById('create-product-btn');

/*FAVORITOS UI*/
const favoritesBtn     = document.getElementById('favorites-btn');
const favoritesSection = document.getElementById('favorites-section');
const favoritesGrid    = document.getElementById('favorites-grid');
const backToGamesBtn   = document.getElementById('back-to-games');

/*ADMIN MODAL*/
const adminModal  = document.getElementById('admin-modal');
const adminTitle  = document.getElementById('admin-modal-title');
const adminSave   = document.getElementById('admin-save-btn');
const adminError  = document.getElementById('admin-error');
const imgPreview  = document.getElementById('product-image-preview');

/*DETALLES + COMENTARIOS*/
const detailsModal = document.getElementById('details-modal');
const detailsClose = document.getElementById('details-close');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const commentSend  = document.getElementById('comment-send');

/*INIT*/
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

  // Ocultar filtros si no hay sesión iniciada
  const filtersContainer = document.getElementById('filters');
  if (filtersContainer) {
    if (!TOKEN) {
      filtersContainer.classList.add('hidden');
    } else {
      filtersContainer.classList.remove('hidden');
    }
  }

  loadProducts();
  loadUser(); // para favoritos
});

/*HEADER HOME CLICK*/
if (headerHome) {
  headerHome.addEventListener('click', () => {
    currentPage = 1;
    hideFavoritesSection();

    if (searchInput) searchInput.value = '';
    if (storeSelect) storeSelect.value = '';
    if (orderSelect) orderSelect.value = '';
    if (offerCheck)  offerCheck.checked = false;

    loadProducts();
  });
}

/*LOGIN MODAL*/
if (loginOpen) {
  loginOpen.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    loginModal.classList.add('flex');
    showLoginTab();
  });
}

if (loginClose)    loginClose.addEventListener('click', closeLogin);
if (registerClose) registerClose.addEventListener('click', closeLogin);

function closeLogin() {
  loginModal.classList.add('hidden');
  loginModal.classList.remove('flex');
  loginError.classList.add('hidden');
  registerError.classList.add('hidden');

  loginEmail.value = '';
  loginPass.value  = '';
  registerName.value            = '';
  registerEmail.value           = '';
  registerPassword.value        = '';
  registerPasswordConfirm.value = '';
}

/*PESTAÑAS LOGIN / REGISTRO*/
function showLoginTab() {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');

  tabLogin.classList.add('text-emerald-600', 'border-emerald-600');
  tabLogin.classList.remove('text-slate-500', 'border-transparent');

  tabRegister.classList.remove('text-emerald-600', 'border-emerald-600');
  tabRegister.classList.add('text-slate-500', 'border-transparent');
}

function showRegisterTab() {
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');

  tabRegister.classList.add('text-emerald-600', 'border-emerald-600');
  tabRegister.classList.remove('text-slate-500', 'border-transparent');

  tabLogin.classList.remove('text-emerald-600', 'border-emerald-600');
  tabLogin.classList.add('text-slate-500', 'border-transparent');
}

if (tabLogin)    tabLogin.addEventListener('click', showLoginTab);
if (tabRegister) tabRegister.addEventListener('click', showRegisterTab);

/*VER / OCULTAR CONTRASEÑAS*/
if (togglePass) {
  togglePass.addEventListener('click', () => {
    loginPass.type = loginPass.type === 'password' ? 'text' : 'password';
    togglePass.textContent = loginPass.type === 'password' ? '👁' : '🙈';
  });
}

if (toggleRegisterPassword) {
  toggleRegisterPassword.addEventListener('click', () => {
    registerPassword.type = registerPassword.type === 'password' ? 'text' : 'password';
    toggleRegisterPassword.textContent = registerPassword.type === 'password' ? '👁' : '🙈';
  });
}

if (toggleRegisterPasswordConfirm) {
  toggleRegisterPasswordConfirm.addEventListener('click', () => {
    registerPasswordConfirm.type = registerPasswordConfirm.type === 'password' ? 'text' : 'password';
    toggleRegisterPasswordConfirm.textContent = registerPasswordConfirm.type === 'password' ? '👁' : '🙈';
  });
}

/*VALIDACIÓN CONTRASEÑA SEGURA*/
function validatePassword(pwd) {
  const hasLength    = pwd.length >= 6;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber    = /[0-9]/.test(pwd);

  document.getElementById('pwd-length').innerHTML =
    hasLength ? '✅ Mínimo 6 caracteres' : '❌ Mínimo 6 caracteres';
  document.getElementById('pwd-uppercase').innerHTML =
    hasUppercase ? '✅ Una mayúscula' : '❌ Una mayúscula';
  document.getElementById('pwd-number').innerHTML =
    hasNumber ? '✅ Un número' : '❌ Un número';

  return hasLength && hasUppercase && hasNumber;
}

if (registerPassword) {
  registerPassword.addEventListener('input', () => {
    validatePassword(registerPassword.value);
  });
}

/*LOGIN API*/
if (loginBtn) {
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
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('Login response:', data);

      if (!res.ok) {
        loginError.textContent = data.message || 'Credenciales incorrectas';
        loginError.classList.remove('hidden');
        console.error('Error login:', data);
        return;
      }

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
}

/*REGISTRO API*/
if (registerBtn) {
  registerBtn.addEventListener('click', async () => {
    const name            = registerName.value.trim();
    const email           = registerEmail.value.trim();
    const password        = registerPassword.value.trim();
    const passwordConfirm = registerPasswordConfirm.value.trim();

    registerError.classList.add('hidden');

    if (!name || !email || !password || !passwordConfirm) {
      registerError.textContent = 'Completa todos los campos';
      registerError.classList.remove('hidden');
      return;
    }

    if (!validatePassword(password)) {
      registerError.textContent = 'La contraseña no cumple los requisitos';
      registerError.classList.remove('hidden');
      return;
    }

    if (password !== passwordConfirm) {
      registerError.textContent = 'Las contraseñas no coinciden';
      registerError.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        registerError.textContent = data.message || 'Error al registrar';
        registerError.classList.remove('hidden');
        console.error('Error registro:', data);
        return;
      }

      alert('¡Cuenta creada! Ahora inicia sesión con tus credenciales.');
      registerName.value            = '';
      registerEmail.value           = '';
      registerPassword.value        = '';
      registerPasswordConfirm.value = '';
      showLoginTab();
    } catch (e) {
      console.error('Error de servidor en registro:', e);
      registerError.textContent = 'Error de servidor';
      registerError.classList.remove('hidden');
    }
  });
}

/*LOGOUT*/
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    location.reload();
  });
}

/*FAVORITOS: MOSTRAR / OCULTAR SECCIÓN*/
function showFavoritesSection() {
  gamesGrid.parentElement.classList.add('hidden');
  document.querySelector('main').style.display = 'none';
  favoritesSection.classList.remove('hidden');
  loadFavoritesDisplay();
}

function hideFavoritesSection() {
  favoritesSection.classList.add('hidden');
  document.querySelector('main').style.display = 'block';
  gamesGrid.parentElement.classList.remove('hidden');
}

if (favoritesBtn)  favoritesBtn.addEventListener('click', showFavoritesSection);
if (backToGamesBtn) backToGamesBtn.addEventListener('click', hideFavoritesSection);

/*CARGAR Y MOSTRAR FAVORITOS*/
async function loadFavoritesDisplay() {
  if (!currentUserId || favoriteIds.size === 0) {
    favoritesGrid.innerHTML = `
      <p class="col-span-full text-center text-gray-500 font-semibold">
        No tienes productos favoritos aún
      </p>
    `;
    return;
  }

  try {
    const res = await fetch(`${API_URL}?per_page=200`);
    if (!res.ok) throw new Error('Error cargando productos');

    const data        = await res.json();
    const allProducts = Array.isArray(data) ? data : (data.data ?? data);

    const favoriteProducts = allProducts.filter(p => favoriteIds.has(p.id));

    if (favoriteProducts.length === 0) {
      favoritesGrid.innerHTML = `
        <p class="col-span-full text-center text-gray-500 font-semibold">
          No tienes productos favoritos aún
        </p>
      `;
      return;
    }

    favoritesGrid.innerHTML = '';

    favoriteProducts.forEach(p => {
      const div = document.createElement('div');
      div.className = 'bg-slate-900 text-white rounded-xl shadow overflow-hidden';

      const isFav = favoriteIds.has(p.id);

      div.innerHTML = `
        <div class="relative">
          <img src="${getImage(p)}" class="h-64 w-full object-cover">
          <button data-id="${p.id}" class="absolute top-2 right-2 text-2xl"
            onclick="toggleFavorite(${p.id}, this)">${isFav ? '❤️' : '🤍'}</button>
        </div>
        <div class="p-4 space-y-2">
          <h4 class="font-bold">${p.name}</h4>
          <span class="text-emerald-400 font-black">$${Number(p.price).toFixed(2)}</span>

          <button class="w-full bg-emerald-500 py-2 rounded font-bold"
            onclick='openDetails(${JSON.stringify(p)})'>
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

      favoritesGrid.appendChild(div);
    });

  } catch (e) {
    console.error('Error cargando favoritos:', e);
    favoritesGrid.innerHTML = `
      <p class="col-span-full text-center text-red-600 font-semibold">
        Error al cargar favoritos
      </p>
    `;
  }
}

/*PRODUCTOS (LISTAR)*/
async function loadProducts(page = 1) {
  try {
    if (page === 1) {
      currentPage = 1;
      gamesGrid.innerHTML = '';
    }

    const params   = new URLSearchParams();
    const searchVal= searchInput ? (searchInput.value || '') : '';
    const storeVal = storeSelect ? (storeSelect.value || '') : '';
    const orderVal = orderSelect ? (orderSelect.value || '') : '';

    if (searchVal) params.append('search', searchVal);
    if (storeVal)  params.append('store',  storeVal);
    if (orderVal)  params.append('order',  orderVal);
    if (offerCheck && offerCheck.checked) params.append('offer', '1');

    params.append('page',      String(page));
    params.append('per_page',  String(itemsPerPage));

    const fetchUrl = `${API_URL}?${params}`;
    console.log('Fetching products URL:', fetchUrl);

    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error('Respuesta no OK de la API');

    const data = await res.json();
    const products = Array.isArray(data) ? data : (data.data ?? data);
    totalProducts  = data.total || products.length;

    if (!products || products.length === 0) {
      if (page === 1) {
        gamesGrid.innerHTML = `
          <p class="col-span-full text-center text-gray-500 font-semibold">
            No hay productos disponibles
          </p>
        `;
      }
      return;
    }

    products.forEach(p => {
      const div = document.createElement('div');
      div.className = 'bg-slate-900 text-white rounded-xl shadow overflow-hidden';

      const isFav = favoriteIds.has(p.id);
      const favoriteBtn = TOKEN
        ? `<button data-id="${p.id}" class="absolute top-2 right-2 text-2xl"
             onclick="toggleFavorite(${p.id}, this)">${isFav ? '❤️' : '🤍'}</button>`
        : '';

      div.innerHTML = `
        <div class="relative">
          <img src="${getImage(p)}" class="h-64 w-full object-cover">
          ${favoriteBtn}
        </div>
        <div class="p-4 space-y-2">
          <h4 class="font-bold">${p.name}</h4>
          <span class="text-emerald-400 font-black">$${Number(p.price).toFixed(2)}</span>

          <button class="w-full bg-emerald-500 py-2 rounded font-bold"
            onclick='openDetails(${JSON.stringify(p)})'>
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

    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      const totalLoaded = page * itemsPerPage;
      loadMoreBtn.style.display = totalLoaded < totalProducts ? 'block' : 'none';
    }

  } catch (e) {
    console.error('Error cargando productos:', e);
    if (currentPage === 1) {
      gamesGrid.innerHTML = `
        <p class="col-span-full text-center text-red-600 font-semibold">
          Error al cargar productos
        </p>
      `;
    }
  }
}

/*CARGAR MÁS PRODUCTOS*/
async function loadMoreProducts() {
  if (isLoadingMore) return;
  isLoadingMore = true;

  currentPage++;

  await loadProducts(currentPage);

  isLoadingMore = false;
}

/*IMÁGENES*/
function getImage(p) {
  if (!p.image_url) {
    return `https://source.unsplash.com/400x600/?video-game&sig=${p.id}`;
  }
  return p.image_url.startsWith('http')
    ? p.image_url
    : `http://127.0.0.1:8000${p.image_url}`;
}
/*DETALLES + COMENTARIOS*/
function openDetails(product) {
  if (!detailsModal) return;

  const imgEl   = document.getElementById('details-image');
  const nameEl  = document.getElementById('details-name');
  const descEl  = document.getElementById('details-description');
  const storeEl = document.getElementById('details-store');
  const priceEl = document.getElementById('details-price');
  const discEl  = document.getElementById('details-discount');

  if (imgEl)   imgEl.src = getImage(product);
  if (nameEl)  nameEl.textContent  = product.name ?? '';
  if (descEl)  descEl.textContent  = product.description ?? '';
  if (storeEl) storeEl.textContent = product.store ?? '';
  if (priceEl) priceEl.textContent = product.price ?? '';
  if (discEl)  discEl.textContent  = product.discount ?? 0;

  if (commentInput) commentInput.value = '';

  if (commentsList) {
    commentsList.innerHTML =
      '<p class="text-sm text-slate-500">Cargando comentarios...</p>';
  }

  if (product && product.id) {
    loadComments(product.id);
    if (commentSend) {
      commentSend.onclick = () => sendComment(product.id);
    }
  }

  detailsModal.classList.remove('hidden');
  detailsModal.classList.add('flex');
}

if (detailsClose) {
  detailsClose.addEventListener('click', () => {
    detailsModal.classList.add('hidden');
    detailsModal.classList.remove('flex');
  });
}

window.openDetails = openDetails;

/***************************************************
 * CARGAR COMENTARIOS
 ***************************************************/
async function loadComments(productId) {
  if (!commentsList) return;

  try {
    // Usa la ruta que tengas en tu backend:
    //  Opción A: /api/products/{id}/comments
    //  Opción B: /api/comments/{id}
    const res = await fetch(`http://127.0.0.1:8000/api/comments/${productId}`);

    if (!res.ok) {
      commentsList.innerHTML =
        '<p class="text-sm text-red-600">Error al cargar comentarios.</p>';
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      commentsList.innerHTML =
        '<p class="text-sm text-slate-500">No hay comentarios aún.</p>';
      return;
    }

    commentsList.innerHTML = '';

    data.forEach(c => {
      const div = document.createElement('div');
      div.className = 'bg-white border rounded px-3 py-2 text-sm text-black';

      const author  = c.user?.name ?? 'Usuario';
      const created = c.created_at
        ? new Date(c.created_at).toLocaleString()
        : '';

      div.innerHTML = `
        <p class="font-semibold">${author}</p>
        <p>${c.content}</p>
        <p class="text-xs text-slate-500 mt-1">${created}</p>
      `;

      commentsList.appendChild(div);
    });

  } catch (e) {
    console.error('Error cargando comentarios:', e);
    commentsList.innerHTML =
      '<p class="text-sm text-red-600">Error al cargar comentarios.</p>';
  }
}

/*ENVIAR COMENTARIO*/
async function sendComment(productId) {
  if (!TOKEN) {
    alert('Debes iniciar sesión para comentar.');
    return;
  }
  if (!commentInput || !commentSend) return;

  const content = (commentInput.value || '').trim();

  if (!content) {
    alert('Escribe un comentario.');
    return;
  }

  if (content.length > 200) {
    alert('Máximo 200 caracteres.');
    return;
  }

  commentSend.disabled = true;
  commentSend.textContent = 'Enviando...';

  try {
    const res = await fetch('http://127.0.0.1:8000/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        product_id: productId,
        content,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Error al enviar comentario:', data);
      alert(data.message || 'Error al enviar comentario.');
      commentSend.disabled = false;
      commentSend.textContent = 'Enviar comentario';
      return;
    }

    commentInput.value = '';
    await loadComments(productId);

  } catch (e) {
    console.error('Error enviando comentario:', e);
    alert('Error de red al enviar comentario.');
  }

  commentSend.disabled = false;
  commentSend.textContent = 'Enviar comentario';
}

window.sendComment = sendComment;

/*BOTÓN NUEVO PRODUCTO*/
if (createBtn) {
  createBtn.addEventListener('click', () => openEdit());
}

/*FILTROS*/
let searchTimer = null;

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadProducts(1), 300);
  });
}

[storeSelect, orderSelect, offerCheck].forEach(el => {
  if (el) el.addEventListener('change', () => loadProducts(1));
});

window.addEventListener('pageshow', () => {
  if (searchInput) searchInput.value = '';
});

/***************************************************
 * BOTÓN VER MÁS
 ***************************************************/
const loadMoreBtn = document.getElementById('load-more');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', loadMoreProducts);
}
window.loadMoreProducts = loadMoreProducts;

/***************************************************
 * ADMIN: ABRIR / CERRAR MODAL, GUARDAR, ELIMINAR
 ***************************************************/
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
    idInput.value    = '';
    nameInput.value  = '';
    descInput.value  = '';
    priceInput.value = '';
    storeInput.value = '';
    discInput.value  = '';
    imgInput.value   = '';
    imgPreview.classList.add('hidden');
  }
}
window.openEdit = openEdit;

function closeAdminModal() {
  adminModal.classList.add('hidden');
  adminModal.classList.remove('flex');
}
if (document.getElementById('admin-close-btn')) {
  document.getElementById('admin-close-btn').addEventListener('click', closeAdminModal);
}

if (adminSave) {
  adminSave.addEventListener('click', async () => {
    // ⛔ si ya está guardando, no volver a ejecutar
    if (isSavingProduct) return;
    isSavingProduct = true;

    if (!TOKEN || ROLE !== 'admin') {
      adminError.textContent = 'Debes iniciar sesión como admin.';
      adminError.classList.remove('hidden');
      isSavingProduct = false;
      return;
    }

    const id = document.getElementById('product-id').value;

    const payload = {
      name:        document.getElementById('product-name').value,
      description: document.getElementById('product-description').value,
      price:       document.getElementById('product-price').value,
      store:       document.getElementById('product-store').value,
      discount:    document.getElementById('product-discount').value || 0,
      image_url:   document.getElementById('product-image').value,
    };

    try {
      const url    = id ? `${API_URL}/${id}` : API_URL;
      const method = id ? 'PUT' : 'POST';

      console.log('Guardando producto (una sola vez):', method, url, payload);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Error guardando producto:', data);
        adminError.textContent = data.message || 'Error al guardar producto';
        adminError.classList.remove('hidden');
        isSavingProduct = false;
        return;
      }

      closeAdminModal();
      await loadProducts();

    } catch (e) {
      console.error('Error de red guardando producto:', e);
      adminError.textContent = 'Error de red al guardar producto';
      adminError.classList.remove('hidden');
    }

    isSavingProduct = false;
  });
}
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
        Authorization: `Bearer ${TOKEN}`,
      },
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
window.deleteProduct = deleteProduct;

/***************************************************
 * FAVORITOS (BACKEND)
 ***************************************************/
async function loadUser() {
  if (!TOKEN) return;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/me', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
    });
    if (!res.ok) return;

    const data = await res.json();
    currentUserId = data.id;
    localStorage.setItem('user_id', currentUserId);

    if (favoritesBtn && data.role !== 'admin') {
      favoritesBtn.classList.remove('hidden');
    } else if (favoritesBtn) {
      favoritesBtn.classList.add('hidden');
    }

    await loadFavorites();

  } catch (e) {
    console.error('Error cargando usuario:', e);
  }
}

async function loadFavorites() {
  if (!currentUserId) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/favorites/${currentUserId}`);
    if (!res.ok) return;

    const data = await res.json();
    favoriteIds = new Set((data || []).map(id => Number(id)));

  } catch (e) {
    console.error('Error cargando favoritos:', e);
  }
}

async function toggleFavorite(productId, btnEl) {
  if (!TOKEN || !currentUserId) {
    alert('Debes iniciar sesión para usar favoritos');
    return;
  }

  const isFav = favoriteIds.has(productId);

  if (isFav) {
    favoriteIds.delete(productId);
    if (btnEl) btnEl.innerText = '🤍';

    try {
      await fetch('http://127.0.0.1:8000/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ user_id: currentUserId, product_id: productId }),
      });
    } catch (e) {
      console.error('Error eliminando favorito:', e);
    }

  } else {
    favoriteIds.add(productId);
    if (btnEl) btnEl.innerText = '❤️';

    try {
      await fetch('http://127.0.0.1:8000/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ user_id: currentUserId, product_id: productId }),
      });
    } catch (e) {
      console.error('Error creando favorito:', e);
    }
  }
}

/*********************************************************
 * ABRIR UBICACIÓN DE TIENDA FÍSICA
 *********************************************************/
function abrirUbicacion() {
  window.open(
    "https://maps.app.goo.gl/wkXUo5ieC45W2Tit8",
    "_blank"
  );
}

window.toggleFavorite = toggleFavorite;