const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.overlay');
const navbar = document.querySelector('.navbar');

function toggleMenu() {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
}

function closeMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);
}

hamburger.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleMenu();
});

hamburger.addEventListener('click', (e) => {
    toggleMenu();
});

overlay.addEventListener('click', closeMenu);

document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        closeMenu();
    }
});

// Dropdown schließen bei Klick außerhalb
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.nav-dropdown');
    const checkbox = document.getElementById('karriere_check');
    if (checkbox && dropdown && !dropdown.contains(e.target)) {
        checkbox.checked = false;
    }
});

window.addEventListener('scroll', () => {
    if (!navbar.classList.contains('scrolled') && window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else if (navbar.classList.contains('scrolled') && window.scrollY < 20) {
        navbar.classList.remove('scrolled');
    }
});
