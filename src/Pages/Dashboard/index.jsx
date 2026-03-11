import React, { useState, useContext, useEffect } from "react";
import DashboardBoxes from "../../Components/DashboardBoxes";
import { FaPlus } from "react-icons/fa6";
import { Button, Pagination } from "@mui/material";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import Badge from "../../Components/Badge";
import "./style.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MyContext } from "../../App";
import SearchBox from "../../Components/SearchBox";
import { fetchDataFromApi } from "../../utils/api";
import Products from "../Products";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconBox      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconOrders   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
const IconPending  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconDelivery = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
const IconConfirm  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>;
const IconUsers    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IconReviews  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconRevenue  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconCategory = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconTrend    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
const IconArrow    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, accent, trend, trendLabel, delay = 0, link }) => (
  <div
    className="stat-card"
    style={{ "--accent": accent, "--delay": `${delay}ms` }}
  >
    <div className="stat-card__top">
      <div className="stat-card__icon" style={{ background: `${accent}18`, color: accent }}>
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? "stat-card__trend--up" : "stat-card__trend--down"}`}>
          <IconTrend />
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div className="stat-card__value">{value ?? "—"}</div>
    <div className="stat-card__label">{label}</div>
    {trendLabel && <div className="stat-card__sublabel">{trendLabel}</div>}
    <div className="stat-card__bar">
      <div className="stat-card__bar-fill" style={{ background: accent }} />
    </div>
  </div>
);

// ─── Order Status Badge ───────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    pending:   { bg: "#fef9c3", text: "#854d0e", label: "Pending"   },
    confirmed: { bg: "#dcfce7", text: "#166534", label: "Confirmed" },
    delivered: { bg: "#dbeafe", text: "#1e40af", label: "Delivered" },
    cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
    shipped:   { bg: "#f3e8ff", text: "#6b21a8", label: "Shipped"   },
  };
  const s = map[status?.toLowerCase()] || { bg: "#f1f5f9", text: "#475569", label: status };
  return (
    <span style={{ background: s.bg, color: s.text }}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-[700] whitespace-nowrap tracking-wide">
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// SELLER DASHBOARD — fully dynamic, real API data
// ═══════════════════════════════════════════════════════════════════════════════

// Stat Box
const SBox = ({ icon, label, value, accent, sub, loading, delay = 0 }) => (
  <div className="sdb-box" style={{ "--ac": accent, animationDelay: `${delay}ms` }}>
    <div className="sdb-box__glow" style={{ background: accent }} />
    <div className="sdb-box__top">
      <span className="sdb-box__icon" style={{ background: `${accent}18`, color: accent }}>{icon}</span>
      {loading ? <div className="sdb-skel sdb-skel--sm" /> : <span className="sdb-box__value">{value ?? "—"}</span>}
    </div>
    <p className="sdb-box__label">{label}</p>
    {sub && <p className="sdb-box__sub">{sub}</p>}
    <div className="sdb-box__bar" style={{ background: `linear-gradient(90deg,${accent},${accent}33)` }} />
  </div>
);

// Transaction Row
const TrxRow = ({ trx }) => {
  const isDeposit = trx?.type === "DEPOSIT";
  const statusMap = {
    PENDING:  { bg: "#fef9c3", color: "#854d0e" },
    APPROVED: { bg: "#dcfce7", color: "#166534" },
    REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  };
  const st = statusMap[trx?.status] || statusMap.PENDING;
  return (
    <tr className="sdb-trx__row">
      <td>
        <span className="sdb-trx__type" style={{ background: isDeposit ? "#dcfce7" : "#fee2e2", color: isDeposit ? "#166534" : "#991b1b" }}>
          {isDeposit ? "↓ Deposit" : "↑ Withdraw"}
        </span>
      </td>
      <td className="sdb-trx__amt" style={{ color: isDeposit ? "#16a34a" : "#dc2626" }}>
        {isDeposit ? "+" : "−"}₹{Number(trx?.amount || 0).toLocaleString("en-IN")}
      </td>
      <td><span className="sdb-trx__badge" style={{ background: st.bg, color: st.color }}>{trx?.status}</span></td>
      <td className="sdb-trx__note">{trx?.note || "—"}</td>
      <td className="sdb-trx__date">{trx?.createdAt ? new Date(trx.createdAt).toLocaleDateString("en-IN") : "—"}</td>
    </tr>
  );
};

const SellerDashboard = ({ context }) => {
  const [stats,    setStats]    = useState(null);
  const [wallet,   setWallet]   = useState(null);
  const [trxList,  setTrxList]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [wLoading, setWLoading] = useState(true);
  const [error,    setError]    = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [greeting, setGreeting] = useState("Hello");
  const [showAllTrx, setShowAllTrx] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  const fetchStats = () => {
    setLoading(true);
    setError(null);

    // Fetch all seller orders (no limit) + products count in parallel
    Promise.all([
      fetchDataFromApi("/api/order/seller/orders?page=1&limit=10000"),
      fetchDataFromApi("/api/product/seller/products"),
    ])
      .then(([ordersRes, productsRes]) => {
        const orders = ordersRes?.data || [];
        const totalProducts = productsRes?.total || productsRes?.products?.length || 0;

        let totalOrders = orders.length;
        let pendingOrders = 0, confirmedOrders = 0, shippedOrders = 0;
        let deliveredOrders = 0, cancelledOrders = 0;
        let totalEarning = 0, pendingEarning = 0;

        for (const o of orders) {
          const st  = (o.order_status || "").toLowerCase();
          const amt = Number(o.totalAmt || 0);
          if (st === "pending")   pendingOrders++;
          if (st === "confirmed") { confirmedOrders++; pendingEarning += amt; }
          if (st === "shipped")   { shippedOrders++;   pendingEarning += amt; }
          if (st === "delivered") { deliveredOrders++; totalEarning   += amt; }
          if (st === "cancelled") cancelledOrders++;
        }

        setStats({
          totalProducts,
          totalOrders,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalEarning,
          pendingEarning,
        });
        setLastSync(new Date());
      })
      .catch(() => setError("Network error — check connection"))
      .finally(() => setLoading(false));
  };

  const fetchWallet = () => {
    setWLoading(true);
    fetchDataFromApi("/api/user/wallet/overview")
      .then((res) => {
        if (res?.error === false || res?.success) {
          setWallet(res?.wallet || null);
          setTrxList(res?.transactions || []);
        }
      })
      .finally(() => setWLoading(false));
  };

  useEffect(() => {
    fetchStats();
    fetchWallet();
    const id = setInterval(() => { fetchStats(); fetchWallet(); }, 60000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const fmtR = (n) => {
    const v = Number(n || 0);
    if (!v) return "₹0";
    return v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${fmt(v)}`;
  };

  const s = stats || {};
  const visibleTrx = showAllTrx ? trxList : trxList.slice(0, 5);

  const statBoxes = [
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      label: "Total Products", value: fmt(s.totalProducts), accent: "#6366f1", sub: "In your store", delay: 0 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
      label: "Total Orders", value: fmt(s.totalOrders), accent: "#0ea5e9", sub: "All time", delay: 60 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      label: "Pending Orders", value: fmt(s.pendingOrders), accent: "#f59e0b", sub: "Awaiting action", delay: 120 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
      label: "Confirmed Orders", value: fmt(s.confirmedOrders), accent: "#10b981", sub: "Ready to ship", delay: 180 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
      label: "Shipped Orders", value: fmt(s.shippedOrders), accent: "#8b5cf6", sub: "Out for delivery", delay: 240 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
      label: "Delivered Orders", value: fmt(s.deliveredOrders), accent: "#3b82f6", sub: "Completed", delay: 300 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
      label: "Cancelled Orders", value: fmt(s.cancelledOrders), accent: "#ef4444", sub: "Refunded/closed", delay: 360 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
      label: "Total Earnings", value: fmtR(s.totalEarning), accent: "#14b8a6", sub: "Delivered orders", delay: 420 },
    { icon: <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      label: "Pending Earnings", value: fmtR(s.pendingEarning), accent: "#ec4899", sub: "Confirmed+shipped", delay: 480 },
  ];

  return (
    <>
      <style>{`
        /* ── Hero ── */
        .sdb-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%);border-radius:18px;padding:32px 36px;margin-bottom:22px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
        .sdb-hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 55% 70% at 85% 50%,#6366f130 0%,transparent 70%),radial-gradient(ellipse 40% 60% at 15% 80%,#0ea5e920 0%,transparent 65%);}
        .sdb-hero__dots{position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(circle,#ffffff09 1px,transparent 1px);background-size:26px 26px;}
        .sdb-hero__left{position:relative;z-index:1;}
        .sdb-hero__right{position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-end;gap:8px;}
        .sdb-hero__tag{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#a5b4fc;margin-bottom:7px;}
        .sdb-hero__name{font-size:clamp(18px,2.5vw,26px);font-weight:800;color:#fff;margin-bottom:5px;letter-spacing:-0.4px;}
        .sdb-hero__sub{font-size:12.5px;color:#94a3b8;line-height:1.6;max-width:340px;}
        .sdb-hero__live{display:inline-flex;align-items:center;gap:6px;margin-top:12px;background:#10b98118;border:1px solid #10b98135;color:#6ee7b7;font-size:10.5px;font-weight:700;padding:4px 11px;border-radius:100px;}
        .sdb-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 7px #10b981;animation:sdot 1.6s ease-in-out infinite;}
        @keyframes sdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.75)}}
        .sdb-hero__pill{background:#ffffff0c;border:1px solid #ffffff15;border-radius:11px;padding:9px 14px;text-align:right;backdrop-filter:blur(8px);min-width:120px;}
        .sdb-hero__pill-lbl{font-size:9.5px;color:#64748b;letter-spacing:1px;text-transform:uppercase;}
        .sdb-hero__pill-val{font-size:18px;font-weight:800;color:#fff;margin-top:1px;}

        /* ── Toolbar ── */
        .sdb-toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
        .sdb-section-lbl{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#64748b;display:flex;align-items:center;gap:8px;}
        .sdb-section-lbl::after{content:"";flex:1;height:1px;background:#e2e8f0;}
        .sdb-sync{font-size:10.5px;color:#94a3b8;}
        .sdb-refresh{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:#6366f1;background:#eef2ff;border:1px solid #c7d2fe;padding:5px 11px;border-radius:8px;cursor:pointer;transition:background .15s;}
        .sdb-refresh:hover{background:#e0e7ff;}
        .sdb-refresh:disabled{opacity:.55;cursor:not-allowed;}
        .sdb-refresh.spin svg{animation:sspin .6s linear infinite;}
        @keyframes sspin{to{transform:rotate(360deg)}}

        /* ── Error ── */
        .sdb-err{background:#fef2f2;border:1px solid #fecaca;border-radius:11px;padding:11px 15px;color:#991b1b;font-size:12px;display:flex;align-items:center;gap:9px;margin-bottom:14px;}
        .sdb-err button{margin-left:auto;font-size:11px;font-weight:700;color:#dc2626;background:none;border:1px solid #fca5a5;padding:3px 9px;border-radius:6px;cursor:pointer;}

        /* ── Stat Boxes ── */
        .sdb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:12px;margin-bottom:24px;}
        .sdb-box{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:15px;overflow:hidden;padding:16px 15px 14px;transition:transform .2s,box-shadow .2s,border-color .2s;animation:sboxIn .4s ease both;cursor:default;}
        @keyframes sboxIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .sdb-box:hover{transform:translateY(-3px);box-shadow:0 12px 28px -8px rgba(0,0,0,.1);border-color:var(--ac);}
        .sdb-box__glow{position:absolute;top:-18px;right:-18px;width:72px;height:72px;border-radius:50%;opacity:.09;filter:blur(22px);pointer-events:none;}
        .sdb-box__bar{position:absolute;bottom:0;left:0;right:0;height:3px;}
        .sdb-box__top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .sdb-box__icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .sdb-box__value{font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;line-height:1;}
        .sdb-box__label{font-size:11px;font-weight:600;color:#64748b;margin-bottom:2px;}
        .sdb-box__sub{font-size:10px;color:#94a3b8;}
        .sdb-skel{border-radius:6px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;animation:sshim 1.3s infinite;}
        .sdb-skel--sm{width:64px;height:22px;}
        .sdb-skel--md{width:100%;height:16px;margin-top:6px;}
        @keyframes sshim{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ── Wallet Card ── */
        .sdb-wallet-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}
        .sdb-wallet-card{background:#fff;border:1px solid #e2e8f0;border-radius:15px;padding:18px 16px;display:flex;align-items:center;gap:13px;}
        .sdb-wallet-card__icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .sdb-wallet-card__lbl{font-size:11px;font-weight:600;color:#64748b;margin-bottom:4px;}
        .sdb-wallet-card__val{font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.4px;}

        /* ── Transactions ── */
        .sdb-trx-wrap{background:#fff;border:1px solid #e2e8f0;border-radius:15px;overflow:hidden;margin-bottom:24px;}
        .sdb-trx-header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #f1f5f9;}
        .sdb-trx-title{font-size:14px;font-weight:700;color:#0f172a;}
        .sdb-trx-count{font-size:11px;color:#94a3b8;font-weight:500;}
        table.sdb-trx{width:100%;border-collapse:collapse;}
        .sdb-trx th{font-size:10.5px;font-weight:700;color:#94a3b8;letter-spacing:.8px;text-transform:uppercase;padding:10px 18px;text-align:left;background:#f8fafc;border-bottom:1px solid #f1f5f9;}
        .sdb-trx__row td{padding:11px 18px;border-bottom:1px solid #f8fafc;font-size:12.5px;vertical-align:middle;}
        .sdb-trx__row:last-child td{border-bottom:none;}
        .sdb-trx__row:hover td{background:#f8fafc;}
        .sdb-trx__type{display:inline-flex;align-items:center;padding:3px 9px;border-radius:100px;font-size:11px;font-weight:700;}
        .sdb-trx__amt{font-size:13px;font-weight:700;}
        .sdb-trx__badge{display:inline-block;padding:3px 9px;border-radius:100px;font-size:10.5px;font-weight:700;}
        .sdb-trx__note{color:#64748b;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .sdb-trx__date{color:#94a3b8;font-size:11px;white-space:nowrap;}
        .sdb-trx-empty{text-align:center;padding:28px;color:#94a3b8;font-size:13px;}
        .sdb-showall{display:flex;align-items:center;justify-content:center;padding:11px;border-top:1px solid #f1f5f9;}
        .sdb-showall button{font-size:12px;font-weight:600;color:#6366f1;background:none;border:none;cursor:pointer;}

        @media(max-width:640px){
          .sdb-hero{padding:20px 16px;flex-direction:column;}
          .sdb-hero__right{align-items:flex-start;flex-direction:row;flex-wrap:wrap;}
          .sdb-grid{grid-template-columns:repeat(2,1fr);}
          .sdb-wallet-grid{grid-template-columns:1fr;}
        }
      `}</style>

      {/* ── Hero ── */}
      <div className="sdb-hero">
        <div className="sdb-hero__dots" />
        <div className="sdb-hero__left">
          <p className="sdb-hero__tag">Seller Dashboard</p>
          <h1 className="sdb-hero__name">{greeting}, {context?.userData?.name?.split(" ")[0]} 👋</h1>
          <p className="sdb-hero__sub">
            {context?.userData?.storeProfile?.storeName
              ? `${context.userData.storeProfile.storeName} — live store analytics`
              : "Your real-time store performance at a glance"}
          </p>
          <div className="sdb-hero__live"><span className="sdb-dot" />Live · Auto-refresh 60s</div>
        </div>
        <div className="sdb-hero__right">
          <div className="sdb-hero__pill">
            <p className="sdb-hero__pill-lbl">Total Earnings</p>
            <p className="sdb-hero__pill-val" style={{ color: "#6ee7b7" }}>{loading ? "…" : fmtR(s.totalEarning)}</p>
          </div>
          <div className="sdb-hero__pill">
            <p className="sdb-hero__pill-lbl">Orders</p>
            <p className="sdb-hero__pill-val">{loading ? "…" : fmt(s.totalOrders)}</p>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="sdb-err">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
          <button onClick={fetchStats}>Retry</button>
        </div>
      )}

      {/* ── Stats Toolbar ── */}
      <div className="sdb-toolbar">
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Store Overview</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastSync && <span className="sdb-sync">Updated {lastSync.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button className={`sdb-refresh${loading ? " spin" : ""}`} onClick={() => { fetchStats(); fetchWallet(); }} disabled={loading}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ── Stat Boxes ── */}
      <div className="sdb-grid">
        {statBoxes.map((b, i) => <SBox key={i} {...b} loading={loading} />)}
      </div>

      {/* ── Wallet ── */}
      <div className="sdb-toolbar" style={{ marginTop: 4 }}>
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Wallet & Earnings</div>
      </div>
      <div className="sdb-wallet-grid">
        {[
          { label: "Available Balance", val: fmtR(wallet?.availableBalance), color: "#10b981", bg: "#dcfce7",
            icon: <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
          { label: "Total Deposited",   val: fmtR(wallet?.totalDeposited),   color: "#6366f1", bg: "#eef2ff",
            icon: <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
          { label: "Total Withdrawn",   val: fmtR(wallet?.totalWithdrawn),   color: "#f59e0b", bg: "#fef9c3",
            icon: <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 19l7-7-7-7"/></svg> },
        ].map((w, i) => (
          <div key={i} className="sdb-wallet-card">
            <div className="sdb-wallet-card__icon" style={{ background: w.bg }}>{w.icon}</div>
            <div>
              <p className="sdb-wallet-card__lbl">{w.label}</p>
              {wLoading ? <div className="sdb-skel sdb-skel--md" /> : <p className="sdb-wallet-card__val" style={{ color: w.color }}>{w.val}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Transactions ── */}
      <div className="sdb-toolbar" style={{ marginTop: 4 }}>
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Transaction History</div>
      </div>
      <div className="sdb-trx-wrap">
        <div className="sdb-trx-header">
          <span className="sdb-trx-title">Wallet Transactions</span>
          <span className="sdb-trx-count">{trxList.length} total</span>
        </div>
        {wLoading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3].map(i => <div key={i} className="sdb-skel sdb-skel--md" style={{ marginBottom: 10 }} />)}
          </div>
        ) : trxList.length === 0 ? (
          <div className="sdb-trx-empty">No transactions yet</div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table className="sdb-trx">
                <thead>
                  <tr>
                    <th>Type</th><th>Amount</th><th>Status</th><th>Note</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTrx.map((trx, i) => <TrxRow key={trx?._id || i} trx={trx} />)}
                </tbody>
              </table>
            </div>
            {trxList.length > 5 && (
              <div className="sdb-showall">
                <button onClick={() => setShowAllTrx(p => !p)}>
                  {showAllTrx ? "Show less ↑" : `Show all ${trxList.length} transactions ↓`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Products Table ── */}
      <div className="sdb-toolbar">
        <div className="sdb-section-lbl" style={{ flex: 1 }}>Your Products</div>
      </div>
      <Products />
    </>
  );
};

const Dashboard = () => {
  const [isOpenOrderdProduct, setIsOpenOrderdProduct] = useState(null);
  const [page,               setPage]               = useState(0);
  const [rowsPerPage,        setRowsPerPage]         = useState(50);
  const [chartData,          setChartData]           = useState([]);
  const [productData,        setProductData]         = useState([]);
  const [productTotalData,   setProductTotalData]    = useState([]);
  const [ordersData,         setOrdersData]          = useState([]);
  const [orders,             setOrders]              = useState([]);
  const [pageOrder,          setPageOrder]           = useState(1);
  const [orderSearchQuery,   setOrderSearchQuery]    = useState("");
  const [totalOrdersData,    setTotalOrdersData]     = useState([]);
  const [users,              setUsers]               = useState([]);
  const [allReviews,         setAllReviews]          = useState([]);
  const [ordersCount,        setOrdersCount]         = useState(null);
  const [orderStats,         setOrderStats]          = useState({
    total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0, shipped: 0
  });

  const context        = useContext(MyContext);
  const isSellerPanel  = context?.userData?.role === "SELLER";

  useEffect(() => {
    context?.setProgress(30);
    getProducts(page, rowsPerPage);
  }, [isSellerPanel]);

  useEffect(() => {
    if (isSellerPanel) return;
    fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
      if (res?.error === false) setOrdersData(res?.data);
    });
    fetchDataFromApi(`/api/order/order-list`).then((res) => {
      if (res?.error === false) setTotalOrdersData(res);
    });
    fetchDataFromApi(`/api/order/count`).then((res) => {
      if (res?.error === false) setOrdersCount(res?.count);
    });
    // Fetch order status counts
    fetchDataFromApi(`/api/order/status-count`).then((res) => {
      if (res?.error === false || res?.success) {
        setOrderStats({
          total:     res?.total     || res?.count?.total     || 0,
          pending:   res?.pending   || res?.count?.pending   || 0,
          confirmed: res?.confirmed || res?.count?.confirmed || 0,
          delivered: res?.delivered || res?.count?.delivered || 0,
          cancelled: res?.cancelled || res?.count?.cancelled || 0,
          shipped:   res?.shipped   || res?.count?.shipped   || 0,
        });
      }
    });
  }, [pageOrder, isSellerPanel]);

  useEffect(() => {
    if (isSellerPanel) return;
    if (orderSearchQuery !== "") {
      const filteredOrders = totalOrdersData?.data?.filter((order) =>
        order._id?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.userId?.email?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
        order?.createdAt?.includes(orderSearchQuery)
      );
      setOrdersData(filteredOrders);
    } else {
      fetchDataFromApi(`/api/order/order-list?page=${pageOrder}&limit=5`).then((res) => {
        if (res?.error === false) { setOrders(res); setOrdersData(res?.data); }
      });
    }
  }, [orderSearchQuery, isSellerPanel]);

  useEffect(() => {
    if (isSellerPanel) return;
    getTotalSalesByYear();
    fetchDataFromApi("/api/user/getAllUsers").then((res) => {
      if (res?.error === false) setUsers(res?.users);
    });
    fetchDataFromApi("/api/user/getAllReviews").then((res) => {
      if (res?.error === false) setAllReviews(res?.reviews);
    });
  }, []);

  const getProducts = async (p, limit) => {
    fetchDataFromApi(`/api/product/getAllProducts?page=${p + 1}&limit=${limit}`).then((res) => {
      setProductData(res);
      setProductTotalData(res);
      context?.setProgress(100);
    });
  };

  const getTotalUsersByYear = () => {
    fetchDataFromApi(`/api/order/users`).then((res) => {
      const users = (res?.TotalUsers || []).map((item) => ({
        name: item?.name, TotalUsers: parseInt(item?.TotalUsers),
      }));
      setChartData(users.filter((obj, i, self) => i === self.findIndex((t) => t.name === obj.name)));
    });
  };

  const getTotalSalesByYear = () => {
    fetchDataFromApi(`/api/order/sales`).then((res) => {
      const sales = (res?.monthlySales || []).map((item) => ({
        name: item?.name, TotalSales: parseInt(item?.TotalSales),
      }));
      setChartData(sales.filter((obj, i, self) => i === self.findIndex((t) => t.name === obj.name)));
    });
  };

  const isShowOrderdProduct = (index) =>
    setIsOpenOrderdProduct(isOpenOrderdProduct === index ? null : index);

  // ── Compute order stats from totalOrdersData as fallback ──────────────────
  const allOrders     = totalOrdersData?.data || [];
  const totalRevenue  = allOrders.reduce((s, o) => s + (Number(o?.totalAmt) || 0), 0);
  const pendingCount  = orderStats.pending  || allOrders.filter(o => o?.order_status?.toLowerCase() === "pending").length;
  const confirmedCount= orderStats.confirmed|| allOrders.filter(o => o?.order_status?.toLowerCase() === "confirmed").length;
  const deliveredCount= orderStats.delivered|| allOrders.filter(o => o?.order_status?.toLowerCase() === "delivered").length;
  const totalProducts = productData?.products?.length || productData?.totalProducts || 0;

  // ─── SELLER PANEL ─────────────────────────────────────────────────────────
  if (isSellerPanel) {
    return <SellerDashboard context={context} />;
  }

  // ─── ADMIN PANEL ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Hero banner ── */}
      <div className="dash-hero">
        <div className="dash-hero__content">
          <p className="dash-hero__eyebrow">Admin Dashboard</p>
          <h1 className="dash-hero__name">{context?.userData?.name} 👋</h1>
          <p className="dash-hero__sub">Here's what's happening in your store today.</p>
          <Button
            className="dash-hero__btn !capitalize"
            onClick={() => { if(context && context.setIsOpenFullScreenPanel) context.setIsOpenFullScreenPanel({ open: true, model: "Add Product" }); }}
          >
            <FaPlus style={{ marginRight: 6 }} /> Add Product
          </Button>
        </div>
        <img src="/shop-illustration.webp" className="dash-hero__img" alt="" />
      </div>

      {/* ══ STATS GRID ══════════════════════════════════════════════════════ */}
      <div className="stats-grid">

        {/* Total Products */}
        <StatCard
          icon={<IconBox />}
          label="Total Products"
          value={totalProducts?.toLocaleString("en-IN")}
          accent="#6366f1"
          trend={4.2}
          trendLabel="vs last month"
          delay={0}
        />

        {/* Total Orders */}
        <StatCard
          icon={<IconOrders />}
          label="Total Orders"
          value={(ordersCount || orderStats.total || allOrders.length)?.toLocaleString("en-IN")}
          accent="#0ea5e9"
          trend={8.1}
          trendLabel="vs last month"
          delay={60}
        />

        {/* Pending Orders */}
        <StatCard
          icon={<IconPending />}
          label="Pending Orders"
          value={pendingCount?.toLocaleString("en-IN")}
          accent="#f59e0b"
          trendLabel="Awaiting action"
          delay={120}
        />

        {/* Confirmed Orders */}
        <StatCard
          icon={<IconConfirm />}
          label="Confirmed"
          value={confirmedCount?.toLocaleString("en-IN")}
          accent="#10b981"
          trendLabel="Ready to ship"
          delay={180}
        />

        {/* Delivered Orders */}
        <StatCard
          icon={<IconDelivery />}
          label="Delivered"
          value={deliveredCount?.toLocaleString("en-IN")}
          accent="#3b82f6"
          trend={12.5}
          trendLabel="vs last month"
          delay={240}
        />

        {/* Total Users */}
        <StatCard
          icon={<IconUsers />}
          label="Total Users"
          value={users?.length?.toLocaleString("en-IN")}
          accent="#8b5cf6"
          trend={3.7}
          trendLabel="New signups"
          delay={300}
        />

        {/* Reviews */}
        <StatCard
          icon={<IconReviews />}
          label="Reviews"
          value={allReviews?.length?.toLocaleString("en-IN")}
          accent="#ec4899"
          trendLabel="Customer ratings"
          delay={360}
        />

        {/* Revenue */}
        <StatCard
          icon={<IconRevenue />}
          label="Total Revenue"
          value={totalRevenue > 0 ? `₹${(totalRevenue / 1000).toFixed(1)}K` : "—"}
          accent="#14b8a6"
          trend={6.4}
          trendLabel="Gross sales"
          delay={420}
        />

        {/* Categories */}
        <StatCard
          icon={<IconCategory />}
          label="Categories"
          value={context?.catData?.length?.toLocaleString("en-IN")}
          accent="#f97316"
          trendLabel="Active categories"
          delay={480}
        />

      </div>

      {/* ══ PRODUCTS TABLE ══════════════════════════════════════════════════ */}
      <Products />

      {/* ══ RECENT ORDERS ═══════════════════════════════════════════════════ */}
      <div className="dash-card" style={{ marginTop: 20 }}>
        <div className="dash-card__header">
          <div>
            <h2 className="dash-card__title">Recent Orders</h2>
            <p className="dash-card__sub">Latest {ordersData?.length || 0} orders from your store</p>
          </div>
          <div className="dash-card__search">
            <SearchBox
              searchQuery={orderSearchQuery}
              setSearchQuery={setOrderSearchQuery}
              setPageOrder={setPageOrder}
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th></th>
                <th>Order ID</th>
                <th>Payment</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Pincode</th>
                <th>Amount</th>
                <th>Email</th>
                <th>User ID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ordersData?.length > 0 && ordersData.map((order, index) => (
                <>
                  <tr key={order._id} className="dash-table__row">
                    <td>
                      <button className="dash-expand-btn" onClick={() => isShowOrderdProduct(index)}>
                        {isOpenOrderdProduct === index
                          ? <FaAngleUp className="text-[14px]" />
                          : <FaAngleDown className="text-[14px]" />}
                      </button>
                    </td>
                    <td>
                      <span className="dash-table__id">#{order?._id?.slice(-8)}</span>
                    </td>
                    <td>
                      <span className="dash-table__payment">
                        {order?.paymentId ? order?.paymentId?.slice(0, 14) + "…" : (
                          <span className="dash-table__cod">COD</span>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap font-[600] text-[#0f172a]">{order?.userId?.name}</td>
                    <td className="whitespace-nowrap">{order?.delivery_address?.mobile}</td>
                    <td>
                      <div className="dash-table__address">
                        <span className="dash-table__addr-type">{order?.delivery_address?.addressType}</span>
                        <span className="dash-table__addr-text">
                          {[
                            order?.delivery_address?.address_line1,
                            order?.delivery_address?.city,
                            order?.delivery_address?.state,
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{order?.delivery_address?.pincode}</td>
                    <td>
                      <span className="dash-table__amt">
                        ₹{Number(order?.totalAmt || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="text-[12px] text-[#64748b]">{order?.userId?.email}</td>
                    <td>
                      <span className="dash-table__uid">{order?.userId?._id?.slice(-8)}</span>
                    </td>
                    <td><StatusPill status={order?.order_status} /></td>
                    <td className="whitespace-nowrap text-[12px] text-[#64748b]">
                      {order?.createdAt?.split("T")[0]}
                    </td>
                  </tr>

                  {isOpenOrderdProduct === index && (
                    <tr key={`expand-${order._id}`} className="dash-table__expand">
                      <td colSpan="12">
                        <div className="dash-expand-wrap">
                          <p className="dash-expand-title">
                            📦 Order Items — {order?.products?.length} product{order?.products?.length !== 1 ? "s" : ""}
                          </p>
                          <table className="dash-inner-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>Image</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order?.products?.map((item, i) => (
                                <tr key={i}>
                                  <td>
                                    <div className="dash-inner-table__name">{item?.productTitle}</div>
                                    <div className="dash-inner-table__id">{item?._id}</div>
                                  </td>
                                  <td>
                                    <img src={item?.image} alt={item?.productTitle}
                                      className="w-[42px] h-[42px] rounded-lg object-cover border border-[#e2e8f0]" />
                                  </td>
                                  <td className="font-[700] text-[#0f172a]">{item?.quantity}</td>
                                  <td>{item?.price?.toLocaleString("en-US", { style: "currency", currency: "INR" })}</td>
                                  <td className="font-[700] text-[#16a34a]">
                                    {(item?.price * item?.quantity)?.toLocaleString("en-US", { style: "currency", currency: "INR" })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          {(!ordersData || ordersData.length === 0) && (
            <div className="dash-empty">No orders found</div>
          )}
        </div>

        {orders?.totalPages > 1 && (
          <div className="flex items-center justify-center py-5">
            <Pagination
              showFirstButton showLastButton
              count={orders?.totalPages}
              page={pageOrder}
              onChange={(e, value) => setPageOrder(value)}
            />
          </div>
        )}
      </div>

      {/* ══ CHART ═══════════════════════════════════════════════════════════ */}
      <div className="dash-card" style={{ marginTop: 20, marginBottom: 20 }}>
        <div className="dash-card__header" style={{ paddingBottom: 4 }}>
          <div>
            <h2 className="dash-card__title">Analytics</h2>
            <p className="dash-card__sub">Monthly trends for users & sales</p>
          </div>
          <div className="flex gap-3">
            <button className="dash-chart-toggle" onClick={getTotalUsersByYear}>
              <span className="dash-chart-dot" style={{ background: "#6366f1" }} />
              Total Users
            </button>
            <button className="dash-chart-toggle" onClick={getTotalSalesByYear}>
              <span className="dash-chart-dot" style={{ background: "#10b981" }} />
              Total Sales
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 overflow-x-auto">
          {chartData?.length > 0 && (
            <BarChart
              width={context?.windowWidth > 920 ? context?.windowWidth - 350 : 800}
              height={320}
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "none", borderRadius: 10, color: "#fff", fontSize: 13 }}
                labelStyle={{ color: "#fbbf24" }}
                itemStyle={{ color: "#a5f3fc" }}
                cursor={{ fill: "rgba(99,102,241,0.05)" }}
              />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <Bar dataKey="TotalSales" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
              <Bar dataKey="TotalUsers" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          )}
          {chartData?.length === 0 && (
            <div className="dash-empty" style={{ height: 200 }}>Click "Total Users" or "Total Sales" to load chart</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;