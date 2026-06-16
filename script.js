document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("intro");
    const enterBtn = document.querySelector(".enter-btn");

    const part1 = document.getElementById("part1");
    const part2 = document.getElementById("part2");
    const part3 = document.getElementById("part3");

    const continue1 = document.getElementById("continue1");
    const continue2 = document.getElementById("continue2");

    const audio = document.getElementById("reveal-audio");
    const appReveal = document.getElementById("app-reveal");

    let appRevealStarted = false;
    let voiceFallbackTimer = null;

    const revealItems = Array.from(
        document.querySelectorAll(".scene, .letter-card")
    );

    function setHidden(el) {
        if (!el) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(50px)";
        el.style.transition = "opacity 1.5s ease, transform 1.5s ease";
    }

    function revealChildren(parent) {
        if (!parent) return;

        const children = parent.querySelectorAll(
            "h1,h2,h3,p,span,a,img,button"
        );

        children.forEach((child, index) => {
            child.style.opacity = "0";
            child.style.transform = "translateY(20px)";
            child.style.transition = "opacity 1.2s ease, transform 1.2s ease";

            setTimeout(() => {
                child.style.opacity = "1";
                child.style.transform = "translateY(0)";
            }, index * 180);
        });
    }

    function startAppRevealSequence() {
        if (appRevealStarted) return;
        appRevealStarted = true;

        if (!appReveal) return;

        const logo = appReveal.querySelector(".logo");
        const title = appReveal.querySelector("h1");
        const text = appReveal.querySelector("p");
        const btn = appReveal.querySelector(".download-btn");
        const sign = appReveal.querySelector(".signature");

        const targets = [logo, title, text, btn, sign];

        targets.forEach((el) => {
            if (!el) return;
            el.style.opacity = "0";
            el.style.transform = "translateY(40px) scale(.95)";
            el.style.transition = "opacity 4s ease, transform 4s ease";
        });

        setTimeout(() => {
            if (logo) logo.classList.add("show");
        }, 500);

        setTimeout(() => {
            if (title) title.classList.add("show");
        }, 3500);

        setTimeout(() => {
            if (text) text.classList.add("show");
        }, 6500);

        setTimeout(() => {
            if (btn) btn.classList.add("show");
        }, 9500);

        setTimeout(() => {
            if (sign) sign.classList.add("show");
        }, 12500);
    }

    function playVoiceThenRevealApp() {
        if (!audio) {
            startAppRevealSequence();
            return;
        }

        try {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {});
            }
        } catch (e) {
            // ignore autoplay errors
        }

        if (voiceFallbackTimer) {
            clearTimeout(voiceFallbackTimer);
        }

        voiceFallbackTimer = setTimeout(() => {
            startAppRevealSequence();
        }, 9000);

        audio.onended = () => {
            if (voiceFallbackTimer) {
                clearTimeout(voiceFallbackTimer);
                voiceFallbackTimer = null;
            }
            startAppRevealSequence();
        };
    }

    // Initial state
    if (part1) part1.style.display = "block";
    if (part2) part2.style.display = "none";
    if (part3) part3.style.display = "none";

    // Hide reveal items initially
    revealItems.forEach(setHidden);

    // Scroll reveal for story sections
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                revealChildren(entry.target);
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.15
        });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
            revealChildren(item);
        });
    }

    // Enter button
    if (enterBtn && intro) {
        enterBtn.addEventListener("click", () => {
            intro.style.transition = "opacity 1.2s ease, transform 1.2s ease";
            intro.style.opacity = "0";
            intro.style.transform = "scale(1.02)";
            intro.style.pointerEvents = "none";

            setTimeout(() => {
                intro.style.display = "none";

                const firstSection = document.getElementById("before-you");
                if (firstSection) {
                    firstSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }, 1200);
        });
    }

    // Part 1 -> Part 2
    if (continue1 && part1 && part2) {
        continue1.addEventListener("click", () => {
            part1.style.transition = "opacity 1s ease";
            part1.style.opacity = "0";

            setTimeout(() => {
                part1.style.display = "none";
                part2.style.display = "block";
                part2.style.opacity = "0";
                part2.style.transition = "opacity 1s ease";

                requestAnimationFrame(() => {
                    part2.style.opacity = "1";
                });

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }, 1000);
        });
    }

    // Part 2 -> Part 3
    if (continue2 && part2 && part3) {
        continue2.addEventListener("click", () => {
            part2.style.transition = "opacity 1s ease";
            part2.style.opacity = "0";

            setTimeout(() => {
                part2.style.display = "none";
                part3.style.display = "block";
                part3.style.opacity = "0";
                part3.style.transition = "opacity 1s ease";

                requestAnimationFrame(() => {
                    part3.style.opacity = "1";
                });

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                // Make sure the app area is visible in the layout
                const appContainer = document.querySelector(".app-container");
                if (appContainer) {
                    appContainer.style.opacity = "1";
                    appContainer.style.transform = "none";
                }

                playVoiceThenRevealApp();
            }, 1000);
        });
    }

    // Gold glow effect
    const glowItems = document.querySelectorAll(".gold-text, .highlight-line");

    glowItems.forEach((item) => {
        let bright = false;

        setInterval(() => {
            bright = !bright;
            item.style.textShadow = bright
                ? "0 0 20px rgba(212,175,55,.6), 0 0 40px rgba(212,175,55,.3)"
                : "0 0 6px rgba(212,175,55,.15)";
        }, 4000);
    });
});
