/**
 * Custom JavaScript - Replacing Webflow Dependencies
 * This file replaces all Webflow-specific functionality with vanilla JS
 * No frameworks required - pure JavaScript for maximum performance
 */

(function() {
  'use strict';

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ================================
  // MOBILE NAVIGATION
  // ================================

  function initMobileNav() {
    const navBtn = document.querySelector('.nav-menu_btn');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (!navBtn || !navMenu) return;

    navBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const isActive = navBtn.classList.contains('active');

      if (isActive) {
        navBtn.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('nav-open');
      } else {
        navBtn.classList.add('active');
        navMenu.classList.add('active');
        body.classList.add('nav-open');
      }
    });

    // Close nav when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navBtn.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('nav-open');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', function(e) {
      if (navMenu.classList.contains('active') &&
          !navMenu.contains(e.target) &&
          !navBtn.contains(e.target)) {
        navBtn.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('nav-open');
      }
    });

    // Close nav on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navBtn.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('nav-open');
      }
    });
  }

  // ================================
  // MODAL FUNCTIONALITY
  // ================================

  function initModals() {
    const modalComponents = document.querySelectorAll('.modal-component');

    modalComponents.forEach(component => {
      const button = component.querySelector('button[data-wf--button--button-variant]');
      const dialog = component.querySelector('dialog');
      const closeBtn = component.querySelector('.modal_close-button');

      if (!button || !dialog) return;

      // Open modal
      button.addEventListener('click', function(e) {
        e.preventDefault();
        dialog.showModal();
        document.body.style.overflow = 'hidden';
      });

      // Close modal
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.preventDefault();
          dialog.close();
          document.body.style.overflow = '';
        });
      }

      // Close on backdrop click
      dialog.addEventListener('click', function(e) {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );

        if (!isInDialog) {
          dialog.close();
          document.body.style.overflow = '';
        }
      });

      // Close on ESC key
      dialog.addEventListener('cancel', function() {
        document.body.style.overflow = '';
      });
    });
  }

  // ================================
  // SCROLL ANIMATIONS
  // ================================

  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (animatedElements.length === 0) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Optional: Unobserve after animation
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  // ================================
  // PARALLAX EFFECTS
  // ================================

  function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-1, .parallax-bg');

    if (parallaxElements.length === 0) return;

    const handleParallax = throttle(() => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach(el => {
        const speed = el.classList.contains('parallax-bg') ? 0.5 : 0.3;
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementVisible = rect.top < window.innerHeight && rect.bottom > 0;

        if (elementVisible) {
          const yPos = (scrolled - elementTop) * speed;
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
      });
    }, 10);

    window.addEventListener('scroll', handleParallax);
    handleParallax(); // Initial call
  }

  // ================================
  // VIDEO AUTOPLAY
  // ================================

  function initVideoAutoplay() {
    const videos = document.querySelectorAll('video[autoplay]');

    videos.forEach(video => {
      // Ensure video plays
      video.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });

      // Restart video on end if loop attribute is present
      if (video.hasAttribute('loop')) {
        video.addEventListener('ended', function() {
          this.currentTime = 0;
          this.play();
        });
      }
    });
  }

  // ================================
  // SMOOTH SCROLL INITIALIZATION
  // ================================

  function initSmoothScroll() {
    // Initialize Lenis smooth scroll if available
    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // Store lenis instance globally
      window.lenis = lenis;
    }
  }

  // ================================
  // LAZY LOADING IMAGES
  // ================================

  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      return;
    }

    // Fallback for browsers that don't support native lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.removeAttribute('loading');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // ================================
  // FONT SIZE INCREASE DETECTION
  // ================================

  function detectFontSizeIncrease() {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const defaultSize = 16;
    const multiplier = rootFontSize / defaultSize;

    if (multiplier >= 2) {
      document.body.classList.add('font-size-increased');
    } else {
      document.body.classList.remove('font-size-increased');
    }
  }

  // ================================
  // FOOTER YEAR UPDATE
  // ================================

  function updateFooterYear() {
    const yearElements = document.querySelectorAll('[data-footer-year]');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
      el.textContent = currentYear;
    });
  }

  // ================================
  // SKIP TO MAIN CONTENT
  // ================================

  function initSkipLink() {
    const skipLink = document.getElementById('skip-link');
    if (!skipLink) return;

    const handleSkipLink = (e) => {
      if (e.type === 'keydown' && e.key !== 'Enter') return;

      e.preventDefault();
      const target = document.querySelector('main');
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    };

    skipLink.addEventListener('click', handleSkipLink);
    skipLink.addEventListener('keydown', handleSkipLink);
  }

  // ================================
  // INITIALIZE ALL
  // ================================

  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Initialize all components
    initMobileNav();
    initModals();
    initScrollAnimations();
    initParallax();
    initVideoAutoplay();
    initSmoothScroll();
    initLazyLoading();
    initSkipLink();
    updateFooterYear();
    detectFontSizeIncrease();

    // Watch for font size changes
    const resizeObserver = new ResizeObserver(debounce(detectFontSizeIncrease, 250));
    resizeObserver.observe(document.documentElement);

    // Handle page visibility for video playback
    document.addEventListener('visibilitychange', function() {
      const videos = document.querySelectorAll('video[autoplay]');
      videos.forEach(video => {
        if (document.hidden) {
          video.pause();
        } else {
          video.play().catch(() => {});
        }
      });
    });

    // Add loaded class to body
    document.body.classList.add('page-loaded');
  }

  // Start initialization
  init();

})();
