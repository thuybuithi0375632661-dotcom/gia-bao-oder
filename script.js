
// Simple static shop with SMS order sending.
// Products are defined inline here.
const products = [
    {id: 1, name: 'Trà sữa trân châu', price: 45000, desc: 'Trà sữa béo, trân châu dai', img: "https://source.unsplash.com/random/200x200?bobatea"},
    {id: 2, name: 'Cà phê sữa đá', price: 30000, desc: 'Cà phê rang thơm, sữa đặc', img: "https://source.unsplash.com/random/200x200?coffee"},
    {id: 3, name: 'Sinh tố bơ', price: 40000, desc: 'Bơ sánh mịn, nhiều vitamin', img: "https://source.unsplash.com/random/200x200?smoothie"},
    {id: 4, name: 'Trà chanh mật ong', price: 12000, desc: 'Giải khát, dịu nhẹ', img: "https://source.unsplash.com/random/200x200?lemontea"} 
];



const phoneToSend = window.APP_CONFIG && window.APP_CONFIG.phone ? window.APP_CONFIG.phone : "0865904246";

let cart = [];

function q(id){return document.getElementById(id)}

function fmt(n){return Number(n).toLocaleString('vi-VN')}

{const container = document.getElementById('product-list'); // 

  const out = q('products');
  out.innerHTML = '';
  products.forEach(p=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="row">
        <div class="price">${fmt(p.price)}₫</div>
        <button class="btn" data-id="${p.id}">Thêm vào giỏ</button>
      </div>
    `;
    out.appendChild(el);
  });
  out.querySelectorAll('.btn').forEach(b=>b.addEventListener('click', e=>{
    const id = Number(e.currentTarget.getAttribute('data-id'));
    addToCart(id);
  }));
}

function addToCart(id){
  const prod = products.find(p=>p.id===id);
  if(!prod) return;
  const found = cart.find(i=>i.id===id);
  if(found) found.qty += 1;
  else cart.push({...prod, qty:1});
  renderCart();
}

function changeQty(id, delta){
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  renderCart();
}

function renderCart(){
  const el = q('cart-items');
  if(cart.length===0){ el.innerHTML = '<div>Chưa có sản phẩm trong giỏ.</div>'; updateSummary(); return; }
  el.innerHTML = '';
  cart.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" />
      <div class="meta">
        <div style="font-weight:600">${item.name}</div>
        <div style="color:#666">${fmt(item.price)}₫</div>
      </div>
      <div class="qty">
        <button data-action="dec" data-id="${item.id}">-</button>
        <div>${item.qty}</div>
        <button data-action="inc" data-id="${item.id}">+</button>
      </div>
    `;
    el.appendChild(div);
  });
  el.querySelectorAll('button[data-action]').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = Number(e.currentTarget.getAttribute('data-id'));
      const action = e.currentTarget.getAttribute('data-action');
      changeQty(id, action==='inc'?1:-1);
    });
  });
  updateSummary();
}

function updateSummary(){
  const subtotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const shipping = subtotal>0 ? 0 : 0;
  const total = subtotal + shipping;
  q('subtotal').innerText = fmt(subtotal);
  q('shipping').innerText = fmt(shipping);
  q('total').innerText = fmt(total);
}

function placeOrderSMS(){
  const name = q('name').value.trim();
  const phone = q('phone').value.trim();
  const address = q('address').value.trim();
  if(!name || !phone || !address){
    alert('Vui lòng điền tên, số điện thoại và địa chỉ người nhận.');
    return;
  }
  if(cart.length===0){
    alert('Giỏ hàng rỗng.');
    return;
  }
  // Build message
  let lines = [];
  lines.push('ĐƠN HÀNG - ' + (window.APP_CONFIG.shopName || 'Gia Bảo Drinks'));
  lines.push('Người đặt: ' + name);
  lines.push('SĐT khách: ' + phone);
  lines.push('Địa chỉ: ' + address);
  lines.push('---');
  cart.forEach(it=>{
    lines.push(`${it.name} x${it.qty} - ${fmt(it.price)}₫`);
  });
  const subtotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  const shipping = subtotal>0 ? 10000 : 0;
  const total = subtotal + shipping;
  lines.push('---');
  lines.push('Tạm tính: ' + fmt(subtotal) + '₫');
  lines.push('Phí giao: ' + fmt(shipping) + '₫');
  lines.push('Tổng: ' + fmt(total) + '₫');
  lines.push('');
  lines.push('Ghi chú: (gõ thêm nếu cần)');
  const body = encodeURIComponent(lines.join('\n'));
  // sms: URI — different platforms use different formats; provide both sms: and sms:&body
  const zaloLink = 'https://zalo.me/' + zaloPhoneNumber + '?text=' + encodeURIComponent(body);
  // open link
const zaloPhoneNumber = '0865904246'; 0865904246 <-- THAY SỐ NÀY BẰNG SỐ ZALO CỦA QUÁN BẠN
const zaloLink = 'https://zalo.me/' + zaloPhoneNumber + '?text=' + encodeURIComponent(body); 
  window.location.href = zaloLink;
}

// init
document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts();}
  renderCart();
  q('place-order').addEventListener('click', placeOrderSMS);
};
