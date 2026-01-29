// ==========================================
// SAISONALITÄT & REGIONALITÄT – FINAL (STABIL)
// - Startseite + Button
// - Monat wählen
// - Center im Kreis (Monat + Jahreszeit)
// - Chips NUR im weissen Bereich (zwischen Center-Kreis & farbigem Ring)
// - Verteilung: gleichmässig im Ring + "Stagger" gegen Überlappung
// ==========================================

const POSTER_URL = "https://i.ibb.co/wZ7HyLHw/lol.png";

// ✅ Fine-Tuning (nur diese Werte, wenn nötig)
const WHITE_RATIO = 0.62;     // passt zum CSS radial-gradient 62%
const CENTER_DIAMETER = 230;  // passt zu .wheelCenter width/height
const CENTER_GAP = 100;       // Abstand zwischen Center-Kreis und Chips
const OUTER_MARGIN = 34;      // Abstand zum Rand des weissen Kreises

// Ab wie vielen Items automatisch compact
const COMPACT_FROM = 10;

// Stagger-Stärke (macht Chips abwechselnd minimal höher/tiefer -> keine Überlappung)
const STAGGER_PX = 52;        // klein (für alle)

const app = document.getElementById("app");
renderStart();

function renderStart() {
  app.innerHTML = `
    <div class="startScreen">
      <img class="startPoster" src="${POSTER_URL}" alt="Poster">
      <div class="startOverlay">
        <h1>Saisonalität & Regionalität</h1>
        <p>Einen Schritt weiter Richtung Nachhaltigkeit</p>
        <button id="startBtn" type="button">🌿 Entdecken</button>
      </div>
    </div>
  `;
  document.getElementById("startBtn").onclick = renderApp;
}

function renderApp() {
  app.innerHTML = `
<header>
  <h1>🌱 Saisonalität & Regionalität</h1>
</header>

<main class="wrap">
  <section class="card">
    <div class="monthTitle">
      <div>
        <h2 id="monthTitle"></h2>
        <span id="seasonInfo" class="muted"></span>
      </div>
      <div class="row">
        <select id="monthSelect" aria-label="Monat wählen"></select>
        <button id="todayBtn" type="button">Heute</button>
      </div>
    </div>

    <div class="wheelWrap">
      <div class="wheel" id="wheel" aria-label="Saison-Rad"></div>
    </div>

    <p class="muted" style="margin-top:10px;">
      🍽️ = Für dieses Obst/Gemüse gibt es in diesem Monat ein Rezept<br>
      📦 <strong>(Lager)</strong> = Früher geerntet und im Lager haltbar gemacht
    </p>
  </section>

  <aside class="card detail">
    <p class="kicker">Rezepte</p>
    <h3 id="detailTitle">Rezepte des Monats</h3>
    <p class="muted" id="detailHint">Klicke auf ein 🍽️-Item im Kreis zum Filtern.</p>
    <div id="recipes" class="recipes"></div>
  </aside>
</main>
`;
  initApp();
}

