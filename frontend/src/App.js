import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [bookings, setBookings] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [serviceType, setServiceType] = useState("");

  // Load all bookings
  const loadBookings = async () => {
    const res = await axios.get(`${API}/bookings`);
    setBookings(res.data);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Create booking
  const createBooking = async () => {
    if (!customerName || !serviceType) return;

    await axios.post(`${API}/bookings`, { customerName, serviceType });
    setCustomerName("");
    setServiceType("");
    loadBookings();
  };

  // Perform action on booking
  const action = async (id, actionName, body = {}) => {
    try {
      await axios.post(`${API}/bookings/${id}/${actionName}`, body);
      loadBookings();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  // Admin override directly from booking card
  const adminOverride = async (id, status) => {
    try {
      await axios.post(`${API}/admin/bookings/${id}/override`, { status });
      loadBookings();
    } catch (err) {
      alert(err.response?.data || err.message);
    }
  };

  return (
    <div className="container">

      {/* ---------- CREATE BOOKING ---------- */}
      <div className="create-booking">
        <h2>Create Booking</h2>

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          placeholder="Service Type"
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
        />

        <button onClick={createBooking}>Create</button>
      </div>

      {/* ---------- BOOKINGS LIST ---------- */}
      <h2>Bookings</h2>

      {bookings.map((b) => (
        <div className="booking-card" key={b.id}>

          <p><b>ID:</b> {b.id}</p>
          <p><b>Status:</b> <span className={`status ${b.status}`}>{b.status}</span></p>

          {/*---------- ACTION BUTTONS ---------- */}
          <div className="actions">
            <button disabled={b.status !== "PENDING"} onClick={() => action(b.id, "assign")}>Assign</button>
            <button disabled={b.status !== "ASSIGNED"} onClick={() => action(b.id, "accept")}>Accept</button>
            <button disabled={b.status !== "ASSIGNED"} onClick={() => action(b.id, "reject")}>Reject</button>
            <button disabled={b.status !== "IN_PROGRESS"} onClick={() => action(b.id, "complete")}>Complete</button>
            <button disabled={["COMPLETED", "CANCELLED"].includes(b.status)} onClick={() => action(b.id, "cancel")}>Cancel</button>
            <button disabled={b.status !== "FAILED"} onClick={() => action(b.id, "retry")}>Retry</button>
          </div>

          {/* ---------- ADMIN OVERRIDE BUTTONS ---------- */}
          <div className="admin-panel">
            <h4>Admin Override</h4>
            <div className="actions">
              <button onClick={() => adminOverride(b.id, "ASSIGNED")}>Force Assign</button>
              <button onClick={() => adminOverride(b.id, "IN_PROGRESS")}>Force In Progress</button>
              <button onClick={() => adminOverride(b.id, "COMPLETED")}>Force Complete</button>
              <button onClick={() => adminOverride(b.id, "FAILED")}>Mark Failed</button>
              <button onClick={() => adminOverride(b.id, "CANCELLED")}>Cancel Booking</button>
            </div>
          </div>

          {/* ---------- HISTORY ---------- */}
          <details>
            <summary>History</summary>
            {b.history.map((h, i) => (
              <p key={i}>
                {h.from || "START"} → {h.to} by {h.by} ({h.at})
              </p>
            ))}
          </details>

        </div>
      ))}
    </div>
  );
}

export default App;
