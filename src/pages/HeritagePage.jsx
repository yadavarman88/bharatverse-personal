import React, { useEffect, useState } from "react";
import { Star, Filter } from "lucide-react";
import heritageData from "../data/heritage.json";

// ✅ Import your local images
import tajMahal from "../assets/tajmahal.jpg";
import qutubMinar from "../assets/qutubminar.jpeg";
import hampi from "../assets/hampi.jpg";
import konark from "../assets/konark.webp";
import ajanta from "../assets/ajanta.jpeg";
import ellora from "../assets/ellora.jpeg";
import khajuraho from "../assets/khajuraho.jpeg";
import redFort from "../assets/redfort.jpg";
import sanchi from "../assets/sanchi.jpg";
import charminar from "../assets/charminar.jpeg";

// ✅ Map JSON imageKey → actual image import
const imageMap = {
  tajMahal,
  qutubMinar,
  hampi,
  konark,
  ajanta,
  ellora,
  khajuraho,
  redFort,
  sanchi,
  charminar,
};

const HeritagePage = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [stateFilter, setStateFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");

  // Load and enrich data
  useEffect(() => {
    const enrichedData = heritageData.map((site) => ({
      ...site,
      images: [
        imageMap[site.imageKey] || "https://via.placeholder.com/400x300",
      ],
    }));
    setSites(enrichedData);
    setFilteredSites(enrichedData);
  }, []);

  // Get unique states for filter dropdown
  const states = ["All", ...new Set(heritageData.map((s) => s.state))];

  // Handle filtering
  useEffect(() => {
    let results = [...sites];

    if (stateFilter !== "All") {
      results = results.filter((s) => s.state === stateFilter);
    }

    if (ratingFilter !== "All") {
      results = results.filter((s) => s.rating >= parseFloat(ratingFilter));
    }

    setFilteredSites(results);
  }, [stateFilter, ratingFilter, sites]);

  return (
    <main className="container mx-auto px-4 py-24" role="main">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-heritage font-bold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          Heritage of India
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg">
          Discover the timeless monuments and cultural treasures of India that
          showcase its glorious history and traditions.
        </p>
      </header>

      {/* Filters */}
      <div className="bg-saffron-50 p-4 rounded-xl shadow-md mb-10 flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-saffron-600" />
          <span className="font-semibold text-saffron-700">Filters:</span>
        </div>

        {/* State Filter */}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-400"
        >
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-saffron-400"
        >
          <option value="All">All Ratings</option>
          <option value="4.5">4.5 & above</option>
          <option value="4.7">4.7 & above</option>
          <option value="4.9">4.9 only</option>
        </select>
      </div>

      {/* Sites Grid */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        aria-label="List of heritage sites"
      >
        {filteredSites.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 font-semibold py-10">
            No heritage sites match your filters.
          </div>
        ) : (
          filteredSites.map((site) => (
            <article
              key={site.id}
              className="heritage-card bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={site.images[0]}
                  alt={site.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-saffron-700 bg-saffron-100 px-3 py-1 rounded-full">
                    {site.state}
                  </span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">
                      {site.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {site.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {site.description}
                </p>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default HeritagePage;
