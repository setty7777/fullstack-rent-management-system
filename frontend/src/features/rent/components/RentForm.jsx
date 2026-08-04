import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createRentEntry,
  updateRentEntry,
  clearError,
} from "../slices/rentSlice";

const RentForm = ({
  currentEntry,
  clearEditing,
  tenants,
  rentEntries = [],
}) => {
  const [formData, setFormData] = useState({
    tenant_id: "",
    month: "",
    rent: "",
    water: "",
    maintenance: "",
    electricity: "",
    previous_due: 0,
    paid: 0,
    advance: 0,
    status: "not vacated",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [minRentMonth, setMinRentMonth] = useState("");

  // Keep track of the previously selected tenant to detect changes reliably
  const prevTenantRef = useRef(formData.tenant_id);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading, error } = useSelector((state) => state.rent || {});

  // Find the selected tenant's join date
  const selectedTenant = tenants?.find(
    (t) => Number(t.id) === Number(formData.tenant_id),
  );

  // Calculate Joining Date + 1 month as the absolute minimum rent month and update state
  useEffect(() => {
    if (!selectedTenant || !selectedTenant.join_date) {
      setMinRentMonth("");
      return;
    }

    const [year, month] = selectedTenant.join_date.split("-").map(Number);

    let nextMonth = month + 1;
    let nextYear = year;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    const calculatedMinMonth = `${nextYear}-${String(nextMonth).padStart(
      2,
      "0",
    )}`;

    setMinRentMonth(calculatedMinMonth);
  }, [selectedTenant]);

  const minMonthString = minRentMonth;

  // Auto vanish alert box after 4 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage("");
      setMessageType("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  // Sync form data when editing an existing entry
  useEffect(() => {
    if (currentEntry) {
      setFormData({
        tenant_id: currentEntry.tenant_id?.toString() || "",
        month: currentEntry.month || "",
        rent: currentEntry.rent ?? "",
        water: currentEntry.water ?? "",
        maintenance: currentEntry.maintenance ?? "",
        electricity: currentEntry.electricity ?? "",
        previous_due: currentEntry.previous_due ?? 0,
        paid: currentEntry.paid ?? 0,
        advance: currentEntry.advance ?? 0,
        status: currentEntry.status || "not vacated",
      });
      prevTenantRef.current = currentEntry.tenant_id?.toString() || "";
    } else {
      resetForm();
    }
    dispatch(clearError());
  }, [currentEntry, dispatch]);

  // Automatically compute previous due, default charges, and target month safely
  useEffect(() => {
    if (!formData.tenant_id || currentEntry) return;

    // 1. Synchronously find the tenant and calculate their min rent month to avoid race conditions
    const activeTenant = tenants?.find(
      (t) => Number(t.id) === Number(formData.tenant_id),
    );

    let calculatedMinMonth = "";
    if (activeTenant?.join_date) {
      const [y, m] = activeTenant.join_date.split("-").map(Number);
      let nextM = m + 1;
      let nextY = y;
      if (nextM > 12) {
        nextM = 1;
        nextY += 1;
      }
      calculatedMinMonth = `${nextY}-${String(nextM).padStart(2, "0")}`;
    }

    const tenantProfileAdvance = activeTenant
      ? Number(activeTenant.advance || 0)
      : 0;

    // 2. Filter and sort entries for this specific tenant strictly
    const tenantEntries = [...rentEntries]
      .filter((e) => Number(e.tenant_id) === Number(formData.tenant_id))
      .sort((a, b) => new Date(a.month) - new Date(b.month));

    // 3. Determine the correct target month
    let targetMonth = calculatedMinMonth;
    if (tenantEntries.length > 0) {
      const lastEntryMonth = tenantEntries[tenantEntries.length - 1].month;
      const [year, month] = lastEntryMonth.split("-").map(Number);
      let nextMonth = month + 1;
      let nextYear = year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      targetMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    }

    setFormData((prev) => {
      // If the tenant changed, we MUST override the month with this tenant's specific target month
      const activeMonth = targetMonth;

      let previousDueVal = 0;
      let advanceVal = tenantProfileAdvance;
      let rentVal = prev.rent;
      let waterVal = prev.water === "" ? 300 : prev.water;
      let maintVal = prev.maintenance;
      let elecVal = prev.electricity;

      if (tenantEntries.length > 0) {
        const previousEntries = tenantEntries.filter(
          (e) => e.month < activeMonth,
        );
        if (previousEntries.length > 0) {
          const last = previousEntries[previousEntries.length - 1];
          rentVal = prev.rent === "" ? (last.rent ?? "") : prev.rent;
          waterVal = prev.water === "" ? (last.water ?? 300) : prev.water;
          maintVal =
            prev.maintenance === ""
              ? (last.maintenance ?? "")
              : prev.maintenance;
          elecVal =
            prev.electricity === ""
              ? (last.electricity ?? "")
              : prev.electricity;
          previousDueVal = Number(last.due || 0);
          advanceVal = Number(last.advance || tenantProfileAdvance);
        }
      }

      return {
        ...prev,
        tenant_id: formData.tenant_id,
        month: activeMonth,
        rent: rentVal,
        water: waterVal,
        maintenance: maintVal,
        electricity: elecVal,
        previous_due: previousDueVal,
        advance: advanceVal,
      };
    });
  }, [formData.tenant_id, rentEntries, currentEntry, tenants]);

  const resetForm = () => {
    setFormData({
      tenant_id: "",
      month: "",
      rent: "",
      water: "",
      maintenance: "",
      electricity: "",
      previous_due: 0,
      paid: 0,
      advance: 0,
      status: "not vacated",
    });
    prevTenantRef.current = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) dispatch(clearError());

    if (successMessage) {
      setSuccessMessage("");
      setMessageType("");
    }
  };

  const isVacatingOrVacated =
    formData.status === "vacating" || formData.status === "vacated";

  const currentMonthCharges =
    Number(formData.rent || 0) +
    Number(formData.water || 0) +
    Number(formData.maintenance || 0) +
    Number(formData.electricity || 0);

  const total = currentMonthCharges + Number(formData.previous_due || 0);

  const due = isVacatingOrVacated
    ? total - Number(formData.paid || 0) - Number(formData.advance || 0)
    : total - Number(formData.paid || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.tenant_id || !formData.month) return;

    dispatch(clearError());
    setSuccessMessage("");
    setMessageType("");

    const payload = {
      ...formData,
      tenant_id: Number(formData.tenant_id),
      rent: Number(formData.rent || 0),
      water: Number(formData.water || 0),
      maintenance: Number(formData.maintenance || 0),
      electricity: Number(formData.electricity || 0),
      previous_due: Number(formData.previous_due || 0),
      total: Number(total || 0),
      paid: Number(formData.paid || 0),
      advance: Number(formData.advance || 0),
      due: Number(due || 0),
    };

    if (currentEntry) {
      dispatch(
        updateRentEntry({ id: currentEntry.id, payload, navigate }),
      ).then((res) => {
        if (!res.error) {
          setSuccessMessage("Rent entry updated successfully.");
          setMessageType("blue");
          clearEditing();
          resetForm();
        }
      });
    } else {
      dispatch(createRentEntry({ payload, navigate })).then((res) => {
        if (!res.error) {
          setSuccessMessage("Rent entry created successfully.");
          setMessageType("green");
          resetForm();
        }
      });
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.formTitle}>
        {currentEntry ? "Update Rent Entry" : "Add New Rent Entry"}
      </h3>

      {error && (
        <div style={styles.errorBox}>
          {typeof error === "string" ? error : error.message}
        </div>
      )}
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
            name="tenant_id"
            value={formData.tenant_id}
            onChange={handleChange}
            required
            style={styles.select}
          >
            <option value="">-- Choose Tenant --</option>
            {tenants
              ?.filter(
                (t) =>
                  t.status !== "vacated" ||
                  Number(t.id) === Number(currentEntry?.tenant_id),
              )
              ?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Joined: {t.join_date})
                </option>
              ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Month (YYYY-MM)</label>
          <input
            type="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            min={minMonthString}
            style={styles.input}
            disabled
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Rent</label>
          <input
            type="number"
            name="rent"
            value={formData.rent}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Water</label>
          <input
            type="number"
            name="water"
            value={formData.water}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Maintenance</label>
          <input
            type="number"
            name="maintenance"
            value={formData.maintenance}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Electricity</label>
          <input
            type="number"
            name="electricity"
            value={formData.electricity}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Previous Due (Auto-fetched)</label>
          <input
            type="number"
            name="previous_due"
            value={formData.previous_due}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Paid Amount</label>
          <input
            type="number"
            name="paid"
            value={formData.paid}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Advance Adjustment</label>
          <input
            type="number"
            name="advance"
            value={formData.advance}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="not vacated">Not Vacated</option>
            <option value="vacated">Vacated</option>
          </select>
        </div>

        <div style={styles.summaryGroup}>
          <span style={styles.summaryText}>
            Total: <strong>₹ {total}</strong>
          </span>
          <span style={styles.summaryText}>
            {isVacatingOrVacated ? "Final Settlement Due / Refund: " : "Due: "}
            <strong style={{ color: due > 0 ? "#dc2626" : "#16a34a" }}>
              ₹ {Math.abs(due)}{" "}
              {isVacatingOrVacated
                ? due < 0
                  ? "(Refundable to Tenant)"
                  : "(Payable by Tenant)"
                : ""}
            </strong>
          </span>
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
                ? "Update Entry"
                : "Save Entry"}
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
  errorBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
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
  warningBox: {
    padding: "10px 14px",
    marginBottom: "16px",
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#b45309",
    fontSize: "13px",
    borderRadius: "8px",
    textAlign: "center",
    fontWeight: "500",
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
  summaryGroup: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    gridColumn: "1 / -1",
    padding: "10px 14px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  summaryText: { fontSize: "14px", color: "#334155" },
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

export default RentForm;
