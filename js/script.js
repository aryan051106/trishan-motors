function formatINR(amount){
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}

function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function toast(title, msg){
  let t = qs("#toast");
  if(!t) return;
  t.querySelector("b").textContent = title;
  t.querySelector("span").textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2500);
}

function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  qsa(".nav-links a").forEach(a=>{
    if(a.getAttribute("href") === path) a.classList.add("active");
  });
}

/* WhatsApp helper */
function openWhatsApp(message){
  const phone = "917796700733";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* MODELS PAGE */
function renderModels(){
  const grid = qs("#modelsGrid");
  if(!grid) return;

  const search = qs("#searchInput");
  const filterBrand = qs("#brandFilter");
  const sort = qs("#sortSelect");

  // populate brand filter
  if(filterBrand && filterBrand.options.length <= 1){
    const brands = [...new Set(SCOOTERS.map(s=>s.brand))].sort();
    brands.forEach(b=>{
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      filterBrand.appendChild(opt);
    });
  }

  function apply(){
    let list = [...SCOOTERS];

    const q = (search?.value || "").trim().toLowerCase();
    if(q){
      list = list.filter(s => (s.name + " " + s.brand).toLowerCase().includes(q));
    }

    const b = filterBrand?.value || "all";
    if(b !== "all"){
      list = list.filter(s => s.brand === b);
    }

    const sorting = sort?.value || "featured";
    if(sorting === "price-low") list.sort((a,b)=>a.price-b.price);
    if(sorting === "price-high") list.sort((a,b)=>b.price-a.price);
    if(sorting === "range-high") list.sort((a,b)=>b.range-a.range);

    grid.innerHTML = list.map(s=>`
      <div class="model">
        <img src="${s.img}" alt="${s.name}" onerror="this.src='https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80'">
        <div class="body">
          <div class="top">
            <div>
              <h3>${s.name}</h3>
              <div class="meta">${s.brand} • ${s.range} km range • ${s.chargeTime} hrs charge</div>
            </div>
            <div class="price">${formatINR(s.price)}</div>
          </div>
          <div class="actions">
            <button class="btn btn-primary small" onclick="goDetails('${s.id}')">View Details</button>
            <button class="btn btn-outline small" onclick="openWhatsApp('Hi Trishan Motors, I want to inquire about ${s.name}. Please share price and availability in Akola.')">WhatsApp</button>
          </div>
        </div>
      </div>
    `).join("") || `<div class="card">No scooters found.</div>`;
  }

  ["input","change"].forEach(evt=>{
    search?.addEventListener(evt, apply);
    filterBrand?.addEventListener(evt, apply);
    sort?.addEventListener(evt, apply);
  });

  apply();
}

function goDetails(id){
  localStorage.setItem("tm_selected_scooter", id);
  window.location.href = "details.html";
}

/* DETAILS PAGE */
function renderDetails(){
  const wrap = qs("#detailsWrap");
  if(!wrap) return;

  const id = localStorage.getItem("tm_selected_scooter") || SCOOTERS[0].id;
  const s = SCOOTERS.find(x=>x.id===id) || SCOOTERS[0];

  wrap.innerHTML = `
    <div class="detail-grid">
      <div class="gallery">
        <img src="${s.img}" alt="${s.name}" onerror="this.src='https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80'">
      </div>

      <div class="detail-card">
        <div class="badge">⚡ ${s.offer}</div>
        <h1 style="margin:12px 0 6px">${s.name}</h1>
        <div style="color:var(--muted);line-height:1.6">${s.desc}</div>

        <hr class="sep">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <div>
            <div style="color:var(--muted);font-weight:800;font-size:13px">Starting Price</div>
            <div style="font-size:26px;font-weight:1000">${formatINR(s.price)}</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="bookTestRide('${s.id}')">📅 Book Test Ride</button>
            <button class="btn btn-outline" onclick="openWhatsApp('Hi Trishan Motors, I want to buy ${s.name}. Please guide me with booking and payment.')">💬 WhatsApp Buy</button>
          </div>
        </div>

        <div class="specs">
          <div class="spec"><b>${s.range} km</b><span>Range (IDC)</span></div>
          <div class="spec"><b>${s.topSpeed} km/h</b><span>Top Speed</span></div>
          <div class="spec"><b>${s.chargeTime} hrs</b><span>Charging Time</span></div>
          <div class="spec"><b>${s.battery}</b><span>Battery</span></div>
          <div class="spec"><b>${s.motor}</b><span>Motor</span></div>
          <div class="spec"><b>${s.warranty}</b><span>Warranty</span></div>
        </div>
      </div>
    </div>
  `;
}

function bookTestRide(id){
  localStorage.setItem("tm_book_scooter", id);
  window.location.href = "book.html";
}

/* BOOK PAGE */
function initBookingForm(){
  const form = qs("#bookingForm");
  if(!form) return;

  const scooterId = localStorage.getItem("tm_book_scooter") || SCOOTERS[0].id;
  const s = SCOOTERS.find(x=>x.id===scooterId) || SCOOTERS[0];

  qs("#bookingScooterName").textContent = s.name;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const name = qs("#b_name").value.trim();
    const phone = qs("#b_phone").value.trim();
    const date = qs("#b_date").value;
    const msg = qs("#b_msg").value.trim();

    if(name.length < 2) return toast("Invalid Name", "Please enter full name.");
    if(!/^[0-9]{10}$/.test(phone)) return toast("Invalid Phone", "Enter 10 digit number.");
    if(!date) return toast("Select Date", "Choose preferred test ride date.");

    const bookings = JSON.parse(localStorage.getItem("tm_bookings") || "[]");
    bookings.push({ name, phone, date, msg, scooter: s.name, time: new Date().toISOString() });
    localStorage.setItem("tm_bookings", JSON.stringify(bookings));

    toast("Booked ✅", "Your test ride request has been saved.");

    openWhatsApp(`Hi Trishan Motors, I want to book a Test Ride.\n\nName: ${name}\nPhone: ${phone}\nScooter: ${s.name}\nPreferred Date: ${date}\nMessage: ${msg || "N/A"}\n\nLocation: Akola`);

    form.reset();
  });
}

