
      let categoriesContainer = document.getElementById('categoriesContainer');
      let searchInput = document.getElementById('searchInput');
      let cartCount = document.getElementById('cart-count');
      let cartButton = document.getElementById('cartButton');
      let cartItemsContainer = document.querySelector('.cart-items');
      const CART_STORAGE_KEY = 'ronItemsCart';

      function loadCart() {
          return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
      }

      function saveCart() {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      }

      let cart = loadCart();
      let allProducts = []; // Store all products for search

      function getProductId(product) {
          return product.id ?? product.productId ?? product._id ?? product.name;
      }

      function formatPrice(value) {
          return Number(value).toLocaleString('en-US');
      }

      function updateCartUI() {
          const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
          cartCount.textContent = totalCount;

          const cartTotalElement = document.getElementById('cart-total');
          if (cartTotalElement) {
              const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
              cartTotalElement.textContent = formatPrice(totalPrice);
          }

          if (!cartItemsContainer) {
              return;
          }

          cartItemsContainer.innerHTML = '';

          if (cart.length === 0) {
              cartItemsContainer.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
              return;
          }

          cart.forEach(item => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'cart-item';
              itemDiv.innerHTML = `
                  <div>
                      <strong>${item.name}</strong><br>
                      Qty: ${item.quantity}
                  </div>
                  <div>
                      ₦${formatPrice(item.price * item.quantity)}
                      <button type="button">Remove</button>
                  </div>
              `;

              const removeButton = itemDiv.querySelector('button');
              removeButton.addEventListener('click', () => {
                  removeFromCart(item.id);
              });

              cartItemsContainer.appendChild(itemDiv);
          });
      }

      function addToCart(product) {
          const productId = getProductId(product);
          const existingItem = cart.find(item => item.id === productId);
          const priceValue = Number(product.priceCents ?? product.price ?? 0);

          if (existingItem) {
              existingItem.quantity += 1;
          } else {
              cart.push({
                  id: productId,
                  name: product.name || product.title || 'Product',
                  price: priceValue,
                  quantity: 1
              });
          }

          saveCart(); 
          updateCartUI();
      }

      function removeFromCart(productId) {
          cart = cart.filter(item => item.id !== productId);
          saveCart();
          updateCartUI();
      }

      function createProductCard(product) {
          const keywords = Array.isArray(product.keywords) ? product.keywords.join(' ') : (product.keywords || '');
          let div = document.createElement('div');
          div.classList.add('prod');
          div.dataset.name = (product.name || product.title || '').toLowerCase();
          div.dataset.category = (product.category || '').toLowerCase();
          div.dataset.keywords = keywords.toLowerCase();
         
          div.innerHTML = `
                <img src='${product.image}' alt="${product.title || product.name}"/>
                <h2 class="prodname">${product.name}</h2><br>
                <h3 class="catname">${product.category}</h3>
                <h3>${product.subCategory || ''}</h3>
                <p>${keywords}</p><br>
                <h3> Ratings : ${product.rating?.stars ?? 'N/A'} (${product.rating?.count ?? '0'})  </h3>
                <p>${product.description || ''}</p><br>
                <h4>Price \u20A6${formatPrice(product.priceCents ?? product.price ?? 0)}</h4>
                <button class="cart">add to cart</button>
          `;

          const cartBtn = div.querySelector('.cart');
          cartBtn.addEventListener('click', () => addToCart(product));

          return div;
      }

      function setupProducts(data) {
          allProducts = data; // Store all products
          const groupedByCategory = {};

          // Group products by category
          data.forEach(product => {
              const category = product.category || 'Uncategorized';
              if (!groupedByCategory[category]) {
                  groupedByCategory[category] = [];
              }
              groupedByCategory[category].push(product);
          });

          // Display products by category
          Object.keys(groupedByCategory).forEach(category => {
              const categorySection = document.createElement('div');
              categorySection.className = 'category-section';
              categorySection.dataset.category = category.toLowerCase();

              const categoryHeader = document.createElement('div');
              categoryHeader.className = 'category-header';
              categoryHeader.textContent = category;

              const categoryProducts = document.createElement('div');
              categoryProducts.className = 'category-products';

              groupedByCategory[category].forEach(product => {
                  const card = createProductCard(product);
                  categoryProducts.appendChild(card);
              });

              categorySection.appendChild(categoryHeader);
              categorySection.appendChild(categoryProducts);
              categoriesContainer.appendChild(categorySection);
          });
      }

      fetch('https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json')
          .then(res => res.json())
          .then(data => {
              console.log(data);
              setupProducts(data);
          })
          .catch(error => {
              console.error('Failed to load products', error);
          });

      searchInput.addEventListener('input', function() {
          const searchTerm = this.value.toLowerCase().trim();
          const categoryCards = document.querySelectorAll('.category-section');

          categoryCards.forEach(categorySection => {
              const productCards = categorySection.querySelectorAll('.prod');
              let categoryHasVisible = false;

              productCards.forEach(card => {
                  const name = card.getAttribute('data-name') || '';
                  const category = card.getAttribute('data-category') || '';
                  const keywords = card.getAttribute('data-keywords') || '';

                  if (name.includes(searchTerm) || category.includes(searchTerm) || keywords.includes(searchTerm)) {
                      card.style.display = 'block';
                      categoryHasVisible = true;
                  } else {
                      card.style.display = 'none';
                  }
              });

              // Hide category section if no products match
              categorySection.style.display = categoryHasVisible ? 'block' : 'none';
          });
      });

      cartButton.addEventListener('click', function() {
          window.location.href = 'cart.html';
      });

      updateCartUI();