function initApp() {
  const months = [
    "Januar","Februar","März","April","Mai","Juni",
    "Juli","August","September","Oktober","November","Dezember"
  ];

  const seasonForMonth = (m) =>
    (m === 12 || m === 1 || m === 2) ? "❄️ Winter" :
    (m >= 3 && m <= 5) ? "🌸 Frühling" :
    (m >= 6 && m <= 8) ? "☀️ Sommer" : "🍂 Herbst";

  const hueForMonth = (m) =>
    (m === 12 || m === 1 || m === 2) ? 210 :
    (m >= 3 && m <= 5) ? 120 :
    (m >= 6 && m <= 8) ? 45 : 25;

  const cleanName = (name) =>
    String(name || "").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim().toLowerCase();

  // Saison-Items
  const seasonByMonth = {
    1:  ["Äpfel (Lager)","Birnen (Lager)","Nüsse","Kartoffeln","Rüebli","Kohl","Lauch","Nüsslisalat","Pastinaken"],
    2:  ["Äpfel (Lager)","Birnen (Lager)","Nüsse","Kartoffeln","Rüebli","Kohl","Lauch","Nüsslisalat","Schwarzwurzeln"],
    3:  ["Äpfel (Lager)","Birnen (Lager)","Spinat","Radieschen","Kohlrabi","Salate"],
    4:  ["Rhabarber","Spargel","Spinat","Frühlingszwiebeln","Salate"],
    5:  ["Erdbeeren","Rhabarber","Spargel","Salate"],
    6:  ["Erdbeeren","Kirschen","Tomaten","Gurken","Zucchetti","Bohnen","Blumenkohl","Broccoli"],
    7:  ["Kirschen","Aprikosen","Beeren","Pfirsiche","Tomaten","Gurken","Zucchetti","Auberginen","Bohnen","Peperoni","Mais"],
    8:  ["Beeren","Pfirsiche","Nektarinen","Melonen","Tomaten","Gurken","Zucchetti","Auberginen","Mais","Karotten"],
    9:  ["Äpfel","Birnen","Zwetschgen","Trauben","Kürbis","Rüebli","Sellerie","Lauch","Randen"],
    10: ["Äpfel","Birnen","Trauben","Quitten","Kastanien","Kürbis","Rüebli","Lauch","Federkohl","Wirz","Rosenkohl"],
    11: ["Äpfel","Birnen","Nüsse","Lauch","Kohl","Randen","Sellerie","Nüsslisalat"],
    12: ["Äpfel (Lager)","Birnen (Lager)","Nüsse","Kartoffeln","Rüebli","Kohl","Lauch","Nüsslisalat"]
  };

  // Rezepte
  const recipesByMonth = {
    1: [
      { title:"Käse-Lauch-Suppe mit Rüebli", tags:["Lauch","Rüebli","Kartoffeln"],
        ingredients:["2 Stangen Lauch","3 Rüebli","3 Kartoffeln","1 Zwiebel","1 EL Butter","1 Liter Gemüsebouillon","100 g Gruyère","Salz, Pfeffer"],
        steps:["Gemüse schneiden.","Zwiebel andünsten, Gemüse dazu.","Mit Bouillon 20 Min. köcheln.","Pürieren (optional), Käse einrühren."] },
      { title:"Rösti mit Lauch und Käse", tags:["Kartoffeln","Lauch"],
        ingredients:["600 g Kartoffeln","1 Stange Lauch","100 g Gruyère","Butter, Salz, Pfeffer"],
        steps:["Kartoffeln reiben, Lauch schneiden.","In Butter braten.","Mit Käse bestreuen und knusprig fertig braten."] }
    ],
    2: [
      { title:"Pastinaken-Püree mit Bratwurst", tags:["Pastinaken","Kartoffeln"],
        ingredients:["400 g Pastinaken","400 g Kartoffeln","50 g Butter","100 ml Milch","Salz, Muskat","Bratwurst"],
        steps:["Pastinaken & Kartoffeln weich kochen.","Mit Butter/Milch stampfen.","Bratwurst braten und servieren."] },
      { title:"Aargauer Rüeblitorte", tags:["Rüebli"],
        ingredients:["300 g Rüebli","200 g gemahlene Nüsse","150 g Zucker","4 Eier","100 g Mehl","Zimt, Backpulver"],
        steps:["Rüebli reiben, mischen.","Eier/Zucker schaumig schlagen.","Backen: 180°C ca. 40 Min."] }
    ],
    3: [
      { title:"Radieschen-Salat", tags:["Radieschen"], ingredients:["Radieschen","Essig/Öl","Salz, Pfeffer"], steps:["Radieschen schneiden.","Dressing mischen.","Vermengen."] },
      { title:"Spinat-Lasagne", tags:["Spinat"], ingredients:["Spinat","Lasagneblätter","Ricotta","Tomatensauce","Käse"], steps:["Spinat dünsten.","Schichten.","Backen ca. 40 Min."] }
    ],
    4: [
      { title:"Spargel-Quiche", tags:["Spargel"], ingredients:["Teig","Spargel","Eier","Rahm","Käse"], steps:["Spargel vorbereiten.","Guss mischen.","Backen ca. 35 Min."] },
      { title:"Rhabarber-Wähe", tags:["Rhabarber"], ingredients:["Teig","Rhabarber","Eier","Rahm","Zucker"], steps:["Rhabarber schneiden.","Guss darüber.","Backen ca. 30 Min."] }
    ],
    5: [
      { title:"Erdbeer-Rhabarber-Crumble", tags:["Erdbeeren","Rhabarber"], ingredients:["Erdbeeren","Rhabarber","Zucker","Mehl","Butter"], steps:["Obst in Form.","Streusel drauf.","Backen ca. 25 Min."] },
      { title:"Spargel-Risotto", tags:["Spargel"], ingredients:["Risotto-Reis","Spargel","Zwiebel","Bouillon","Parmesan"], steps:["Reis anrösten.","Bouillon nach und nach.","Spargel dazu, Parmesan."] }
    ],
    6: [
      { title:"Kirschenwähe", tags:["Kirschen"], ingredients:["Teig","Kirschen","Eierguss"], steps:["Kirschen auf Teig.","Guss drauf.","Backen."] },
      { title:"Erdbeer-Tiramisu", tags:["Erdbeeren"], ingredients:["Erdbeeren","Mascarpone","Rahm","Biskuits"], steps:["Schichten.","Kühlen.","Servieren."] }
    ],
    7: [
      { title:"Aprikosenknödel", tags:["Aprikosen"], ingredients:["Aprikosen","Teig (Quark/Mehl)","Brösel"], steps:["Teig, füllen.","Kochen.","In Bröseln wälzen."] },
      { title:"Heidelbeer-Muffins", tags:["Beeren","Heidelbeeren"], ingredients:["Mehl","Zucker","Eier","Milch","Butter","Beeren"], steps:["Teig rühren.","Backen 20 Min."] }
    ],
    8: [
      { title:"Gefüllte Zucchetti", tags:["Zucchetti","Tomaten"], ingredients:["Zucchetti","Tomaten","Käse","Kräuter"], steps:["Füllen.","Backen/Grill."] },
      { title:"Ratatouille", tags:["Zucchetti","Auberginen","Tomaten","Peperoni"], ingredients:["Gemüse","Olivenöl","Kräuter"], steps:["Schmoren.","Würzen.","Servieren."] }
    ],
    9: [
      { title:"Zwetschgenkuchen", tags:["Zwetschgen"], ingredients:["Teig","Zwetschgen","Zucker"], steps:["Belegen.","Backen."] },
      { title:"Trauben-Focaccia", tags:["Trauben"], ingredients:["Hefeteig","Trauben","Rosmarin"], steps:["Belegen.","Backen."] }
    ],
    10: [
      { title:"Kürbissuppe", tags:["Kürbis"], ingredients:["Kürbis","Zwiebel","Bouillon","Rahm"], steps:["Kochen.","Pürieren.","Servieren."] },
      { title:"Kürbisgratin", tags:["Kürbis","Kartoffeln"], ingredients:["Kürbis","Kartoffeln","Rahm","Käse"], steps:["Schichten.","Backen."] }
    ],
    11: [
      { title:"Älplermagronen", tags:["Kartoffeln","Äpfel"], ingredients:["Hörnli","Kartoffeln","Käse","Rahm","Apfelmus"], steps:["Kochen.","Mischen.","Servieren."] },
      { title:"Marroni-Crème", tags:["Kastanien","Marroni"], ingredients:["Marroni-Püree","Rahm","Zucker"], steps:["Mischen.","Kühlen.","Servieren."] }
    ],
    12: [
      { title:"Basler Brunsli", tags:["Nüsse"], ingredients:["Mandeln","Zucker","Schokolade","Eiweiss","Zimt"], steps:["Mischen.","Ausstechen.","Kurz backen."] },
      { title:"Apfelküchlein", tags:["Äpfel"], ingredients:["Äpfel","Mehl","Milch","Ei","Öl","Zucker/Zimt"], steps:["Äpfel in Ringe.","Teig rühren.","Ausbacken.","Zimt/Zucker drüber."] }
    ]
  };

  const iconMap = {
    "äpfel":"🍎","birnen":"🍐","erdbeeren":"🍓","kirschen":"🍒","aprikosen":"🍑","beeren":"🫐","trauben":"🍇",
    "zwetschgen":"🍑","kürbis":"🎃","kartoffeln":"🥔","rüebli":"🥕","karotten":"🥕","tomaten":"🍅","gurken":"🥒",
    "zucchetti":"🥒","auberginen":"🍆","mais":"🌽","salate":"🥬","spinat":"🥬","lauch":"🧅","nüsse":"🌰"
  };

  // UI
  const wheel = document.getElementById("wheel");
  const monthTitle = document.getElementById("monthTitle");
  const seasonInfo = document.getElementById("seasonInfo");
  const monthSelect = document.getElementById("monthSelect");
  const todayBtn = document.getElementById("todayBtn");
  const recipesEl = document.getElementById("recipes");
  const detailTitle = document.getElementById("detailTitle");
  const detailHint = document.getElementById("detailHint");

  months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = String(i + 1);
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });

  const itemHasRecipe = (item, month) => {
    const key = cleanName(item);
    return (recipesByMonth[month] || []).some(r => (r.tags || []).some(t => cleanName(t) === key));
  };

  const recipesMatchingItem = (item, month) => {
    const key = cleanName(item);
    return (recipesByMonth[month] || []).filter(r => (r.tags || []).some(t => cleanName(t) === key));
  };

  function renderRecipes(list) {
    recipesEl.innerHTML = "";
    if (!list.length) return;
    for (const r of list) {
      const div = document.createElement("div");
      div.className = "recipe";
      div.innerHTML = `
        <h4>${r.title}</h4>
        <div class="kicker">Zutaten</div>
        <ul>${(r.ingredients || []).map(x => `<li>${x}</li>`).join("")}</ul>
        <div class="kicker" style="margin-top:10px;">Zubereitung</div>
        <ul>${(r.steps || []).map(x => `<li>${x}</li>`).join("")}</ul>
      `;
      recipesEl.appendChild(div);
    }
  }

  // ✅ NEUE Verteilung: gleichmässig 360/n + staggered radius (verhindert Overlaps)
  function renderMonth(month) {
    document.documentElement.style.setProperty("--accent-h", hueForMonth(month));

    monthSelect.value = String(month);
    monthTitle.textContent = months[month - 1];
    seasonInfo.textContent = `Jahreszeit: ${seasonForMonth(month)}`;

    detailTitle.textContent = "Rezepte des Monats";
    detailHint.textContent = "Klicke auf ein 🍽️-Item im Kreis zum Filtern.";
    renderRecipes(recipesByMonth[month] || []);

    wheel.innerHTML = "";
    wheel.classList.toggle("compact", (seasonByMonth[month] || []).length >= COMPACT_FROM);

    // Center
    const center = document.createElement("div");
    center.className = "wheelCenter";
    center.innerHTML = `
      <div class="m">${months[month - 1]}</div>
      <div class="s">${seasonForMonth(month)}</div>
    `;
    wheel.appendChild(center);

    const items = seasonByMonth[month] || [];
    const n = items.length || 1;

    // Geometrie: nur im weissen Bereich
    const wheelSize = wheel.getBoundingClientRect().width;
    const whiteRadius = (wheelSize / 2) * WHITE_RATIO;

    const centerRadius = CENTER_DIAMETER / 2;
    const innerR = centerRadius + CENTER_GAP;
    const outerR = Math.max(innerR + 20, whiteRadius - OUTER_MARGIN);
    const baseR = (innerR + outerR) / 2;

    // Stagger automatisch etwas kleiner, wenn wenig Platz
    const maxStagger = Math.max(10, (outerR - innerR) * 0.35);
    const stagger = Math.min(STAGGER_PX, maxStagger);

    const step = 360 / n;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      const radius = baseR;
      const angle = i * step;

      const chip = document.createElement("div");
      chip.className = "chip";
      chip.style.setProperty("--rot", angle + "deg");
      chip.style.setProperty("--radius", radius + "px");

      const badge = itemHasRecipe(item, month) ? `<span class="badge">🍽️</span>` : "";
      const key = cleanName(item);
      const icon = iconMap[key] || "🍏";

      chip.innerHTML = `<span class="dot"></span><strong>${icon} ${item}</strong>${badge}`;

      chip.onclick = () => {
        if (!itemHasRecipe(item, month)) return;
        detailTitle.textContent = item.replace(/\(.*?\)/g, "").trim();
        detailHint.textContent = "Passende Rezepte:";
        renderRecipes(recipesMatchingItem(item, month));
      };

      wheel.appendChild(chip);
    }
  }

  // Events (NUR EINMAL)
  monthSelect.onchange = (e) => renderMonth(Number(e.target.value));
  todayBtn.onclick = () => renderMonth(new Date().getMonth() + 1);
  window.addEventListener("resize", () => renderMonth(Number(monthSelect.value)));

  renderMonth(new Date().getMonth() + 1);
}