const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.getElementById("main-navigation");

function setMenuOpen(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", () => setMenuOpen(menuToggle.getAttribute("aria-expanded") === "false"));

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.querySelector(".site-header").addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

window.matchMedia("(min-width: 44rem)").addEventListener("change", () => setMenuOpen(false));

const examples = {
  meta: {
    spend: "KSh 384,000", result: "1,000", cost: "KSh 384",
    resultLabel: "Orders", costLabel: "Cost per order",
    chartLabel: "Orders by week", weeks: [170, 220, 280, 330], chartMax: 400,
    salesLabel: "Sales from 1,000 orders", sales: "KSh 4,800,000",
    directCostLabel: "Cost of goods and delivery", directCost: "− KSh 3,500,000",
    remainder: "KSh 896,000",
    decision: "Put more of the budget into the Facebook or Instagram ad that brings in orders at a lower cost. Set aside a little to try a new ad.",
  },
  google: {
    spend: "KSh 32,000", result: "64", cost: "KSh 500",
    resultLabel: "Sales enquiries", costLabel: "Cost per enquiry",
    chartLabel: "Sales enquiries by week", weeks: [10, 14, 18, 22], chartMax: 24,
    salesLabel: "Sales from 8 jobs booked", sales: "KSh 360,000",
    directCostLabel: "Cost of completing those jobs", directCost: "− KSh 250,000",
    remainder: "KSh 58,000",
    decision: "Stop paying for unrelated searches. Put more of the budget toward searches that bring in serious enquiries.",
  },
};

const fields = {
  spend: "spend", result: "result", cost: "cost", "result-label": "resultLabel",
  "cost-label": "costLabel", "chart-label": "chartLabel", decision: "decision",
  "sales-label": "salesLabel", sales: "sales", "direct-cost-label": "directCostLabel",
  "direct-cost": "directCost", remainder: "remainder",
};
const channels = document.querySelectorAll("[data-channel]");
const chart = document.getElementById("chart");

function showExample(channel) {
  const example = examples[channel];
  for (const [id, key] of Object.entries(fields)) {
    document.getElementById(id).textContent = example[key];
  }
  document.getElementById("expense-spend").textContent = "− " + example.spend;
  chart.setAttribute("aria-label", example.chartLabel + ": " + example.weeks.join(", "));
  for (const [index, bar] of Array.from(chart.children).entries()) {
    bar.style.height = (example.weeks[index] / example.chartMax) * 100 + "%";
    bar.firstElementChild.textContent = example.weeks[index];
  }
  for (const button of channels) {
    button.setAttribute("aria-pressed", String(button.dataset.channel === channel));
  }
}

for (const button of channels) {
  button.addEventListener("click", () => showExample(button.dataset.channel));
}

document.querySelector(".hero-results a").addEventListener("click", () => showExample("meta"));

const orderInbox = document.getElementById("order-inbox");
function loadOrderInbox() {
  const script = document.createElement("script");
  script.src = orderInbox.dataset.script;
  document.head.append(script);
}

if ("IntersectionObserver" in window) {
  const preload = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    preload.disconnect();
    loadOrderInbox();
  }, { rootMargin: "500px" });
  preload.observe(orderInbox);

  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });
  document.querySelectorAll("[data-reveal]").forEach((element) => reveal.observe(element));
} else {
  loadOrderInbox();
}

const form = document.getElementById("brief-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = new FormData(form);
  const message = [
    "Hello Sephanly, I’d like a quote for ads management.",
    "",
    "What I sell: " + fields.get("business").trim(),
    "Where my customers are: " + (fields.get("area").trim() || "—"),
    "Website or social page: " + (fields.get("website") || "—"),
    "Where I’d like to advertise: " + fields.get("channel"),
    "Monthly ad budget in KSh: " + (fields.get("budget").trim() || "Help me decide"),
    "What I’d like to achieve: " + fields.get("goal").trim(),
  ].join("\n");
  const contact = new URL(document.getElementById("whatsapp-contact").href);
  contact.searchParams.set("text", message);
  document.getElementById("form-status").textContent = "Review and send your message in WhatsApp.";
  window.location.assign(contact.href);
});
