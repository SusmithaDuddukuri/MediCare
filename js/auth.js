/**
 * MediCare Pro - Authentication Module
 * Handles login, register, session management
 */

(function() {
    'use strict';

    const SESSION_KEY = 'user_session';

    // Check if user is logged in
    function getSession() {
        return Utils.storage.get(SESSION_KEY);
    }

    function setSession(user) {
        Utils.storage.set(SESSION_KEY, {
            ...user,
            loginAt: new Date().toISOString()
        });
    }

    function clearSession() {
        Utils.storage.remove(SESSION_KEY);
    }

    function isLoggedIn() {
        return !!getSession();
    }

    // Handle Login
    window.handleLogin = function(event) {
        event.preventDefault();
        const form = event.target;
        if (!validateForm(form)) {
            Utils.showToast('Please fill all required fields', 'error');
            return;
        }

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Demo authentication - accept any valid looking credentials
        if (email.length < 3 || password.length < 4) {
            Utils.showToast('Invalid credentials', 'error');
            return;
        }

        // Simulate API delay
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        setTimeout(() => {
            const user = {
                email,
                name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                role: 'admin',
                hospital: 'Demo Hospital'
            };
            setSession(user);
            Utils.showToast(`Welcome back, ${user.name}!`, 'success');
            closeModal('loginModal');
            form.reset();
            btn.disabled = false;
            btn.textContent = originalText;
            updateAuthUI();
            
            // Optionally redirect to dashboard
            // window.location.href = 'pages/dashboard.html';
        }, 800);
    };

    // Handle Register
    window.handleRegister = function(event) {
        event.preventDefault();
        const form = event.target;
        if (!validateForm(form)) {
            Utils.showToast('Please fill all required fields', 'error');
            return;
        }

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        const hospital = document.getElementById('regHospital').value.trim();

        if (!Utils.isValidEmail(email)) {
            Utils.showToast('Please enter a valid email', 'error');
            return;
        }

        if (password.length < 8) {
            Utils.showToast('Password must be at least 8 characters', 'error');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

        setTimeout(() => {
            const user = { name, email, phone, role, hospital };
            setSession(user);
            Utils.showToast(`Account created successfully! Welcome, ${name}`, 'success');
            closeModal('registerModal');
            form.reset();
            btn.disabled = false;
            btn.textContent = originalText;
            updateAuthUI();
        }, 1000);
    };

    window.showForgotPassword = function() {
        Utils.showToast('Password reset link would be sent to your email (demo)', 'info');
    };

    window.logout = function() {
        if (Utils.confirm('Are you sure you want to logout?')) {
            clearSession();
            Utils.showToast('Logged out successfully', 'success');
            updateAuthUI();
            // Redirect to home if on protected page
            if (window.location.pathname.includes('dashboard') || 
                window.location.pathname.includes('patients')) {
                window.location.href = '../index.html';
            }
        }
    };

    function updateAuthUI() {
        const session = getSession();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (session && loginBtn && registerBtn) {
            loginBtn.textContent = session.name.split(' ')[0];
            loginBtn.onclick = () => {
                // Show user menu or profile
                Utils.showToast(`Logged in as ${session.name} (${session.role})`, 'info');
            };
            registerBtn.textContent = 'Logout';
            registerBtn.onclick = logout;
            registerBtn.classList.remove('btn-primary');
            registerBtn.classList.add('btn-outline');
        }
    }

    // Initialize auth UI on load
    document.addEventListener('DOMContentLoaded', () => {
        updateAuthUI();
        
        // Protect certain pages (demo)
        const protectedPages = ['dashboard.html', 'reports.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage) && !isLoggedIn()) {
            // Soft protect - just show message
            console.log('Protected page - login recommended');
        }
    });

    // Export
    window.Auth = {
        getSession,
        isLoggedIn,
        logout
    };
})();
