document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("intro");
    const enterBtn = document.querySelector(".enter-btn");

    const part1 = document.getElementById("part1");
    const part2 = document.getElementById("part2");
    const part3 = document.getElementById("part3");

    const continue1 = document.getElementById("continue1");
    const continue2 = document.getElementById("continue2");

    const voiceAudio = document.getElementById("reveal-audio");

    const beforeYou = document.getElementById("before-you");
    const letter = document.getElementById("letter");
    const voiceReveal = document.getElementById("voice-reveal");
    const appReveal = document.getElementById("app-reveal");

    let voiceFallbackTimer = null;
    let introHidden = false;
    let part2Shown = false;
    let part3Shown = false;
    let appRevealStarted = false;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const setHidden = (el) => {
        if (!el) return;
        el.style.opacity = "0";
        el.style.transform = "translateY(42px)";
        el.style.transition = "opacity 1.1s ease, transform 1.1s ease";
    };

    const setVisible = (el) => {
        if (!el) return;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
    };

    const clearTimers = (container) => {
        if (container && container._revealTimers && container._revealTimers.length) {
            container._revealTimers.forEach(clearTimeout);
            container._revealTimers = [];
        }
    };

    const getRevealChildren = (container) => {
        if (!container) return [];
        return Array.from(
            container.querySelectorAll("h1, h2, h3, p, span, a, img, button, .continue-btn")
        );
    };

    const hideChildren = (container) => {
        if (!container) return;
        clearTimers(container);
        getRevealChildren(container).forEach(child => {
            child.style.opacity = "0";
            child.style.transform = "translateY(18px)";
            child.style.transition = "opacity .8s ease, transform .8s ease";
        });
    };

    const revealChildren = (container) => {
        if (!container) return;
        clearTimers(container);

        const children = getRevealChildren(container);
        container._revealTimers = [];

        children.forEach((child, index) => {
            child.style.opacity = "0";
            child.style.transform = "translateY(18px)";
            child.style.transition = "opacity .9s ease, transform .9s ease";

            const t = setTimeout(() => {
                child.style.opacity = "1";
                child.style.transform = "translateY(0)";
            }, index * 120);

            container._revealTimers.push(t);
        });
    };

    const showHiddenBlock = async (el) => {
        if (!el) return;
        el.style.display = "block";
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        el.style.transition = "opacity .9s ease, transform .9s ease";

        requestAnimationFrame(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        });

        await delay(100);
    };

    if (part2) {
        part2.style.display = "none";
    }

    if (part3) {
        part3.style.display = "none";
    }

    const revealTargets = document.querySelectorAll(".scene:not(#app-reveal), .letter-card, .part-navigation");

    revealTargets.forEach(setHidden);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const el = entry.target;

            if (entry.isIntersecting) {
                setVisible(el);
                revealChildren(el);
            } else {
                setHidden(el);
                hideChildren(el);
            }
        });
    }, {
        threshold: 0.22,
        rootMargin: "0px 0px -8% 0px"
    });

    revealTargets.forEach(el => observer.observe(el));

    if (enterBtn && intro) {
        enterBtn.addEventListener("click", async () => {
            if (introHidden) return;
            introHidden = true;

            intro.style.transition = "opacity 1s ease, transform 1s ease";
            intro.style.opacity = "0";
            intro.style.transform = "scale(1.02)";
            intro.style.pointerEvents = "none";

            await delay(1000);

            intro.style.display = "none";

            if (beforeYou) {
                beforeYou.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    }

    if (continue1 && part2 && letter) {
        continue1.addEventListener("click", async () => {
            if (part2Shown) return;
            part2Shown = true;

            await showHiddenBlock(part2);

            letter.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    const startAppReveal = () => {
        if (!appReveal || appRevealStarted) return;
        appRevealStarted = true;

        appReveal.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    };

    const playVoiceAndMoveOn = async () => {
        if (!voiceAudio) {
            await delay(6500);
            startAppReveal();
            return;
        }

        try {
            voiceAudio.currentTime = 0;
            const playPromise = voiceAudio.play();

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
            startAppReveal();
        }, 9000);

        voiceAudio.onended = () => {
            if (voiceFallbackTimer) {
                clearTimeout(voiceFallbackTimer);
                voiceFallbackTimer = null;
            }
            startAppReveal();
        };
    };

    if (continue2 && part3 && voiceReveal) {
        continue2.addEventListener("click", async () => {
            if (part3Shown) return;
            part3Shown = true;

            await showHiddenBlock(part3);

            voiceReveal.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            await delay(350);
            playVoiceAndMoveOn();
        });
    }

    if (appReveal) {
        const logo = appReveal.querySelector(".logo");
        const title = appReveal.querySelector("h1");
        const text = appReveal.querySelector("p");
        const btn = appReveal.querySelector(".download-btn");
        const sign = appReveal.querySelector(".signature");

        [logo, title, text, btn, sign].forEach(el => {
            if (!el) return;
            el.style.opacity = "0";
            el.style.transform = "translateY(26px) scale(0.98)";
            el.style.transition = "opacity 1.8s ease, transform 1.8s ease";
        });

        const appObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting || appRevealStarted === false) return;

                const logoEl = appReveal.querySelector(".logo");
                const titleEl = appReveal.querySelector("h1");
                const textEl = appReveal.querySelector("p");
                const btnEl = appReveal.querySelector(".download-btn");
                const signEl = appReveal.querySelector(".signature");

                setTimeout(() => {
                    if (logoEl) {
                        logoEl.style.opacity = "1";
                        logoEl.style.transform = "translateY(0) scale(1)";
                    }
                }, 500);

                setTimeout(() => {
                    if (titleEl) {
                        titleEl.style.opacity = "1";
                        titleEl.style.transform = "translateY(0) scale(1)";
                    }
                }, 5000);

                setTimeout(() => {
                    if (textEl) {
                        textEl.style.opacity = "1";
                        textEl.style.transform = "translateY(0) scale(1)";
                    }
                }, 9000);

                setTimeout(() => {
                    if (btnEl) {
                        btnEl.style.opacity = "1";
                        btnEl.style.transform = "translateY(0) scale(1)";
                    }
                }, 13000);

                setTimeout(() => {
                    if (signEl) {
                        signEl.style.opacity = "1";
                        signEl.style.transform = "translateY(0) scale(1)";
                    }
                }, 17000);

                appObserver.unobserve(appReveal);
            });
        }, {
            threshold: 0.35,
            rootMargin: "0px 0px -8% 0px"
        });

        appObserver.observe(appReveal);
    }

    const glowElements = document.querySelectorAll(
        ".gold-text, .highlight-line, .intro-tag, .scene-label, .letter-mark, .final-tag"
    );

    glowElements.forEach(el => {
        let on = false;

        setInterval(() => {
            on = !on;
            el.style.textShadow = on
                ? "0 0 15px rgba(212,175,55,.40), 0 0 30px rgba(212,175,55,.18)"
                : "0 0 6px rgba(212,175,55,.14)";
        }, 3200);
    });
});
