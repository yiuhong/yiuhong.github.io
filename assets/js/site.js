/* Homepage navigation. No jQuery, no Hyperspace helpers. */
(function () {
	"use strict";

	var toggle = document.querySelector("[data-nav-toggle]");
	var nav = document.getElementById("site-nav");
	var header = document.querySelector(".site-header");
	var backdrop = document.querySelector("[data-nav-backdrop]");
	var main = document.querySelector("main");
	var footer = document.querySelector(".site-footer");

	if (!toggle || !nav || !header) {
		return;
	}

	document.documentElement.classList.add("js");

	var desktop = window.matchMedia("(min-width: 1024px)");

	function isMobile() {
		return !desktop.matches;
	}

	function setPageHidden(hidden) {
		[main, footer].forEach(function (el) {
			if (!el) {
				return;
			}

			if (hidden) {
				el.setAttribute("inert", "");
				el.setAttribute("aria-hidden", "true");
			} else {
				el.removeAttribute("inert");
				el.removeAttribute("aria-hidden");
			}
		});
	}

	function setOpen(open) {
		var show = !!open && isMobile();
		var label = toggle.querySelector(".nav-toggle-label");

		nav.classList.toggle("is-open", show);
		header.classList.toggle("is-open", show);
		document.body.classList.toggle("nav-open", show);
		toggle.setAttribute("aria-expanded", show ? "true" : "false");

		if (label) {
			label.textContent = show ? "Close" : "Menu";
		}

		if (backdrop) {
			backdrop.hidden = !show;
		}

		if (!isMobile()) {
			nav.removeAttribute("aria-hidden");
		} else {
			nav.setAttribute("aria-hidden", show ? "false" : "true");
		}

		setPageHidden(show);
	}

	function focusSection(href) {
		var target;
		var heading;
		var focusTarget;

		if (!href || href.charAt(0) !== "#") {
			return;
		}

		target = document.querySelector(href);

		if (!target) {
			return;
		}

		heading = target.querySelector("h1, h2, h3");
		focusTarget = heading || target;

		if (!focusTarget.hasAttribute("tabindex")) {
			focusTarget.setAttribute("tabindex", "-1");
		}

		window.setTimeout(function () {
			focusTarget.focus({ preventScroll: true });
		}, 0);
	}

	function focusableInHeader() {
		return Array.prototype.filter.call(
			header.querySelectorAll("a, button"),
			function (el) {
				return !el.hidden && el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null;
			}
		);
	}

	toggle.addEventListener("click", function () {
		var willOpen = toggle.getAttribute("aria-expanded") !== "true";
		var firstLink;

		setOpen(willOpen);

		if (willOpen) {
			firstLink = nav.querySelector("a");

			if (firstLink) {
				firstLink.focus();
			}
		}
	});

	if (backdrop) {
		backdrop.addEventListener("click", function () {
			setOpen(false);
			toggle.focus();
		});
	}

	document.addEventListener("keydown", function (event) {
		var items;
		var first;
		var last;

		if (!header.classList.contains("is-open")) {
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			setOpen(false);
			toggle.focus();
			return;
		}

		if (event.key !== "Tab") {
			return;
		}

		items = focusableInHeader();

		if (!items.length) {
			return;
		}

		first = items[0];
		last = items[items.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	});

	document.addEventListener("click", function (event) {
		var link = event.target.closest("a");
		var href;

		if (!link) {
			return;
		}

		href = link.getAttribute("href") || "";

		if (isMobile() && (nav.contains(link) || link.classList.contains("brand"))) {
			setOpen(false);
		}

		if (href.charAt(0) === "#") {
			focusSection(href);
		}
	});

	function onViewportChange() {
		setOpen(false);
	}

	if (desktop.addEventListener) {
		desktop.addEventListener("change", onViewportChange);
	} else if (desktop.addListener) {
		desktop.addListener(onViewportChange);
	}

	setOpen(false);

	if ("IntersectionObserver" in window) {
		var sectionLinks = Array.prototype.filter.call(
			nav.querySelectorAll('a[href^="#"]'),
			function (link) {
				return document.querySelector(link.getAttribute("href"));
			}
		);
		var currentId = "";

		var observer = new IntersectionObserver(
			function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						currentId = entry.target.id;
					}
				});

				sectionLinks.forEach(function (link) {
					if (link.getAttribute("href") === "#" + currentId) {
						link.setAttribute("aria-current", "true");
					} else {
						link.removeAttribute("aria-current");
					}
				});
			},
			{
				rootMargin: "-45% 0px -45% 0px",
				threshold: 0
			}
		);

		sectionLinks.forEach(function (link) {
			observer.observe(document.querySelector(link.getAttribute("href")));
		});
	}
})();
