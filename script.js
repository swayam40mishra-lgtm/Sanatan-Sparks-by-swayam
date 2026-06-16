document.addEventListener("DOMContentLoaded", () => {

    const intro = document.getElementById("intro");
    const enterBtn = document.querySelector(".enter-btn");

    const part1 = document.getElementById("part1");
    const part2 = document.getElementById("part2");
    const part3 = document.getElementById("part3");

    const continue1 = document.getElementById("continue1");
    const continue2 = document.getElementById("continue2");

    const audio = document.getElementById("reveal-audio");

    // =====================================
    // INITIAL STATE
    // =====================================

    if (part1) part1.style.display = "block";
    if (part2) part2.style.display = "none";
    if (part3) part3.style.display = "none";

    // =====================================
    // INTRO ENTER
    // =====================================

    enterBtn?.addEventListener("click", () => {

        intro.style.transition = "opacity 1.5s ease";
        intro.style.opacity = "0";

        setTimeout(() => {

            intro.style.display = "none";

            document.getElementById("before-you")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }, 1500);

    });

    // =====================================
    // PART 1 -> PART 2
    // =====================================

    continue1?.addEventListener("click", () => {

        part1.style.opacity = "0";

        setTimeout(() => {

            part1.style.display = "none";
            part2.style.display = "block";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }, 1000);

    });

    // =====================================
    // PART 2 -> PART 3
    // =====================================

    continue2?.addEventListener("click", () => {

        part2.style.opacity = "0";

        setTimeout(() => {

            part2.style.display = "none";
            part3.style.display = "block";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            audio?.play().catch(() => {});

        }, 1000);

    });

    // =====================================
    // SCROLL REVEAL
    // =====================================

    const revealItems = document.querySelectorAll(
        ".scene, .letter-card"
    );

    revealItems.forEach(item => {

        item.style.opacity = "0";
        item.style.transform = "translateY(50px)";
        item.style.transition =
            "opacity 1.5s ease, transform 1.5s ease";

    });

    const revealObserver = new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.style.opacity = "1";
                entry.target.style.transform =
                    "translateY(0)";

                observerChildren(entry.target);

                revealObserver.unobserve(entry.target);

            });

        },

        {
            threshold: 0.15
        }

    );

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

    // =====================================
    // CHILD STAGGER EFFECT
    // =====================================

    function observerChildren(parent) {

        const elements =
            parent.querySelectorAll(
                "h1,h2,h3,p,span,a,img,button"
            );

        elements.forEach((el, index) => {

            el.style.opacity = "0";
            el.style.transform = "translateY(20px)";
            el.style.transition =
                "opacity 1.2s ease, transform 1.2s ease";

            setTimeout(() => {

                el.style.opacity = "1";
                el.style.transform = "translateY(0)";

            }, index * 250);

        });

    }

    // =====================================
    // APP REVEAL
    // =====================================

    const appReveal =
        document.getElementById("app-reveal");

    if (appReveal) {

        const logo =
            appReveal.querySelector(".logo");

        const title =
            appReveal.querySelector("h1");

        const text =
            appReveal.querySelector("p");

        const btn =
            appReveal.querySelector(".download-btn");

        const sign =
            appReveal.querySelector(".signature");

        [
            logo,
            title,
            text,
            btn,
            sign
        ].forEach(el => {

            if (!el) return;

            el.style.opacity = "0";
            el.style.transform =
                "translateY(30px) scale(.95)";

        });

        const appObserver =
            new IntersectionObserver(

                (entries) => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting)
                            return;

                        // Logo
                        setTimeout(() => {
                            logo?.classList.add("show");
                        }, 1000);

                        // MUSKAN
                        setTimeout(() => {
                            title?.classList.add("show");
                        }, 5000);

                        // Built for one person
                        setTimeout(() => {
                            text?.classList.add("show");
                        }, 9000);

                        // Download Button
                        setTimeout(() => {
                            btn?.classList.add("show");
                        }, 13000);

                        // Signature
                        setTimeout(() => {
                            sign?.classList.add("show");
                        }, 17000);

                        appObserver.unobserve(
                            appReveal
                        );

                    });

                },

                {
                    threshold: 0.50
                }

            );

        appObserver.observe(appReveal);

    }

    // =====================================
    // GOLD GLOW
    // =====================================

    const glowItems =
        document.querySelectorAll(
            ".gold-text, .highlight-line"
        );

    glowItems.forEach(item => {

        setInterval(() => {

            item.style.textShadow =
                "0 0 20px rgba(212,175,55,.6), 0 0 40px rgba(212,175,55,.3)";

            setTimeout(() => {

                item.style.textShadow =
                    "0 0 6px rgba(212,175,55,.15)";

            }, 1500);

        }, 4000);

    });

});
