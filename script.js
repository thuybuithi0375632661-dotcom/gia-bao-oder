<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Gia Bảo Order</title>
<link rel="stylesheet" href="style.css">
<!-- EmailJS SDK -->
<script src="https://cdn.emailjs.com/sdk/3.2.0/email.min.js"></script>
</head>
<body>
<main class="container">
  <header class="header">
    <div class="logo-wrap">
      <svg id="logo" width="260" height="64" viewBox="0 0 520 128" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <text x="30" y="78" font-family="Poppins, Inter, Arial" font-weight="700" font-size="64" fill="#2f7a3f">Gia Bảo</text>
        <text x="360" y="78" font-family="Poppins, Inter, Arial" font-weight="600" font-size="36" fill="#66a56a">Order</text>
      </svg>
    </div>
    <p class="subtitle">Đặt hàng nhanh — mở Zalo & lưu đơn tự động</p>
  </header>

  <section class="menu">
    <h2>Menu</h2>

    <form id="orderForm">
      <div class="menu-grid" id="menuGrid"></div>

      <div class="controls">
        <label for="customerName">Tên khách hàng</label>
        <input id="customerName" name="customerName" type="text" placeholder="Nhập tên bạn" required>

        <label for="phone">Số điện thoại</label>
        <input id="phone" name="phone" type="text" placeholder="Số điện thoại (vd: 09xxxxxxxx)" required>

        <label for="notes">Ghi chú (ít đá, mang về...)</label>
        <textarea id="notes" name="notes" placeholder="Ghi chú thêm..." rows="3"></textarea>

        <label>Hình thức nhận hàng</label>
        <div class="pickup">
          <label><input type="radio" name="receive" value="Nhận tại quán" checked> Nhận tại quán</label>
          <label><input type="radio" name="receive" value="Mang về"> Mang về</label>
        </div>

        <div class="total-row">
          <div class="total-label">Tổng tiền:</div>
          <div id="totalAmount" class="total-amount">0 ₫</div>
        </div>

        <div class="actions">
          <button id="orderBtn" type="button">Đặt hàng (Gửi qua Zalo & Email)</button>
          <button id="previewBtn" type="button" class="alt">Xem lại đơn gần đây</button>
        </div>

        <p class="small">Sau khi bấm: trang sẽ lưu đơn, gửi email tới chủ quán và mở Zalo. Nội dung cũng được sao chép vào clipboard.</p>
      </div>
    </form>
  </section>

  <section id="recentSection" class="recent hidden">
    <h3>Đơn gần đây</h3>
    <div id="recentList"></div>
    <div class="recent-actions"><button id="closeRecent">Đóng</button></div>
  </section>

  <footer>
    <p>Liên hệ Zalo: <strong>0865904246</strong> • Email nhận đơn: <strong>thuybuithi.0375632661@gmail.com</strong></p>
  </footer>
</main>

<script>
// --- Cấu hình EmailJS (thay giá trị của bạn vào 3 chỗ dưới) ---
emailjs.init("YOUR_EMAILJS_USER_ID"); // <-- thay bằng user ID từ EmailJS
const SERVICE_ID = "YOUR_SERVICE_ID";   // <-- thay bằng Service ID trên EmailJS
const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // <-- thay bằng Template ID trên EmailJS
// ------------------------------------------------------------

const ZALO_PHONE = "0865904246";
const MAX_RECENT = 5;

const MENU = [
  { id: "m1", name: "Matcha Latte (9k)", price: 9000, img: "img/matcha_latte_9k.svg" },
  { id: "m2", name: "Matcha Latte (10k)", price: 10000, img: "img/matcha_latte_10k.svg" },
  { id: "m3", name: "Trà Houjicha (12k)", price: 12000, img: "img/houjicha_12k.svg" },
  { id: "m4", name: "Matcha Cold Whish (15k)", price: 15000, img: "img/matcha_cold_whish_15k.svg" }
];

function formatCurrency(n){ return n.toLocaleString("vi-VN") + " ₫"; }

function renderMenu(){
  const grid = document.getElementById("menuGrid");
  MENU.forEach(item => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <input type="checkbox" id="${item.id}" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}">
      <div class="info">
        <h4>${item.name}</h4>
        <p>Mã: ${item.id} • Giá: <span class="price">${formatCurrency(item.price)}</span></p>
      </div>
    `;
    grid.appendChild(div);
  });
}

function calculateTotal(){
  let total = 0;
  MENU.forEach(item => {
    const cb = document.querySelector(`#${item.id}`);
    if(cb && cb.checked) total += item.price;
  });
  document.getElementById("totalAmount").textContent = formatCurrency(total);
  return total;
}

function getSelectedItems(){
  const items = [];
  MENU.forEach(item => {
    const cb = document.querySelector(`#${item.id}`);
    if(cb && cb.checked) items.push({ name:item.name, price:item.price });
  });
  return items;
}

function saveRecent(order){
  try{
    const raw = localStorage.getItem("gb_recent") || "[]";
    const arr = JSON.parse(raw);
    arr.unshift(order);
    if(arr.length > MAX_RECENT) arr.splice(MAX_RECENT);
    localStorage.setItem("gb_recent", JSON.stringify(arr));
  }catch(e){ console.warn("localStorage failed", e); }
}

