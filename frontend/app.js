const API_BASE = "/api";
const DEMO_MODE = false; // Set true only if you want browser-only demo data without a database.
const STORAGE_KEY = "pet-care-log-demo-v1";

const $ = (selector) => document.querySelector(selector);
const state = { pets: [], records: [] };

const typeLabels = {
  health: "Health",
  feeding: "Feeding",
  appointment: "Appointment",
  medication: "Medication",
  grooming: "Grooming",
};

const typeIcons = {
  health: "🩺",
  feeding: "🥣",
  appointment: "📅",
  medication: "💊",
  grooming: "🛁",
};

function safeText(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[ch],
  );
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function setMessage(selector, message, error = false) {
  const el = $(selector);
  if (!el) return;

  el.textContent = message;
  el.classList.toggle("error", error);
}

function localRead() {
  try {
    return (
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        pets: [],
        records: [],
      }
    );
  } catch {
    return { pets: [], records: [] };
  }
}

function localWrite() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

async function loadData() {
  try {
    if (DEMO_MODE) {
      Object.assign(state, localRead());
    } else {
      const [pets, records] = await Promise.all([
        request("/pets"),
        request("/records"),
      ]);

      state.pets = pets.data || [];
      state.records = records.data || [];
    }
  } catch (error) {
    showToast(`Could not load data: ${error.message}`);
  }

  render();
}

function render() {
  $("#pet-count").textContent = state.pets.length;

  $("#health-count").textContent = state.records.filter(
    (r) => r.type === "health" || r.type === "medication",
  ).length;

  $("#feeding-count").textContent = state.records.filter(
    (r) => r.type === "feeding",
  ).length;

  $("#appointment-count").textContent = state.records.filter(
    (r) => r.type === "appointment" && r.next_date && r.next_date >= today(),
  ).length;

  renderPetOptions();
  renderPets();
  renderRecords();
}

function renderPetOptions() {
  const select = $("#record-pet");
  const previous = select.value;

  select.innerHTML = state.pets.length
    ? '<option value="">Choose a pet</option>' +
      state.pets
        .map((p) => `<option value="${p.id}">${safeText(p.name)}</option>`)
        .join("")
    : '<option value="">Add a pet first</option>';

  if (state.pets.some((p) => String(p.id) === previous)) {
    select.value = previous;
  }
}

