document.addEventListener("DOMContentLoaded", () => {

const intro = document.getElementById("intro");
const enterBtn = document.querySelector(".enter-btn");

// Hide all sections initially
const sections = document.querySelectorAll(".scene, .letter-card");

sections.forEach(section => {
    section.style.opacity = "0";
    section.style.transform = "translateY(60px)";
    section.style.transition =
        "opacity 1.4s ease, transform 1.4s ease";
});

// ENTER BUTTON
if (enterBtn) {

    enterBtn.addEventListener("click", () => {

        intro.style.opacity = "0";
        intro.style.pointerEvents = "none";

        setTimeout(() => {

            intro.style.display = "none";

            const firstSection =
                document.getElementById("before-you");

            if (firstSection) {

                window.scrollTo({
                    top: firstSection.offsetTop,
                    behavior: "smooth"
                });

            }

        }, 1200);

    });

}

// SCROLL REVEALS
const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform =
                    "translateY(0px)";

                // Reveal children one by one
                const children =
                    entry.target.querySelectorAll(
                        "h1,h2,h3,p,span,a,img"
                    );

                children.forEach((child, index) => {

                    child.style.opacity = "0";
                    child.style.transform =
                        "translateY(20px)";
                    child.style.transition =
                        "all 1s ease";

                    setTimeout(() => {

                        child.style.opacity = "1";
                        child.style.transform =
                            "translateY(0px)";

                    }, index * 180);

                });

            }

        });

    },

    {
        threshold: 0.25
    }

);

sections.forEach(section => {
    observer.observe(section);
});

// VOICE REVEAL
const voiceSection =
    document.getElementById("voice-reveal");

const audio =
    document.getElementById("reveal-audio");

if (voiceSection && audio) {

    const voiceObserver =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        audio.play().catch(() => {
                            console.log(
                                "Autoplay blocked by browser"
                            );
                        });

                    }

                });

            },

            {
                threshold: 0.6
            }

        );

    voiceObserver.observe(voiceSection);

}

// GOLD GLOW EFFECT
const glowElements =
    document.querySelectorAll(
        ".gold-text, .highlight-line, h1"
    );

glowElements.forEach(el => {

    setInterval(() => {

        el.style.textShadow =
            "0 0 12px rgba(212,175,55,.35), 0 0 28px rgba(212,175,55,.15)";

        setTimeout(() => {

            el.style.textShadow =
                "0 0 6px rgba(212,175,55,.15)";

        }, 1200);

    }, 3500);

});

});
