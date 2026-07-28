// ---------------------------------------------------------------------------
// Orina portfolio — frontend behavior
// ---------------------------------------------------------------------------

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Build nav items with dropdowns ---------- */
const navItems = [
  { label: "Home", href: "#top" },
  { label: "Companies", href: "#work" },
  { label: "About Us", href: "#about" },
  { label: "Our Foundation", href: "#foundation" },
  { label: "News", href: "#news" },
  { label: "Support", href: "mailto:mokuaedwin63@gmail.com" },
];

const navLinksContainer = document.getElementById("navLinks");
const dropdownTemplate = document.getElementById("navDropdownTemplate");

navItems.forEach((item, i) => {
  const wrapper = document.createElement("div");
  wrapper.className = "nav__item";

  const link = document.createElement("a");
  link.className = "nav__link";
  link.href = item.href;
  link.textContent = item.label;
  if (item.external) {
    link.target = "_blank";
    link.rel = "noopener";
  }

  const caret = document.createElement("button");
  caret.className = "nav__caret";
  caret.type = "button";
  caret.setAttribute("aria-expanded", "false");
  caret.setAttribute("aria-label", `Toggle ${item.label} menu`);
  caret.textContent = "▾";

  const dropdown = dropdownTemplate.content.cloneNode(true);

  wrapper.appendChild(link);
  wrapper.appendChild(caret);
  wrapper.appendChild(dropdown);
  navLinksContainer.appendChild(wrapper);

  caret.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = wrapper.classList.contains("is-open");
    closeAllDropdowns();
    if (!isOpen) {
      wrapper.classList.add("is-open");
      caret.setAttribute("aria-expanded", "true");
    }
  });
});

function closeAllDropdowns() {
  document.querySelectorAll(".nav__item.is-open").forEach((el) => {
    el.classList.remove("is-open");
    el.querySelector(".nav__caret")?.setAttribute("aria-expanded", "false");
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav__item")) closeAllDropdowns();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAllDropdowns();
});

/* ---------- Auth modal (Sign in / Sign up) ---------- */
const authModal = document.getElementById("authModal");
const authModalTitle = document.getElementById("authModalTitle");

document.addEventListener("click", (e) => {
  const authTrigger = e.target.closest("[data-auth]");
  if (authTrigger) {
    e.preventDefault();
    authModalTitle.textContent = authTrigger.dataset.auth === "signup" ? "Sign up" : "Sign in";
    authModal.hidden = false;
    closeAllDropdowns();
  }
  if (e.target.closest("[data-close-modal]")) {
    authModal.hidden = true;
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") authModal.hidden = true;
});

/* ---------- Nav: scrolled state + mobile toggle ---------- */
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav__links");

window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 10);
  updateTideline();
}, { passive: true });

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

/* ---------- Tide-line scroll progress ---------- */
const tidelineFill = document.querySelector(".tideline__fill");
function updateTideline() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  tidelineFill.style.width = `${pct}%`;
}
updateTideline();

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

function observeReveals(container) {
  container.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

/* ---------- Load projects from the API ---------- */
async function loadProjects() {
  const container = document.getElementById("projects");
  try {
    const res = await fetch("/api/projects");
    if (!res.ok) throw new Error("Failed to load projects");
    const { projects } = await res.json();

    container.innerHTML = projects
      .map(
        (p, i) => `
      <article class="project-card reveal" style="transition-delay:${i * 60}ms">
        <div class="project-card__thumb">
          <img src="${p.image}" alt="${p.title} preview" loading="lazy" />
        </div>
        <div class="project-card__meta">
          <span>${p.tag}</span>
          <span>${p.year}</span>
        </div>
        <h3>${p.title}</h3>
        <p>${p.summary}</p>
        <div class="project-card__stack">
          ${p.stack.map((s) => `<span>${s}</span>`).join("")}
        </div>
        <div class="project-card__links">
          <a href="${p.link}" target="_blank" rel="noopener">View project →</a>
          <a href="${p.repo}" target="_blank" rel="noopener">Source</a>
        </div>
      </article>`
      )
      .join("");

    observeReveals(container);
  } catch (err) {
    container.innerHTML = `<p class="projects__loading">Couldn't load projects right now — please refresh.</p>`;
    console.error(err);
  }
}

/* ---------- Load skills from the API ---------- */
async function loadSkills() {
  const container = document.getElementById("skills-list");
  try {
    const res = await fetch("/api/skills");
    if (!res.ok) throw new Error("Failed to load skills");
    const { groups } = await res.json();

    container.innerHTML = groups
      .map(
        (g) => `
      <div class="skill-group reveal">
        <h3>${g.label}</h3>
        <ul>${g.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>`
      )
      .join("");

    observeReveals(container);
  } catch (err) {
    container.innerHTML = `<p class="projects__loading">Couldn't load the toolkit right now — please refresh.</p>`;
    console.error(err);
  }
}

/* ---------- Contact form ---------- */
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const formStatus = document.getElementById("formStatus");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
    company: form.company.value, // honeypot
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    formStatus.textContent = "Thanks — your message is in. I'll reply within a couple of days.";
    formStatus.classList.add("success");
    form.reset();
  } catch (err) {
    formStatus.textContent = err.message || "Something went wrong. Please try again.";
    formStatus.classList.add("error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send message";
  }
});

/* ---------- Init ---------- */
document.querySelectorAll(".section__head").forEach((el) => el.classList.add("reveal"));
observeReveals(document);
loadProjects();
loadSkills();
