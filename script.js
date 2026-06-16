document.addEventListener("DOMContentLoaded", () => {

    const intro = document.getElementById("intro");
    const enterBtn = document.querySelector(".enter-btn");

    const part1 = document.getElementById("part1");
    const part2 = document.getElementById("part2");
    const part3 = document.getElementById("part3");

    const continue1 = document.getElementById("continue1");
    const continue2 = document.getElementById("continue2");

    const audio = document.getElementById("reveal-audio");

    // =========================
    // INITIAL STATE
    // =========================

    if (part2) {
        part2.style.display = "none";
    }

    if (part3) {
        part3.style.display = "none";
    }

    // =========================
    // INTRO BUTTON
    // =========================

    if (enterBtn) {

        enterBtn.addEventListener("click", () => {

            intro.style.opacity = "0";
            intro.style.pointerEvents = "none";

            setTimeout(() => {

                intro.style.display = "none";

                const firstSection =
                    document.getElementById("before-you");

                if (firstSection) {

                    firstSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }, 1000);

        });

    }

    // =========================
    // PART 1 -> PART 2
    // =========================

    if (continue1) {

        continue1.addEventListener("click", () => {

            part2.style.display = "block";

            setTimeout(() => {

                part2.scrollIntoView({
                    behavior: "smooth"
                });

            }, 150);

        });

    }

    // =========================
    // PART 2 -> PART 3
    // =========================

    if (continue2) {

        continue2.addEventListener("click", () => {

            part3.style.display = "block";

            setTimeout(() => {

                part3.scrollIntoView({
                    behavior: "smooth"
                });

            }, 150);

            // Auto Play Audio

            if (audio) {

                audio.play().catch(() => {
                    console.log("Audio autoplay blocked");
                });

            }

        });

    }

    // =========================
    // SCROLL REVEAL
    // =========================

    const revealElements = document.querySelectorAll(
        ".scene, .letter-card, .app-container"
    );

    revealElements.forEach(el => {

        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
        el.style.transition =
            "opacity 1s ease, transform 1s ease";

    });

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.style.opacity = "1";
                entry.target.style.transform =
                    "translateY(0px)";

                const children =
                    entry.target.querySelectorAll(
                        "h1,h2,h3,p,span,a,img,button"
                    );

                children.forEach((child, index) => {

                    child.style.opacity = "0";
                    child.style.transform =
                        "translateY(15px)";
                    child.style.transition =
                        "all .8s ease";

                    setTimeout(() => {

                        child.style.opacity = "1";
                        child.style.transform =
                            "translateY(0px)";

                    }, index * 120);

                });

                observer.unobserve(entry.target);

            });

        },

        {
            threshold: 0.20
        }

    );

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // =========================
    // APP REVEAL SPECIAL EFFECT
    // =========================

    const appReveal =
        document.getElementById("app-reveal");

    if (appReveal) {

        const appObserver =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;

                        const logo =
                            appReveal.querySelector(
                                ".logo"
                            );

                        setTimeout(() => {
    logo.classList.add("show");
}, 0);

setTimeout(() => {
    title.classList.add("show");
}, 2000);

setTimeout(() => {
    text.classList.add("show");
}, 4000);

setTimeout(() => {
    btn.classList.add("show");
}, 6000);

setTimeout(() => {
    sign.classList.add("show");
}, 8000);

                        
                        const title =
                            appReveal.querySelector(
                                "h1"
                            );

                        const text =
                            appReveal.querySelector(
                                "p"
                            );

                        const btn =
                            appReveal.querySelector(
                                ".download-btn"
                            );

                        const sign =
                            appReveal.querySelector(
                                ".signature"
                            );


                    });

                },

                {
                    threshold: 0.4
                }

            );

        appObserver.observe(appReveal);

    }

    // =========================
    // GOLD TEXT GLOW
    // =========================

    const glowElements =
        document.querySelectorAll(
            ".gold-text, .highlight-line"
        );

    glowElements.forEach(el => {

        setInterval(() => {

            el.style.textShadow =
                "0 0 15px rgba(212,175,55,.45), 0 0 30px rgba(212,175,55,.20)";

            setTimeout(() => {

                el.style.textShadow =
                    "0 0 6px rgba(212,175,55,.15)";

            }, 1200);

        }, 3500);

    });

});
