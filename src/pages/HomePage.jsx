import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./Home.css";

const HomePage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [products, setProducts] = useState();
  const timePeriods = ["Yearly", "Monthly", "Weekly"];
  const [Top, setTop] = useState([]);
  const [stats, setStats] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [invent, setInvent] = useState([]);
  const [data, setData] = useState([]);
  const [leftColumnSections, setLeftColumnSections] = useState([
    "Sales Overview",
    "Purchase Overview",
    "Charts",
  ]);
  const [rightColumnSections, setRightColumnSections] = useState([
    "Inventory Summary",
    "Product Summary",
    "Top Products",
  ]);
  const token = localStorage.getItem("token");
  const [draggedProductIndex, setDraggedProductIndex] = useState(null);
  const [draggedLeftSectionIndex, setDraggedLeftSectionIndex] = useState(null);
  const [draggedRightSectionIndex, setDraggedRightSectionIndex] =
    useState(null);
  const renderRating = (level) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: star <= level ? "#ffd700" : "#e0e0e0",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>
    );
  };
  const handleDragStart = (e, index, setStateFunction) => {
    setStateFunction(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.style.opacity = "0.5";
    }, 0);
  };
  const handleDragEnd = (e, setStateFunction) => {
    e.target.style.opacity = "1";
    setStateFunction(null);
  };
  const handleDrop = (e, dropIndex, draggedIndex, state, setStateFunction) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newItems = [...state];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setStateFunction(newItems);
  };
  const handleDragStartLeft = (e, index) =>
    handleDragStart(e, index, setDraggedLeftSectionIndex);
  const handleDragEndLeft = (e) => handleDragEnd(e, setDraggedLeftSectionIndex);
  const handleDropLeft = (e, dropIndex) =>
    handleDrop(
      e,
      dropIndex,
      draggedLeftSectionIndex,
      leftColumnSections,
      setLeftColumnSections
    );

  const handleDragStartRight = (e, index) =>
    handleDragStart(e, index, setDraggedRightSectionIndex);
  const handleDragEndRight = (e) =>
    handleDragEnd(e, setDraggedRightSectionIndex);
  const handleDropRight = (e, dropIndex) =>
    handleDrop(
      e,
      dropIndex,
      draggedRightSectionIndex,
      rightColumnSections,
      setRightColumnSections
    );

  const handleDragStartProduct = (e, index) =>
    handleDragStart(e, index, setDraggedProductIndex);
  const handleDragEndProduct = (e) => handleDragEnd(e, setDraggedProductIndex);
  const handleDropProduct = (e, dropIndex) =>
    handleDrop(e, dropIndex, draggedProductIndex, products, setProducts);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const renderSection = (title) => {
    switch (title) {
      case "Sales Overview":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px 25px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
            className="sales-overview"
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Sales Overview
            </h3>

            {/* Responsive grid */}
            <div
              className="sales-box"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 2fr))",
                gap: "20px",
              }}
            >
              {stats.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: "center",
                    padding: "10px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                    }}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      style={{ width: "40px" }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#2d3436",
                      }}
                    >
                      ₹ {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#2d3436",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Purchase Overview":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "10px 15px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
            className="purch"
          >
            <h3
              style={{
                marginBottom: "20px",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Purchase Overview
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // ✅ auto responsive
                gap: "15px",
              }}
            >
              {purchases.map((item, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px auto",
                    }}
                  >
                    <img src={item.icon} alt={item.label} />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#292929",
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "#292929",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Charts":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              height: "400px",
            }}
            className="charts"
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "600" }}>
                Sales & Purchase
              </h3>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    minWidth: "100px",
                  }}
                >
                  📊 {selectedPeriod}{" "}
                  <span style={{ fontSize: "10px" }}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      zIndex: 1000,
                      minWidth: "100px",
                      marginTop: "4px",
                    }}
                  >
                    {timePeriods.map((period) => (
                      <div
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setIsDropdownOpen(false);
                        }}
                        style={{
                          padding: "8px 16px",
                          cursor: "pointer",
                          fontSize: "12px",
                          backgroundColor:
                            selectedPeriod === period
                              ? "#f8f9fa"
                              : "transparent",
                          borderBottom:
                            period !== timePeriods[timePeriods.length - 1]
                              ? "1px solid #eee"
                              : "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor =
                            selectedPeriod === period
                              ? "#f8f9fa"
                              : "transparent")
                        }
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="purchase"
                  fill="#74b9ff"
                  radius={[10, 10, 0, 0]}
                />
                <Bar dataKey="sales" fill="#00b894" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "Inventory Summary":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
                marginTop: "4px",
              }}
            >
              Inventory Summary
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", // ✅ auto responsive
                gap: "15px",
              }}
            >
              {invent.map((item, index) => (
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      padding: "5px",
                      textAlign: "center",
                    }}
                    key={index}
                  >
                    <div style={{ fontSize: "20px", marginBottom: "2px" }}>
                      <img src={item.icon} alt="" />
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#292929",
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#292929",
                        fontWeight: "600",
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "Product Summary":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Product Summary
            </h3>
            <div style={{ display: "flex", gap: "15px" }}>
              <div
                style={{
                  flex: 1,
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>
                  <img src="/sup.png" alt="" />
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#292929",
                  }}
                >
                  10
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#292929",
                    fontWeight: "bold",
                  }}
                >
                  Number of Suppliers
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>
                  <img src="/cate.png" alt="" />
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#292929",
                  }}
                >
                  4
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#292929",
                    fontWeight: "600",
                  }}
                >
                  Number of Categories
                </div>
              </div>
            </div>
          </div>
        );
      case "Top Products":
        return (
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              flex: 1,
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Top Products
            </h3>
            <div
              style={{
                padding: "15px",
                minHeight: "300px",
              }}
            >
              {Top.map((product, index) => (
                <div
                  key={product.name}
                  draggable="true"
                  onDragStart={(e) => handleDragStartProduct(e, index)}
                  onDragEnd={handleDragEndProduct}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropProduct(e, index)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    cursor: "grab",
                    transition: "opacity 0.2s ease",
                    paddingBottom: "50px",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#292929" }}>
                    {product.name}
                  </div>
                  {renderRating(product.rating)}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  //to get sales
  useEffect(() => {
    fetch("https://mernback-2-x047.onrender.com/api/v1/all/sales", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = [
          { label: "Sales", value: data.totalSales, icon: "/sales.png" },
          { label: "Revenue", value: data.totalRevenue, icon: "/revenue.png" },
          { label: "Profit", value: data.totalProfit, icon: "/profit.png" },
          { label: "Cost", value: data.totalCost, icon: "/salescost.png" },
        ];
        setStats(items);
      })
      .catch((err) => {
        console.error("Error fetching sales:", err);
      });
  }, [token]);
  //to get purchase
  useEffect(() => {
    fetch("https://mernback-2-x047.onrender.com/api/v1/all/purchases", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const items = [
          {
            label: "Purchases",
            value: data.totalPurchases,
            icon: "/purchase.png",
          },
          { label: "Cost", value: data.totalCost, icon: "/cost.png" },
          {
            label: "Cancelled",
            value: data.cancelledOrders,
            icon: "/cancel.png",
          },
          { label: "Returned", value: data.returnedOrders, icon: "/ret.png" },
        ];
        const item2 = [
          {
            label: "Quantity in Hand",
            value: data.currentQuantity,
            icon: "/quantity.png",
          },
          {
            label: "To be Received",
            value: data.orderQuantity,
            icon: "/loc.png",
          },
        ];
        setInvent(item2);
        setPurchases(items);
      })
      .catch((err) => {
        console.error("Error fetching purchases:", err);
      });
  }, [token]);
  useEffect(() => {
    fetch("https://mernback-2-x047.onrender.com/api/v1/all/tops", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => setTop(data))
      .catch((err) => console.error(err));
  }, []);
  useEffect(() => {
    fetch("https://mernback-2-x047.onrender.com/api/v1/all/charts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);
  return (
    <>
      <div className="title">
        <h1
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            margin: 0,
            paddingBottom: "10px",
          }}
        >
          Home
        </h1>
        <hr className="styled-hrp"></hr>
      </div>
      <div className="content-left">
        <div
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          className="sales"
        >
          {leftColumnSections.map((sectionTitle, index) => (
            <div
              key={sectionTitle}
              draggable="true"
              onDragStart={(e) => handleDragStartLeft(e, index)}
              onDragEnd={handleDragEndLeft}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropLeft(e, index)}
              style={{ cursor: "grab" }}
            >
              {renderSection(sectionTitle)}
            </div>
          ))}
        </div>

        <div className="right-data">
          {rightColumnSections.map((sectionTitle, index) => (
            <div
              key={sectionTitle}
              draggable="true"
              onDragStart={(e) => handleDragStartRight(e, index)}
              onDragEnd={handleDragEndRight}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropRight(e, index)}
              style={{ cursor: "grab" }}
            >
              {renderSection(sectionTitle)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
