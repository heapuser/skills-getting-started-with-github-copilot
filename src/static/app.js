document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

// Fetch activities, render cards (including participants), populate select, handle signups.

(async function () {
  const activitiesListEl = document.getElementById('activities-list');
  const activitySelect = document.getElementById('activity');
  const signupForm = document.getElementById('signup-form');
  const messageEl = document.getElementById('message');

  async function loadActivities() {
    activitiesListEl.innerHTML = '<p>Loading activities...</p>';
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    try {
      const res = await fetch('/activities');
      if (!res.ok) throw new Error('Failed to load activities');
      const activities = await res.json();

      activitiesListEl.innerHTML = '';
      Object.entries(activities).forEach(([name, info]) => {
        const card = document.createElement('div');
        card.className = 'activity-card';

        const title = document.createElement('h4');
        title.textContent = name;
        card.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = info.description;
        card.appendChild(desc);

        const sched = document.createElement('p');
        sched.innerHTML = `<strong>Schedule:</strong> ${info.schedule}`;
        card.appendChild(sched);

        const spots = document.createElement('p');
        spots.innerHTML = `<strong>Max participants:</strong> ${info.max_participants}`;
        card.appendChild(spots);

        // Participants section
        const participantsSection = document.createElement('div');
        participantsSection.className = 'participants-section';

        const participantsTitle = document.createElement('h5');
        participantsTitle.textContent = `Participants (${info.participants.length})`;
        participantsSection.appendChild(participantsTitle);

        const ul = document.createElement('ul');
        ul.className = 'participants-list';

        if (!info.participants || info.participants.length === 0) {
          const li = document.createElement('li');
          const span = document.createElement('span');
          span.className = 'participant-badge';
          span.textContent = 'No participants yet';
          li.appendChild(span);
          ul.appendChild(li);
        } else {
          info.participants.forEach(p => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.className = 'participant-badge';
            span.textContent = p;
            li.appendChild(span);

            // Add delete icon
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-participant-btn';
            delBtn.title = 'Remove participant';
            delBtn.innerHTML = '🗑️';
            delBtn.style.marginLeft = '6px';
            delBtn.onclick = async (e) => {
              e.preventDefault();
              if (!confirm(`Remove ${p} from ${name}?`)) return;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(p)}`, {
                  method: 'DELETE'
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Failed to remove participant');
                showMessage(data.message, 'success');
                await loadActivities();
              } catch (err) {
                showMessage(err.message || 'Failed to remove participant', 'error');
              }
            };
            li.appendChild(delBtn);
            ul.appendChild(li);
          });
        }

        participantsSection.appendChild(ul);
        card.appendChild(participantsSection);
        activitiesListEl.appendChild(card);

        // Add to select
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        activitySelect.appendChild(opt);
      });
    } catch (err) {
      activitiesListEl.innerHTML = `<p class="error">Could not load activities. Try again later.</p>`;
      console.error(err);
    }
  }

  function showMessage(text, type = 'info') {
    messageEl.className = `message ${type}`;
    messageEl.textContent = text;
    messageEl.classList.remove('hidden');
    setTimeout(() => messageEl.classList.add('hidden'), 4000);
  }

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const activity = document.getElementById('activity').value;

    if (!activity || !email) {
      showMessage('Please select an activity and enter your email.', 'error');
      return;
    }

    try {
      const res = await fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed');
      showMessage(data.message, 'success');
      signupForm.reset();
      await loadActivities();
    } catch (err) {
      showMessage(err.message || 'Signup failed', 'error');
      console.error(err);
    }
  });

  // initial load
  loadActivities();
})();
