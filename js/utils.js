/**
 * MediCare Pro - Utility Functions
 * Common helpers used across the application
 */

const Utils = {
    // Format currency in INR
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Format date
    formatDate(dateStr, options = {}) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            ...options
        });
    },

    // Format time
    formatTime(timeStr) {
        return timeStr; // already HH:MM
    },

    // Generate unique ID
    generateId(prefix = 'ID') {
        return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    },

    // Debounce function
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Local storage helpers
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(`medicare_${key}`, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage set error:', e);
                return false;
            }
        },
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`medicare_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Storage get error:', e);
                return defaultValue;
            }
        },
        remove(key) {
            localStorage.removeItem(`medicare_${key}`);
        },
        clear() {
            Object.keys(localStorage)
                .filter(k => k.startsWith('medicare_'))
                .forEach(k => localStorage.removeItem(k));
        }
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3500) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate phone (Indian)
    isValidPhone(phone) {
        return /^(\+91[\-\s]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
    },

    // Sanitize input
    sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Animate counter
    animateCounter(element, target, duration = 2000) {
        if (!element) return;
        const start = 0;
        const startTime = performance.now();
        const isPercentage = element.dataset.count && parseInt(element.dataset.count) <= 100 && target <= 100;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * easeOut);
            element.textContent = isPercentage ? current + '%' : current.toLocaleString('en-IN');
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = isPercentage ? target + '%' : target.toLocaleString('en-IN');
            }
        }
        requestAnimationFrame(update);
    },

    // Get query params
    getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },

    // Set query param without reload
    setQueryParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({}, '', url);
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copied to clipboard!', 'success');
            return true;
        } catch (e) {
            this.showToast('Failed to copy', 'error');
            return false;
        }
    },

    // Download as CSV
    downloadCSV(data, filename = 'export.csv') {
        if (!data || !data.length) return;
        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => {
                const val = row[h];
                const str = Array.isArray(val) ? val.join(';') : String(val ?? '');
                return `"${str.replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        this.showToast('Export downloaded', 'success');
    },

    // Filter array by search term across multiple keys
    searchFilter(array, term, keys) {
        if (!term) return array;
        const lower = term.toLowerCase();
        return array.filter(item => 
            keys.some(key => {
                const val = item[key];
                if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(lower));
                return String(val ?? '').toLowerCase().includes(lower);
            })
        );
    },

    // Sort array
    sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            let va = a[key], vb = b[key];
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return direction === 'asc' ? -1 : 1;
            if (va > vb) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // Paginate
    paginate(array, page = 1, perPage = 10) {
        const total = array.length;
        const totalPages = Math.ceil(total / perPage) || 1;
        const current = Math.min(Math.max(1, page), totalPages);
        const start = (current - 1) * perPage;
        return {
            data: array.slice(start, start + perPage),
            page: current,
            perPage,
            total,
            totalPages,
            hasPrev: current > 1,
            hasNext: current < totalPages
        };
    },

    // Render pagination controls
    renderPagination(container, pagination, onPageChange) {
        if (!container) return;
        const { page, totalPages, hasPrev, hasNext } = pagination;
        let html = '';
        html += `<button ${!hasPrev ? 'disabled' : ''} data-page="${page - 1}">&laquo;</button>`;
        
        const range = 2;
        let start = Math.max(1, page - range);
        let end = Math.min(totalPages, page + range);
        
        if (start > 1) {
            html += `<button data-page="1">1</button>`;
            if (start > 2) html += `<button disabled>...</button>`;
        }
        
        for (let i = start; i <= end; i++) {
            html += `<button class="${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        
        if (end < totalPages) {
            if (end < totalPages - 1) html += `<button disabled>...</button>`;
            html += `<button data-page="${totalPages}">${totalPages}</button>`;
        }
        
        html += `<button ${!hasNext ? 'disabled' : ''} data-page="${page + 1}">&raquo;</button>`;
        container.innerHTML = html;
        
        container.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!btn.disabled) onPageChange(parseInt(btn.dataset.page));
            });
        });
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Get initials from name
    getInitials(name) {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    },

    // Random color for avatars
    getAvatarColor(str) {
        const colors = ['#0d6efd', '#6610f2', '#198754', '#dc3545', '#fd7e14', '#20c997', '#0dcaf0', '#d63384'];
        let hash = 0;
        for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    },

    // Status badge HTML
    statusBadge(status) {
        const map = {
            'Confirmed': 'success',
            'Completed': 'success',
            'Active': 'success',
            'Available': 'success',
            'Pending': 'warning',
            'In Progress': 'warning',
            'Cancelled': 'danger',
            'Discharged': 'info',
            'Admitted': 'primary',
            'Low Stock': 'danger',
            'Out of Stock': 'danger'
        };
        const type = map[status] || 'info';
        return `<span class="badge badge-${type}">${status}</span>`;
    }
};

// Make available globally
window.Utils = Utils;
