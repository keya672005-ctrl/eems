let allEventsCache = [];
let userRegistrationsCache = [];
let currentRegisterEventId = null;
let upcomingEvent = null;
const headers = {};

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    const firstName = user.name.split(' ')[0];
    document.getElementById('welcome-message').innerText = `Welcome back, ${firstName}!`;
    document.getElementById('user-name-display').innerText = user.name;
    document.getElementById('user-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=5c6ac4&color=fff`;
  }

  headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = 'application/json';

  // Navigation Logic (SPA Routing)
  const navItems = document.querySelectorAll('#sidebar-nav li');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Remove active states
      navItems.forEach(nav => nav.classList.remove('active'));
      document.querySelectorAll('.spa-view').forEach(view => view.classList.remove('active'));
      
      // Set active new state
      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      
      // Render specific view logic
      if (targetId === 'view-catalog') renderCatalog(allEventsCache);
      if (targetId === 'view-schedule') renderSchedule();
      if (targetId === 'view-certificates') renderCertificates();
    });
  });

  // Global Search Logic Array Filtering
  document.getElementById('global-search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    
    // Switch to Catalog view if user starts searching and isn't already there
    if (query.trim().length > 0) {
       document.querySelector('[data-target="view-catalog"]').click();
    }
    
    const filteredEvents = allEventsCache.filter(evt => 
      evt.title.toLowerCase().includes(query) || 
      (evt.description && evt.description.toLowerCase().includes(query)) ||
      (evt.category && evt.category.toLowerCase().includes(query))
    );
    renderCatalog(filteredEvents);
  });

  // Profile and Notification Dropdown UI Logic
  const notifBtn = document.getElementById('notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.getElementById('profile-dropdown');

  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.remove('active');
    notifDropdown?.classList.toggle('active');
  });

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown?.classList.remove('active');
    profileDropdown?.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    notifDropdown?.classList.remove('active');
    profileDropdown?.classList.remove('active');
  });

  notifDropdown?.addEventListener('click', e => e.stopPropagation());
  profileDropdown?.addEventListener('click', e => e.stopPropagation());

  document.getElementById('dropdown-logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  });

  // Core Data Fetch from Server
  await loadDashboard();

  // Sidebar mobile toggle
  const toggle = document.querySelector('.menu-toggle');
  const closeSidebarBtn = document.querySelector('.mobile-close-btn');
  const sidebar = document.querySelector('.sidebar');
  if(toggle && closeSidebarBtn && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // Logout logic
  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  });
  
  document.getElementById('confirmRegisterBtn').addEventListener('click', async () => {
    if(!currentRegisterEventId) return;
    try {
      const res = await fetch('http://localhost:3000/api/events/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({ eventId: currentRegisterEventId })
      });
      const data = await res.json();
      if(res.ok) {
        closeConfirmModal();
        await loadDashboard(); 
        document.querySelector('[data-target="view-overview"]').click(); // Reset back to home screen to show new event
      } else {
        alert(data.error);
      }
    } catch(e) {
      alert("Registration failed. Are you connected to the server?");
    }
  });
});

async function loadDashboard() {
  try {
    const regRes = await fetch('http://localhost:3000/api/user/registrations', { headers });
    userRegistrationsCache = await regRes.json();
    
    const res = await fetch('http://localhost:3000/api/events');
    allEventsCache = await res.json();
    
    renderOverview();
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }
}

// ------------------------------------
// Rendering Helpers for SPA Views
// ------------------------------------

