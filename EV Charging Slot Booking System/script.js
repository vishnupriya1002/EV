const stations = [
  { name: "GreenCharge Hub - Downtown", distance: 2.3, load: 76, chargers: 6 },
  { name: "BlueVolt Plaza - Airport Road", distance: 4.1, load: 42, chargers: 8 },
  { name: "EcoPower Station - Tech Park", distance: 6.8, load: 88, chargers: 4 },
  { name: "RapidEV Point - Ring Road", distance: 9.5, load: 38, chargers: 10 }
];

const chargerState = ["Available", "Charging", "Reserved", "Out of Service"];
let queue = [];
const dashboard = {
  sessions: 0,
  energy: 0,
  cost: 0,
  co2: 0
};

const els = {
  station: document.getElementById("station"),
  chargerBoard: document.getElementById("chargerBoard"),
  bookingResult: document.getElementById("bookingResult"),
  queueInfo: document.getElementById("queueInfo"),
  occupancyInfo: document.getElementById("occupancyInfo"),
  waitPrediction: document.getElementById("waitPrediction"),
  recommendation: document.getElementById("recommendation"),
  routePlan: document.getElementById("routePlan"),
  costResult: document.getElementById("costResult"),
  loadBalance: document.getElementById("loadBalance"),
  emergencyResult: document.getElementById("emergencyResult"),
  notificationList: document.getElementById("notificationList"),
  countAvailable: document.getElementById("countAvailable"),
  countCharging: document.getElementById("countCharging"),
  countReserved: document.getElementById("countReserved"),
  countOutage: document.getElementById("countOutage"),
  dashSessions: document.getElementById("dashSessions"),
  dashEnergy: document.getElementById("dashEnergy"),
  dashCost: document.getElementById("dashCost"),
  dashCO2: document.getElementById("dashCO2")
};

function initStations() {
  stations.forEach((s) => {
    const op = document.createElement("option");
    op.value = s.name;
    op.textContent = `${s.name} (${s.distance} km)`;
    els.station.appendChild(op);
  });
}

function randomStatus() {
  const roll = Math.random();
  if (roll < 0.35) return "Available";
  if (roll < 0.62) return "Charging";
  if (roll < 0.85) return "Reserved";
  return "Out of Service";
}

function renderChargerBoard() {
  els.chargerBoard.innerHTML = "";
  let available = 0;
  let charging = 0;
  let reserved = 0;
  let outage = 0;

  stations.forEach((station) => {
    for (let i = 1; i <= 2; i++) {
      const status = randomStatus();
      if (status === "Available") available++;
      if (status === "Charging") charging++;
      if (status === "Reserved") reserved++;
      if (status === "Out of Service") outage++;

      const tile = document.createElement("article");
      tile.className = `status-tile ${status.toLowerCase().replaceAll(" ", "-")}-bg`;

      let extra = "Ready for immediate booking.";
      if (status === "Charging") {
        const percent = 45 + Math.floor(Math.random() * 45);
        const min = 10 + Math.floor(Math.random() * 30);
        extra = `${percent}% charged, around ${min} min remaining.`;
        els.occupancyInfo.textContent = `Live update: A vehicle is currently ${percent}% charged at ${station.name}. Estimated wait: ${min} minutes.`;
      }

      tile.innerHTML = `
        <h4>${station.name}</h4>
        <p>Charger ${i}: <strong>${status}</strong></p>
        <p>${extra}</p>
      `;
      els.chargerBoard.appendChild(tile);
    }
  });

  els.countAvailable.textContent = available;
  els.countCharging.textContent = charging;
  els.countReserved.textContent = reserved;
  els.countOutage.textContent = outage;
}

function addNotification(message) {
  const li = document.createElement("li");
  const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  li.textContent = `${t} - ${message}`;
  els.notificationList.prepend(li);

  while (els.notificationList.children.length > 6) {
    els.notificationList.removeChild(els.notificationList.lastChild);
  }
}

function updateDashboard() {
  els.dashSessions.textContent = dashboard.sessions;
  els.dashEnergy.textContent = dashboard.energy.toFixed(1);
  els.dashCost.textContent = `INR ${dashboard.cost.toFixed(0)}`;
  els.dashCO2.textContent = dashboard.co2.toFixed(1);
}

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const car = document.getElementById("carNumber").value.trim().toUpperCase();
  const station = els.station.value;
  const date = document.getElementById("bookingDate").value;
  const time = document.getElementById("bookingTime").value;

  if (!car || !date || !time) return;

  dashboard.sessions += 1;
  dashboard.energy += 18 + Math.random() * 24;
  dashboard.cost += 300 + Math.random() * 420;
  dashboard.co2 += 7 + Math.random() * 6;
  updateDashboard();

  els.bookingResult.textContent = `Booking confirmed for ${car} at ${station} on ${date} at ${time}. Slot notification sent.`;
  addNotification(`Slot confirmed for ${car} at ${time}.`);
});

