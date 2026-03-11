import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { MyContext } from "../../App";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { BsStarFill, BsStarHalf, BsStar, BsThreeDotsVertical } from "react-icons/bs";
import { MdOutlineSort, MdOutlineFilterList, MdOutlineRateReview } from "react-icons/md";
import { FiSearch, FiTrash2, FiRefreshCw, FiX } from "react-icons/fi";
import { IoStarSharp } from "react-icons/io5";

// ── Star Row ──────────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 13 }) => {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i}>
          {r >= i ? (
            <BsStarFill size={size} className="text-amber-400" />
          ) : r >= i - 0.5 ? (
            <BsStarHalf size={size} className="text-amber-400" />
          ) : (
            <BsStar size={size} className="text-gray-200" />
          )}
        </span>
      ))}
    </div>
  );
};

// ── Rating Bar ────────────────────────────────────────────────────────────────
const RatingBar = ({ star, count, total, onClick, active }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 text-xs rounded-lg px-2 py-1 transition-all ${
        active ? "bg-amber-50 ring-1 ring-amber-200" : "hover:bg-gray-50"
      }`}
    >
      <span className="w-3 text-right text-gray-500 font-semibold flex-shrink-0">{star}</span>
      <IoStarSharp size={10} className="text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-gray-500 font-semibold flex-shrink-0">{count}</span>
    </button>
  );
};

// ── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review, isAdmin, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const text     = review.review || "";
  const isLong   = text.length > 200;
  const dispText = isLong && !expanded ? text.slice(0, 200) + "…" : text;
  const rating   = Number(review.rating) || 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm hover:border-gray-200 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {review.image ? (
              <img src={review.image} alt={review.userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2874f0] to-blue-300 text-white flex items-center justify-center text-sm font-bold">
                {review.userName?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-800">{review.userName || "Anonymous"}</span>
              <span className="text-[11px] text-gray-400">
                {review.createdAt
                  ? new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mb-2">
              <StarRow rating={rating} size={12} />
              <span className="text-xs font-bold text-gray-600">{rating}.0</span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed break-words">
              {dispText}
              {isLong && (
                <button onClick={() => setExpanded(!expanded)}
                  className="ml-1.5 text-[#2874f0] text-xs font-medium hover:underline">
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </p>

            {review.productId && (
              <p className="mt-2 text-[11px] text-gray-400">
                Product: <span className="font-mono text-gray-500 bg-gray-50 px-1 rounded">{review.productId}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border
            ${rating >= 4 ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : rating === 3 ? "bg-amber-50 text-amber-600 border-amber-200"
              : "bg-red-50 text-red-500 border-red-200"}`}>
            <IoStarSharp size={9} /> {rating}.0
          </span>

          {isAdmin && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                <BsThreeDotsVertical size={14} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-20 w-36 py-1 overflow-hidden">
                  <button onClick={() => { onDelete(review._id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 text-sm">
                    <FiTrash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded w-32" />
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
const ReviewsPage = () => {
  const context  = useContext(MyContext);
  const isAdmin  = context?.userData?.role === "ADMIN";

  const [reviews,    setReviews]    = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Server-side pagination state
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PER_PAGE = 8;

  // Stats from server (not computed client-side)
  const [totalAll,  setTotalAll]  = useState(0);
  const [avgRating, setAvgRating] = useState("0.0");
  const [breakdown, setBreakdown] = useState({ 1:0, 2:0, 3:0, 4:0, 5:0 });

  // Filters
  const [search,       setSearch]       = useState("");
  const [filterRating, setFilterRating] = useState("ALL");
  const [sortBy,       setSortBy]       = useState("NEWEST");

  const searchTimer = useRef(null);

  // ── Build query string ──────────────────────────────────────────────────
  const buildQuery = useCallback((p = 1) => {
    const params = new URLSearchParams({
      page:  String(p),
      limit: String(PER_PAGE),
      sort:  sortBy,
    });
    if (search.trim())          params.set("search", search.trim());
    if (filterRating !== "ALL") params.set("rating", filterRating);
    return params.toString();
  }, [search, filterRating, sortBy]);

  // ── Fetch from DB ───────────────────────────────────────────────────────
  const fetchReviews = useCallback((p = 1, silent = false) => {
    if (silent) setIsFetching(true);
    else        setIsLoading(true);

    const endpoint = isAdmin
      ? `/api/reviews?${buildQuery(p)}`
      : `/api/reviews/seller?${buildQuery(p)}`;

    fetchDataFromApi(endpoint)
      .then((res) => {
        if (Array.isArray(res)) {
          // Fallback: API returned plain array (no pagination)
          setReviews(res);
          setTotalCount(res.length);
          setTotalPages(1);
          setTotalAll(res.length);
          const bd = { 1:0, 2:0, 3:0, 4:0, 5:0 };
          res.forEach(r => { const n = Math.round(Number(r.rating)); if (n>=1&&n<=5) bd[n]++; });
          setBreakdown(bd);
          const avg = res.length
            ? (res.reduce((s, r) => s + (Number(r.rating) || 0), 0) / res.length).toFixed(1)
            : "0.0";
          setAvgRating(avg);
        } else {
          // Paginated response from our route
          setReviews(res?.reviews   || []);
          setTotalCount(res?.total      ?? 0);
          setTotalPages(res?.totalPages ?? 1);
          setTotalAll(  res?.totalAll   ?? res?.total ?? 0);
          if (res?.avgRating !== undefined) setAvgRating(String(res.avgRating));
          if (res?.breakdown)               setBreakdown(res.breakdown);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => { setIsLoading(false); setIsFetching(false); });
  }, [isAdmin, buildQuery]);

  // Re-fetch on filter/sort change (debounce search)
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchReviews(1);
    }, search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [search, filterRating, sortBy, isAdmin]);

  // Page change → DB fetch
  const handlePageChange = (newPage) => {
    if (newPage === page || newPage < 1 || newPage > totalPages || isFetching) return;
    setPage(newPage);
    fetchReviews(newPage, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this review permanently?")) return;
    deleteData(`/api/reviews/${id}`).then((res) => {
      if (res?.success !== false) {
        context?.openAlertBox?.("success", "Review deleted");
        fetchReviews(page, true);
      }
    });
  };

  const setRatingFilter = (r) => { setFilterRating(prev => prev === r ? "ALL" : r); };
  const clearFilters    = () => { setSearch(""); setFilterRating("ALL"); setSortBy("NEWEST"); };
  const hasFilters      = search || filterRating !== "ALL" || sortBy !== "NEWEST";

  // Normalise breakdown keys (backend may send string or number keys)
  const bd = (star) => breakdown[star] ?? breakdown[String(star)] ?? 0;

  return (
    <section className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MdOutlineRateReview size={22} className="text-[#2874f0]" />
            {isAdmin ? "All Reviews" : "My Product Reviews"}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalAll} review{totalAll !== 1 ? "s" : ""} in database
          </p>
        </div>
        <button onClick={() => fetchReviews(page, true)} disabled={isFetching || isLoading}
          className="flex items-center gap-1.5 text-sm text-[#2874f0] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl font-medium transition-all disabled:opacity-60">
          <FiRefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="text-center min-w-[72px]">
            <p className="text-4xl font-black text-gray-900">{avgRating}</p>
            <StarRow rating={Number(avgRating)} size={15} />
            <p className="text-[11px] text-gray-400 mt-1">{totalAll} total</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((s) => (
              <RatingBar key={s} star={s} count={bd(s)} total={totalAll}
                active={filterRating === String(s)}
                onClick={() => setRatingFilter(String(s))} />
            ))}
          </div>
        </div>

        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: totalAll,          color: "text-gray-800",    bg: "bg-gray-50"    },
            { label: "5 Star",   value: bd(5),             color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "3–4 Star", value: bd(3) + bd(4),     color: "text-amber-600",   bg: "bg-amber-50"   },
            { label: "1–2 Star", value: bd(1) + bd(2),     color: "text-red-500",     bg: "bg-red-50"     },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-gray-100`}>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, review, product ID…"
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874f0] focus:border-transparent" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <FiX size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <MdOutlineFilterList size={15} className="text-gray-400 flex-shrink-0" />
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {["ALL", "5", "4", "3", "2", "1"].map((r) => (
              <button key={r} onClick={() => setRatingFilter(r)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 flex items-center gap-0.5 transition-all border-r border-gray-200 last:border-r-0
                  ${filterRating === r ? "bg-amber-400 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                {r === "ALL" ? "All" : <>{r}<IoStarSharp size={8} /></>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <MdOutlineSort size={15} className="text-gray-400" />
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2874f0] text-gray-600 bg-white cursor-pointer">
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="HIGHEST">Highest Rating</option>
            <option value="LOWEST">Lowest Rating</option>
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearFilters}
            className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-all flex items-center gap-1">
            <FiX size={12} /> Clear
          </button>
        )}
      </div>

      {/* Count row */}
      {!isLoading && (
        <p className="text-xs text-gray-400 mb-3 px-1">
          {isFetching ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
              Fetching from database…
            </span>
          ) : totalCount > 0 ? (
            <>
              Showing{" "}
              <span className="font-semibold text-gray-600">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, totalCount)}
              </span>{" "}
              of <span className="font-semibold text-gray-600">{totalCount}</span> results
              {hasFilters && " (filtered)"}
            </>
          ) : null}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <MdOutlineRateReview size={44} className="opacity-20 mb-3" />
          <p className="text-sm font-semibold">No reviews found</p>
          <p className="text-xs mt-1">{hasFilters ? "Try clearing your filters" : "No reviews in database yet"}</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-[#2874f0] hover:underline font-medium">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`space-y-3 transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : ""}`}>
          {reviews.map((review) => (
            <ReviewCard key={review._id} review={review} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
          <p className="text-xs text-gray-400">
            Page <span className="font-semibold text-gray-600">{page}</span> of{" "}
            <span className="font-semibold text-gray-600">{totalPages}</span>
            {" · "}{totalCount} results
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(1)} disabled={page === 1 || isFetching}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all">«</button>
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1 || isFetching}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all">Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`e${idx}`} className="px-1 text-gray-400 text-xs select-none">…</span>
                ) : (
                  <button key={p} onClick={() => handlePageChange(p)} disabled={isFetching}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all disabled:opacity-60
                      ${p === page ? "bg-[#2874f0] text-white shadow-sm" : "border border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                    {p}
                  </button>
                )
              )}

            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages || isFetching}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all">Next</button>
            <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages || isFetching}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-all">»</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ReviewsPage;