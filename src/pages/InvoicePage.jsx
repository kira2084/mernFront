import React, { useState, useEffect, useCallback } from "react";
import "./InvoicePage.css";

const InvoicePage = ({ setInvoiceModalOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [getinvs, setInv] = useState(null);
  const [search, setSearch] = useState("");
  const limit = 5;
  const token = localStorage.getItem("token");
  useEffect(() => {
    fetch(
      `https://mernback-2-x047.onrender.com/api/v1/invoice?page=${page}&limit=${limit}`,
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
        if (data && data.invoices) {
          setInvoices(data.invoices);
          setTotalPages(data.totalPages);
        } else {
          setInvoices([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching invoices:", err);
        setInvoices([]);
      });
  }, [page]);

  const toggleDropdown = (invoiceId) => {
    setActiveDropdown(activeDropdown === invoiceId ? null : invoiceId);
  };

  const handleViewInvoice = (invoiceId) => {
    setSelectedInvoice(invoiceId);
    setShowInvoiceModal(true);
    setActiveDropdown(null);
    if (setInvoiceModalOpen) setInvoiceModalOpen(true);
  };

  const closeModal = () => {
    setShowInvoiceModal(false);
    if (setInvoiceModalOpen) setInvoiceModalOpen(false);
  };

  const handleDeleteInvoice = useCallback(async (id) => {
    try {
      const res = await fetch(
        `https://mernback-2-x047.onrender.com/api/v1/invoice/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        //alert("Succesfully deleted");
        setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      } else {
        console.error("Failed to delete:", data.error);
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  }, []);

  // Drag functionality - exactly from ProductsPage
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState({
    inventory: { x: 0, y: 100 },
    products: { x: 0, y: 290 },
  });
  const [lastScrollY, setLastScrollY] = useState(0);
  const [order, setOrder] = useState(["inventory", "products"]);

  // Auto-shift sections based on scroll direction - exactly from ProductsPage
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";

      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        // Minimum scroll threshold
        setPositions((prev) => ({
          products: {
            x: prev.products.x,
            y:
              scrollDirection === "down"
                ? Math.max(prev.products.y - 50, -200) // Move up when scrolling down
                : Math.min(prev.products.y + 50, 200), // Move down when scrolling up
          },
          inventory: {
            x: prev.inventory.x,
            y:
              scrollDirection === "down"
                ? Math.max(prev.inventory.y - 50, 200) // Move up when scrolling down
                : Math.min(prev.inventory.y + 50, 700), // Move down when scrolling up
          },
        }));

        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleMouseDown = (e, elementId) => {
    // Don't start dragging if clicking on interactive elements
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

      // Detect swap (if inventory dragged below products midpoint OR vice versa)
      if (draggedElement === "inventory") {
        const productsMid = prev.products.y + 150; // half height
        if (newY > productsMid) {
          setOrder(["products", "inventory"]); // swap order
          updated.inventory.y = 580;
          updated.products.y = 100;
        }
      }

      if (draggedElement === "products") {
        const inventoryMid = prev.inventory.y + 150;
        if (newY < inventoryMid) {
          setOrder(["inventory", "products"]); // swap order
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

  // Filter invoices (client-side)
  const filteredInvoices = search
    ? invoices.filter(
        (inv) =>
          inv.id?.toLowerCase().includes(search.toLowerCase()) ||
          inv.ref?.toLowerCase().includes(search.toLowerCase()) ||
          inv.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
          inv.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
          inv.amount?.toString().includes(search) ||
          inv.status?.toLowerCase().includes(search.toLowerCase())
      )
    : invoices;

  const printInvoice = () => {
    window.print();
  };

  const totalRecords = invoices.length;
  const paidInvoices = invoices.filter(
    (inv) => inv.status.toLowerCase() === "paid"
  );
  const paidCount = paidInvoices.length;
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const unpaidInvoices = invoices.filter(
    (inv) => inv.status.toLowerCase() === "unpaid"
  );
  const unpaidCount = unpaidInvoices.length;
  const unpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleDownload = () => {
    // Create a clean version for PDF generation
    const printContent = document.getElementById("invoice-content").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoices.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-title { font-size: 24px; font-weight: bold; color: #333; }
            .bill-to { margin: 20px 0; }
            .bill-to h3 { margin: 0 0 10px 0; font-size: 14px; color: #666; }
            .business-address { text-align: right; font-size: 12px; color: #666; }
            .invoice-details { display: flex; gap: 40px; margin: 20px 0; }
            .detail-group h4 { margin: 0 0 5px 0; font-size: 12px; color: #666; }
            .detail-group p { margin: 0; font-size: 14px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { background: #f5f5f5; padding: 10px; text-align: left; font-size: 12px; color: #666; border-bottom: 1px solid #ddd; }
            .items-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .totals { margin-left: auto; width: 200px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-row.final { font-weight: bold; border-top: 1px solid #333; padding-top: 10px; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
            .contact-info { display: flex; justify-content: space-between; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: "3px",
        }}
      >
        {/* === Page Header === */}
        <div className="invoice-my">
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#fff",
              margin: 0,
            }}
          >
            Invoice
          </h1>
          <div className="search-bar" style={{ backgroundColor: "#4f5062" }}>
            <span className="search-icon">
              <img src="/searchicn.png" alt="" />
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
        {/* === Draggable Overview Section === */}
        <div
          style={{
            position: "absolute",
            left: 0, // lock X axis
            top: positions.inventory.y,
            width: "100%",
            maxWidth: "95%", // prevent overflow
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            cursor: draggedElement === "inventory" ? "grabbing" : "grab",
            userSelect: "none",
            zIndex: draggedElement === "inventory" ? 1001 : 999,
            padding: "25px",
          }}
          className="over-mob"
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
              Overall Invoice
            </h2>
          </div>
          <div className="overview-content">
            <div className="overview-item">
              <span className="item-title">Recent Transactions</span>
              <span className="item-value">{paidCount}</span>
              <span className="item-sub">Last 7 days</span>
            </div>

            <div className="divider"></div>

            <div className="overview-item">
              <span className="item-title">Total Invoices</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
                className="total-inv"
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">{totalRecords}</span>
                  <span className="item-sub">Last 7 days</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">{paidCount}</span>
                  <span className="item-sub">Processed</span>
                </div>
              </div>
            </div>

            <div className="divider nonh"></div>

            <div className="overview-item">
              <span className="item-title">Paid Amount</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">₹{paidAmount}</span>
                  <span className="item-sub">Last 7 days</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">23</span>
                  <span className="item-sub">customers</span>
                </div>
              </div>
            </div>

            <div className="divider"></div>

            <div className="overview-item">
              <span className="item-title">Unpaid Amount</span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-around",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">₹{unpaidAmount}</span>
                  <span className="item-sub">Ordered</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="item-value">{unpaidCount}</span>
                  <span className="item-sub">Pending Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* === Draggable Invoices List === */}
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
            userSelect: "none",
            zIndex: draggedElement === "products" ? 1001 : 1000,
          }}
          onMouseDown={(e) => handleMouseDown(e, "products")}
        >
          <div className="products-list-section">
            <div className="products-list-header">
              <h3 className="section-title">Invoice</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th style={{ backgroundColor: "#B7B9CF" }}>Invoice ID</th>
                  <th style={{ backgroundColor: "#B7B9CF" }} className="subcat">
                    Reference Number
                  </th>
                  <th className="subcat" style={{ backgroundColor: "#B7B9CF" }}>
                    Amount (₹)
                  </th>
                  <th className="subcat" style={{ backgroundColor: "#B7B9CF" }}>
                    Status
                  </th>
                  <th
                    className="desktop-only"
                    style={{ backgroundColor: "#B7B9CF" }}
                  >
                    Due Date
                  </th>
                  <th
                    className="mobile-only"
                    style={{ backgroundColor: "#B7B9CF" }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id || invoice._id}>
                    <td>{invoice.id || invoice.invoiceId}</td>
                    <td className="subcat">
                      {invoice.ref || invoice.referenceNumber}
                    </td>
                    <td className="subcat">₹{invoice.amount}</td>
                    <td className="subcat">
                      <span
                        className={`status ${invoice.status?.toLowerCase()}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="desktop-only">
                      <div className="due-date-with-actions">
                        <span>{invoice.dueDate}</span>
                        <div className="dropdown-container">
                          <button
                            className="three-dots-btn"
                            onClick={() =>
                              toggleDropdown(invoice.id || invoice._id)
                            }
                          >
                            ⋮
                          </button>
                          {activeDropdown === (invoice.id || invoice._id) && (
                            <div className="dropdown-menu">
                              <button
                                className="dropdown-item view-btn"
                                onClick={() => {
                                  handleViewInvoice(invoice.id || invoice._id);
                                  setInv(invoice);
                                }}
                              >
                                <img
                                  src="/view.png"
                                  alt="View"
                                  style={{ paddingRight: "5px" }}
                                />
                                View Invoice
                              </button>
                              <button
                                className="dropdown-item delete-btn"
                                disabled={
                                  invoice.status.toLowerCase() === "unpaid"
                                    ? true
                                    : false
                                }
                                onClick={() => {
                                  setSelectedInvoiceId(
                                    invoice.id || invoice._id
                                  );
                                  setShowDeleteModal(true);
                                  setActiveDropdown(null);
                                }}
                              >
                                <img
                                  src="/del.png"
                                  alt="Delete"
                                  style={{ paddingRight: "5px" }}
                                />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="mobile-only">
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src="/view.png"
                          alt="View"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleViewInvoice(invoice.id || invoice._id)
                          }
                        />
                        <img
                          src="/del.png"
                          alt="Delete"
                          style={{
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedInvoiceId(invoice.id || invoice._id);
                            setShowDeleteModal(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {(showDeleteModal || showInvoiceModal) && (
          <div className="modal-overlay-bg"></div>
        )}
        {showDeleteModal && (
          <div id="invoiceDeleteModal" className="modal">
            <div className="modal-content">
              <p>This invoice will be deleted.</p>
              <div className="button-container">
                <button
                  id="cancelButton"
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="confirmButton"
                  className="confirm-btn"
                  onClick={() => {
                    handleDeleteInvoice(selectedInvoiceId);
                    setShowDeleteModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {showInvoiceModal && (
          <div class="invoice-wrapper">
            <div class="action-buttons">
              <button
                class="btn btn-download"
                onClick={handleDownload}
                title="Download"
              >
                ⬇
              </button>
              <button
                class="btn btn-print"
                onClick={printInvoice}
                title="Print"
              >
                🖨
              </button>
              <button class="btn btn-close" onClick={closeModal} title="Close">
                ✕
              </button>
              <button className="mob-can" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div class="invoice-content">
              <div class="invoice-header">
                <div>
                  <h1 class="invoice-title">INVOICE</h1>
                  <div class="bill-to">
                    <h3>Billed to</h3>
                    <div>Company Name</div>
                    <div>Company address</div>
                    <div>City, Country 12345</div>
                  </div>
                </div>
                <div class="business-address">
                  <div>Business address</div>
                  <div>City, State, Zip - 000 000</div>
                  <div>TAX ID: 00000000000000</div>
                </div>
              </div>

              <div class="invoice-details">
                <div class="detail-group">
                  <h4>Invoice #</h4>
                  <p>{getinvs.invoiceId}</p>
                </div>
                <div class="detail-group">
                  <h4>Products</h4>
                  <p>10</p>
                </div>
                <div class="detail-group">
                  <h4>Qty</h4>
                  <p>519</p>
                </div>
                <div class="detail-group">
                  <h4>Price</h4>
                  <p>₹13810</p>
                </div>
              </div>

              <div class="invoice-details">
                <div class="detail-group">
                  <h4>Reference</h4>
                  <p>{getinvs.referenceNumber}</p>
                </div>
                <div class="detail-group">
                  <h4>Due date</h4>
                  <p>{getinvs.dueDate}</p>
                </div>
              </div>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Business Plan (5kg)</td>
                    <td>1</td>
                    <td>₹1200</td>
                  </tr>
                  <tr>
                    <td>Dashboard Alive (10kg)</td>
                    <td>1</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Fertilizer Sunflower Oil (5L)</td>
                    <td>1</td>
                    <td>₹11500</td>
                  </tr>
                  <tr>
                    <td>Amal Tomato Milk (5L)</td>
                    <td>5</td>
                    <td>₹273</td>
                  </tr>
                  <tr>
                    <td>Take Salad (5kg)</td>
                    <td>2</td>
                    <td>₹156</td>
                  </tr>
                  <tr>
                    <td>Mango Noodles (10 packs)</td>
                    <td>1</td>
                    <td>₹156</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals-section">
                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>₹13500</span>
                  </div>
                  <div class="total-row">
                    <span>Tax (10%)</span>
                    <span>₹310</span>
                  </div>
                  <div class="total-row final">
                    <span>Total due</span>
                    <span>₹13810</span>
                  </div>
                </div>
              </div>
              <div class="footer-note">
                ⚡ Please pay within 10 days of receiving this invoice
              </div>

              <div class="contact-info">
                <div>www.mysite.com</div>
                <div>+91 00000 00000</div>
                <div>hello@email.com</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InvoicePage;
