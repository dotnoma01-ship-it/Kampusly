import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import StudentSidebar from "../StudentSidebar";
import {
ArrowLeft,
ArrowRight,
Search,
SlidersHorizontal,
Plus,
Heart,
MessageCircle,
MapPin,
Tag,
Package,
Utensils,
Shirt,
ShoppingBasket,
BookOpen,
Recycle,
Users,
X,
CheckCircle2,
Clock,
} from "lucide-react";
import "./ServiceCategory.css";

const categories = {
food: {
title: "Food & Meals",
subtitle: "Discover meals and connect with food sellers in your campus community.",
icon: Utensils,
color: "orange",
unit: "meal",
filters: ["All food", "Rice dishes", "Snacks", "Drinks", "Local meals"],
examples: [
{
id: "food-1",
title: "Jollof Rice & Chicken",
description: "A tasty meal for lunch or dinner.",
price: 2500,
seller: "Campus Kitchen",
location: "Campus area",
badge: "Popular",
},
{
id: "food-2",
title: "Homemade Beans & Plantain",
description: "A filling homemade meal.",
price: 1800,
seller: "Student Food Vendor",
location: "Campus area",
badge: "Fresh",
},
{
id: "food-3",
title: "Small Chops Pack",
description: "Snacks for study breaks and hangouts.",
price: 1500,
seller: "Snack Corner",
location: "Campus area",
badge: "",
},
],
},
laundry: {
title: "Laundry Services",
subtitle: "Find laundry providers and compare services that fit your needs.",
icon: Shirt,
color: "blue",
unit: "service",
filters: ["All laundry", "Washing", "Ironing", "Wash & iron", "Bedding"],
examples: [
{
id: "laundry-1",
title: "Wash & Iron Package",
description: "Laundry care for your everyday clothes.",
price: 2500,
seller: "FreshWear Laundry",
location: "Campus area",
badge: "Popular",
},
{
id: "laundry-2",
title: "Ironing Service",
description: "Get your clothes neatly pressed.",
price: 1000,
seller: "Student Laundry Provider",
location: "Campus area",
badge: "",
},
{
id: "laundry-3",
title: "Bedsheet Washing",
description: "Cleaning service for bedsheets and pillowcases.",
price: 1800,
seller: "CleanCare Services",
location: "Campus area",
badge: "",
},
],
},
groceries: {
title: "Groceries",
subtitle: "Find everyday essentials and discover offers shared by the community.",
icon: ShoppingBasket,
color: "green",
unit: "item",
filters: ["All groceries", "Food staples", "Drinks", "Snacks", "Household"],
examples: [
{
id: "grocery-1",
title: "Rice â€” 1 kg",
description: "A staple for your student kitchen.",
price: 1800,
seller: "Campus Grocery Store",
location: "Campus area",
badge: "",
},
{
id: "grocery-2",
title: "Instant Noodles Pack",
description: "Convenient noodles for quick meals.",
price: 3500,
seller: "Student Essentials",
location: "Campus area",
badge: "Popular",
},
{
id: "grocery-3",
title: "Laundry Detergent",
description: "A household essential for everyday washing.",
price: 1200,
seller: "Everyday Needs",
location: "Campus area",
badge: "",
},
],
},
"school-items": {
title: "School Items",
subtitle: "Discover learning materials and supplies shared by students.",
icon: BookOpen,
color: "purple",
unit: "item",
filters: ["All school items", "Textbooks", "Calculators", "Stationery", "Electronics"],
examples: [
{
id: "school-1",
title: "Scientific Calculator",
description: "A calculator for mathematics and science courses.",
price: 8500,
seller: "Student Reseller",
location: "Campus area",
badge: "Popular",
},
{
id: "school-2",
title: "Used Mathematics Textbook",
description: "A pre-owned textbook in usable condition.",
price: 4000,
seller: "Final-Year Student",
location: "Campus area",
badge: "Used",
},
{
id: "school-3",
title: "Notebook Bundle",
description: "Notebooks for lectures and personal study.",
price: 2500,
seller: "Campus Stationery",
location: "Campus area",
badge: "",
},
],
},
"used-products": {
title: "Used Products",
subtitle: "Give useful items a second life by buying from or selling to fellow students.",
icon: Recycle,
color: "lime",
unit: "item",
filters: ["All used items", "Electronics", "Clothing", "Room essentials", "Books"],
examples: [
{
id: "used-1",
title: "Pre-owned Reading Desk",
description: "A used study desk for a hostel room.",
price: 12000,
seller: "Student Reseller",
location: "Campus area",
badge: "Used",
},
{
id: "used-2",
title: "Second-hand Backpack",
description: "A previously owned backpack ready for reuse.",
price: 4500,
seller: "Campus Student",
location: "Campus area",
badge: "Good deal",
},
{
id: "used-3",
title: "Table Fan",
description: "A pre-owned fan. Check its condition with the seller.",
price: 9000,
seller: "Student Reseller",
location: "Campus area",
badge: "Used",
},
],
},
"student-requests": {
title: "Student Requests",
subtitle: "See what fellow students need and find opportunities to help.",
icon: Users,
color: "pink",
unit: "request",
filters: ["All requests", "School items", "Room essentials", "Food", "Other"],
examples: [
{
id: "request-1",
title: "Looking for a used textbook",
description: "I need an affordable copy for my upcoming course.",
price: null,
seller: "Student Request",
location: "Campus community",
badge: "Looking for",
},
{
id: "request-2",
title: "Need a study desk",
description: "Searching for a second-hand desk in usable condition.",
price: null,
seller: "Student Request",
location: "Campus community",
badge: "Looking for",
},
{
id: "request-3",
title: "Looking for affordable groceries",
description: "Hoping to find budget-friendly essentials nearby.",
price: null,
seller: "Student Request",
location: "Campus community",
badge: "Looking for",
},
],
},
};

