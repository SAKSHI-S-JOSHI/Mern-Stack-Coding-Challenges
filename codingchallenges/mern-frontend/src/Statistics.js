import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState({
    totalSale: 0,
    soldItems: 0,
    notSoldItems: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = async () => {
    try {
      const { data } = await axios.get("/api/statistics", {
        params: { month },
      });
      setStatistics(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="stats">
      <div className="stat-box">
        <div>Total Sale Amount</div>
        <div>{statistics.totalSale}</div>
      </div>
      <div className="stat-box">
        <div>Total Sold Items</div>
        <div>{statistics.soldItems}</div>
      </div>
      <div className="stat-box">
        <div>Total Not Sold Items</div>
        <div>{statistics.notSoldItems}</div>
      </div>
    </div>
  );
};

export default Statistics;
