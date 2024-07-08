import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

const BarChart = ({ month }) => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchBarChartData();
  }, [month]);

  const fetchBarChartData = async () => {
    try {
      const { data } = await axios.get("/api/bar-chart", { params: { month } });
      setData({
        labels: Object.keys(data),
        datasets: [
          {
            label: "Number of Items",
            data: Object.values(data),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  return <Bar data={data} />;
};

export default BarChart;
