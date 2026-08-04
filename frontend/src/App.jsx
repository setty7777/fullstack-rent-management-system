import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard/Dashboard";
import Buildings from "./pages/Buildings/Buildings";
import Floors from "./pages/Floors/Floors";
import Rooms from "./pages/Rooms/Rooms";
import Tenants from "./pages/Tenants/Tenants";
import RentEntry from "./pages/RentEntry/RentEntry";
import Bills from "./pages/Bills/Bills";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Public Login Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes wrapped with Layout via a Parent Route */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/floors" element={<Floors />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/tenants" element={<Tenants />} />
        <Route path="/rent-entry" element={<RentEntry />} />
        <Route path="/bills" element={<Bills />} />
      </Route>
    </Routes>
  );
}

export default App;
