const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const errorState = document.getElementById("errorState");
const errorMsg = document.getElementById("errorMsg");
const emptyState = document.getElementById("emptyState");
const search = document.getElementById("search");
const retryBtn = document.getElementById("retryBtn");
const locLabel = document.getElementById("locLabel");
const statCount = document.getElementById("statCount");
const statRadius = document.getElementById("statRadius");
const filterBtns = document.querySelectorAll(".pill");
const sortSelect = document.getElementById("sortSelect");

let allCafes = [], activeFilter = "all", userLat = null, userLng = null;

const ACCENTS = [
  "linear-gradient(90deg,#b8722a,#d4a043)",
  "linear-gradient(90deg,#5c3d1e,#b8722a)",
  "linear-gradient(90deg,#d4a043,#e8c87a)",
  "linear-gradient(90deg,#2e1f0e,#5c3d1e)",
  "linear-gradient(90deg,#8a7560,#b8a080)"
];

function emoji(tags) {
  const c = (tags.cuisine || "").toLowerCase();
  if (c.includes("tea")) return "🍵";
  if (c.includes("bakery")) return "🥐";
  return "☕";
}

function address(tags) {
  const p = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean);
  return p.length ? p.join(", ") : "Address not listed";
}

function isOpen(h) {
  try {
    const m = h.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (!m) return false;
    const now = new Date(), t = now.getHours() + now.getMinutes() / 60;
    return t >= +m[1] + +m[2]/60 && t < +m[3] + +m[4]/60;
  } catch { return false; }
}

function badges(tags) {
  const b = [];
  if (tags.internet_access === "wlan" || tags.wifi === "yes") b.push({ label:"WiFi", cls:"badge--wifi", filter:"wifi" });
  if (tags.outdoor_seating === "yes") b.push({ label:"Outdoor", cls:"badge--outdoor", filter:"outdoor" });
  if (tags["diet:vegetarian"] === "yes" || tags["diet:vegan"] === "yes") b.push({ label:"Veg", cls:"badge--veg", filter:"veg" });
  if (tags.opening_hours && isOpen(tags.opening_hours)) b.push({ label:"Open", cls:"badge--open", filter:"open" });
  return b;
}

function calculateKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1));
}

async function fetchCafes(lat, lng, r = 3000) {
  loader.style.display = "flex";
  errorState.style.display = emptyState.style.display = "none";
  grid.innerHTML = "";
  statRadius.textContent = (r/1000).toFixed(0) + "km";

  const q = `[out:json][timeout:30];(node["amenity"="cafe"](around:${r},${lat},${lng});node["amenity"="coffee_shop"](around:${r},${lat},${lng}););out body 20;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const json = await res.json();
    let results = (json.elements || []).filter(p => p.tags?.name);

    if (!results.length && r < 10000) return fetchCafes(lat, lng, 10000);

    allCafes = results.map((p, i) => ({
      name: p.tags.name,
      address: address(p.tags),
      emoji: emoji(p.tags),
      badges: badges(p.tags),
      hours: p.tags.opening_hours || null,
      distance: calculateKm(lat, lng, p.lat, p.lon),
      accent: ACCENTS[i % ACCENTS.length]
    }));

    statCount.textContent = allCafes.length;
    render();
  } catch(e) {
    errorState.style.display = "block";
    errorMsg.textContent = e.message;
  } finally {
    loader.style.display = "none";
  }
}

function render() {
  grid.innerHTML = "";
  const query = search.value.toLowerCase().trim();
  const sortType = sortSelect.value;

  const filtered = allCafes
    .filter(c => {
      const matchSearch = !query || c.name.toLowerCase().includes(query) || c.address.toLowerCase().includes(query);
      const matchFilter = activeFilter === "all" || c.badges.some(b => b.filter === activeFilter);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortType === "distance") return a.distance - b.distance;
      if (sortType === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  if (!filtered.length) {
    emptyState.style.display = "block";
    return;
  }
  
  emptyState.style.display = "none";

  filtered.map(c => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card__strip" style="background:${c.accent}"></div>
      <div class="card__head">
        <div class="card__icon">${c.emoji}</div>
        <div class="card__badges">${c.badges.map(b=>`<span class="badge ${b.cls}">${b.label}</span>`).join("")}</div>
      </div>
      <div class="card__body">
        <h3 class="card__name">${c.name}</h3>
        <p class="card__addr">${c.address}</p>
        <div class="card__meta">
          <span class="card__dist">📍 ${c.distance} km</span>
          <span class="card__hours">${c.hours ? c.hours.split(";")[0] : "Hours unknown"}</span>
        </div>
      </div>`;
    grid.appendChild(el);
  });
}

search.addEventListener("input", render);
sortSelect.addEventListener("change", render);

filterBtns.forEach(b => b.addEventListener("click", () => {
  filterBtns.forEach(x => x.classList.remove("pill--active"));
  b.classList.add("pill--active");
  activeFilter = b.dataset.filter;
  render();
}));

retryBtn.addEventListener("click", () => fetchCafes(userLat ?? 28.9931, userLng ?? 77.0151));

navigator.geolocation.getCurrentPosition(
  p => { 
    userLat = p.coords.latitude; 
    userLng = p.coords.longitude; 
    locLabel.textContent = "📍 Near you"; 
    fetchCafes(userLat, userLng); 
  },
  () => { 
    userLat = 28.9931; 
    userLng = 77.0151; 
    locLabel.textContent = "📍 Sonipat"; 
    fetchCafes(userLat, userLng); 
  },
  { timeout: 6000 }
);