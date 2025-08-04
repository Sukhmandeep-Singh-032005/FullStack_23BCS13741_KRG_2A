document.addEventListener("DOMContentLoaded", function () {
    console.log("Portfolio loaded!");
});
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