document.getElementById("joinQueueBtn").addEventListener("click", () => {
  const ticket = `Q${String(queue.length + 1).padStart(3, "0")}`;
  queue.push(ticket);
  const wait = queue.length * 15;
  els.queueInfo.textContent = `Joined waiting list with ticket ${ticket}. Position: ${queue.length}. Predicted wait: ${wait} min.`;
  addNotification(`Queue joined (${ticket}). You will be auto-assigned when charger frees up.`);
});

document.getElementById("waitPredictForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = Number(document.getElementById("queueLength").value);
  const d = Number(document.getElementById("avgDuration").value);
  const variability = Math.round(d * 0.15);
  const prediction = q * d;
  els.waitPrediction.textContent = `AI estimate: ${prediction} min (+/- ${variability} min) based on current queue dynamics.`;
});

document.getElementById("recommendForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const battery = Number(document.getElementById("batteryPct").value);
  const vehicleType = document.getElementById("vehicleType").value;
  const remaining = Number(document.getElementById("remainingDistance").value);

  const sorted = [...stations].sort((a, b) => a.load - b.load || a.distance - b.distance);
  const nearest = [...stations].sort((a, b) => a.distance - b.distance)[0];
  const fastest = sorted[0];

  let msg = `For ${vehicleType}, nearest option: ${nearest.name} (${nearest.distance} km). Fastest availability: ${fastest.name} (load ${fastest.load}%).`;
  if (battery < 15 || remaining > 80) {
    msg = `Priority suggestion: ${fastest.name}. Low battery/long distance detected; recommend immediate fast charging.`;
  }

  els.recommendation.textContent = msg;
});

document.getElementById("routeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const from = document.getElementById("startPoint").value;
  const to = document.getElementById("destination").value;
  const range = Number(document.getElementById("currentRange").value);

  const stops = range < 150 ? stations.slice(0, 2) : stations.slice(0, 1);
  const plan = stops.map((s, i) => `${i + 1}. ${s.name} (${s.distance} km detour)`).join(" | ");
  els.routePlan.textContent = `Route from ${from} to ${to}: Recommended charging stops -> ${plan}.`;
});

document.getElementById("costForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const cap = Number(document.getElementById("capacity").value);
  const type = document.getElementById("chargeType").value;
  const rate = type === "fast" ? 18 : 11;
  const speed = type === "fast" ? 80 : 30;
  const cost = cap * rate;
  const hours = cap / speed;

  dashboard.energy += cap;
  dashboard.cost += cost;
  dashboard.co2 += cap * 0.21;
  updateDashboard();

  els.costResult.textContent = `Estimated cost: INR ${cost.toFixed(0)} | Estimated time: ${hours.toFixed(2)} hours (${type} charging).`;
  addNotification(`Cost estimate generated: INR ${cost.toFixed(0)}.`);
});

function refreshLoadBalancing() {
  const overloaded = [...stations].sort((a, b) => b.load - a.load)[0];
  const alternatives = stations
    .filter((s) => s.name !== overloaded.name)
    .sort((a, b) => a.load - b.load)
    .slice(0, 2)
    .map((s) => `${s.name} (${s.load}% load)`)
    .join(" and ");

  els.loadBalance.textContent = `${overloaded.name} is overloaded at ${overloaded.load}%. Suggested nearby alternatives: ${alternatives}.`;
}

document.getElementById("refreshLoad").addEventListener("click", refreshLoadBalancing);

document.getElementById("emergencyBtn").addEventListener("click", () => {
  const battery = Number(document.getElementById("batteryPct").value || 0);
  const best = [...stations].sort((a, b) => a.distance - b.distance)[0];

  if (battery <= 10) {
    els.emergencyResult.textContent = `Emergency mode ON: Priority slot locked at ${best.name}. Reach in approx ${Math.ceil(best.distance * 4)} minutes.`;
    addNotification(`Emergency booking activated at ${best.name}.`);
  } else {
    els.emergencyResult.textContent = `Battery is ${battery}%. Emergency priority works when battery is 10% or below.`;
  }
});

function periodicUpdates() {
  renderChargerBoard();

  if (queue.length > 0 && Math.random() > 0.55) {
    const served = queue.shift();
    addNotification(`Queue ticket ${served} auto-assigned to a free charger.`);
  }

  if (Math.random() > 0.75) {
    addNotification("Charging completion alert: Bay B2 session completed.");
  } else if (Math.random() > 0.65) {
    addNotification("Reminder: Charging session nearing completion in 10 minutes.");
  }
}

initStations();
updateDashboard();
renderChargerBoard();
refreshLoadBalancing();
addNotification("System online. Live station monitoring started.");
setInterval(periodicUpdates, 12000);
