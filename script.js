(() => {
	const root = document.documentElement;
	const header = document.querySelector(".site-header");
	const yearEl = document.querySelector("[data-year]");
	const themeToggle = document.querySelector("[data-theme-toggle]");
	const navToggle = document.querySelector(".nav-toggle");
	const navLinks = document.querySelector("[data-nav-links]");
	const contactForm = document.getElementById("contactForm");
	const toast = document.querySelector(".toast");
	const toastClose = document.querySelector("[data-toast-close]");

	const STORAGE_KEY = "forgelabs-theme";
	const isServedByChatServer = window.location.protocol.startsWith("http") && window.location.port === "5000";
	const CHAT_ENDPOINT = isServedByChatServer ? "/chat" : "http://localhost:5000/chat";

	async function sendMessage() {
 	 const input = document.getElementById("message");
 	 const chatbox = document.getElementById("chatbox");
 	 const userText = input.value.trim();
	if (!userText) return;

  // Show user message
  chatbox.innerHTML += `<div><b>You:</b> ${userText}</div>`;
  input.value = "";

  try {
		const res = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText })
    });

		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
	      let msg;
	      if (res.status === 429) {
	        const wait = typeof data?.retryAfterSeconds === "number" ? ` Try again in ~${data.retryAfterSeconds}s.` : "";
	        msg = `${data?.error || "Rate limited"}.${wait} Check your Gemini API quota/billing.`;
	      } else {
	        msg = data?.details ? `${data.error || "Error"}: ${data.details}` : (data?.error || `Request failed (${res.status})`);
	        if (typeof msg === "string" && msg.length > 500) msg = msg.slice(0, 500) + "…";
	      }
			throw new Error(msg);
		}

		const replyText = typeof data?.reply === "string" && data.reply.trim() ? data.reply : "(No reply returned)";
		chatbox.innerHTML += `<div><b>Gemini:</b> ${replyText}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

  } catch (err) {
		const msg = err instanceof Error ? err.message : "Cannot connect to chatbot";
		chatbox.innerHTML += `<div><b>Error:</b> ${msg}</div>`;
  }
}

	// Needed because index.html uses an inline onclick="sendMessage()".
	window.sendMessage = sendMessage;

	function setTheme(theme) {
		root.setAttribute("data-theme", theme);
		try {
			localStorage.setItem(STORAGE_KEY, theme);
		} catch {
			// ignore
		}
	}

	function getInitialTheme() {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved === "light" || saved === "dark") return saved;
		} catch {
			// ignore
		}

		const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
		return prefersLight ? "light" : "dark";
	}

	function showToast() {
		if (!toast) return;
		toast.hidden = false;
		toast.dataset.open = "true";
		window.clearTimeout(showToast._t);
		showToast._t = window.setTimeout(() => {
			hideToast();
		}, 4000);
	}

	function hideToast() {
		if (!toast) return;
		toast.hidden = true;
		toast.dataset.open = "false";
	}

	// Init
	root.setAttribute("data-theme", getInitialTheme());
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Smooth scrolling (only for same-page anchors)
	document.addEventListener("click", (e) => {
		const a = e.target.closest?.("a[href^='#']");
		if (!a) return;
		const href = a.getAttribute("href");
		if (!href || href === "#") return;
		const target = document.querySelector(href);
		if (!target) return;
		e.preventDefault();
		target.scrollIntoView({ behavior: "smooth", block: "start" });
		navLinks?.classList.remove("is-open");
		navToggle?.setAttribute("aria-expanded", "false");
	});

	// Header elevation on scroll
	function onScroll() {
		if (!header) return;
		header.dataset.scrolled = window.scrollY > 6 ? "true" : "false";
	}
	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });

	// Theme toggle
	themeToggle?.addEventListener("click", () => {
		const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
		setTheme(current === "light" ? "dark" : "light");
	});

	// Mobile nav toggle
	navToggle?.addEventListener("click", () => {
		const isOpen = navLinks?.classList.toggle("is-open");
		navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
	});

	// Close mobile nav when clicking outside
	document.addEventListener("click", (e) => {
		if (!navLinks?.classList.contains("is-open")) return;
		const clickedInside = e.target.closest?.(".nav");
		if (clickedInside) return;
		navLinks.classList.remove("is-open");
		navToggle?.setAttribute("aria-expanded", "false");
	});

	// Contact form demo
	contactForm?.addEventListener("submit", (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const data = new FormData(form);
		const name = String(data.get("name") || "").trim();
		const email = String(data.get("email") || "").trim();
		const message = String(data.get("message") || "").trim();
		if (!name || !email || !message) return;
		form.reset();
		showToast();
	});

	toastClose?.addEventListener("click", hideToast);

	// Reveal on scroll
	const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
	if (revealEls.length && "IntersectionObserver" in window) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						io.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.12 }
		);
		for (const el of revealEls) io.observe(el);
	} else {
		for (const el of revealEls) el.classList.add("is-visible");
	}
})();
