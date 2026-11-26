/**
 * MediCare Pro - Home Page Specific Scripts
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.querySelector('.hero')) return; // only on home
        
        animateHeroStats();
        renderDoctorsPreview();
        setupIntersectionObserver();
    });

    function animateHeroStats() {
        const stats = document.querySelectorAll('.stat-item h3[data-count]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.dataset.count);
                    Utils.animateCounter(el, target, 2000);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(s => observer.observe(s));
    }

    function renderDoctorsPreview() {
        const container = document.getElementById('doctorsCarousel');
        if (!container || typeof APP_DATA === 'undefined') return;

        // Show top 6 available doctors sorted by rating
        const topDoctors = [...APP_DATA.doctors]
            .filter(d => d.available)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);

        container.innerHTML = topDoctors.map(doc => `
            <div class="doctor-card hover-lift">
                <div class="doctor-avatar" style="background: ${Utils.getAvatarColor(doc.name)}">
                    <i class="fas fa-user-md"></i>
                </div>
                <div class="doctor-info">
                    <h4>${doc.name}</h4>
                    <p class="specialty">${doc.specialty}</p>
                    <p class="experience">${doc.experience} years experience</p>
                    <div class="doctor-rating">
                        ${'★'.repeat(Math.floor(doc.rating))}${'☆'.repeat(5 - Math.floor(doc.rating))} ${doc.rating}
                    </div>
                    <a href="pages/doctors.html?id=${doc.id}" class="btn btn-sm btn-outline">View Profile</a>
                </div>
            </div>
        `).join('');
    }

    function setupIntersectionObserver() {
        const cards = document.querySelectorAll('.feature-card, .testimonial-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${index * 0.1}s`;
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(card => {
            card.style.opacity = '0';
            observer.observe(card);
        });
    }
})();
