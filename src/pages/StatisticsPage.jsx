import React, { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./statistics.css";

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

const DraggableBox = ({ children, id, onSwap, currentOrder, isMobile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || isMobile) return;

      const newOffset = e.clientX - startX;
      setDragOffset(newOffset);

      // Check for swaps with other boxes
      checkForSwap(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragOffset(0);
      }
    };

    if (isDragging && !isMobile) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startX, isMobile]);

  const checkForSwap = (mouseX) => {
    const boxes = document.querySelectorAll(".draggable-box");
    const currentBox = boxRef.current;
    if (!currentBox) return;

    boxes.forEach((box, index) => {
      if (box === currentBox) return;

      const rect = box.getBoundingClientRect();
      const boxCenter = rect.left + rect.width / 2;

      // Check if mouse is over this box's center area
      if (mouseX >= rect.left && mouseX <= rect.right) {
        const targetId = box.getAttribute("data-id");
        if (targetId && targetId !== id) {
          onSwap(id, targetId);
        }
      }
    });
  };

  const handleMouseDown = (e) => {
    if (isMobile) return;

    setIsDragging(true);
    setStartX(e.clientX);
    e.preventDefault();
  };

  return (
    <div
      ref={boxRef}
      className={`draggable-box ${isMobile ? "mobile" : ""}`}
      data-id={id}
      style={{
        transform: isMobile ? "none" : `translateX(${dragOffset}px)`,
        cursor: isMobile ? "default" : isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 1000 : 1,
        position: "relative",
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

const StatisticsPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [topRowOrder, setTopRowOrder] = useState([
    "revenue",
    "products-sold",
    "products-stock",
  ]);
  const [Top, setTop] = useState([]);
  const [data, setData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timePeriods = ["Yearly", "Monthly", "Weekly"];

  const [bottomRowOrder, setBottomRowOrder] = useState([
    "chart",
    "top-products",
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSwapTopRow = (draggedId, targetId) => {
    setTopRowOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const draggedIndex = newOrder.indexOf(draggedId);
      const targetIndex = newOrder.indexOf(targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        [newOrder[draggedIndex], newOrder[targetIndex]] = [
          newOrder[targetIndex],
          newOrder[draggedIndex],
        ];
      }

      return newOrder;
    });
  };
  const token = localStorage.getItem("token");
  const handleSwapBottomRow = (draggedId, targetId) => {
    setBottomRowOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const draggedIndex = newOrder.indexOf(draggedId);
      const targetIndex = newOrder.indexOf(targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        [newOrder[draggedIndex], newOrder[targetIndex]] = [
          newOrder[targetIndex],
          newOrder[draggedIndex],
        ];
      }

      return newOrder;
    });
  };
  const [product, setProduct] = useState([]);
  useEffect(() => {
    fetch(
      "https://mernback-2-x047.onrender.com/api/v1/products?page=" +
        1 +
        "&limit=10",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProduct(data.products);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const totalProduct = product.length;
  const now = new Date();
  const totalPrice = product.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const inStock = product.filter(
    (p) => p.quantity >= p.threshold && new Date(p.expiryDate) >= now
  ).length;
  const boxComponents = {
    revenue: (
      <div className="yellow" style={{ backgroundColor: "#fad85d" }}>
        <h3>Total Revenue</h3>
        <p className="value">₹{totalPrice}</p>
        <span>+20.1% from last month</span>
      </div>
    ),
    "products-sold": (
      <div className="teal" style={{ backgroundColor: "#2fd3c5" }}>
        <h3>Products Sold</h3>
        <p className="value">{totalProduct}</p>
        <span>+180.1% from last month</span>
      </div>
    ),
    "products-stock": (
      <div className="purple" style={{ backgroundColor: "#f2a0ff" }}>
        <h3>Products In Stock</h3>
        <p className="value">{inStock}</p>
        <span>+19% from last month</span>
      </div>
    ),
    "top-products": (
      <div className="top-products">
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
            minHeight: "520px",
          }}
        >
          {Top.map((product) => (
            <div
              key={product.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                cursor: "grab",
                transition: "opacity 0.2s ease",
                gap: "100px",
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
    ),
    chart: (
      <div className="chart">
        <div className="chart-header">
          <h3>Sales & Purchase</h3>
          {data && (
            <div className="dropdown-wrapper">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="dropdown-btn"
              >
                📊 {selectedPeriod} <span className="arrow">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {timePeriods.map((period) => (
                    <div
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setIsDropdownOpen(false);
                      }}
                      className={`dropdown-item ${
                        selectedPeriod === period ? "active" : ""
                      }`}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ResponsiveContainer height="92%" width="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="purchase" fill="#74b9ff" radius={[10, 10, 0, 0]} />
            <Bar dataKey="sales" fill="#00b894" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ),
  };
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
      <div className="title-set">
        <h3 style={{ color: "#fff", marginTop: "10px", marginBottom: "9px" }}>
          Statistics
        </h3>
        <hr className="styled-hrp"></hr>
      </div>
      <div className="stats-container">
        <div className="stats-top-row">
          {topRowOrder.map((boxId) => (
            <DraggableBox
              key={boxId}
              id={boxId}
              onSwap={handleSwapTopRow}
              currentOrder={topRowOrder}
            >
              {boxComponents[boxId]}
            </DraggableBox>
          ))}
        </div>

        <div className="stats-bottom-row">
          {bottomRowOrder.map((boxId) => (
            <DraggableBox
              key={boxId}
              id={boxId}
              onSwap={handleSwapBottomRow}
              currentOrder={bottomRowOrder}
              isMobile={isMobile}
            >
              {boxComponents[boxId]}
            </DraggableBox>
          ))}
        </div>
      </div>
    </>
  );
};

export default StatisticsPage;
