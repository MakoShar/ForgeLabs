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