function renderPets() {
  const query = $("#pet-search").value.trim().toLowerCase();

  const pets = state.pets.filter((p) =>
    `${p.name} ${p.species} ${p.breed || ""}`.toLowerCase().includes(query),
  );

  const list = $("#pets-list");

  if (!pets.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span>🐾</span>
        <h3>${query ? "No pets found" : "Your pet list starts here"}</h3>
        <p>${
          query
            ? "Try another search term."
            : "Add a pet using the form to create your first profile."
        }</p>
      </div>`;
    return;
  }

  list.innerHTML = pets
    .map((p) => {
      const petRecords = state.records.filter(
        (r) => String(r.pet_id) === String(p.id),
      ).length;

      const details = [
        p.species,
        p.breed,
        p.weight_kg ? `${p.weight_kg} kg` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      const avatar =
        p.species === "Cat"
          ? "🐱"
          : p.species === "Bird"
            ? "🐦"
            : p.species === "Rabbit"
              ? "🐰"
              : "🐶";

      return `
      <article class="pet-card">
        <div class="pet-avatar">${avatar}</div>
        <div class="pet-info">
          <h3>${safeText(p.name)}</h3>
          <p>${safeText(details || "Pet profile")}</p>
          <p>
            ${
              p.birth_date
                ? `Born ${safeText(p.birth_date)}`
                : "Birth date not added"
            }
            · ${petRecords} care record${petRecords === 1 ? "" : "s"}
          </p>
          ${p.notes ? `<p>${safeText(p.notes)}</p>` : ""}
        </div>
        <div class="pet-actions">
          <button class="small-button"
            data-delete-pet="${p.id}"
            aria-label="Delete ${safeText(p.name)}">
            Delete
          </button>
        </div>
      </article>`;
    })
    .join("");
}

function renderRecords() {
  const filter = $("#history-filter").value;

  const records = state.records
    .filter((r) => filter === "all" || r.type === filter)
    .sort((a, b) =>
      `${b.record_date}${b.created_at || ""}`.localeCompare(
        `${a.record_date}${a.created_at || ""}`,
      ),
    );

  const list = $("#records-list");

  if (!records.length) {
    list.innerHTML = `
      <div class="empty-state compact">
        <span>📔</span>
        <p>No records match this filter yet.</p>
      </div>`;
    return;
  }

  list.innerHTML = records
    .map((r) => {
      const pet = state.pets.find((p) => String(p.id) === String(r.pet_id));

      return `
      <article class="record-item">
        <div class="record-icon">${typeIcons[r.type] || "📝"}</div>
        <div class="record-main">
          <h3>${safeText(r.title)}</h3>
          <p>
            ${safeText(pet ? pet.name : "Pet")} ·
            ${safeText(r.details || typeLabels[r.type] || "")}
            ${r.next_date ? `<br>Next date: ${safeText(r.next_date)}` : ""}
          </p>
        </div>
        <div class="record-meta">
          <span class="pill">${safeText(typeLabels[r.type] || r.type)}</span>
          <div>${safeText(r.record_date)}</div>
          <button class="small-button" data-delete-record="${r.id}">
            Delete
          </button>
        </div>
      </article>`;
    })
    .join("");
}

// Add a pet
$("#pet-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Save the form reference before awaiting the network request.
  const petForm = event.currentTarget;
  const button = event.submitter;

  if (button) button.disabled = true;

  const form = new FormData(petForm);
  const payload = Object.fromEntries(form.entries());

  if (payload.weight_kg === "") {
    delete payload.weight_kg;
  } else if (payload.weight_kg !== undefined) {
    payload.weight_kg = Number(payload.weight_kg);
  }

  try {
    if (DEMO_MODE) {
      payload.id = crypto.randomUUID();
      state.pets.push(payload);
      localWrite();
    } else {
      const result = await request("/pets", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      state.pets.unshift(result.data);
    }

    // Reset using the saved form reference.
    petForm.reset();

    setMessage("#pet-message", "Pet profile saved successfully.");
    showToast("Pet profile saved!");
    render();
  } catch (error) {
    setMessage("#pet-message", error.message, true);
  } finally {
    if (button) button.disabled = false;
  }
});

// Add a care record
$("#record-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  // Save the form reference before awaiting the network request.
  const recordForm = event.currentTarget;
  const button = event.submitter;

  if (button) button.disabled = true;

  const form = new FormData(recordForm);
  const payload = Object.fromEntries(form.entries());

  payload.pet_id = Number(payload.pet_id);

  if (!payload.next_date) {
    delete payload.next_date;
  }

  try {
    if (DEMO_MODE) {
      payload.id = crypto.randomUUID();
      state.records.unshift(payload);
      localWrite();
    } else {
      const result = await request("/records", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      state.records.unshift(result.data);
    }

    // Reset using the saved form reference.
    recordForm.reset();

    $("#record-date").value = today();

    setMessage("#record-message", "Care record saved successfully.");
    showToast("Care record saved!");
    render();
  } catch (error) {
    setMessage("#record-message", error.message, true);
  } finally {
    if (button) button.disabled = false;
  }
});

// Delete a pet
$("#pets-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-pet]");
  if (!button) return;

  const pet = state.pets.find((p) => String(p.id) === button.dataset.deletePet);

  if (!pet || !confirm(`Delete ${pet.name} and all of its care records?`)) {
    return;
  }

  try {
    if (DEMO_MODE) {
      state.pets = state.pets.filter((p) => String(p.id) !== String(pet.id));

      state.records = state.records.filter(
        (r) => String(r.pet_id) !== String(pet.id),
      );

      localWrite();
    } else {
      await request(`/pets/${pet.id}`, { method: "DELETE" });

      state.pets = state.pets.filter((p) => String(p.id) !== String(pet.id));

      state.records = state.records.filter(
        (r) => String(r.pet_id) !== String(pet.id),
      );
    }

    render();
    showToast("Pet profile deleted.");
  } catch (error) {
    showToast(error.message);
  }
});

// Delete a care record
$("#records-list").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-record]");
  if (!button) return;

  const id = button.dataset.deleteRecord;

  if (!confirm("Delete this care record?")) return;

  try {
    if (DEMO_MODE) {
      state.records = state.records.filter((r) => String(r.id) !== String(id));

      localWrite();
    } else {
      await request(`/records/${id}`, { method: "DELETE" });

      state.records = state.records.filter((r) => String(r.id) !== String(id));
    }

    render();
    showToast("Care record deleted.");
  } catch (error) {
    showToast(error.message);
  }
});

// Search and filters
$("#pet-search").addEventListener("input", renderPets);
$("#history-filter").addEventListener("change", renderRecords);

// Set today's date and load saved data
$("#record-date").value = today();
loadData();