function showRecent(){
  const sec = document.getElementById("recentSection");
  const list = document.getElementById("recentList");
  list.innerHTML = "";
  try{
    const arr = JSON.parse(localStorage.getItem("gb_recent") || "[]");
    if(arr.length === 0){
      list.innerHTML = "<div class='recent-item'>Chưa có đơn gần đây.</div>";
    }else{
      arr.forEach(o => {
        const d = document.createElement("div");
        d.className = "recent-item";
        d.innerHTML = `<div><strong>${o.name || "Khách lạ"}</strong> — ${o.time}</div>
          <div style="font-size:13px;color:#444;margin-top:6px">${o.items.map(i=>i.name).join(", ")}</div>
          <div style="margin-top:6px;font-weight:700">${formatCurrency(o.total)}</div>`;
        list.appendChild(d);
      });
    }
  }catch(e){ list.innerHTML = "<div class='recent-item'>Lỗi đọc đơn gần đây.</div>"; }
  sec.classList.remove("hidden");
}

function hideRecent(){ document.getElementById("recentSection").classList.add("hidden"); }

document.addEventListener("DOMContentLoaded", function(){
  renderMenu();
  document.getElementById("menuGrid").addEventListener("change", calculateTotal);
  calculateTotal();

  document.getElementById("previewBtn").addEventListener("click", showRecent);
  document.getElementById("closeRecent").addEventListener("click", hideRecent);

  document.getElementById("orderBtn").addEventListener("click", async function(){
    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const notes = document.getElementById("notes").value.trim();
    const receive = document.querySelector('input[name="receive"]:checked').value;
    const items = getSelectedItems();
    if(items.length === 0){ alert("Vui lòng chọn ít nhất 1 món."); return; }
    if(!name){ if(!confirm("Bạn chưa nhập tên. Tiếp tục với tên trống?")) return; }
    if(!phone){ if(!confirm("Bạn chưa nhập số điện thoại. Tiếp tục?")) return; }

    const total = calculateTotal();
    const time = new Date().toLocaleString();
    const order = { time, name, phone, items, notes, receive, total };

    // Lưu local để khách xem lại
    saveRecent(order);

    // Gửi email qua EmailJS (nếu đã cấu hình)
    try{
      if(typeof emailjs !== "undefined" && SERVICE_ID && TEMPLATE_ID){
        // Prepare template params: (đặt tên biến tuỳ ý, template trong EmailJS sẽ dùng các biến này)
        const templateParams = {
          to_email: "thuybuithi.0375632661@gmail.com",
          order_time: order.time,
          customer_name: order.name,
          customer_phone: order.phone,
          items: order.items.map(i => i.name + " - " + formatCurrency(i.price)).join("\\n"),
          notes: order.notes || "-",
          receive: order.receive,
          total: formatCurrency(order.total)
        };
        // send
        emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
          .then(function(resp){ console.log("Email sent", resp); }, function(err){ console.warn("Email error", err); });
      }
    }catch(e){ console.warn("EmailJS error:", e); }

    // Build message for Zalo
    const message = `Em tên ${order.name || ""}, SĐT: ${order.phone}, muốn đặt: ${order.items.map(i=>i.name).join(", ")}. Hình thức: ${order.receive}. Ghi chú: ${order.notes || "-"} Tổng: ${formatCurrency(order.total)}.`;
    try{ await navigator.clipboard.writeText(message); }catch(e){}

    // Show success popup (style B)
    alert("🧋 Đơn của bạn đã được gửi! Vui lòng chờ quán xác nhận nhé 💚");

    // Open Zalo (best-effort)
    const encoded = encodeURIComponent(message);
    const appUrls = [`zalo://send?phone=${ZALO_PHONE}&text=${encoded}`, `zalo://chat?phone=${ZALO_PHONE}&text=${encoded}`];
    const webUrl = `https://zalo.me/${ZALO_PHONE}?text=${encoded}`;
    for(const u of appUrls){ try{ window.open(u, "_blank"); }catch(e){} }
    setTimeout(() => { try{ window.open(webUrl, "_blank"); }catch(e){ window.location.href = webUrl; } }, 700);
  });
});
</script>
</body>
</html>
document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const drink = document.getElementById("drink").value;
  const quantity = document.getElementById("quantity").value;
  const delivery = document.getElementById("delivery").value;
  const address = document.getElementById("address").value;

  let message = `Xin chào, mình là ${name}%0A`;
  message += `📱 SĐT: ${phone}%0A`;
  message += `☕ Món: ${drink}%0A`;
  message += `🧾 Số lượng: ${quantity}%0A`;
  message += `🚚 Hình thức: ${delivery}%0A`;
  if (delivery === "Giao tận nơi" && address)
    message += `🏠 Địa chỉ: ${address}%0A`;
  message += `%0A👉 Đặt tại Gia Bảo Oder`;

  const zaloURL = `https://zalo.me/0865904246?text=${message}`;
  window.open(zaloURL, "_blank");
});

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
  renderProducts();
  renderCart();
  q('place-order').addEventListener('click', placeOrderSMS);
}
