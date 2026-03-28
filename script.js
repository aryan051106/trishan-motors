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

/* TAB SWITCH */
function switchTab(id, el){
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  el.classList.add("active");

  const data = SCOOTERS.filter(s => s.id === id);
  renderModels(data);
}

/* RENDER MODELS (NO IMAGE VERSION) */
function renderModels(list){
  const grid = document.getElementById("modelsGrid");
  if(!grid) return;

  grid.innerHTML = list.map(s=>`
    <div class="model">
      
      <div style="height:200px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.03);">
        <span style="color:#888;font-weight:600">View on WhatsApp</span>
      </div>

      <div class="body">
        <div class="top">
          <h3>${s.name}</h3>
          <div class="price">${formatINR(s.price)}</div>
        </div>

        <div class="actions">
          <a href="https://wa.me/917796700733" target="_blank" class="btn btn-primary small">
            WhatsApp Now
          </a>
        </div>
      </div>

    </div>
  `).join("");
}

/* DETAILS PAGE (SIMPLIFIED) */
function renderDetails(){
  const wrap = qs("#detailsWrap");
  if(!wrap) return;

  const id = localStorage.getItem("tm_selected_scooter") || SCOOTERS[0].id;
  const s = SCOOTERS.find(x=>x.id===id) || SCOOTERS[0];

  wrap.innerHTML = `
    <div class="detail-grid">

      <div class="gallery">
        <img src="https://via.placeholder.com/600x400?text=Contact+on+WhatsApp" alt="${s.name}">
      </div>

      <div class="detail-card">
        <h1 style="margin:12px 0 6px">${s.name}</h1>

        <hr class="sep">

        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <div>
            <div style="color:var(--muted);font-weight:800;font-size:13px">Price</div>
            <div style="font-size:26px;font-weight:1000">${formatINR(s.price)}</div>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="openWhatsApp('Hi Trishan Motors, I want to buy ${s.name}. Please share details.')">
              💬 WhatsApp Buy
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
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

    if(name.length < 2) return toast("Invalid Name", "Please enter full name.");
    if(!/^[0-9]{10}$/.test(phone)) return toast("Invalid Phone", "Enter 10 digit number.");
    if(!date) return toast("Select Date", "Choose preferred test ride date.");

    toast("Booked ✅", "Your request has been saved.");

    openWhatsApp(`Hi Trishan Motors, I want to book ${s.name}\nName: ${name}\nPhone: ${phone}\nDate: ${date}`);

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
      return toast("Invalid Input", "Enter proper values.");
    }

    const r = (rate/100)/12;
    const n = years*12;
    const emi = (principal*r*Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);

    qs("#emiResult").innerHTML = `
      <div class="card">
        <h3>Monthly EMI: ${formatINR(Math.round(emi))}</h3>
      </div>
    `;
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

    if(name.length < 2) return toast("Invalid Name","Enter name.");
    if(!/^[0-9]{10}$/.test(phone)) return toast("Invalid Phone","Enter 10 digit phone.");

    openWhatsApp(`Hi Trishan Motors\nName: ${name}\nPhone: ${phone}`);
    form.reset();
  });
}

/* INIT */
document.addEventListener("DOMContentLoaded", ()=>{
  setActiveNav();
  renderDetails();
  initBookingForm();
  initEMI();
  initContact();
});