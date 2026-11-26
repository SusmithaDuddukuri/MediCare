/**
 * MediCare Pro - Appointments Module
 */
(function() {
    'use strict';
    let currentPage = 1;
    let filtered = [];
    const PER_PAGE = 15;

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof APP_DATA === 'undefined') return;
        populateFilters();
        setupListeners();
        const docParam = Utils.getQueryParam('doctor');
        if (docParam) {
            document.getElementById('appointmentDoctor').value = docParam;
        }
        applyFilters();
        setupBookingForm();
    });

    function populateFilters() {
        const statusSel = document.getElementById('statusFilter');
        if (statusSel) {
            ['Confirmed', 'Pending', 'Completed', 'Cancelled'].forEach(s => {
                const o = document.createElement('option');
                o.value = s; o.textContent = s;
                statusSel.appendChild(o);
            });
        }
        const typeSel = document.getElementById('typeFilter');
        if (typeSel) {
            ['OPD', 'Follow-up', 'Emergency', 'Consultation'].forEach(s => {
                const o = document.createElement('option');
                o.value = s; o.textContent = s;
                typeSel.appendChild(o);
            });
        }
        // Populate doctor select in form
        const docSelect = document.getElementById('bookDoctor');
        if (docSelect) {
            APP_DATA.doctors.filter(d => d.available).forEach(d => {
                const o = document.createElement('option');
                o.value = d.name;
                o.textContent = `${d.name} - ${d.specialty}`;
                docSelect.appendChild(o);
            });
        }
    }

    function setupListeners() {
        document.getElementById('apptSearch')?.addEventListener('input', Utils.debounce(applyFilters, 300));
        document.getElementById('statusFilter')?.addEventListener('change', applyFilters);
        document.getElementById('typeFilter')?.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        let list = [...APP_DATA.appointments];
        const term = document.getElementById('apptSearch')?.value || '';
        list = Utils.searchFilter(list, term, ['patient', 'doctor', 'id', 'department']);
        const status = document.getElementById('statusFilter')?.value;
        if (status) list = list.filter(a => a.status === status);
        const type = document.getElementById('typeFilter')?.value;
        if (type) list = list.filter(a => a.type === type);
        filtered = list;
        currentPage = 1;
        renderTable();
        updateStats();
    }

    function updateStats() {
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        el('totalAppts', APP_DATA.appointments.length);
        el('confirmedAppts', APP_DATA.appointments.filter(a => a.status === 'Confirmed').length);
        el('pendingAppts', APP_DATA.appointments.filter(a => a.status === 'Pending').length);
        el('todayAppts', APP_DATA.appointments.filter(a => a.date.startsWith('2026-11')).length);
    }

    function renderTable() {
        const tbody = document.getElementById('appointmentsTable');
        const pag = document.getElementById('apptPagination');
        if (!tbody) return;
        const result = Utils.paginate(filtered, currentPage, PER_PAGE);
        if (!result.data.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No appointments found</td></tr>';
            pag.innerHTML = '';
            return;
        }
        tbody.innerHTML = result.data.map(a => `
            <tr>
                <td><strong>${a.id}</strong></td>
                <td>${a.patient}</td>
                <td>${a.doctor}</td>
                <td>${Utils.formatDate(a.date)} ${a.time}</td>
                <td>${a.type}</td>
                <td>${Utils.statusBadge(a.status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="viewAppt('${a.id}')">View</button>
                    ${a.status === 'Pending' || a.status === 'Confirmed' ? `<button class="btn btn-sm btn-danger" onclick="cancelAppt('${a.id}')">Cancel</button>` : ''}
                </td>
            </tr>
        `).join('');
        Utils.renderPagination(pag, result, p => { currentPage = p; renderTable(); });
    }

    window.viewAppt = function(id) {
        const a = APP_DATA.appointments.find(x => x.id === id);
        if (a) Utils.showToast(`Appointment ${a.id}: ${a.patient} with ${a.doctor} on ${a.date} at ${a.time} (${a.status})`, 'info');
    };

    window.cancelAppt = function(id) {
        if (!Utils.confirm('Cancel this appointment?')) return;
        const a = APP_DATA.appointments.find(x => x.id === id);
        if (a) {
            a.status = 'Cancelled';
            Utils.showToast('Appointment cancelled', 'success');
            applyFilters();
        }
    };

    function setupBookingForm() {
        const form = document.getElementById('bookingForm');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!validateForm(form)) {
                Utils.showToast('Please fill all fields', 'error');
                return;
            }
            const newAppt = {
                id: Utils.generateId('APT'),
                patient: document.getElementById('bookPatient').value,
                doctor: document.getElementById('bookDoctor').value,
                date: document.getElementById('bookDate').value,
                time: document.getElementById('bookTime').value,
                type: document.getElementById('bookType').value,
                status: 'Confirmed',
                department: 'General'
            };
            APP_DATA.appointments.unshift(newAppt);
            Utils.showToast(`Appointment booked successfully! ID: ${newAppt.id}`, 'success');
            form.reset();
            closeModal('bookingModal');
            applyFilters();
        });
    }

    window.openBooking = function() {
        openModal('bookingModal');
    };
})();
