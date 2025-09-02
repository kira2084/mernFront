import React, { useEffect, useRef, useState } from "react";

import "./ProductPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIndividualForm, setShowIndividualForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [add, setAdd] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const token = localStorage.getItem("token");
  const now = new Date();
  const [mobprod, setmobprod] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const [formData, setFormData] = useState({
    productName: "",
    productId: "",
    category: "",
    price: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    thresholdValue: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // CSV upload states
  const [csvFile, setCsvFile] = useState(null);
  const [csvDragOver, setCsvDragOver] = useState(false);
  const csvFileInputRef = useRef(null);

  // CSV handling functions
  const handleCSVUpload = (file) => {
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      setCsvFile(file);
    } else {
      alert("Please upload a valid CSV file");
    }
  };

  const handleCSVDrop = (e) => {
    e.preventDefault();
    setCsvDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleCSVUpload(files[0]);
    }
  };

  const handleCSVDragOver = (e) => {
    e.preventDefault();
    setCsvDragOver(true);
  };

  const handleCSVDragLeave = (e) => {
    e.preventDefault();
    setCsvDragOver(false);
  };

  const handleCSVFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCSVUpload(file);
    }
  };

  const removeCSVFile = () => {
    setCsvFile(null);
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
    }
  };

  // Image handling functions
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData((prev) => ({ ...prev, image: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    fetch(
      "https://mernback-2-x047.onrender.com/api/v1/products?page=" +
        page +
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
        if (data.products) setProducts(data.products);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [page, add]);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState({
    inventory: { x: 0, y: 100 },
    products: { x: 0, y: 290 },
  });
  const [lastScrollY, setLastScrollY] = useState(0);
  const [order, setOrder] = useState(["inventory", "products"]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setPositions((prev) => ({
          products: {
            x: prev.products.x,
            y:
              scrollDirection === "down"
                ? Math.max(prev.products.y - 50, -200)
                : Math.min(prev.products.y + 50, 200),
          },
          inventory: {
            x: prev.inventory.x,
            y:
              scrollDirection === "down"
                ? Math.max(prev.inventory.y - 50, 200)
                : Math.min(prev.inventory.y + 50, 700),
          },
        }));

        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleMouseDown = (e, elementId) => {
    if (
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT" ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest(".pagination")
    ) {
      return;
    }

    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggedElement(elementId);
  };

  const handleMouseMove = (e) => {
    if (!draggedElement) return;

    const newY = e.clientY - dragOffset.y;

    setPositions((prev) => {
      const updated = { ...prev, [draggedElement]: { y: newY } };

      if (draggedElement === "inventory") {
        const productsMid = prev.products.y + 150;
        if (newY > productsMid) {
          setOrder(["products", "inventory"]);
          updated.inventory.y = 580;
          updated.products.y = 100;
        }
      }

      if (draggedElement === "products") {
        const inventoryMid = prev.inventory.y + 150;
        if (newY < inventoryMid) {
          setOrder(["inventory", "products"]);
          updated.inventory.y = 100;
          updated.products.y = 290;
        }
      }

      return updated;
    });
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
  };

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (draggedElement) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedElement, dragOffset]);

  const handleAddProduct = async () => {
    try {
      const productData = {
        productName: formData.productName,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        threshold: parseInt(formData.thresholdValue),
        existing_date: formData.expiryDate,
        productId: formData.productId,
        category: formData.category,
        unit: formData.unit,
      };

      const response = await fetch(
        "https://mernback-2-x047.onrender.com/api/v1/product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // console.log("Product created:", result);

        // Success - close form and reset
        setShowIndividualForm(false);
        setFormData({
          productName: "",
          productId: "",
          category: "",
          price: "",
          quantity: "",
          unit: "",
          expiryDate: "",
          thresholdValue: "",
          image: null,
        });
        setImagePreview(null);

        setAdd(!add);
      } else {
        const error = await response.json();
        console.error("Error creating product:", error);
        alert("Error adding product: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: " + error.message);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    // console.log("handle");
    handleAddProduct();
  };

  const handleCSVSubmit = () => {
    if (!csvFile) {
      //alert("Please select a CSV file to upload");
      return;
    }

    // Here you would handle the CSV file upload
    //console.log("Uploading CSV file:", csvFile.name);

    // Reset and close
    setCsvFile(null);
    setShowCSVUpload(false);
    if (csvFileInputRef.current) {
      csvFileInputRef.current.value = "";
    }

    //alert("CSV file uploaded successfully!");
    setAdd(!add);
  };
  const uniqueProducts = new Set(products.map((p) => p.productName)).size;
  const totalProduct = products.length;
  const totalPrice = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const lowStock = products.filter(
    (p) => p.quantity <= p.threshold && new Date(p.expiryDate) >= now
  ).length;
  const outOfStock = products.filter(
    (p) => p.quantity <= 0 || new Date(p.expiryDate) < now
  ).length;

  const filteredprod = search
    ? products.filter(
        (inv) =>
          inv.id?.toLowerCase().includes(search.toLowerCase()) ||
          inv.name?.toLowerCase().includes(search.toLowerCase()) ||
          inv.price?.toString().includes(search) || // partial match
          inv.quantity?.toString().includes(search)
      )
    : products;
  return (
    <>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
        }}
        className="prod"
      >
        <div
          style={{
            flex: 1,
            transition: "opacity 0.3s ease",
            opacity: showIndividualForm || showCSVUpload ? 0.3 : 1,
            pointerEvents: showIndividualForm || showCSVUpload ? "none" : "all",
          }}
        >
          <div className="title-prod">
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#fff",
                margin: 0,
              }}
            >
              Product
            </h1>
            <div className="search-bar" style={{ backgroundColor: "#4f5062" }}>
              <span className="search-icon">
                <img src="/searchicn" alt="" />
              </span>
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <hr className="styled-hrp"></hr>

          {showAddModal && !showIndividualForm && !showCSVUpload && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 2000,
                overflow: "auto",
                padding: "20px",
              }}
              onClick={() => setShowAddModal(false)}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "60px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  minWidth: "300px",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1f2937")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#374151")
                  }
                  disabled={isMobile}
                  onClick={() => {
                    if (!isMobile) {
                      setShowAddModal(false);
                      setShowIndividualForm(true);
                    }
                  }}
                >
                  Individual Product
                </button>

                <button
                  style={{
                    backgroundColor: "#374151",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#1f2937")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#374151")
                  }
                  onClick={() => {
                    setShowAddModal(false);
                    setShowCSVUpload(true);
                  }}
                >
                  Multiple Product
                </button>
              </div>
            </div>
          )}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: positions.inventory.y,
              width: "100%",
              maxWidth: "100%",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              cursor: draggedElement === "inventory" ? "grabbing" : "grab",
              zIndex: draggedElement === "inventory" ? 1001 : 999,
              padding: "25px",
            }}
            className="prod-cont"
            onMouseDown={(e) => handleMouseDown(e, "inventory")}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#374151",
                  margin: 0,
                }}
              >
                Overall Inventory
              </h2>
            </div>
            <div className="overview-content">
              <div
                className="overview-item"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginLeft: "20px",
                }}
              >
                <span className="item-title">Categories</span>
                <span className="item-value">{uniqueProducts}</span>
                <span className="item-sub">Last 7 days</span>
              </div>

              <div className="divider"></div>

              <div className="overview-item">
                <span className="item-title">Total Products</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    gap: isMobile ? "2px" : "90px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <span className="item-value">{totalProduct}</span>
                    <span className="item-sub">Last 7 days</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-value">₹{totalPrice}</span>
                    <span className="item-sub">Processed</span>
                  </div>
                </div>
              </div>

              <div className="divider nonh"></div>

              <div className="overview-item">
                <span className="item-title">Top Selling</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    gap: isMobile ? "2px" : "100px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-value">5</span>
                    <span className="item-sub">Last 7 days</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-value">₹2000</span>
                    <span className="item-sub">Cost</span>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="overview-item">
                <span className="item-title">Low Stocks</span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-around",
                    gap: isMobile ? "3px" : "80px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-value">{lowStock}</span>
                    <span className="item-sub">Ordered</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="item-value">{outOfStock}</span>
                    <span className="item-sub">Not in stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: 0,
              top: positions.products.y,
              width: "100%",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              cursor: draggedElement === "products" ? "grabbing" : "grab",
              zIndex: draggedElement === "products" ? 1001 : 1000,
            }}
            className="prod-main"
            onMouseDown={(e) => handleMouseDown(e, "products")}
          >
            <div className="products-list-section">
              <div className="products-list-header">
                <h3 className="section-title">Products</h3>
                <button
                  className="add-product-btn"
                  onClick={() => {
                    setShowAddModal(true);
                    setAdd(!add);
                  }}
                >
                  Add Product
                </button>
              </div>

              <table>
                <thead>
                  <tr>
                    <th style={{ backgroundColor: "#B7B9CF" }}>Products</th>
                    <th
                      style={{ backgroundColor: "#B7B9CF" }}
                      className="subcat"
                    >
                      Price
                    </th>
                    <th
                      style={{ backgroundColor: "#B7B9CF" }}
                      className="subcat"
                    >
                      Quantity
                    </th>
                    <th
                      className="subcat"
                      style={{ backgroundColor: "#B7B9CF" }}
                    >
                      Threshold Value
                    </th>
                    <th
                      className="subcat"
                      style={{ backgroundColor: "#B7B9CF" }}
                    >
                      Expiry Date
                    </th>
                    <th style={{ backgroundColor: "#B7B9CF" }}>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredprod.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td className="subcat">₹{p.price}</td>
                      <td className="subcat">{p.quantity} Packets</td>
                      <td className="subcat">{p.threshold} Packets</td>
                      <td className="subcat">
                        {new Date(p.expiryDate).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {p.quantity <= 0 || new Date(p.expiryDate) < now ? (
                          <span style={{ color: "red", fontWeight: "600" }}>
                            Out of stock
                          </span>
                        ) : p.quantity < p.threshold ? (
                          <span style={{ color: "#e49b43", fontWeight: "600" }}>
                            Low stock
                          </span>
                        ) : (
                          <span style={{ color: "#11a761", fontWeight: "600" }}>
                            In-stock
                          </span>
                        )}
                        <img
                          src="/info.png"
                          alt=""
                          className="mob-img"
                          style={{ width: "18px", height: "18px" }}
                          onClick={() => {
                            setmobprod(true);
                            setSelectedProduct(p);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CSV Upload Modal */}
        {showCSVUpload && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2000,
              overflow: "auto",
              padding: "20px",
            }}
          >
            {/* CSV Upload Content */}
            <div
              style={{
                padding: "30px",
                backgroundColor: "white",
                margin: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                CSV Upload
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",

                  marginBottom: "30px",
                }}
              >
                Add your documents here
              </p>

              {/* CSV Upload Area */}
              <div
                style={{
                  border: `2px dashed ${csvDragOver ? "#3b82f6" : "#d1d5db"}`,
                  borderRadius: "8px",
                  padding: "60px 40px",
                  textAlign: "center",
                  backgroundColor: csvDragOver ? "#f0f9ff" : "#f9fafb",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                  minHeight: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onDrop={handleCSVDrop}
                onDragOver={handleCSVDragOver}
                onDragLeave={handleCSVDragLeave}
                onClick={() => csvFileInputRef.current?.click()}
              >
                {csvFile ? (
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "48px",
                        marginBottom: "16px",
                        color: "#10b981",
                      }}
                    >
                      📄
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#374151",
                        marginBottom: "8px",
                      }}
                    >
                      {csvFile.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      File uploaded successfully!
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCSVFile();
                      }}
                      style={{
                        marginTop: "12px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        fontSize: "48px",
                        marginBottom: "16px",
                        color: "#9ca3af",
                      }}
                    ></div>
                    <img src="/uploadimg" alt="" />
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "16px",
                      }}
                    >
                      Drag your file(s) to start uploading
                    </div>
                    <div
                      style={{
                        width: "100px",
                        height: "1px",
                        backgroundColor: "#d1d5db",
                        margin: "0 auto 16px",
                      }}
                    ></div>
                    <button
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        padding: "8px 16px",
                        fontSize: "14px",
                        color: "#374151",
                        cursor: "pointer",
                      }}
                    >
                      Browse files
                    </button>
                  </div>
                )}
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileSelect}
                  style={{ display: "none" }}
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => {
                    setShowCSVUpload(false);
                    setCsvFile(null);
                    if (csvFileInputRef.current) {
                      csvFileInputRef.current.value = "";
                    }
                  }}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVSubmit}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#374151",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {csvFile ? "Upload" : "Next →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Individual Product Form */}
        {showIndividualForm && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              left: 0,
              right: 0,
              minHeight: "calc(100vh - 60px)",
              backgroundColor: "#424457",
              zIndex: 2000,
              overflowY: "auto",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "24px",
                fontSize: "14px",
                color: "#fff",
              }}
            >
              <span>Add Product</span>
              <span>›</span>
              <span style={{ color: "#ffff", fontWeight: "500" }}>
                Individual Product
              </span>
            </div>

            {/* Form Content */}
            <div
              style={{
                padding: "30px",
                backgroundColor: "white",
                margin: "20px",
                borderRadius: "12px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "24px",
                }}
              >
                New Product
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "20px",
                  marginBottom: "30px",
                }}
              >
                <div
                  style={{
                    border: `2px dashed ${isDragOver ? "#3b82f6" : "#d1d5db"}`,
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: isDragOver ? "#f0f9ff" : "#f9fafb",
                    width: "120px",
                    height: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "rgba(239, 68, 68, 0.9)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <div
                      style={{
                        color: "#9ca3af",
                        fontSize: "40px",
                        marginBottom: "8px",
                      }}
                    >
                      📷
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    paddingTop: "10px",
                  }}
                >
                  {imagePreview ? (
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          color: "#374151",
                          marginBottom: "4px",
                        }}
                      >
                        Image uploaded successfully!
                      </div>
                      <div style={{ fontSize: "12px" }}>
                        Click the image to change or the × to remove
                      </div>
                    </div>
                  ) : (
                    <>
                      Drag image here
                      <br />
                      or
                      <br />
                      <span
                        style={{
                          color: "#3b82f6",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Browse image
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productName: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  >
                    Product ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter product ID"
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        productId: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Select product category</option>
                    <option value="food">Food</option>
                    <option value="beverages">Beverages</option>
                    <option value="household">Household</option>
                    <option value="personal-care">Personal Care</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      Price
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Enter product quantity"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="Enter product unit"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "500",
                        color: "#374151",
                        fontSize: "14px",
                      }}
                    >
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiryDate: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                        backgroundColor: "white",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "500",
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  >
                    Threshold Value
                  </label>
                  <input
                    type="number"
                    placeholder="Enter threshold value"
                    value={formData.thresholdValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thresholdValue: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "32px",
                  paddingTop: "24px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => setShowIndividualForm(false)}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#6b7280",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  onClick={() => handleSubmit()}
                  style={{
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#374151",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {mobprod &&
        selectedProduct &&
        !showAddModal &&
        !showCSVUpload &&
        !showIndividualForm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 3000,
            }}
          >
            <div
              style={{
                width: "269px",
                height: "239px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                padding: "16px",
                maxWidth: "350px", // ✅ works for both mobile & desktop
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
            >
              {/* Header with close button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ fontSize: "16px", fontWeight: "600" }}>
                  Products Details
                </h3>
                <button
                  onClick={() => {
                    setmobprod(false);
                    setSelectedProduct([]);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ margin: "6px" }}>
                <p
                  style={{
                    margin: "4px 0",
                    fontWeight: "500",
                  }}
                >
                  {selectedProduct.name}
                </p>
                <p
                  style={{
                    margin: "4px 0",
                  }}
                >
                  Price ₹{selectedProduct.price}
                </p>
                <p style={{ margin: "4px 0" }}>
                  Quantity {selectedProduct.quantity} Packets
                </p>
                <p style={{ margin: "4px 0" }}>
                  Threshold Value {selectedProduct.threshold} Packets
                </p>
                <p style={{ margin: "4px 0" }}>
                  Expiry Date{" "}
                  {new Date(selectedProduct.expiryDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default ProductsPage;