const formatPrice = (price) =>
price === null || price === undefined
? null
: `â‚¦${Number(price).toLocaleString("en-NG")}`;

function ServiceCategory() {
const { categoryId } = useParams();
const navigate = useNavigate();
const location = useLocation();

const category = categories[categoryId];

const [searchTerm, setSearchTerm] = useState("");
const [activeFilter, setActiveFilter] = useState("All");
const [sortBy, setSortBy] = useState("recommended");
const [savedItems, setSavedItems] = useState([]);
const [selectedItem, setSelectedItem] = useState(null);
const [feedback, setFeedback] = useState("");

const items = useMemo(() => {
if (!category) return [];


const search = searchTerm.trim().toLowerCase();

let results = category.examples.filter((item) => {
  const matchesSearch =
    item.title.toLowerCase().includes(search) ||
    item.description.toLowerCase().includes(search) ||
    item.seller.toLowerCase().includes(search);

  const matchesFilter =
    activeFilter === "All" ||
    activeFilter === `All ${categoryId.replace("-", " ")}` ||
    item.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
    item.description.toLowerCase().includes(activeFilter.toLowerCase());

  return matchesSearch && matchesFilter;
});

if (sortBy === "price-low") {
  results = [...results].sort(
    (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
  );
}

if (sortBy === "price-high") {
  results = [...results].sort(
    (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity)
  );
}

return results;


}, [category, categoryId, searchTerm, activeFilter, sortBy]);

if (!category) {
return ( <div className="service-category-not-found"> <Package size={42} /> <h1>Service category not found</h1> <p>Choose a category from the Kampusly Services page.</p>
<button type="button" onClick={() => navigate("/student/services")}>
Return to Services </button> </div>
);
}

const CategoryIcon = category.icon;

const toggleSaved = (itemId) => {
setSavedItems((current) =>
current.includes(itemId)
? current.filter((id) => id !== itemId)
: [...current, itemId]
);


setFeedback(
  savedItems.includes(itemId) ? "Removed from saved items." : "Item saved."
);


};

const contactSeller = (item) => {
setFeedback(`Contacting ${item.seller} will be available when messaging is connected.`);
};

const createPost = () => {
navigate("/student/feed", {
state: {
serviceCategory: category.title,
openCreatePost: true,
},
});
};

return ( <div className="service-category-page"> <header className="service-category-header">
<button
type="button"
className="service-category-back"
onClick={() =>
navigate("/student/services", {
state: { from: location.pathname },
})
}
aria-label="Back to services"
> <ArrowLeft size={20} /> </button>


    <button
      type="button"
      className="service-category-brand"
      onClick={() => navigate("/student/dashboard")}
    >
      <span className="service-category-brand-icon">
        <BookOpen size={20} />
      </span>
      <span>kampusly<span className="service-category-brand-dot">.</span></span>
    </button>

    <button
      type="button"
      className="service-category-header-profile"
      onClick={() => navigate("/student/profile")}
    >
      <Users size={19} />
      <span>Profile</span>
    </button>
  </header>

  <main className="service-category-main">
    <section className={`service-category-hero category-${category.color}`}>
      <div className="service-category-hero-icon">
        <CategoryIcon size={30} />
      </div>

      <span className="service-category-eyebrow">KAMPUSLY SERVICES</span>

      <h1>{category.title}</h1>

      <p>{category.subtitle}</p>

      <div className="service-category-search">
        <Search size={19} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={`Search ${category.title.toLowerCase()}...`}
          aria-label={`Search ${category.title}`}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </section>

    {feedback && (
      <div className="service-category-feedback" role="status">
        <CheckCircle2 size={17} />
        <span>{feedback}</span>
        <button
          type="button"
          onClick={() => setFeedback("")}
          aria-label="Dismiss message"
        >
          <X size={16} />
        </button>
      </div>
    )}

    <section className="service-category-toolbar">
      <div className="service-category-results">
        <h2>Explore listings</h2>
        <p>
          {items.length} {items.length === 1 ? "result" : "results"} found
        </p>
      </div>

      <div className="service-category-toolbar-actions">
        <label className="service-category-sort">
          <SlidersHorizontal size={16} />
          <span className="service-category-sort-label">Sort:</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort listings"
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>

        <button
          type="button"
          className="service-category-create"
          onClick={createPost}
        >
          <Plus size={17} />
          <span>Post</span>
        </button>
      </div>
    </section>

    <section className="service-category-filter-row" aria-label="Category filters">
      {category.filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={activeFilter === filter ? "active" : ""}
          onClick={() =>
            setActiveFilter(filter === activeFilter ? "All" : filter)
          }
        >
          {filter}
        </button>
      ))}
    </section>

    {items.length > 0 ? (
      <section className="service-category-grid">
        {items.map((item) => {
          const isSaved = savedItems.includes(item.id);

          return (
            <article className="service-listing-card" key={item.id}>
              <div className={`service-listing-image category-${category.color}`}>
                <CategoryIcon size={45} strokeWidth={1.4} />

                {item.badge && (
                  <span className="service-listing-badge">{item.badge}</span>
                )}

                <button
                  type="button"
                  className={`service-listing-save ${isSaved ? "saved" : ""}`}
                  onClick={() => toggleSaved(item.id)}
                  aria-label={isSaved ? "Unsave listing" : "Save listing"}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="service-listing-body">
                <div className="service-listing-price-row">
                  <h3>{item.title}</h3>
                  {item.price !== null && (
                    <span className="service-listing-price">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                <p className="service-listing-description">
                  {item.description}
                </p>

                <div className="service-listing-seller">
                  <span className="service-listing-avatar">
                    {item.seller.charAt(0).toUpperCase()}
                  </span>
                  <span>{item.seller}</span>
                </div>

                <div className="service-listing-location">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>

                <div className="service-listing-actions">
                  <button
                    type="button"
                    className="service-listing-details"
                    onClick={() => setSelectedItem(item)}
                  >
                    View details
                  </button>

                  <button
                    type="button"
                    className="service-listing-contact"
                    onClick={() => contactSeller(item)}
                  >
                    <MessageCircle size={16} />
                    Contact
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    ) : (
      <section className="service-category-empty">
        <div>
          <Search size={30} />
        </div>
        <h3>No matching listings</h3>
        <p>Try another search or choose a different filter.</p>
        <button
          type="button"
          onClick={() => {
            setSearchTerm("");
            setActiveFilter("All");
          }}
        >
          Clear filters
        </button>
      </section>
    )}

    <section className="service-category-community">
      <div className="service-category-community-icon">
        <Tag size={23} />
      </div>
      <div>
        <h2>Have something to share?</h2>
        <p>
          Post an item, offer a service, or ask your campus community for help.
        </p>
      </div>
      <button type="button" onClick={createPost}>
        Create a post <ArrowRight size={16} />
      </button>
    </section>

    <p className="service-category-demo-note">
      <Clock size={14} />
      These are sample listings for layout testing, not verified live offers.
    </p>
  </main>

  {selectedItem && (
    <div
      className="service-detail-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setSelectedItem(null);
      }}
    >
      <section
        className="service-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-detail-title"
      >
        <button
          type="button"
          className="service-detail-close"
          onClick={() => setSelectedItem(null)}
          aria-label="Close details"
        >
          <X size={20} />
        </button>

        <div className={`service-detail-icon category-${category.color}`}>
          <CategoryIcon size={34} />
        </div>

        {selectedItem.badge && (
          <span className="service-detail-badge">{selectedItem.badge}</span>
        )}

        <h2 id="service-detail-title">{selectedItem.title}</h2>
        <p className="service-detail-description">
          {selectedItem.description}
        </p>

        {selectedItem.price !== null && (
          <p className="service-detail-price">
            {formatPrice(selectedItem.price)}
          </p>
        )}

        <div className="service-detail-info">
          <span>Posted by</span>
          <strong>{selectedItem.seller}</strong>
        </div>

        <div className="service-detail-info">
          <span>Location</span>
          <strong>{selectedItem.location}</strong>
        </div>

        <button
          type="button"
          className="service-detail-contact"
          onClick={() => {
            contactSeller(selectedItem);
            setSelectedItem(null);
          }}
        >
          <MessageCircle size={17} />
          Contact seller
        </button>

        <p className="service-detail-note">
          Seller messaging will be available once connected to the Kampusly backend.
        </p>
      </section>
    </div>
  )}
</div>

);
}

export default ServiceCategory;

