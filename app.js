const container    = document.getElementById("cafes-container");
const loading      = document.getElementById("loading");
const searchInput  = document.getElementById("search");
const emptyState   = document.getElementById("empty-state");
const resultsCount = document.getElementById("results-count");
const filterTags   = document.querySelectorAll(".tag");

let cafesData    = [];
let activeFilter = "all";

const DATA = [
  {
    title: "Café Delhi",
    description: "A quiet corner perfect for long study sessions with great filter coffee.",
    emoji: "📖",
    tags: ["study", "quiet"],
    rating: 4.7,
    strip: "linear-gradient(90deg,#c07e3a,#e8a84b)"
  },
  {
    title: "Brew House",
    description: "Lively atmosphere with board games — perfect for a fun evening with friends.",
    emoji: "🎲",
    tags: ["friends", "lively"],
    rating: 4.5,
    strip: "linear-gradient(90deg,#7b5ea7,#b08ddb)"
  },
  {
    title: "Urban Café",
    description: "Minimalist interiors, cold brews, and fast Wi-Fi. Built for the modern creative.",
    emoji: "🖥️",
    tags: ["study", "aesthetic"],
    rating: 4.6,
    strip: "linear-gradient(90deg,#3a7bd5,#6faee8)"
  },
  {
    title: "Coffee Corner",
    description: "Student-friendly prices and generous portions. Never leaves your wallet hurting.",
    emoji: "💸",
    tags: ["budget", "friends"],
    rating: 4.2,
    strip: "linear-gradient(90deg,#43a47a,#7fd4a8)"
  },
  {
    title: "Mocha Magic",
    description: "Dreamy décor and whipped drinks made for your Instagram grid.",
    emoji: "📸",
    tags: ["aesthetic", "friends"],
    rating: 4.8,
    strip: "linear-gradient(90deg,#e05c97,#f5a2c6)"
  },
  {
    title: "Chill Beans",
    description: "Deep armchairs, lo-fi music, and endless refills. Your remote office awaits.",
    emoji: "🎧",
    tags: ["study", "budget"],
    rating: 4.4,
    strip: "linear-gradient(90deg,#c07e3a,#d4a464)"
  },
  {
    title: "Café Connect",
    description: "The social hub of the neighbourhood — open mics, events, and great espresso.",
    emoji: "🎤",
    tags: ["friends", "aesthetic"],
    rating: 4.6,
    strip: "linear-gradient(90deg,#e07b39,#f5a865)"
  },
  {
    title: "The Roast Room",
    description: "Single-origin beans and serious baristas. For the true coffee connoisseur.",
    emoji: "☕",
    tags: ["study", "aesthetic"],
    rating: 4.9,
    strip: "linear-gradient(90deg,#2b1a0f,#7a5230)"
  },
  {
    title: "Penny Brew",
    description: "Delicious chai and snacks at prices that make sense for a student budget.",
    emoji: "🍵",
    tags: ["budget", "study"],
    rating: 4.3,
    strip: "linear-gradient(90deg,#5aab5a,#a0d46b)"
  }
];

function updateResultsBar(count) {
  resultsCount.textContent = count === cafesData.length
    ? `Showing all ${count} cafés`
    : `${count} café${count !== 1 ? "s" : ""} found`;
}

function showEmpty(show) {
  emptyState.style.display = show ? "block" : "none";
}

function displayCafes(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    showEmpty(true);
    updateResultsBar(0);
    return;
  }

  showEmpty(false);
  updateResultsBar(data.length);

  data.forEach(cafe => {
    const card = document.createElement("div");
    card.className = "cafe-card";

    const tagHTML = cafe.tags
      .map(t => `<span class="card-tag">${t}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card-strip" style="background:${cafe.strip}"></div>
      <div class="card-body">
        <span class="card-emoji">${cafe.emoji}</span>
        <h3>${cafe.title}</h3>
        <p class="desc">${cafe.description}</p>
        <div class="card-footer">
          <div class="card-tags">${tagHTML}</div>
          <div class="card-rating">★ ${cafe.rating}</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();

  const filtered = cafesData.filter(cafe => {
    const matchesSearch =
      cafe.title.toLowerCase().includes(query) ||
      cafe.description.toLowerCase().includes(query) ||
      cafe.tags.some(t => t.includes(query));

    const matchesFilter =
      activeFilter === "all" || cafe.tags.includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  displayCafes(filtered);
}

searchInput.addEventListener("input", applyFilters);

filterTags.forEach(tag => {
  tag.addEventListener("click", () => {
    filterTags.forEach(t => t.classList.remove("active"));
    tag.classList.add("active");
    activeFilter = tag.dataset.filter;
    applyFilters();
  });
});

function fetchCafes() {
  loading.style.display = "block";
  container.innerHTML   = "";
  showEmpty(false);

  setTimeout(() => {
    cafesData = DATA;
    loading.style.display = "none";
    displayCafes(cafesData);
    updateResultsBar(cafesData.length);
  }, 850);
}

fetchCafes();
```

---

Just copy-paste each block into their respective files. Folder structure reminder:
```
