import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TenantForm from "./TenantForm";
import TenantTable from "./TenantTable";
import { getTenants } from "../slices/tenantSlice";
import { getBuildings } from "../../buildings/slices/buildingSlice";

const TenantModule = () => {
  const [currentTenant, setCurrentTenant] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const buildingsState = useSelector((state) => state.buildings);
  const buildings = Array.isArray(buildingsState)
    ? buildingsState
    : buildingsState?.buildings || [];

  const tenantState = useSelector((state) => state.tenants);
  const tenants = Array.isArray(tenantState)
    ? tenantState
    : tenantState?.tenants || [];

  // Automatically extract unique rooms from loaded tenants so the dropdown filter populates instantly
  const rooms = [
    ...new Set(
      tenants.map((t) => t.room?.room_number || t.room_number).filter(Boolean),
    ),
  ].map((roomNum, index) => ({ id: index, room_number: roomNum }));

  // Initial data loading
  useEffect(() => {
    dispatch(getTenants(navigate));
    dispatch(getBuildings(navigate));
  }, [dispatch, navigate]);

  return (
    <>
      <div style={styles.container}>
        <div style={styles.headerSection}>
          <h1 style={styles.pageTitle}>Tenant Management</h1>
          <p style={styles.pageSubtitle}>
            Manage occupants, leases, and documentation records.
          </p>
        </div>

        <TenantForm
          currentTenant={currentTenant}
          clearEditing={() => setCurrentTenant(null)}
          buildings={buildings}
        />

        <TenantTable
          onEdit={(tenant) => setCurrentTenant(tenant)}
          buildings={buildings}
          rooms={rooms}
        />
      </div>
    </>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  headerSection: {
    marginBottom: "24px",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "4px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#64748b",
  },
};

export default TenantModule;
