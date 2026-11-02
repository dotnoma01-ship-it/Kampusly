import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../StudentSidebar";
import {
ArrowLeft,
ArrowRight,
Search,
Utensils,
Shirt,
ShoppingBasket,
BookOpen,
Recycle,
Users,
Package,
Sparkles,
ShoppingBag,
Clock,
} from "lucide-react";
import "./Services.css";

const serviceCategories = [
{
id: "food",
title: "Food & Meals",
description: "Discover meals and support campus food vendors.",
icon: Utensils,
color: "orange",
route: "/student/services/food",
tag: "Food & Meals",
},
{
id: "laundry",
title: "Laundry",
description: "Find students and vendors offering laundry services.",
icon: Shirt,
color: "blue",
route: "/student/services/laundry",
tag: "Laundry",
},
{
id: "groceries",
title: "Groceries",
description: "Find everyday essentials and grocery offers.",
icon: ShoppingBasket,
color: "green",
route: "/student/services/groceries",
tag: "Groceries",
},
{
id: "school-items",
title: "School Items",
description: "Discover textbooks, calculators, and school supplies.",
icon: BookOpen,
color: "purple",
route: "/student/services/school-items",
tag: "School Items",
},
{
id: "used-products",
title: "Used Products",
description:
"Buy and resell useful items within the student community.",
icon: Recycle,
color: "lime",
route: "/student/services/used-products",
tag: "Used Products",
},
{
id: "student-requests",
title: "Student Requests",
description:
"See what other students need and find ways to help.",
icon: Users,
color: "pink",
route: "/student/services/student-requests",
tag: "Student Requests",
},
];

function Services() {
const navigate = useNavigate();
const [searchTerm, setSearchTerm] = useState("");

const filteredServices = serviceCategories.filter((service) => {
const search = searchTerm.trim().toLowerCase();


return (
  service.title.toLowerCase().includes(search) ||
  service.description.toLowerCase().includes(search)
);


});

const openService = (service) => {
navigate(service.route);
};

return ( <div className="kampusly-services-page"> <header className="services-topbar">
<button
type="button"
className="services-back-button"
onClick={() => navigate(-1)}
aria-label="Go back"
> <ArrowLeft size={20} /> </button>


    <div className="services-brand">
      <div className="services-brand-icon">
        <GraduationCapIcon />
      </div>

      <span>
        kampusly<span className="services-brand-dot">.</span>
      </span>
    </div>

    <button
      type="button"
      className="services-profile-button"
      onClick={() => navigate("/student/profile")}
      aria-label="Open profile"
    >
      <Users size={19} />
    </button>
  </header>

  <main className="services-main">
    <section className="services-hero">
      <div className="services-hero-content">
        <span className="services-eyebrow">
          <Sparkles size={14} />
          YOUR CAMPUS, CONNECTED
        </span>

        <h1>
          What do you <span>need today?</span>
        </h1>

        <p>
          Find useful services, discover affordable items, and help
          fellow students get what they need.
        </p>

        <div className="services-search">
          <Search size={20} />

          <input
            type="search"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search services"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="services-hero-decoration" aria-hidden="true">
        <div className="services-decoration-circle">
          <ShoppingBag size={48} />
        </div>

        <span className="services-decoration-sparkle sparkle-one">
          âœ¦
        </span>

        <span className="services-decoration-sparkle sparkle-two">
          âœ¦
        </span>
      </div>
    </section>

    <section className="services-section">
      <div className="services-section-heading">
        <div>
          <span className="services-section-label">
            EXPLORE KAMPUSLY
          </span>

          <h2>Services for you</h2>

          <p>Everything you need, in one student community.</p>
        </div>

        <span className="services-count">
          {filteredServices.length}{" "}
          {filteredServices.length === 1 ? "service" : "services"}
        </span>
      </div>

      {filteredServices.length > 0 ? (
        <div className="services-grid">
          {filteredServices.map((service) => {
            const Icon = service.icon;

            return (
              <button
                type="button"
                className="service-card"
                key={service.id}
                onClick={() => openService(service)}
                aria-label={`Explore ${service.title}`}
              >
                <div
                  className={`service-card-icon service-icon-${service.color}`}
                >
                  <Icon size={25} strokeWidth={1.9} />
                </div>

                <div className="service-card-content">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>

                <span className="service-card-arrow">
                  <ArrowRight size={18} />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="services-empty-state">
          <Search size={30} />

          <h3>No services found</h3>

          <p>Try another search term.</p>

          <button
            type="button"
            onClick={() => setSearchTerm("")}
          >
            Clear search
          </button>
        </div>
      )}
    </section>

    <section className="services-community-banner">
      <div className="services-community-icon">
        <Package size={25} />
      </div>

      <div className="services-community-copy">
        <span>MAKE A DIFFERENCE</span>

        <h2>Have something another student needs?</h2>

        <p>
          List an item, share a service, or create a post to connect
          with your campus community.
        </p>
      </div>

      <button
        type="button"
        className="services-create-button"
        onClick={() =>
          navigate("/student/feed", {
            state: { openCreatePost: true },
          })
        }
      >
        Create a post
        <ArrowRight size={17} />
      </button>
    </section>

    <div className="services-note">
      <Clock size={16} />

      <p>
        Kampusly helps students connect, share resources, and support
        one another.
      </p>
    </div>
  </main>
</div>


);
}

function GraduationCapIcon() {
return <BookOpen size={21} strokeWidth={2.3} />;
}

export default Services;

