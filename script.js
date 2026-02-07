(() => {

    const resourcesEl = document.getElementById("resources");
    const queryEl = document.getElementById("query");
    const resourcesSection = document.getElementById("resourcesSection");
    const highlights = document.getElementById("highlights");
    const form = document.getElementById("suggestionForm");
    const popup = document.getElementById("successPopup");

    function createCardHTML(item) {
        const div = document.createElement("div");
        div.className = "resource-card";
        div.setAttribute("data-id", item.id);
        div.setAttribute("data-title", item.title.toLowerCase());
        div.setAttribute("data-desc", item.description.toLowerCase());

        div.innerHTML = `
        <div class="rc-icon" aria-hidden="true">${item.icon}</div>
        <div class="rc-content">
            <h4 class="rc-title">${item.title}</h4>
            <p class="rc-desc">${item.description}</p>
            <div class="rc-actions">
            <a class="rc-link" href="${item.link}" role="button">Learn more →</a>
            </div>
        </div>
        `;
        return div;
    }

    function renderResources(list) {
        resourcesEl.innerHTML = "";
        if (!list.length) {
            const empty = document.createElement("div");
            empty.className = "empty";
            empty.textContent = "No resources match your search.";
            resourcesEl.appendChild(empty);
            return;
        }
        const fragment = document.createDocumentFragment();
        for (const item of list) {
            fragment.appendChild(createCardHTML(item));
        }
        resourcesEl.appendChild(fragment);

        // animate cards in
        gsap.from(".resource-card", {
            duration: 0.6,
            y: 16,
            opacity: 0,
            stagger: 0.06,
            ease: "power3.out"
        });
    }

    // initial render
    renderResources(resourcesData);

    // ----------------------------
    // Search filter
    // ----------------------------
    function normalize(q) {
        return q.trim().toLowerCase();
    }

    function filterResources(q) {
        const n = normalize(q);
        if (!n) {
            // show all + restore gap
            resourcesSection.classList.remove("gap-hidden");
            resourcesSection.classList.add("gap-visible");
            highlights.style.display = "block";
            renderResources(resourcesData);
            return;
        }

        // remove the gap (tighten)
        resourcesSection.classList.remove("gap-visible");
        resourcesSection.classList.add("gap-hidden");
        highlights.style.display = "none";

        const filtered = resourcesData.filter((r) => {
            return (
                r.title.toLowerCase().includes(n) ||
                r.description.toLowerCase().includes(n)
            );
        });

        renderResources(filtered);
    }

    // events
    queryEl.addEventListener("input", (e) => {
        filterResources(e.target.value);
    });

    // Press Escape to clear search
    queryEl.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            queryEl.value = "";
            filterResources("");
        }
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Show success popup
        popup.style.display = "flex";

        // Auto-close after 2.5 seconds
        setTimeout(() => {
            popup.style.display = "none";
        }, 2500);

        // Clear the form
        form.reset();
    });

    // ----------------------------
    // Extra niceties: animate header & initial cards
    // ----------------------------
    // gsap.registerPlugin(ScrollTrigger);

    gsap.from(".title", { y: 20, opacity: 0, duration: 0.7, ease: "power3.out" });
    gsap.from(".underline", { scaleX: 0, transformOrigin: "left", duration: 0.7, delay: 0.05 });
    gsap.from("#query", { y: 16, opacity: 0, duration: 0.7, delay: 0.12, ease: "power2.out" });
    gsap.from(".highlight-card", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#highlights",
            start: "top 80%"
        }
    });

    // Tab Switching Logic
    const tabButtons = document.querySelectorAll(".tab-btn");
    const slider = document.querySelector(".tab-slider");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {

            // Remove active from all buttons
            tabButtons.forEach(b => b.classList.remove("active"));

            // Add active to clicked one
            btn.classList.add("active");

            // Switch slider mode
            if (btn.dataset.tab === "docsTab") {
                slider.classList.remove("show-resources");
                slider.classList.add("show-docs");
            } else {
                slider.classList.remove("show-docs");
                slider.classList.add("show-resources");
            }
    });
    });

    // Default state
    slider.classList.add("show-resources");

})();
