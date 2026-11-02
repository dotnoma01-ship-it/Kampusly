import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Recycle,
  Search,
  Shirt,
  ShoppingBasket,
  SlidersHorizontal,
  Tag,
  Utensils,
  Users,
  X,
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import "./ServiceCategory.css";

const categories = {
  food: { title: "Food & Meals", subtitle: "Discover meals and connect with food sellers in your campus community.", icon: Utensils, color: "orange", filters: ["All food", "Rice dishes", "Snacks", "Drinks", "Local meals"] },
  laundry: { title: "Laundry Services", subtitle: "Find laundry providers and compare services that fit your needs.", icon: Shirt, color: "blue", filters: ["All laundry", "Washing", "Ironing", "Wash & iron", "Bedding"] },
  groceries: { title: "Groceries", subtitle: "Find everyday essentials and discover offers shared by the community.", icon: ShoppingBasket, color: "green", filters: ["All groceries", "Food staples", "Drinks", "Snacks", "Household"] },
  "school-items": { title: "School Items", subtitle: "Discover learning materials and supplies shared by students.", icon: BookOpen, color: "purple", filters: ["All school items", "Textbooks", "Calculators", "Stationery", "Electronics"] },
  "used-products": { title: "Used Products", subtitle: "Give useful items a second life by buying from or selling to fellow students.", icon: Recycle, color: "lime", filters: ["All used items", "Electronics", "Clothing", "Room essentials", "Books"] },
  "student-requests": { title: "Student Requests", subtitle: "Student requests are not available until a request listing workflow is implemented.", icon: Users, color: "pink", filters: [] },
};

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5001/api").replace(/\/api\/?$/, "");
const formatPrice = (price) => `₦${Number(price || 0).toLocaleString("en-NG")}`;

function ServiceCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const category = categories[categoryId];
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recommended");
  const [listings, setListings] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingIds, setSavingIds] = useState([]);
  const [mine, setMine] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [submittingListing, setSubmittingListing] = useState(false);
  const [listingForm, setListingForm] = useState({ title: "", description: "", price: "", condition: "good", location: "" });

  const loadListings = useCallback(async () => {
    if (!category || categoryId === "student-requests") {
      setListings([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ category: category.title });
      if (mine) query.set("mine", "true");
      const response = savedOnly
        ? await apiRequest("/products/saved")
        : await apiRequest(`/products?${query}`);
      if (!Array.isArray(response.products)) throw new Error("The server returned an invalid listings response.");
      setListings(response.products.filter((product) => product.category === category.title));
    } catch (requestError) {
      setError(requestError.message || "Unable to load listings.");
    } finally {
      setLoading(false);
    }
  }, [category, categoryId, mine, savedOnly]);

  const loadListingsEffect = useEffectEvent(loadListings);

  useEffect(() => {
    Promise.resolve().then(() => loadListingsEffect());
  }, [categoryId, mine, savedOnly]);

  const items = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    let results = listings.filter((item) => {
      const sellerName = item.seller?.name || item.seller?.username || "Kampusly seller";
      const matchesSearch = [item.title, item.description, sellerName].some((value) => value.toLowerCase().includes(search));
      const filterText = activeFilter.replace(/^All\s+/i, "").toLowerCase();
      const matchesFilter = activeFilter === "All" || activeFilter.startsWith("All ") || `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(filterText);
      return matchesSearch && matchesFilter;
    });
    if (sortBy === "price-low") results = [...results].sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") results = [...results].sort((a, b) => b.price - a.price);
    return results;
  }, [listings, searchTerm, activeFilter, sortBy]);

  if (!category) {
    return (
      <div className="service-category-not-found">
        <Package size={42} />
        <h1>Service category not found</h1>
        <p>Choose a category from the Kampusly Services page.</p>
        <button type="button" onClick={() => navigate("/student/services")}>Return to Services</button>
      </div>
    );
  }

  const CategoryIcon = category.icon;

  async function toggleSaved(item) {
    if (savingIds.includes(item._id)) return;
    setSavingIds((current) => [...current, item._id]);
    try {
      const response = await apiRequest(`/products/${item._id}/save`, { method: "POST" });
      setListings((current) => current.map((listing) => listing._id === item._id ? { ...listing, savedByMe: response.saved } : listing));
      setFeedback(response.saved ? "Listing saved." : "Listing removed from saved listings.");
    } catch (requestError) {
      setFeedback(requestError.message || "Could not update the saved listing.");
    } finally {
      setSavingIds((current) => current.filter((id) => id !== item._id));
    }
  }

  async function submitListing(event) {
    event.preventDefault();
    if (submittingListing) return;
    setSubmittingListing(true);
    try {
      const response = await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          ...listingForm,
          price: Number(listingForm.price),
          category: category.title,
        }),
      });
      if (!response.product) throw new Error("The server did not return the saved listing.");
      setMine(true);
      setListings((current) => [response.product, ...current]);
      setListingForm({ title: "", description: "", price: "", condition: "good", location: "" });
      setShowListingForm(false);
      setFeedback("Your listing was published.");
    } catch (requestError) {
      setFeedback(requestError.message || "Listing could not be published.");
    } finally {
      setSubmittingListing(false);
    }
  }

  async function markListingSold(item) {
    try {
      const response = await apiRequest(`/products/${item._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: item.status === "sold" ? "available" : "sold" }),
      });
      setListings((current) => current.map((listing) => listing._id === item._id ? response.product : listing));
      setFeedback(response.message || "Listing status updated.");
    } catch (requestError) {
      setFeedback(requestError.message || "Listing status could not be updated.");
    }
  }

  function createPost() {
    navigate("/student/feed", { state: { serviceCategory: category.title, openCreatePost: true } });
  }

  return (
    <div className="service-category-page">
      <header className="service-category-header">
        <button type="button" className="service-category-back" onClick={() => navigate("/student/services", { state: { from: location.pathname } })} aria-label="Back to services"><ArrowLeft size={20} /></button>
        <button type="button" className="service-category-brand" onClick={() => navigate("/student/dashboard")}>
          <span className="service-category-brand-icon"><BookOpen size={20} /></span>
          <span>kampusly<span className="service-category-brand-dot">.</span></span>
        </button>
        <button type="button" className="service-category-header-profile" onClick={() => navigate("/student/profile")}><Users size={19} /><span>Profile</span></button>
      </header>

      <main className="service-category-main">
        <section className={`service-category-hero category-${category.color}`}>
          <div className="service-category-hero-icon"><CategoryIcon size={30} /></div>
          <span className="service-category-eyebrow">KAMPUSLY SERVICES</span>
          <h1>{category.title}</h1>
          <p>{category.subtitle}</p>
          <div className="service-category-search">
            <Search size={19} />
            <input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Search ${category.title.toLowerCase()}...`} aria-label={`Search ${category.title}`} />
            {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={17} /></button>}
          </div>
        </section>

        {feedback && <div className="service-category-feedback" role="status"><CheckCircle2 size={17} /><span>{feedback}</span><button type="button" onClick={() => setFeedback("")} aria-label="Dismiss message"><X size={16} /></button></div>}

        <section className="service-category-toolbar">
          <div className="service-category-results"><h2>{mine ? "My listings" : savedOnly ? "Saved listings" : "Explore listings"}</h2><p>{loading ? "Loading listings..." : `${items.length} ${items.length === 1 ? "result" : "results"} found`}</p></div>
          <div className="service-category-toolbar-actions">
            <label className="service-category-sort"><SlidersHorizontal size={16} /><span className="service-category-sort-label">Sort:</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort listings"><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
            {categoryId !== "student-requests" && <button type="button" className="service-category-create" onClick={() => { setMine(false); setSavedOnly((value) => !value); }}>{savedOnly ? "Browse all" : "Saved listings"}</button>}
            {categoryId !== "student-requests" && <button type="button" className="service-category-create" onClick={() => { setSavedOnly(false); setMine((value) => !value); }}>{mine ? "Browse all" : "My listings"}</button>}
            {categoryId !== "student-requests" && <button type="button" className="service-category-create" onClick={() => setShowListingForm(true)}><Tag size={17} /><span>Add listing</span></button>}
            <button type="button" className="service-category-create" onClick={createPost}><Tag size={17} /><span>Post</span></button>
          </div>
        </section>

        {category.filters.length > 0 && <section className="service-category-filter-row" aria-label="Category filters">{category.filters.map((filter) => <button key={filter} type="button" className={activeFilter === filter ? "active" : ""} onClick={() => setActiveFilter(filter === activeFilter ? "All" : filter)}>{filter}</button>)}</section>}

        {loading ? (
          <section className="service-category-empty" role="status"><div><Package size={30} /></div><h3>Loading listings</h3><p>Fetching current listings from Kampusly.</p></section>
        ) : error ? (
          <section className="service-category-empty" role="alert"><div><Package size={30} /></div><h3>Listings could not be loaded</h3><p>{error}</p><button type="button" onClick={loadListings}>Try again</button></section>
        ) : items.length > 0 ? (
          <section className="service-category-grid">
            {items.map((item) => {
              const sellerName = item.seller?.name || item.seller?.username || "Kampusly seller";
              return (
                <article className="service-listing-card" key={item._id}>
                  <div className={`service-listing-image category-${category.color}`}>
                    {item.images?.[0] ? <img src={/^https?:\/\//i.test(item.images[0]) ? item.images[0] : `${API_ORIGIN}${item.images[0].startsWith("/") ? "" : "/"}${item.images[0]}`} alt={item.title} loading="lazy" /> : <CategoryIcon size={45} strokeWidth={1.4} />}
                    <button type="button" className={`service-listing-save ${item.savedByMe ? "saved" : ""}`} onClick={() => toggleSaved(item)} disabled={savingIds.includes(item._id)} aria-label={item.savedByMe ? "Unsave listing" : "Save listing"}><Heart size={18} fill={item.savedByMe ? "currentColor" : "none"} /></button>
                  </div>
                  <div className="service-listing-body">
                    <div className="service-listing-price-row"><h3>{item.title}</h3><span className="service-listing-price">{formatPrice(item.price)}</span></div>
                    <p className="service-listing-description">{item.description}</p>
                    <div className="service-listing-seller"><span className="service-listing-avatar">{sellerName.charAt(0).toUpperCase()}</span><span>{sellerName}</span></div>
                    {item.location && <div className="service-listing-location"><MapPin size={14} /><span>{item.location}</span></div>}
                    <div className="service-listing-actions">
                      <button type="button" className="service-listing-details" onClick={() => setSelectedItem(item)}>View details</button>
                      {item.seller?._id && <button type="button" className="service-listing-contact" onClick={() => navigate(`/student/users/${item.seller._id}`)}><MessageCircle size={16} />Profile</button>}
                      {mine && <button type="button" className="service-listing-details" onClick={() => markListingSold(item)}>{item.status === "sold" ? "Relist" : "Mark sold"}</button>}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="service-category-empty">
            <div><Search size={30} /></div>
            <h3>{categoryId === "student-requests" ? "Requests are not available yet" : searchTerm || activeFilter !== "All" ? "No matching listings" : "No listings yet"}</h3>
            <p>{categoryId === "student-requests" ? "There is no persistent student request workflow yet." : searchTerm || activeFilter !== "All" ? "Try another search or choose a different filter." : "No current listings have been published in this category."}</p>
            {(searchTerm || activeFilter !== "All") && <button type="button" onClick={() => { setSearchTerm(""); setActiveFilter("All"); }}>Clear filters</button>}
          </section>
        )}

        <section className="service-category-community">
          <div className="service-category-community-icon"><Tag size={23} /></div>
          <div><h2>Have something to share?</h2><p>Post an item, offer a service, or ask your campus community for help.</p></div>
          <button type="button" onClick={createPost}>Create a post <ArrowRight size={16} /></button>
        </section>
      </main>

      {showListingForm && (
        <div className="service-detail-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !submittingListing) setShowListingForm(false); }}>
          <section className="service-detail-modal service-listing-form-modal" role="dialog" aria-modal="true" aria-labelledby="service-listing-form-title">
            <button type="button" className="service-detail-close" onClick={() => setShowListingForm(false)} aria-label="Close listing form" disabled={submittingListing}><X size={20} /></button>
            <div className={`service-detail-icon category-${category.color}`}><CategoryIcon size={34} /></div>
            <h2 id="service-listing-form-title">Add {category.title.toLowerCase()} listing</h2>
            <form onSubmit={submitListing} className="service-listing-form">
              <label>Title<input required minLength={3} maxLength={120} value={listingForm.title} onChange={(event) => setListingForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label>Description<textarea required maxLength={3000} rows={4} value={listingForm.description} onChange={(event) => setListingForm((current) => ({ ...current, description: event.target.value }))} /></label>
              <div className="service-listing-form-row">
                <label>Price (NGN)<input required type="number" min="1" max="1000000000" step="1" value={listingForm.price} onChange={(event) => setListingForm((current) => ({ ...current, price: event.target.value }))} /></label>
                <label>Condition<select value={listingForm.condition} onChange={(event) => setListingForm((current) => ({ ...current, condition: event.target.value }))}><option value="like-new">Like new</option><option value="good">Good</option><option value="fair">Fair</option><option value="well-used">Well used</option></select></label>
              </div>
              <label>Campus location (optional)<input maxLength={120} value={listingForm.location} onChange={(event) => setListingForm((current) => ({ ...current, location: event.target.value }))} /></label>
              <div className="service-listing-form-actions"><button type="button" onClick={() => setShowListingForm(false)} disabled={submittingListing}>Cancel</button><button type="submit" disabled={submittingListing}>{submittingListing ? "Publishing..." : "Publish listing"}</button></div>
            </form>
          </section>
        </div>
      )}

      {selectedItem && (
        <div className="service-detail-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedItem(null); }}>
          <section className="service-detail-modal" role="dialog" aria-modal="true" aria-labelledby="service-detail-title">
            <button type="button" className="service-detail-close" onClick={() => setSelectedItem(null)} aria-label="Close details"><X size={20} /></button>
            <div className={`service-detail-icon category-${category.color}`}><CategoryIcon size={34} /></div>
            <h2 id="service-detail-title">{selectedItem.title}</h2>
            <p className="service-detail-description">{selectedItem.description}</p>
            <p className="service-detail-price">{formatPrice(selectedItem.price)}</p>
            <div className="service-detail-info"><span>Posted by</span><strong>{selectedItem.seller?.name || selectedItem.seller?.username || "Kampusly seller"}</strong></div>
            <div className="service-detail-info"><span>Location</span><strong>{selectedItem.location || "Not provided"}</strong></div>
            <button type="button" className="service-detail-contact" onClick={() => { setSelectedItem(null); if (selectedItem.seller?._id) navigate(`/student/users/${selectedItem.seller._id}`); }}><MessageCircle size={17} />View seller profile</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default ServiceCategory;
