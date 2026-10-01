// SoluView pre-launch configuration.
// Replace each checkoutUrl with your Stripe, Lemon Squeezy, Paddle, or application URL when ready.
const membershipConfig = {
  founding: { price: "US$250 / first year", checkoutUrl: "membership.html" },
  agency: { price: "US$750 / first year", checkoutUrl: "membership.html" },
  design: { price: "US$1,500 / first year", checkoutUrl: "membership.html" }
};

// Update only with real reservation data. Defaults intentionally do not imply sales.
const foundingMembers = 0;
const foundingMemberLimit = 50;

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-menu");

  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 18);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.classList.toggle("open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  const closeDropdowns = () => menu.querySelectorAll(".nav-dropdown[open]").forEach(dropdown => {
    dropdown.open = false;
  });

  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    closeDropdowns();
  }));
  document.addEventListener("click", event => {
    if (!menu.contains(event.target)) closeDropdowns();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeDropdowns();
  });

  const tabTitles = {
    overview: ["PROPERTY WORKSPACE / OVERVIEW", "Apartment 304"],
    property: ["PROPERTY WORKSPACE / INTERACTIVE EXPERIENCE", "Apartment 304"],
    assistant: ["PROPERTY WORKSPACE / AI ASSISTANT", "Verified property answers"],
    marketing: ["PROPERTY WORKSPACE / MARKETING", "Campaign studio"],
    leads: ["PROPERTY WORKSPACE / LEADS", "Qualified interest"],
    analytics: ["PROPERTY WORKSPACE / ANALYTICS", "Property performance"]
  };
  const tabs = document.querySelectorAll(".explorer-tab");
  const panels = document.querySelectorAll(".tab-panel");
  const title = document.getElementById("stage-title");
  const breadcrumb = document.getElementById("stage-breadcrumb");

  const countUp = root => root.querySelectorAll("[data-count]").forEach(node => {
    if (node.dataset.played === "true") return;
    node.dataset.played = "true";
    const target = Number(node.dataset.count);
    if (reduceMotion) { node.textContent = target.toLocaleString(); return; }
    const start = performance.now();
    const duration = 700;
    const draw = now => {
      const progress = Math.min((now - start) / duration, 1);
      node.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3))).toLocaleString();
      if (progress < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  });

  const activateTab = tabId => {
    tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabId));
    panels.forEach(panel => panel.classList.toggle("active", panel.id === tabId));
    breadcrumb.textContent = tabTitles[tabId][0];
    title.textContent = tabTitles[tabId][1];
    if (tabId === "overview") countUp(document.getElementById("overview"));
    if (tabId === "analytics") document.querySelectorAll(".bar-chart b").forEach(bar => { bar.style.width = `${bar.dataset.width}%`; });
  };
  tabs.forEach(tab => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));
  countUp(document.getElementById("overview"));

  const hotspotData = {
    living: ["Living Room", "Open-plan living and dining space with large window frontage."],
    kitchen: ["Kitchen", "Integrated kitchen layout positioned beside the main dining area."],
    master: ["Master Bedroom", "Private primary suite with direct access to the apartment's main corridor."],
    balcony: ["Balcony", "Outdoor extension connected to the living space."]
  };
  const popover = document.querySelector(".hotspot-popover");
  document.querySelectorAll(".hotspot").forEach(button => button.addEventListener("click", () => {
    const [heading, detail] = hotspotData[button.dataset.hotspot];
    popover.innerHTML = `<b>${heading}</b><span>${detail}</span>`;
  }));
  document.querySelectorAll(".room-select").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll(".room-select").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
  }));

  const answers = {
    parking: "Yes. This unit includes one dedicated parking space.",
    price: "Apartment 304 is listed at QAR 1.85M.",
    bedroom: "The verified property information lists two bedrooms within 112 m² of internal area. Room-by-room dimensions can be confirmed during a viewing.",
    furniture: "Furniture is not listed as included in the verified property information. An agent can confirm the current furnishing arrangement.",
    viewing: "Yes. I can help you request a viewing. Please share your preferred day and time with the sales team."
  };
  const questionButtons = document.querySelectorAll(".quick-questions button");
  const conversation = document.getElementById("conversation");
  questionButtons.forEach(button => button.addEventListener("click", () => {
    const question = button.textContent;
    const answer = answers[button.dataset.question];
    conversation.insertAdjacentHTML("beforeend", `<div class="message buyer">${question}</div><div class="typing">SoluView AI is checking verified property data…</div>`);
    conversation.scrollTop = conversation.scrollHeight;
    questionButtons.forEach(item => item.disabled = true);
    window.setTimeout(() => {
      conversation.querySelector(".typing")?.remove();
      conversation.insertAdjacentHTML("beforeend", `<div class="message ai"><span>✦</span>${answer}</div>`);
      conversation.scrollTop = conversation.scrollHeight;
      questionButtons.forEach(item => item.disabled = false);
    }, reduceMotion ? 0 : 520);
  }));

  const marketing = {
    listing: ["AI LISTING DESCRIPTION", "A refined West Bay residence designed for modern city living.", "Discover Apartment 304: a light-filled two-bedroom home with 112 m² of considered space, dedicated parking and access to premium building amenities."],
    instagram: ["INSTAGRAM CAPTION", "A calmer kind of city living in West Bay.", "112 m², two bedrooms, dedicated parking and a considered space to come home to. Explore Apartment 304."],
    reel: ["REEL SCRIPT", "From arrival to balcony: a West Bay home in motion.", "Open with the living space, transition to the kitchen and finish with the key facts: 2 bedrooms, 2 bathrooms and dedicated parking."],
    email: ["EMAIL CAMPAIGN", "A new two-bedroom opportunity in West Bay.", "Introducing Apartment 304: an available 112 m² residence for buyers seeking an intelligently planned city base."],
    investor: ["INVESTOR VERSION", "An available West Bay apartment with clear fundamentals.", "Position the 112 m² layout, two-bedroom configuration, dedicated parking and premium location for an investment-focused audience."],
    family: ["FAMILY VERSION", "Room to settle into West Bay life.", "Two bedrooms, two bathrooms and a flexible open-plan living area make Apartment 304 a thoughtful base for everyday routines."],
    luxury: ["LUXURY VERSION", "A composed, contemporary address in West Bay.", "Apartment 304 pairs a generous 112 m² layout with building amenities, dedicated parking and a polished city setting."]
  };
  document.querySelectorAll(".persona-tabs button").forEach(button => button.addEventListener("click", () => {
    const [label, heading, copy] = marketing[button.dataset.persona];
    document.querySelectorAll(".persona-tabs button").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    const output = document.querySelector(".marketing-output");
    output.style.opacity = "0";
    window.setTimeout(() => {
      document.getElementById("marketing-label").textContent = label;
      document.getElementById("marketing-title").textContent = heading;
      document.getElementById("marketing-copy").textContent = copy;
      output.style.opacity = "1";
    }, reduceMotion ? 0 : 150);
  }));
  document.querySelector(".generate-button").addEventListener("click", event => {
    const button = event.currentTarget;
    button.classList.add("generating");
    window.setTimeout(() => button.classList.remove("generating"), reduceMotion ? 0 : 750);
  });

  const leadData = {
    sarah: { initials: "SM", name: "Sarah M.", subtitle: "2 Bedroom Apartment", score: "92", intent: "HIGH INTENT", budget: "QAR 1.8–2M", viewing: "This weekend", financing: "Available", signal: "Asked about parking & viewing" },
    adam: { initials: "AK", name: "Adam K.", subtitle: "Villa", score: "84", intent: "HIGH INTENT", budget: "QAR 2.5–3.2M", viewing: "Researching options", financing: "Not shared", signal: "Compared locations and amenities" },
    visitor: { initials: "?", name: "Anonymous visitor", subtitle: "Browsing", score: "41", intent: "BROWSING", budget: "Not shared", viewing: "Not requested", financing: "Not shared", signal: "Viewed 3 property pages" }
  };
  const drawer = document.querySelector(".lead-drawer");
  const openDrawer = id => {
    const lead = leadData[id];
    document.getElementById("drawer-avatar").textContent = lead.initials;
    document.getElementById("drawer-name").textContent = lead.name;
    document.getElementById("drawer-subtitle").textContent = lead.subtitle;
    document.getElementById("drawer-score").textContent = lead.score;
    document.getElementById("drawer-intent").textContent = lead.intent;
    document.getElementById("drawer-budget").textContent = lead.budget;
    document.getElementById("drawer-viewing").textContent = lead.viewing;
    document.getElementById("drawer-financing").textContent = lead.financing;
    document.getElementById("drawer-signal").textContent = lead.signal;
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
  };
  const closeDrawer = () => { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); };
  document.querySelectorAll(".lead-row").forEach(row => row.addEventListener("click", () => openDrawer(row.dataset.lead)));
  drawer.querySelector(".drawer-overlay").addEventListener("click", closeDrawer);
  drawer.querySelector(".drawer-close").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDrawer(); });

  document.getElementById("founding-members").textContent = foundingMembers;
  document.getElementById("founding-member-limit").textContent = foundingMemberLimit;
  document.getElementById("member-progress").style.width = `${Math.min((foundingMembers / foundingMemberLimit) * 100, 100)}%`;
  document.querySelectorAll("[data-membership-price]").forEach(node => { node.textContent = membershipConfig[node.dataset.membershipPrice].price; });
  document.querySelectorAll(".membership-cta").forEach(link => {
    const config = membershipConfig[link.dataset.membership];
    link.href = config.checkoutUrl;
    if (config.checkoutUrl === "#") link.addEventListener("click", event => event.preventDefault());
  });

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(item => revealObserver.observe(item));

  if (!reduceMotion) {
    const heroProduct = document.getElementById("hero-product");
    heroProduct.addEventListener("pointermove", event => {
      if (window.innerWidth < 901) return;
      const box = heroProduct.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width - .5) * 5;
      const y = ((event.clientY - box.top) / box.height - .5) * -4;
      heroProduct.querySelector(".product-window").style.transform = `rotateY(${-4 + x}deg) rotateX(${2 + y}deg)`;
    });
    heroProduct.addEventListener("pointerleave", () => { heroProduct.querySelector(".product-window").style.transform = "rotateY(-4deg) rotateX(2deg)"; });
  }
});