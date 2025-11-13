import React from "react";
import DashboardCharts from "./DashboardCharts";

export default function App() {
  return (
    <div style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      <h2 style={{ padding: "20px" }}>Dashboard</h2>
      <DashboardCharts />
    </div>
  );
}

