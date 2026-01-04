// ========================================
// ENHANCED ANIMATIONS & INTERACTIVITY
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // ========================================
    // 1. TYPING ANIMATION FOR HERO TITLE
    // ========================================
    const typingElement = document.querySelector('.hero-content .title');
    if (typingElement) {
        const originalText = typingElement.textContent;
        typingElement.textContent = '';
        typingElement.classList.add('typing-animation');

        let charIndex = 0;
        const typeSpeed = 80;

        function typeWriter() {
            if (charIndex < originalText.length) {
                typingElement.textContent += originalText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, typeSpeed);
            } else {
                // Remove cursor blink after typing is complete
                setTimeout(() => {
                    typingElement.style.borderRight = 'none';
                }, 1000);
            }
        }

        // Start typing animation after a small delay
        setTimeout(typeWriter, 500);
    }

    // ========================================
    // 2. SCROLL-TRIGGERED FADE-IN ANIMATIONS
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Apply fade-in animations to various elements
    const fadeInElements = document.querySelectorAll('.skill-category, .timeline-item, .featured-project, .contact-method-card');
    fadeInElements.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        fadeInObserver.observe(el);
    });

    // Apply fade-in-left to about text
    const fadeInLeftElements = document.querySelectorAll('.about-text');
    fadeInLeftElements.forEach(el => {
        el.classList.add('fade-in-left');
        fadeInObserver.observe(el);
    });

    // Apply fade-in-right to about image
    const fadeInRightElements = document.querySelectorAll('.about-image');
    fadeInRightElements.forEach(el => {
        el.classList.add('fade-in-right');
        fadeInObserver.observe(el);
    });

    // ========================================
    // 3. ANIMATED SKILL PROGRESS BARS
    // ========================================
    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach(item => {
        const skillLevel = item.querySelector('.skill-level');
        if (skillLevel) {
            const level = skillLevel.getAttribute('data-level');

            // Add animation class to existing skill level element
            skillLevel.classList.add('skill-progress-animated-inline');
            skillLevel.style.setProperty('--level', `${level}%`);
        }
    });

    // Animate skill bars when they come into view
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillLevel = entry.target.querySelector('.skill-level');
                if (skillLevel) {
                    setTimeout(() => {
                        skillLevel.classList.add('animate');
                    }, 200);
                }
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillItems.forEach(item => {
        skillObserver.observe(item);
    });


    // ========================================
    // 4. BUTTON RIPPLE EFFECT
    // ========================================
    const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-outline');

    buttons.forEach(button => {
        button.classList.add('btn-ripple');

        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.position = 'absolute';
            ripple.style.width = '100px';
            ripple.style.height = '100px';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // ========================================
    // 5. ENHANCED GLOW EFFECT FOR CTA BUTTONS
    // ========================================
    const ctaButtons = document.querySelectorAll('.btn-glow, .contact-cta .btn');
    ctaButtons.forEach(btn => {
        btn.classList.add('btn-glow-enhanced');
    });

    // ========================================
    // 6. CARD HOVER TILT EFFECT
    // ========================================
    const cards = document.querySelectorAll('.glass-card, .contact-method-card');

    cards.forEach(card => {
        card.classList.add('card-tilt');

        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ========================================
    // 7. LAZY LOADING IMAGES WITH BLUR EFFECT
    // ========================================
    const images = document.querySelectorAll('img[loading="lazy"]');

    images.forEach(img => {
        img.classList.add('lazy-load-image');

        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () {
                this.classList.add('loaded');
            });
        }
    });

    // ========================================
    // 8. SMOOTH PARALLAX SCROLL EFFECT
    // ========================================
    const parallaxElements = document.querySelectorAll('.hero-image');

    parallaxElements.forEach(el => {
        el.classList.add('parallax', 'parallax-slow');
    });

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(el => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            el.style.transform = `translateY(${yPos}px)`;
        });
    }, { passive: true });

    // ========================================
    // 9. ENHANCED FLOATING CODE SYMBOLS
    // ========================================
    const codeSymbols = document.querySelectorAll('.code-symbol');
    codeSymbols.forEach(symbol => {
        symbol.classList.add('float-animation', 'gpu-accelerated');
    });

    // ========================================
    // 10. GRADIENT TEXT ANIMATION
    // ========================================
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        title.classList.add('gradient-text');
    });

    // ========================================
    // 11. PERFORMANCE OPTIMIZATIONS
    // ========================================
    // Add will-change to elements that will animate
    const animatingElements = document.querySelectorAll('.btn, .glass-card, .hero-image img');
    animatingElements.forEach(el => {
        el.classList.add('gpu-accelerated');
    });

    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            // Scroll-based animations go here
        });
    }, { passive: true });

    // ========================================
    // 12. KEYBOARD NAVIGATION ENHANCEMENTS
    // ========================================
    document.addEventListener('keydown', (e) => {
        // Tab key navigation
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });

    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    `;
    skipLink.addEventListener('focus', function () {
        this.style.top = '0';
    });
    skipLink.addEventListener('blur', function () {
        this.style.top = '-40px';
    });
    document.body.insertBefore(skipLink, document.body.firstChild);

    // ========================================
    // 13. LOADING STATE HANDLING
    // ========================================
    window.addEventListener('load', () => {
        // Remove skeleton loaders if any
        const skeletons = document.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => {
            skeleton.classList.remove('skeleton');
        });

        // Trigger initial animations
        document.body.classList.add('loaded');
    });

    // ========================================
    // 14. SCROLL PROGRESS INDICATOR UPDATE
    // ========================================
    const scrollProgress = document.querySelector('.scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            scrollProgress.style.width = `${scrolled}%`;
        }, { passive: true });
    }

    // ========================================
    // 15. MOBILE OPTIMIZATIONS
    // ========================================
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        // Disable heavy animations on mobile
        document.body.classList.add('mobile-device');

        // Reduce parallax effect on mobile
        parallaxElements.forEach(el => {
            el.style.transform = 'none';
        });
    }

    // ========================================
    // 16. HOVER SCALE EFFECTS
    // ========================================
    const hoverScaleElements = document.querySelectorAll('.hero-socials a, .project-links a, .footer-socials a');
    hoverScaleElements.forEach(el => {
        el.classList.add('hover-scale', 'gpu-accelerated');
    });

    // ========================================
    // 17. ANIMATED SECTIONS ON SCROLL
    // ========================================
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, { threshold: 0.2 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    console.log('✨ Portfolio enhancements loaded successfully!');
});

// ========================================
// INTERSECTION OBSERVER POLYFILL CHECK
// ========================================
if (!('IntersectionObserver' in window)) {
    console.warn('IntersectionObserver not supported. Some animations may not work.');
}
