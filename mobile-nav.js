// Mobile Navigation Fix
document.addEventListener('DOMContentLoaded', function () {
    console.log('Mobile nav script loaded');

    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLinks = document.querySelectorAll('.nav-link');

    console.log('Nav elements:', { navMenu, navToggle, navClose });

    // Show mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Toggle clicked!');
            if (navMenu) {
                navMenu.classList.add('active');
                console.log('Menu opened');
            }
        });
    }

    // Hide mobile menu when close button clicked
    if (navClose) {
        navClose.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Close clicked!');
            if (navMenu) {
                navMenu.classList.remove('active');
                console.log('Menu closed');
            }
        });
    }

    // Hide mobile menu when nav link clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            console.log('Link clicked!');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                console.log('Clicked outside - menu closed');
            }
        }
    });
});
