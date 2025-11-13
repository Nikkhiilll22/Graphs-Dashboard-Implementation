import React, { useEffect, useState, useCallback } from "react";
import ReactECharts from "echarts-for-react";

export default function DashboardCharts() {
  const [, setToken] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Login API
  const getNewToken = useCallback(async () => {
    try {
      const res = await fetch("https://hr.techind.co/api/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: JSON.stringify({
          email: "sandeep@techind.co",
          password: "Sandeep@123",
          keep_me_logged_in: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to login");

      const data = await res.json();
      const newToken = data?.data?.token;

      if (!newToken) throw new Error("Token not found");
      setToken(newToken);
      return newToken;
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to get token");
      throw err;
    }
  }, []);

  // 🔹 Fetch chart data
  const fetchChartData = useCallback(
    async (authToken, retry = true) => {
      try {
        const positionId = ""; // Replace with actual position_id if needed
        const url = `https://hr.techind.co/api/candidate/dashboard/chartcount?startDate=2025-11-05&endDate=2025-11-12&position_id=${positionId}`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json, text/plain, */*",
          },
        });

        if (res.status === 401 && retry) {
          const newToken = await getNewToken();
          return await fetchChartData(newToken, false);
        }

        if (!res.ok) throw new Error(`Failed to fetch chart data: ${res.status}`);
        const json = await res.json();

        if (!json?.data) throw new Error("Invalid data structure");

        const data = json.data;

        // Map API arrays to numbers for ECharts
        const labels = data.invite_sent.map((item) => item.month);
        const inviteSent = data.invite_sent.map((item) => item.count);
        const testAttempted = data.test_attempted.map((item) => item.count);
        const passRate = data.pass_rate.map((item) => item.rate);
        const averageScore = data.avg_score.map((item) => item.score);

        setChartData({ labels, inviteSent, testAttempted, passRate, averageScore });
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
        setLoading(false);
      }
    },
    [getNewToken]
  );

  useEffect(() => {
    (async () => {
      try {
        const auth = await getNewToken();
        await fetchChartData(auth);
      } catch (err) {
        setError("Failed to load charts");
      }
    })();
  }, [getNewToken, fetchChartData]);

  // 🔹 Chart Options
  const inviteChart = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Invite Sent", "Test Attempted"] },
    xAxis: { type: "category", data: chartData?.labels || [] },
    yAxis: { type: "value" },
    series: [
      {
        name: "Invite Sent",
        type: "line",
        smooth: true,
        data: chartData?.inviteSent || [],
        color: "#6f24ff",
        areaStyle: { color: "rgba(111,36,255,0.1)" },
      },
      {
        name: "Test Attempted",
        type: "line",
        smooth: true,
        data: chartData?.testAttempted || [],
        color: "#000",
      },
    ],
  };

  const performanceChart = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Pass Rate", "Average Score"] },
    xAxis: { type: "category", data: chartData?.labels || [] },
    yAxis: { type: "value" },
    series: [
      {
        name: "Pass Rate",
        type: "line",
        smooth: true,
        data: chartData?.passRate || [],
        color: "#6f24ff",
        areaStyle: { color: "rgba(111,36,255,0.1)" },
      },
      {
        name: "Average Score",
        type: "line",
        smooth: true,
        data: chartData?.averageScore || [],
        color: "#000",
      },
    ],
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      <div style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "16px" }}>
        <h3>Test Activity</h3>
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && <ReactECharts option={inviteChart} style={{ height: 400 }} />}
      </div>

      <div style={{ flex: 1, background: "#fff", borderRadius: "12px", padding: "16px" }}>
        <h3>Performance Trends</h3>
        {loading && <p>Loading data...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && <ReactECharts option={performanceChart} style={{ height: 400 }} />}
      </div>
    </div>
  );
}