/* EMI PAGE */
function initEMI(){
  const form = qs("#emiForm");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const principal = Number(qs("#emi_amount").value);
    const rate = Number(qs("#emi_rate").value);
    const years = Number(qs("#emi_years").value);

    if(principal <= 0 || rate <= 0 || years <= 0){
      return toast("Invalid Input", "Enter proper values for EMI.");
    }

    const r = (rate/100)/12;
    const n = years*12;
    const emi = (principal*r*Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);

    qs("#emiResult").innerHTML = `
      <div class="card">
        <h3>Monthly EMI: ${formatINR(Math.round(emi))}</h3>
        <p>Total Payment: <b>${formatINR(Math.round(emi*n))}</b></p>
        <p>Total Interest: <b>${formatINR(Math.round(emi*n - principal))}</b></p>
      </div>
    `;
    toast("Calculated ✅", "EMI result generated.");
  });
}

/* CONTACT PAGE */
function initContact(){
  const form = qs("#contactForm");
  if(!form) return;

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = qs("#c_name").value.trim();
    const phone = qs("#c_phone").value.trim();
    const msg = qs("#c_msg").value.trim();

    if(name.length < 2) return toast("Invalid Name","Please enter name.");
    if(!/^[0-9]{10}$/.test(phone)) return toast("Invalid Phone","Enter 10 digit phone.");
    if(msg.length < 5) return toast("Message too short","Write at least 5 characters.");

    toast("Sent ✅", "We received your inquiry.");

    openWhatsApp(`Hi Trishan Motors,\n\nName: ${name}\nPhone: ${phone}\nMessage: ${msg}\n\nLocation: Akola`);
    form.reset();
  });
}

/* Init */
document.addEventListener("DOMContentLoaded", ()=>{
  setActiveNav();
  renderModels();
  renderDetails();
  initBookingForm();
  initEMI();
  initContact();
});
