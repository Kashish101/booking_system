const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

/* ---------------- Constants ---------------- */

const STATUS = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED"
};

/* ---------------- In-memory DB ---------------- */

const bookings = {};

/* ---------------- Helpers ---------------- */

function logHistory(booking, from, to, by) {
  booking.history.push({
    from,
    to,
    by,
    at: new Date().toISOString()
  });
}

/* ---------------- Routes ---------------- */

// Create Booking
app.post("/bookings", (req, res) => {
  const { customerName, serviceType } = req.body;

  const id = uuid();
  bookings[id] = {
    id,
    customerName,
    serviceType,
    status: STATUS.PENDING,
    providerId: null,
    history: []
  };

  logHistory(bookings[id], null, STATUS.PENDING, "SYSTEM");
  res.json(bookings[id]);
});

// Assign Provider
app.post("/bookings/:id/assign", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Booking not found");

  if (booking.status !== STATUS.PENDING)
    return res.status(400).send("Invalid state");

  booking.providerId = "PROVIDER_1";
  logHistory(booking, booking.status, STATUS.ASSIGNED, "SYSTEM");
  booking.status = STATUS.ASSIGNED;

  res.json(booking);
});

// Provider Accept
app.post("/bookings/:id/accept", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Not found");

  if (booking.status !== STATUS.ASSIGNED)
    return res.status(400).send("Invalid state");

  logHistory(booking, booking.status, STATUS.IN_PROGRESS, "PROVIDER");
  booking.status = STATUS.IN_PROGRESS;

  res.json(booking);
});

// Provider Reject / No-show
app.post("/bookings/:id/reject", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Not found");

  logHistory(booking, booking.status, STATUS.FAILED, "PROVIDER");
  booking.status = STATUS.FAILED;

  res.json(booking);
});

// Complete Booking
app.post("/bookings/:id/complete", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Not found");

  if (booking.status !== STATUS.IN_PROGRESS)
    return res.status(400).send("Invalid state");

  logHistory(booking, booking.status, STATUS.COMPLETED, "PROVIDER");
  booking.status = STATUS.COMPLETED;

  res.json(booking);
});

// Cancel Booking
app.post("/bookings/:id/cancel", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Not found");

  logHistory(booking, booking.status, STATUS.CANCELLED, "CUSTOMER");
  booking.status = STATUS.CANCELLED;

  res.json(booking);
});

// Retry Failed Booking
app.post("/bookings/:id/retry", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Not found");

  if (booking.status !== STATUS.FAILED)
    return res.status(400).send("Only failed bookings can retry");

  logHistory(booking, booking.status, STATUS.PENDING, "SYSTEM");
  booking.status = STATUS.PENDING;
  booking.providerId = null;

  res.json(booking);
});

// Admin Override
app.post("/admin/bookings/:id/override", (req, res) => {
  console.log("Admin override request:", req.params.id, req.body);

  const booking = bookings[req.params.id];

  if (!booking) {
    console.log("Booking not found:", req.params.id);
    return res.status(404).json({ error: "Booking not found" });
  }

  const { status } = req.body;

  // Validate status
  if (!Object.values(STATUS).includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  logHistory(booking, booking.status, status, "ADMIN");
  booking.status = status;

  res.json(booking);
});

// Get All Bookings
app.get("/bookings", (req, res) => {
  res.json(Object.values(bookings));
});

// Get Single Booking
app.get("/bookings/:id", (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).send("Booking not found");
  res.json(booking);
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
