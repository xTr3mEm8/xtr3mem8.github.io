// Cris Malus — Portfolio scripts (no dependencies)
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile nav
  const btn = $(".menu-btn"), list = $(".nav ul");
  if (btn && list) btn.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  $$(".nav ul a").forEach(a => a.addEventListener("click", () => list && list.classList.remove("open")));

  // Boot animation — plays once per visit
  if (document.body.classList.contains("home")) {
    let seen = false;
    try { seen = sessionStorage.getItem("booted") === "1"; sessionStorage.setItem("booted", "1"); } catch (e) {}
    if (!seen) document.body.classList.add("boot");
  }

  // Console menu: arrow keys move the selection, Enter opens it
  const items = $$(".menu-panel li a");
  if (items.length) {
    let i = 0;
    const sel = n => { items.forEach(a => a.classList.remove("sel")); i = (n + items.length) % items.length; items[i].classList.add("sel"); };
    sel(0);
    items.forEach((a, n) => a.addEventListener("mouseenter", () => sel(n)));
    document.addEventListener("keydown", e => {
      if (window.scrollY > window.innerHeight * 0.6) return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
      if (e.key === "ArrowDown") { e.preventDefault(); sel(i + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel(i - 1); }
      else if (e.key === "Enter" && document.activeElement === document.body) { items[i].click(); }
    });
  }

  // Active nav link while scrolling
  const links = $$(".nav a.link[href^='#']");
  const secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if (secs.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(s => io.observe(s));
  }

  // Reveal on scroll
  const rev = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
    }), { threshold: 0.12 });
    rev.forEach(el => ro.observe(el));
  } else rev.forEach(el => el.classList.add("in"));

  // Only play looping clips while they're on screen
  const vids = $$("video[data-auto]");
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver(es => es.forEach(en => {
      const v = en.target;
      if (en.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); } else v.pause();
    }), { threshold: 0.25 });
    vids.forEach(v => vo.observe(v));
  }

  // Lightbox for screenshots
  const lb = document.createElement("div");
  lb.className = "lb"; lb.innerHTML = "<img alt=''>";
  document.body.appendChild(lb);
  lb.addEventListener("click", () => lb.classList.remove("on"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("on"); });
  $$(".shots a").forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); $("img", lb).src = a.href; $("img", lb).alt = a.querySelector("img").alt; lb.classList.add("on");
  }));

  // Tiny C++ highlighter
  const KW = /\b(if|else|return|void|bool|float|double|int|const|auto|static_cast|nullptr|true|false|for|while|class|struct|public|private|this|virtual|override)\b/g;
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  $$("pre code.cpp").forEach(el => {
    const src = el.textContent;
    const re = /(\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(#\w+)|(\b\d+(?:\.\d+)?f?\b)|(\b[UAFIE][A-Z]\w+\b)|([A-Za-z_]\w*)|([\s\S])/g;
    let out = "", m;
    while ((m = re.exec(src))) {
      if (m[1]) out += `<span class="tok-c">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tok-s">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tok-p">${esc(m[3])}</span>`;
      else if (m[4]) out += `<span class="tok-n">${m[4]}</span>`;
      else if (m[5]) out += `<span class="tok-t">${m[5]}</span>`;
      else if (m[6]) out += KW.test(m[6]) ? `<span class="tok-k">${m[6]}</span>` : m[6];
      else out += esc(m[7]);
      KW.lastIndex = 0;
    }
    el.innerHTML = out;
  });
})();
