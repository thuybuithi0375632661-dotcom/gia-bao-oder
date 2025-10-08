Gia Bảo Order - static web (no backend)
Files:
- index.html : main page
- style.css  : styles
- script.js  : javascript: builds message and tries to open Zalo with prefilled message; also copies message to clipboard

How to use:
1. Download and unzip.
2. Open index.html in browser.
3. Fill name (optional) and notes, choose item, click "Đặt hàng".
4. The site will attempt to open Zalo app or zalo.me link. If message isn't auto-filled, the text is already copied — paste into Zalo chat and send.

Phone used for Zalo: 0865904246
Message template:
Em tên [Tên khách], muốn đặt [Tên món] [Giá], [Ghi chú], nhận tại quán ạ.Gia Bảo - Static Order Page
===========================
This is a simple static website for ordering drinks and sending the order via SMS to the shop owner.

How to use:
1. Extract the zip.
2. Upload files to GitHub repository (or Vercel, Netlify).
3. Deploy as a static site. On phones, the "Đặt hàng qua SMS" button opens the SMS app prefilled with the order to 0865904246.

Features:
- Mobile-first layout
- Add to cart, change quantities
- Order summary and SMS sending

Edit:
- Modify phone or shop name in index.html (APP_CONFIG) or in script.js variable `phoneToSend`.
