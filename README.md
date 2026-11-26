# MediCare Pro - Smart Hospital Management System

A complete, production-style frontend website for a real-world Hospital Management System.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Multi-page Navigation**: Home, Services, Doctors, Appointments, Patients, Pharmacy, Billing, Reports, About, Contact
- **Working Buttons & Interactions**:
  - Login / Register modals with form validation
  - Mobile hamburger menu
  - Tab switching on services
  - Doctor search, filter, sort, pagination
  - Appointment booking, cancel, view
  - Export to CSV
  - Toast notifications
  - Counter animations
  - Modal dialogs
- **Large Dataset**: 200 doctors, 2000 patients, 500 pharmacy items, 1000 appointments
- **Local Storage**: Session persistence for demo auth
- **No Backend Required**: Fully client-side, open index.html in any browser

## How to Run

1. Extract the zip
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari)
3. Navigate using the top menu
4. Try Login/Register, Book Appointment, search doctors, export data, etc.

All navigation, buttons, forms, filters, and modals work without a server.

## Tech Stack

- Pure HTML5, CSS3, Vanilla JavaScript
- Font Awesome icons (CDN)
- No frameworks required

## Structure

```
website/
├── index.html
├── css/
│   ├── styles.css
│   ├── animations.css
│   └── components.css
├── js/
│   ├── data.js          (large sample dataset)
│   ├── utils.js
│   ├── main.js
│   ├── auth.js
│   ├── home.js
│   ├── doctors.js
│   └── appointments.js
├── pages/
│   ├── doctors.html
│   ├── appointments.html
│   ├── patients.html
│   ├── pharmacy.html
│   ├── billing.html
│   ├── reports.html
│   ├── services.html
│   ├── about.html
│   └── contact.html
└── README.md
```

Built for demonstration of real-world hospital digital workflows.
