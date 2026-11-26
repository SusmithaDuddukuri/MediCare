/**
 * MediCare Pro - Doctors Page Logic
 */

(function() {
    'use strict';

    let currentPage = 1;
    let filteredDoctors = [];
    const PER_PAGE = 12;

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        if (typeof APP_DATA === 'undefined') {
            console.error('APP_DATA not loaded');
            return;
        }

        populateSpecialtyFilter();
        updateStats();
        setupEventListeners();
        
        // Check for ID in query
        const id = Utils.getQueryParam('id');
        if (id) {
            const doc = APP_DATA.doctors.find(d => d.id === parseInt(id));
            if (doc) showDoctorModal(doc);
        }

        applyFilters();
    }

    function populateSpecialtyFilter() {
        const select = document.getElementById('specialtyFilter');
        if (!select) return;
        const specialties = [...new Set(APP_DATA.doctors.map(d => d.specialty))].sort();
        specialties.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            select.appendChild(opt);
        });
    }

    function updateStats() {
        document.getElementById('totalDoctors').textContent = APP_DATA.doctors.length;
        document.getElementById('availableDoctors').textContent = APP_DATA.doctors.filter(d => d.available).length;
        document.getElementById('specialtyCount').textContent = new Set(APP_DATA.doctors.map(d => d.specialty)).size;
    }

    function setupEventListeners() {
        const search = document.getElementById('doctorSearch');
        const specialty = document.getElementById('specialtyFilter');
        const availability = document.getElementById('availabilityFilter');
        const sort = document.getElementById('sortDoctors');

        search?.addEventListener('input', Utils.debounce(applyFilters, 300));
        specialty?.addEventListener('change', applyFilters);
        availability?.addEventListener('change', applyFilters);
        sort?.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        let list = [...APP_DATA.doctors];

        // Search
        const term = document.getElementById('doctorSearch')?.value || '';
        list = Utils.searchFilter(list, term, ['name', 'specialty', 'hospital', 'education']);

        // Specialty
        const spec = document.getElementById('specialtyFilter')?.value;
        if (spec) list = list.filter(d => d.specialty === spec);

        // Availability
        const avail = document.getElementById('availabilityFilter')?.value;
        if (avail !== '') list = list.filter(d => String(d.available) === avail);

        // Sort
        const sortVal = document.getElementById('sortDoctors')?.value || 'rating-desc';
        const [key, dir] = sortVal.split('-');
        list = Utils.sortBy(list, key === 'fee' ? 'fee' : key, dir);

        filteredDoctors = list;
        currentPage = 1;
        renderDoctors();
    }

    function renderDoctors() {
        const grid = document.getElementById('doctorsGrid');
        const pagination = document.getElementById('doctorsPagination');
        if (!grid) return;

        const result = Utils.paginate(filteredDoctors, currentPage, PER_PAGE);

        if (result.data.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-user-md"></i>
                    <h3>No doctors found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        grid.innerHTML = result.data.map(doc => `
            <div class="data-card hover-lift">
                <div class="data-card-header">
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                        <div class="avatar" style="background:${Utils.getAvatarColor(doc.name)}">${Utils.getInitials(doc.name.replace('Dr. ', ''))}</div>
                        <div>
                            <strong>${doc.name}</strong>
                            <div style="font-size:0.8125rem;color:#6c757d;">${doc.specialty}</div>
                        </div>
                    </div>
                    ${doc.available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-danger">Busy</span>'}
                </div>
                <div class="data-card-body">
                    <p style="margin-bottom:0.5rem;"><i class="fas fa-hospital" style="width:20px;color:#0d6efd;"></i> ${doc.hospital}</p>
                    <p style="margin-bottom:0.5rem;"><i class="fas fa-briefcase" style="width:20px;color:#0d6efd;"></i> ${doc.experience} years exp</p>
                    <p style="margin-bottom:0.5rem;"><i class="fas fa-star" style="width:20px;color:#ffc107;"></i> ${doc.rating} (${doc.patients.toLocaleString()} patients)</p>
                    <p style="margin-bottom:0.5rem;"><i class="fas fa-rupee-sign" style="width:20px;color:#0d6efd;"></i> Consultation: ${Utils.formatCurrency(doc.fee)}</p>
                    <p style="font-size:0.8125rem;color:#6c757d;">Languages: ${doc.languages.join(', ')}</p>
                </div>
                <div class="data-card-footer">
                    <button class="btn btn-sm btn-outline" onclick='showDoctorModal(${JSON.stringify(doc).replace(/'/g, "&#39;")})'>View Details</button>
                    <a href="appointments.html?doctor=${encodeURIComponent(doc.name)}" class="btn btn-sm btn-primary">Book</a>
                </div>
            </div>
        `).join('');

        Utils.renderPagination(pagination, result, (page) => {
            currentPage = page;
            renderDoctors();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        });
    }

    window.showDoctorModal = function(doc) {
        const body = document.getElementById('doctorModalBody');
        if (!body) return;

        body.innerHTML = `
            <div style="text-align:center;margin-bottom:1.5rem;">
                <div class="avatar avatar-xl" style="margin:0 auto 1rem;background:${Utils.getAvatarColor(doc.name)};font-size:2rem;">
                    ${Utils.getInitials(doc.name.replace('Dr. ', ''))}
                </div>
                <h2 style="margin-bottom:0.25rem;">${doc.name}</h2>
                <p style="color:#0d6efd;font-weight:600;">${doc.specialty}</p>
                <div class="rating" style="justify-content:center;margin-top:0.5rem;">
                    ${'★'.repeat(Math.floor(doc.rating))}${'☆'.repeat(5-Math.floor(doc.rating))} ${doc.rating}
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">
                <div><strong>Experience</strong><br>${doc.experience} years</div>
                <div><strong>Patients</strong><br>${doc.patients.toLocaleString()}</div>
                <div><strong>Fee</strong><br>${Utils.formatCurrency(doc.fee)}</div>
                <div><strong>Hospital</strong><br>${doc.hospital}</div>
                <div><strong>Education</strong><br>${doc.education}</div>
                <div><strong>Status</strong><br>${doc.available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-danger">Busy</span>'}</div>
            </div>
            <div style="margin-bottom:1rem;">
                <strong>Languages:</strong> ${doc.languages.join(', ')}
            </div>
            <div style="margin-bottom:1.5rem;">
                <strong>Available Slots Today:</strong>
                <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-top:0.5rem;">
                    ${doc.slots.map(s => `<span class="tag tag-primary">${s}</span>`).join('')}
                </div>
            </div>
            <a href="appointments.html?doctor=${encodeURIComponent(doc.name)}" class="btn btn-primary btn-block">Book Appointment</a>
        `;
        openModal('doctorModal');
    };
})();
