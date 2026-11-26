/**
 * MediCare Pro - Main Application Script
 * Handles global navigation, modals, and common UI interactions
 */

(function() {
    'use strict';

    // DOM Ready
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupNavbar();
        setupModals();
        setupTabs();
        setupSmoothScroll();
        highlightActiveNav();
        setupKeyboardShortcuts();
        console.log('MediCare Pro initialized');
    }

    // Navbar scroll effect
    function setupNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const onScroll = Utils.throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 100);

        window.addEventListener('scroll', onScroll);
    }

    // Mobile menu toggle
    window.toggleMenu = function() {
        const menu = document.getElementById('nav-menu');
        const hamburger = document.getElementById('hamburger');
        if (menu) {
            menu.classList.toggle('active');
            hamburger?.classList.toggle('active');
        }
    };

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('nav-menu')?.classList.remove('active');
        });
    });

    // Modal functions
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.switchModal = function(fromId, toId) {
        closeModal(fromId);
        setTimeout(() => openModal(toId), 200);
    };

    function setupModals() {
        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(m => closeModal(m.id));
            }
        });
    }

    // Tabs functionality
    function setupTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                if (!tabId) return;

                // Update buttons
                const parent = btn.closest('.services-tabs, .tabs');
                parent?.querySelectorAll('.tab-btn, .tab-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update content
                const container = parent?.parentElement || document;
                container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const content = document.getElementById(tabId);
                if (content) content.classList.add('active');
            });
        });
    }

    // Smooth scroll for anchor links
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // Highlight current page in nav
    function highlightActiveNav() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === page || href.endsWith(page) || (page === '' && href.includes('index'))) {
                link.classList.add('active');
            }
        });
    }

    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus (if exists)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const search = document.querySelector('.search-box input, #searchInput');
                if (search) search.focus();
            }
        });
    }

    // Global form validation helper
    window.validateForm = function(form) {
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                valid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        return valid;
    };

    // Export for modules
    window.MediCare = {
        openModal,
        closeModal,
        switchModal,
        toggleMenu
    };

})();
