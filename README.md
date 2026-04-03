# Educational Event Management System (EEMS)

![Educational Event Management System](https://img.shields.io/badge/Status-Active-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla_JS_%7C_Node.js_%7C_SQLite-blue)

A modern, responsive, and robust **Educational Event Management System** designed for seamless event registration, real-time ticket generation, and comprehensive student scheduling.

## 🌟 Key Features

* **Single Page Application (SPA) Dashboard**: Lightning-fast, animated transitions between Overview, Catalog, Schedule, and Certificate views without reloading the page.
* **Authentication System**: Secure JSON Web Token (JWT) based authentication for Student Logins and Sign-ups, with password encryption via `bcrypt`.
* **Live Intelligent Search**: A powerful front-end search engine capable of filtering events dynamically by title, category, or description in real-time.
* **Digital Ticketing & QR Codes**: Dynamic generation of personalized event tickets equipped with custom QR Codes.
* **Database Automation**: Robust SQLite backend schema that automatically initializes and seeds diverse Mock events and tracks dynamic event registrations.

## 🛠 Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript, Modern CSS (Flexbox/Grid, Custom Variables).
* **Backend:** Node.js, Express.js.
* **Database:** SQLite (via `better-sqlite3`).
* **Tooling:** Vite (for rapid frontend hot module replacement), Nodemon (for backend restarting), and `concurrently` to run the stack seamlessly.

## 🚀 Getting Started

Follow these instructions to get a copy of the project running on your local machine for development and testing.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16.0 or higher recommended)
* `npm` package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/eems.git
   cd eems
   ```

2. **Install all dependencies:**
   This command installs dependencies for both the frontend (Vite) and the backend (Express server).
   ```bash
   npm install
   ```

3. **Spin up the development server:**
   Running this command will concurrently launch the Vite frontend server and the Node backend server. The database will automatically initialize itself.
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to the local Vite URL output by the terminal (typically `http://localhost:5173`).

---

### 📂 Directory Structure

```text
eems/
├── server/
│   ├── index.js          # Main Express server and API endpoints
│   ├── db.js             # SQLite database initialization and seeding
│   ├── database.sqlite   # Local database (auto-generated)
├── index.html            # Marketing Landing Page
├── login.html            # Authentication / Auth UI
├── dashboard.html        # Main SPA Student Portal HTML
├── dashboard.js          # SPA Engine, Routing, API fethes & Filtering
├── dashboard.css         # Styling for Modals, Dropdowns, Cards, etc.
├── style.css             # Core Variables, Landing Page & Global Resets
├── package.json          # Dependency tracking and concurrency scripts
└── README.md
```

## 🤝 Contributing
Contributions, issues, and feature requests are always welcome! Feel free to check the issues page.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
