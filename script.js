document.addEventListener("DOMContentLoaded", () => {

    const elements = document.querySelectorAll(
        ".letter h1, .letter p, .signature, .button-container"
    );

    elements.forEach((element, index) => {

        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "all 0.8s ease";

        setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, index * 350);

    });

});
