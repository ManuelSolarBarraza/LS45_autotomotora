(function () {
    "use strict";

    const ready = (fn) => {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    };

    ready(() => {
        initScrollProgress();
        initSmoothScroll();
        initScrollSpy();
        initHeroTypewriter();
        initModelFilter();
        initContactForm();
        initSimulator();
    });

    function initScrollProgress() {
        const bar = document.querySelector(".scroll-progress span");
        if (!bar) return;

        const update = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.scrollY;
            const progress = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
            bar.style.width = `${progress}%`;
        };

        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        update();
    }

    function initSmoothScroll() {
        const links = document.querySelectorAll("a[href^='#']");
        const navbarCollapse = document.getElementById("navbarCollapse");

        links.forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetId = link.getAttribute("href");
                if (!targetId || targetId === "#") {
                    return;
                }
                const target = document.querySelector(targetId);
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });

                if (navbarCollapse && navbarCollapse.classList.contains("show") && window.bootstrap) {
                    window.bootstrap.Collapse.getOrCreateInstance(navbarCollapse).hide();
                }
            });
        });
    }

    function initScrollSpy() {
        const sections = document.querySelectorAll("[data-scroll-section]");
        const links = document.querySelectorAll("[data-scroll-link]");
        if (!sections.length || !links.length) return;

        const linkMap = new Map();
        links.forEach((link) => {
            const key = link.dataset.scrollLink;
            if (key) {
                linkMap.set(key, link);
            }
        });

        const setActive = (id) => {
            links.forEach((link) => link.classList.remove("active"));
            const active = linkMap.get(id);
            if (active) {
                active.classList.add("active");
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActive(entry.target.id);
                    }
                });
            },
            { threshold: 0.45 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    function initHeroTypewriter() {
        const targets = document.querySelectorAll(".hero-typed");
        if (!targets.length) return;

        const phrases = [
            "financiamiento inteligente",
            "entregas r\u00e1pidas y seguras",
            "veh\u00edculos certificados"
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const type = () => {
            const current = phrases[phraseIndex];
            if (!deleting && charIndex <= current.length) {
                charIndex++;
            } else if (deleting && charIndex > 0) {
                charIndex--;
            }

            const text = current.slice(0, charIndex);
            targets.forEach((el) => (el.textContent = text));

            let delay = deleting ? 70 : 120;
            if (!deleting && charIndex === current.length) {
                deleting = true;
                delay = 1600;
            } else if (deleting && charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                delay = 400;
            }
            setTimeout(type, delay);
        };

        type();
    }

    // Sección de filtros para modelos
    function initModelFilter() {
        const buttons = document.querySelectorAll(".model-filter [data-filter]");
        const stateButtons = document.querySelectorAll(".model-filter [data-state]");
        const cards = document.querySelectorAll(".model-card");
        const insight = document.querySelector("#model-insight .card-body");
        const exploreButtons = document.querySelectorAll(".explore-model");
        if (!cards.length) return;

        let activeCategory = "all";
        let activeState = "all";

        if (buttons.length) {
            buttons.forEach((button) => {
                button.addEventListener("click", () => {
                    buttons.forEach((btn) => btn.classList.remove("active"));
                    button.classList.add("active");

                    activeCategory = button.dataset.filter;
                    applyFilters();
                });
            });
        }

        if (stateButtons.length) {
            stateButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    stateButtons.forEach((btn) => btn.classList.remove("active"));
                    button.classList.add("active");

                    activeState = button.dataset.state;
                    applyFilters();
                });
            });
        }

        function applyFilters() {
            cards.forEach((card) => {
                const category = card.dataset.category;
                const state = card.dataset.state;

                const matchCategory =
                    activeCategory === "all" || category === activeCategory;

                const matchState =
                    activeState === "all" || state === activeState;

                const shouldShow = matchCategory && matchState;

                card.classList.toggle("is-hidden", !shouldShow);
            });
        }

        exploreButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (!insight) return;
                const { modelName, modelPrice, modelDetail } = button.dataset;
                insight.innerHTML = `
                    <h5 class="card-title mb-1">${modelName || "Modelo seleccionado"}</h5>
                    <p class="text-primary fw-bold mb-2">${modelPrice || ""}</p>
                    <p class="card-text mb-0">${modelDetail || "Solicita un ejecutivo para conocer la disponibilidad real."}</p>
                `;
            });
        });
    }

    function initContactForm() {
        const form = document.getElementById("contact-form");
        const feedback = document.getElementById("contact-feedback");
        if (!form || !feedback) return;

        const commentsField = document.getElementById("contact-comentarios");
        const counter = document.getElementById("comentarios-characters");
        const storageKey = "ls45-contact";

        const updateCounter = () => {
            if (!commentsField || !counter) return;
            const max = parseInt(commentsField.dataset.maxlength, 10) || commentsField.maxLength || 280;
            if (commentsField.value.length > max) {
                commentsField.value = commentsField.value.slice(0, max);
            }
            counter.textContent = `${commentsField.value.length} / ${max}`;
        };

        if (commentsField) {
            commentsField.addEventListener("input", updateCounter);
            updateCounter();
        }

        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.nombre) form.nombre.value = data.nombre;
                if (data.correo) form.correo.value = data.correo;
                if (data.servicio) form.servicio.value = data.servicio;
            }
        } catch (error) {
            console.warn("No se pudo recuperar el contacto previo.", error);
        }

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = new FormData(form);
            const nombre = (data.get("nombre") || "").trim();
            const correo = (data.get("correo") || "").trim();
            const servicio = data.get("servicio") || "";
            const fecha = data.get("fecha") || "Pronto";
            const comentarios = (data.get("comentarios") || "").trim();

            const errors = [];
            if (!nombre) errors.push("Ingresa tu nombre.");
            if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(correo)) {
                errors.push("Agrega un correo válido.");
            }
            if (!servicio) errors.push("Selecciona un servicio.");

            feedback.classList.remove("alert-danger", "alert-success", "d-none");
            if (errors.length) {
                feedback.classList.add("alert-danger");
                feedback.textContent = errors.join(" ");
                return;
            }

            feedback.classList.add("alert-success");
            feedback.innerHTML = `
                <strong>¡Gracias ${nombre}!</strong> Hemos recibido tu solicitud para <em>${servicio}</em>. 
                Un ejecutivo te contactará antes del ${fecha}.<br>
                <span class="small text-white-50">${comentarios || "Sin comentarios adicionales."}</span>
            `;

            try {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({ nombre, correo, servicio })
                );
            } catch (error) {
                console.warn("No se pudo guardar el contacto.", error);
            }

            form.reset();
            updateCounter();
        });
    }

    function initSimulator() {
        const modelSelect = document.getElementById("sim-model");
        const downPaymentRange = document.getElementById("sim-down-payment");
        const termRange = document.getElementById("sim-term");
        const downDisplay = document.querySelector("[data-display='down-payment']");
        const termDisplay = document.querySelector("[data-display='term']");
        const resultValue = document.querySelector("[data-sim-result]");
        const resume = document.querySelector("[data-sim-resume]");
        if (!modelSelect || !downPaymentRange || !termRange || !resultValue || !resume) return;

        const moneyFormatter = new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            maximumFractionDigits: 0
        });

        const calculate = () => {
            const price = parseFloat(modelSelect.value) || 0;
            const selectedOption = modelSelect.selectedOptions[0];
            const rate = parseFloat(selectedOption?.dataset.rate) || 1.4;
            const downPercent = parseInt(downPaymentRange.value, 10);
            const term = parseInt(termRange.value, 10);

            if (downDisplay) downDisplay.textContent = `${downPercent}%`;
            if (termDisplay) termDisplay.textContent = `${term}`;

            if (!price) {
                resultValue.textContent = "$0";
                resume.textContent = "Selecciona un modelo para comenzar.";
                return;
            }

            const downPayment = price * (downPercent / 100);
            const financed = Math.max(price - downPayment, 0);
            const monthlyRate = rate / 100;
            let installment = 0;

            if (financed > 0 && term > 0) {
                const factor = Math.pow(1 + monthlyRate, term);
                installment = (financed * monthlyRate * factor) / (factor - 1);
            }

            resultValue.textContent = moneyFormatter.format(installment || 0);
            resume.textContent = `Pie: ${moneyFormatter.format(downPayment)} | Financiamiento: ${moneyFormatter.format(financed)}`;
        };

        ["change", "input"].forEach((eventName) => {
            modelSelect.addEventListener(eventName, calculate);
            downPaymentRange.addEventListener(eventName, calculate);
            termRange.addEventListener(eventName, calculate);
        });

        calculate();
    }
})();
