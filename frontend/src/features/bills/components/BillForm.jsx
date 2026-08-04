import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addBill, editBill } from "../slices/billSlice";
import { fetchLastBillService } from "../services/bill.service";

const BillForm = ({ currentEntry, clearEditing, tenants, billEntries }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tenantId, setTenantId] = useState("");
  const [previous, setPrevious] = useState("");
  const [current, setCurrent] = useState("");
  const [units, setUnits] = useState("");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(0);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { actionLoading } = useSelector((state) => state.bills || {});

  // Auto vanish alert box after 4 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage("");
      setMessageType("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (currentEntry) {
      setTenantId(currentEntry.tenant_id?.toString() || "");
      setPrevious(currentEntry.previous_reading ?? "");
      setCurrent(currentEntry.current_reading ?? "");
      setUnits(currentEntry.units ?? "");
      setRate(currentEntry.rate ?? "");
      setAmount(currentEntry.amount || 0);
      setMonth(currentEntry.month || "");
      setYear(currentEntry.year?.toString() || "");
    } else {
      resetForm();
    }
  }, [currentEntry]);

  // Auto-fetch last bill reading if creating new
  useEffect(() => {
    const fetchLast = async () => {
      if (!tenantId || currentEntry) return;
      const lastBill = await fetchLastBillService(tenantId, navigate);
      if (lastBill?.current_reading !== undefined) {
        setPrevious(lastBill.current_reading);
      } else {
        setPrevious(0);
      }
    };
    fetchLast();
  }, [tenantId, currentEntry, navigate]);

  // Calculation effect
  useEffect(() => {
    if (previous !== "" && current !== "") {
      const calcUnits = Number(current) - Number(previous);
      const finalUnits = calcUnits >= 0 ? calcUnits : 0;
      setUnits(finalUnits);
      if (rate !== "") {
        setAmount(finalUnits * Number(rate));
      } else {
        setAmount(0);
      }
    }
  }, [previous, current, rate]);

  const years = Array.from(
    { length: new Date().getFullYear() - 2020 + 6 },
    (_, i) => 2020 + i,
  );

  const resetForm = () => {
    setTenantId("");
    setPrevious("");
    setCurrent("");
    setUnits("");
    setRate("");
    setAmount(0);
    setMonth("");
    setYear("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setMessageType("");

    const alreadyExists = billEntries.find(
      (r) =>
        Number(r.tenant_id) === Number(tenantId) &&
        r.month?.toLowerCase() === month?.toLowerCase() &&
        Number(r.year) === Number(year) &&
        Number(r.id) !== Number(currentEntry?.id),
    );

    if (alreadyExists) {
      alert("Bill already exists for this tenant, month and year");
      return;
    }

    const payload = {
      tenant_id: Number(tenantId),
      previous_reading: Number(previous),
      current_reading: Number(current),
      units: Number(units),
      rate: Number(rate),
      amount: Number(amount),
      month,
      year: Number(year),
    };

    if (currentEntry) {
      const res = await dispatch(
        editBill({ id: currentEntry.id, payload, navigate }),
      );
      if (editBill.fulfilled.match(res)) {
        setSuccessMessage("Electricity bill updated successfully.");
        setMessageType("blue");
        clearEditing();
      } else {
        alert(res.payload || "Failed to update bill");
      }
    } else {
      const res = await dispatch(addBill({ payload, navigate }));
      if (addBill.fulfilled.match(res)) {
        setSuccessMessage("Electricity bill saved successfully.");
        setMessageType("green");
        resetForm();
      } else {
        alert(res.payload || "Failed to save bill");
      }
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>
        {currentEntry ? "Update Electricity Bill" : "Add New Electricity Bill"}
      </h3>

      {successMessage && (
        <div
          style={messageType === "blue" ? styles.updateBox : styles.successBox}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Tenant</label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">-- Choose Tenant --</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Previous Reading</label>
          <input
            type="number"
            placeholder="Previous"
            value={previous}
            onChange={(e) => setPrevious(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Current Reading</label>
          <input
            type="number"
            placeholder="Current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Units Consumed</label>
          <input
            type="number"
            placeholder="Units"
            value={units}
            readOnly
            style={{ ...styles.input, backgroundColor: "#f8fafc" }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Rate per Unit</label>
          <input
            type="number"
            placeholder="Rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Total Amount (₹)</label>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            readOnly
            style={{ ...styles.input, backgroundColor: "#f8fafc" }}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">-- Choose Month --</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            style={styles.select}
          >
            <option value="">-- Choose Year --</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={actionLoading}
            style={styles.submitBtn}
          >
            {actionLoading
              ? "Saving..."
              : currentEntry
                ? "Update Bill"
                : "Save Bill"}
          </button>
          {currentEntry && (
            <button
              type="button"
              onClick={() => {
                clearEditing();
                resetForm();
              }}
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const styles = {
  card: {
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "16px",
  },
  successBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  updateBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e40af",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    alignItems: "end",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#334155" },
  input: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  select: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    outline: "none",
    backgroundColor: "#ffffff",
    color: "#0f172a",
  },
  buttonGroup: { display: "flex", gap: "10px", gridColumn: "1 / -1" },
  submitBtn: {
    padding: "10px 18px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#0f172a",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default BillForm;
