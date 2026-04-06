const products = [
  {
    name:"Solar Fan",
    description:"Solar fan with 2 external bulbs, solar panel, rechargeable adaptor and Lithium battery",
    price:69000,
    img:"https://d21d281c1yd2en.cloudfront.net/media/product_images/lontor-12-inch-rechargeable-table-fan-with-solar-panel-d01a-1280x1280.jpg",
    soldOut:false
  },
  {
    name:"Stainless Pot (Set of 6)",
    description:"Original stainless pot, a set of 6 pieces cookware",
    price:79000,
    img:"https://ng.jumia.is/unsafe/fit-in/500x500/filters%3Afill%28white%29/product/24/2255504/1.jpg?1151",
    soldOut:false
  },
  {
    name:"14 PCs Aluminum Pot",
    description:"A very durable set of 14 pieces aluminum pot with lids",
    price:59000,
    img:"https://d21d281c1yd2en.cloudfront.net/media/product_images/century-12-inches-rechargeable-table-fan-with-solar-panel-two-bulbs-c2a4-640x640.jpg",
    soldOut:false
  }, 
  { 
  name: "Air fryer", 
    description:"digital 6litres Air fryer with adjustable temperature and timer", 
    price:50, 
    img:"https://example.com/airfryer.jpg", 
    soldOut:false 
  }

];

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let tempQty = products.map(p => 1);

function displayProducts() {
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach((p, i)=>{
    if(p.soldOut) return;
    container.innerHTML += `
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>₦${p.price.toLocaleString()}</strong></p>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;">
        <button onclick="changeQty(${i}, -1)">-</button>
        <span id="qty-${i}">${tempQty[i]}</span>
        <button onclick="changeQty(${i}, 1)">+</button>
      </div>
      <button onclick="addToCart(${i})">Add to Cart</button>
    </div>`;
  });
}

function changeQty(index, delta){
  tempQty[index] += delta;
  if(tempQty[index] < 1) tempQty[index] = 1;
  document.getElementById(`qty-${index}`).innerText = tempQty[index];
}

function addToCart(index){
  const product = products[index];
  const quantityToAdd = tempQty[index];
  const existing = cart.find(item => item.name === product.name);
  if(existing){ existing.qty += quantityToAdd; } 
  else { cart.push({name: product.name, price: product.price, qty: quantityToAdd}); }
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function displayCart(){
  const cartDiv = document.getElementById('cart-items');
  if(cart.length===0){ cartDiv.innerHTML='<p>Your cart is empty</p>'; return; }
  let html='', total=0;
  cart.forEach((item,i)=>{
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    html += `<p>${item.name} (x${item.qty}) - ₦${itemTotal.toLocaleString()} <button onclick="removeFromCart(${i})">Remove</button></p>`;
  });
  html += `<p><strong>Total: ₦${total.toLocaleString()}</strong></p>`;
  cartDiv.innerHTML = html;
}

function removeFromCart(index){
  if(cart[index].qty>1){ cart[index].qty-=1; } else { cart.splice(index,1); }
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

document.addEventListener("DOMContentLoaded", function(){
  displayProducts(); displayCart();
  const checkoutBtn = document.getElementById('checkout');
  checkoutBtn.addEventListener('click', function(){
    if(cart.length===0){ alert("Your cart is empty!"); return; }
    let totalAmount = cart.reduce((sum,item)=>sum + item.price*item.qty,0);
    let handler = PaystackPop.setup({
      key: 'pk_test_1224eb0ed84251c2ca7babe4c33be28d5949783f',
      email: 'customer@example.com',
      amount: totalAmount*100,
      currency:"NGN",
      ref: ''+Math.floor((Math.random()*1000000000)+1),
      callback:function(response){
        let pickupCode = "K2C-" + Math.floor(100000 + Math.random()*900000);
        let orderDetails = cart.map(item=>`${item.name} (x${item.qty})`).join(", ");
        let yourNumber = "2348134153644";
        let message = `New Order!\\nItems: ${orderDetails}\\nTotal: ₦${totalAmount}\\nPickup Code: ${pickupCode}`;
        let whatsappURL = `https://wa.me/${yourNumber}?text=${encodeURIComponent(message)}`;
        document.body.innerHTML = `
          <div style="text-align:center; padding:30px;">
          <h2>✅ Payment Successful!</h2>
          <h1>${pickupCode}</h1>
          <p>Screenshot this code</p>
          <p>${orderDetails}</p>
          <p>₦${totalAmount}</p>
          <a href="${whatsappURL}" style="background:#25D366;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">Send to Seller</a>
          </div>`;
        cart=[]; localStorage.removeItem('cart');
      },
      onClose:function(){ alert('Transaction cancelled.'); }
    });
    handler.openIframe();
  });
});
