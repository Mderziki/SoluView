// Keep membership display prices and PayPal subscription plan IDs in one clear location.
// The client IDs are loaded in membership.html because PayPal requires each SDK client to load once.
const membershipConfig = {
  founding: { price: "US$250 / first year", planId: "P-6X931242BW9402147NK7KD5Y", namespace: "paypalSoluView" },
  agency: { price: "US$750 / first year", planId: "P-2LR84646HH6201233NK7KEZI", namespace: "paypalAgency" },
  design: { price: "US$1,500 / first year", planId: "P-29V48614EM1131702NK7KFLI", namespace: "paypalSoluView" }
};

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-menu");
  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 18);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  menuButton.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuButton.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  document.querySelectorAll("[data-membership-price]").forEach(node => {
    node.textContent = membershipConfig[node.dataset.membershipPrice].price;
  });
  const paypalStatus = document.getElementById("paypal-status");
  const showPaypalStatus = (type, message) => {
    if (!paypalStatus) return;
    paypalStatus.className = `paypal-status ${type}`;
    paypalStatus.textContent = message;
    paypalStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const renderPaypalButton = membership => {
    const config = membershipConfig[membership];
    const container = document.querySelector(`[data-paypal-plan="${membership}"]`);
    const paypalSdk = window[config.namespace];
    if (!container || !paypalSdk?.Buttons) return;

    paypalSdk.Buttons({
      style: { shape: "rect", color: "gold", layout: "vertical", label: "paypal" },
      createSubscription(data, actions) {
        return actions.subscription.create({ plan_id: config.planId });
      },
      onApprove(data) {
        showPaypalStatus("success", `Thank you—your ${membership === "agency" ? "Agency Launch Partner" : membership === "design" ? "Design Partner" : "Founding Member"} subscription is confirmed. Subscription ID: ${data.subscriptionID}. Our team will follow up with your pre-launch onboarding details.`);
      },
      onCancel() {
        showPaypalStatus("notice", "Your PayPal checkout was cancelled. You can select a plan again whenever you are ready.");
      },
      onError(error) {
        console.error("PayPal subscription error:", error);
        showPaypalStatus("error", "We could not start the PayPal subscription. Please try again or contact SoluView for assistance.");
      }
    }).render(container);
  };

  Object.keys(membershipConfig).forEach(renderPaypalButton);

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
});