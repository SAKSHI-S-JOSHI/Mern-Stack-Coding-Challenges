import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const PieChart = ({ month }) => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetchPieChartData();
  }, [month]);

  const fetchPieChartData = async () => {
    try {
      const { data } = await axios.get("/api/pie-chart", { params: { month } });
      setData({
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
            ],
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  return <Pie data={data} />;
};

export default PieChart;