function generateEventHTML(evt, isRegistered) {
  const dateObj = new Date(evt.date);
  const month = dateObj.toLocaleString('en-us', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const isPast = dateObj < new Date();
  
  let btnHtml = '';
  if (isPast && isRegistered) {
    btnHtml = `<button class="btn btn-primary btn-small"><i class="fas fa-download"></i> Certificate</button>`;
  } else if (isPast && !isRegistered) {
    btnHtml = `<button class="btn btn-outline btn-small" disabled>Completed</button>`;
  } else if (isRegistered) {
    btnHtml = `<button class="btn btn-registered btn-small" disabled>Registered</button>`;
  } else {
    btnHtml = `<button class="btn btn-outline btn-small" onclick="openConfirmModal(${evt.id}, '${evt.title.replace(/'/g, "\\'")}')">Register</button>`;
  }

  return `
    <div class="event-item">
      <div class="event-date-box">
        <span class="month">${month}</span>
        <span class="day">${day}</span>
      </div>
      <div class="event-info">
        <h4>${evt.title}</h4>
        <p>${evt.category} - ${isPast ? 'Completed' : evt.status}</p>
      </div>
      <button class="btn btn-outline btn-small" onclick="openDetailsModal(${evt.id})" style="margin-right: 0.5rem; margin-left: auto;">Details</button>
      ${btnHtml}
    </div>`;
}

function renderOverview() {
  const registeredIds = userRegistrationsCache.map(r => r.id);
  const upcomingRegs = userRegistrationsCache.filter(r => new Date(r.date) >= new Date());
  const pastRegs = userRegistrationsCache.filter(r => new Date(r.date) < new Date());
  
  // Update Numeric Stats
  document.getElementById('stat-registered').innerText = upcomingRegs.length;
  document.getElementById('stat-certs').innerText = pastRegs.length;
  
  // Render Top Action Hero Banner Block
  if (upcomingRegs.length > 0) {
    upcomingEvent = upcomingRegs[0];
    document.getElementById('upcoming-status').innerText = upcomingEvent.status;
    document.getElementById('upcoming-status').style.display = 'inline-block';
    
    const formattedDate = new Date(upcomingEvent.date).toLocaleDateString('en-us', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('upcoming-content').innerHTML = `
      <div class="event-icon bg-primary"><i class="fas fa-laptop-code"></i></div>
      <div class="event-details">
        <h2>${upcomingEvent.title}</h2>
        <p>Category: ${upcomingEvent.category}</p>
        <div class="event-meta">
          <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
        </div>
      </div>
    `;
    const detailsBtn = document.getElementById('upcoming-view-btn');
    detailsBtn.disabled = false;
    detailsBtn.onclick = () => openDetailsModal(upcomingEvent.id);
    document.getElementById('upcoming-footer').style.display = 'flex';
  } else {
    document.getElementById('upcoming-status').style.display = 'none';
    document.getElementById('upcoming-content').innerHTML = `
      <div class="event-details" style="width:100%; text-align:center; padding: 2rem 0;">
        <h2>No Upcoming Events</h2>
        <p>Register for an event to see it here.</p>
      </div>
    `;
    document.getElementById('upcoming-footer').style.display = 'none';
  }

  // Render Recommended list (Top 4 future events not registered globally)
  const list = document.getElementById('dynamic-events-list');
  const recommended = allEventsCache.filter(evt => !registeredIds.includes(evt.id) && new Date(evt.date) >= new Date()).slice(0, 4);
  list.innerHTML = recommended.map(evt => generateEventHTML(evt, false)).join('');
  if(recommended.length === 0) list.innerHTML = "<p>All caught up! Wow.</p>";
}

function renderCatalog(eventsToRender) {
  const registeredIds = userRegistrationsCache.map(r => r.id);
  const list = document.getElementById('spa-catalog-list');
  if(eventsToRender.length === 0) {
    list.innerHTML = '<p>No events found matching your search term.</p>';
    return;
  }
  list.innerHTML = eventsToRender.map(evt => generateEventHTML(evt, registeredIds.includes(evt.id))).join('');
}

function renderSchedule() {
  const list = document.getElementById('spa-schedule-list');
  const upcomingRegs = userRegistrationsCache.filter(r => new Date(r.date) >= new Date());
  if (upcomingRegs.length === 0) {
    list.innerHTML = '<p>You are not currently registered for any upcoming events.</p>';
    return;
  }
  list.innerHTML = upcomingRegs.map(evt => generateEventHTML(evt, true)).join('');
}

function renderCertificates() {
  const list = document.getElementById('spa-certificates-list');
  const pastRegs = userRegistrationsCache.filter(r => new Date(r.date) < new Date());
  if (pastRegs.length === 0) {
    list.innerHTML = '<p>No certificates earned yet. Attend an event to earn one!</p>';
    return;
  }
  
  let certHtml = '';
  pastRegs.forEach(evt => {
    certHtml += `
      <div class="cert-item">
        <div class="cert-icon"><i class="fas fa-award"></i></div>
        <div class="cert-info">
          <h4>${evt.title}</h4>
          <p>Completed: ${new Date(evt.date).toLocaleDateString('en-us', { month: 'short', day: 'numeric', year: 'numeric'})}</p>
        </div>
        <button class="action-icon" title="Download Official Document"><i class="fas fa-download"></i></button>
      </div>`;
  });
  list.innerHTML = certHtml;
}

// ------------------------------------
// Modal System Overrides
// ------------------------------------
window.openConfirmModal = (eventId, eventTitle) => {
  currentRegisterEventId = eventId;
  document.getElementById('confirm-text').innerText = `Are you sure you want to register for "${eventTitle}"?`;
  document.getElementById('confirmModal').classList.add('active');
};
window.closeConfirmModal = () => {
  currentRegisterEventId = null;
  document.getElementById('confirmModal').classList.remove('active');
};

window.openTicketModal = () => {
  if (!upcomingEvent) return;
  const user = JSON.parse(localStorage.getItem('user'));
  document.getElementById('ticket-event-name').innerText = upcomingEvent.title;
  document.getElementById('ticket-user-name').innerText = user.name;
  document.getElementById('ticket-date').innerText = new Date(upcomingEvent.date).toLocaleDateString();
  const qrData = encodeURIComponent(`EEMS-${upcomingEvent.id}:${upcomingEvent.title}:${user.name}`);
  document.getElementById('ticket-qr').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;
  document.getElementById('ticketModal').classList.add('active');
};
window.closeTicketModal = () => document.getElementById('ticketModal').classList.remove('active');

window.openDetailsModal = (eventId) => {
  const evt = allEventsCache.find(e => e.id === eventId);
  if(!evt) return;
  document.getElementById('details-title').innerText = evt.title;
  document.getElementById('details-date').innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date(evt.date).toLocaleDateString('en-us', { month: 'long', day: 'numeric', year: 'numeric'})}`;
  document.getElementById('details-category').innerHTML = `<i class="fas fa-tag"></i> ${evt.category}`;
  document.getElementById('details-description').innerText = evt.description || "Detailed agenda currently unavailable.";
  document.getElementById('detailsModal').classList.add('active');
};
window.closeDetailsModal = () => document.getElementById('detailsModal').classList.remove('active');
