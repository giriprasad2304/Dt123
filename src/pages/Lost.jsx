import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = 'https://dtholcvwoxinthslvryl.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aG9sY3Z3b3hpbnRoc2x2cnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDg2MzAsImV4cCI6MjA1ODIyNDYzMH0.WDaT0GKsIizIxjR2fizvaoCaMGS9ZHmcUwX_aLOWKLQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const LostFoundApp = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  // Filters state for lost items
  const [lostCategory, setLostCategory] = useState('all');
  const [lostDate, setLostDate] = useState('all');
  const [lostSearch, setLostSearch] = useState('');

  // Filters state for found items
  const [foundCategory, setFoundCategory] = useState('all');
  const [foundDate, setFoundDate] = useState('all');
  const [foundSearch, setFoundSearch] = useState('');

  // Modal states
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);

  // Helper to calculate date threshold for filtering
  const getDateThreshold = (filter) => {
    if (filter === 'all') return null;
    const now = new Date();
    let offset;
    switch (filter) {
      case '24h':
        offset = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        offset = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        offset = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        offset = 0;
    }
    const dateThreshold = new Date(now - offset);
    return dateThreshold.toISOString().split('T')[0];
  };

  // Fetch items from Supabase
  const fetchItems = async (type) => {
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    const categoryFilter = type === 'lost' ? lostCategory : foundCategory;
    const dateFilter = type === 'lost' ? lostDate : foundDate;
    const searchInput =
      type === 'lost' ? lostSearch.toLowerCase() : foundSearch.toLowerCase();

    let query = supabase.from(table).select('*');

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    // Apply date filter
    if (dateFilter && dateFilter !== 'all') {
      const threshold = getDateThreshold(dateFilter);
      const dateField = type === 'lost' ? 'date_lost' : 'date_found';
      query = query.gte(dateField, threshold);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return;
    }

    // Apply search filter client-side
    let items = data;
    if (searchInput) {
      items = data.filter(
        (item) =>
          (item.item_name || '').toLowerCase().includes(searchInput) ||
          (item.description || '').toLowerCase().includes(searchInput)
      );
    }
    if (type === 'lost') {
      setLostItems(items);
    } else {
      setFoundItems(items);
    }
  };

  // Fetch items when filters or active section changes
  useEffect(() => {
    if (activeSection === 'lost') {
      fetchItems('lost');
    } else if (activeSection === 'found') {
      fetchItems('found');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeSection,
    lostCategory,
    lostDate,
    lostSearch,
    foundCategory,
    foundDate,
    foundSearch,
  ]);

  // Handlers for form submissions
  const handleLostSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const item = {
      item_name: formData.get('name'),
      category: formData.get('category'),
      date_lost: formData.get('date'),
      location: formData.get('location'),
      description: formData.get('description'),
      contact_email: formData.get('email'),
      image_url: formData.get('image') || null,
      status: 'Lost',
    };
    const { error } = await supabase.from('lost_items').insert([item]);
    if (error) {
      console.error('Error reporting lost item:', error);
      alert('Failed to report item.');
    } else {
      alert('Lost item reported successfully!');
      setShowLostModal(false);
      if (activeSection === 'lost') fetchItems('lost');
      form.reset();
    }
  };

  const handleFoundSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const item = {
      item_name: formData.get('name'),
      category: formData.get('category'),
      date_found: formData.get('date'),
      location: formData.get('location'),
      description: formData.get('description'),
      contact_email: formData.get('email'),
      image_url: formData.get('image') || null,
      status: 'Found',
    };
    const { error } = await supabase.from('found_items').insert([item]);
    if (error) {
      console.error('Error reporting found item:', error);
      alert('Failed to report item.');
    } else {
      alert('Found item reported successfully!');
      setShowFoundModal(false);
      if (activeSection === 'found') fetchItems('found');
      form.reset();
    }
  };

  // Render a list of items for lost or found sections
  const renderItems = (items, type) => {
    return items.map((item) => (
      <div className="item-card bg-white shadow rounded p-4 mb-4" key={item.id}>
        <h3 className="text-xl font-bold mb-2">{item.item_name || 'Unnamed'}</h3>
        <p className="mb-1">Category: <span className="font-medium">{item.category || 'N/A'}</span></p>
        <p className="mb-1">
          Date {type === 'lost' ? 'Lost' : 'Found'}:{' '}
          <span className="font-medium">
            {type === 'lost' ? item.date_lost || 'N/A' : item.date_found || 'N/A'}
          </span>
        </p>
        <p className="mb-1">Location: <span className="font-medium">{item.location || 'N/A'}</span></p>
        <p className="mb-1">Description: {item.description || 'No description'}</p>
        <p className="mb-2">Contact: <span className="font-medium">{item.contact_email || 'N/A'}</span></p>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.item_name || 'Image'}
            className="w-full rounded"
          />
        )}
      </div>
    ));
  };

  return (
    <div className="lost-found-app min-h-screen bg-gray-100 relative">
      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="logo text-2xl font-bold">Lost &amp; Found</div>
        <nav className="flex flex-wrap gap-2">
          <button
            className="nav-item px-3 py-1 rounded hover:bg-blue-500"
            onClick={() => setActiveSection('home')}
          >
            Home
          </button>
          <button
            className="nav-item px-3 py-1 rounded hover:bg-blue-500"
            onClick={() => setActiveSection('lost')}
          >
            Browse Lost Items
          </button>
          <button
            className="nav-item px-3 py-1 rounded hover:bg-blue-500"
            onClick={() => setActiveSection('found')}
          >
            Browse Found Items
          </button>
          <a
            className="nav-item px-3 py-1 rounded hover:bg-blue-500"
            href="/frontend/home/home.html"
          >
            Back To Main Page
          </a>
          <button
            className="nav-item btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400"
            onClick={() => setShowLostModal(true)}
          >
            Report Lost Item
          </button>
          <button
            className="nav-item btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-400"
            onClick={() => setShowFoundModal(true)}
          >
            Report Found Item
          </button>
        </nav>
      </header>

      <main className="px-6 py-8">
        {activeSection === 'home' && (
          <section id="home-section" className="section text-center">
            <h1 className="text-4xl font-bold mb-4">Have you Lost something?</h1>
            <h1 className="text-4xl font-bold mb-4">Have you Found something?</h1>
            <p className="text-lg mb-6">
              Our platform helps reunite lost items with their owners.
            </p>
            <div className="hero-buttons flex justify-center gap-4">
              <button
                className="btn px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                onClick={() => setActiveSection('lost')}
              >
                Browse Lost Items
              </button>
              <button
                className="btn px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                onClick={() => setActiveSection('found')}
              >
                Browse Found Items
              </button>
            </div>
          </section>
        )}

        {activeSection === 'lost' && (
          <section id="lost-section" className="section">
            <div className="header mb-6">
              <h1 className="text-3xl font-bold">Lost Items</h1>
              <p className="text-gray-700">
                Browse reported lost items and help reunite them with their owners.
              </p>
            </div>
            <div className="filters mb-6 flex flex-col md:flex-row items-center gap-4">
              <div className="search-bar flex items-center bg-white p-2 rounded shadow">
                <span className="search-icon mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Search lost items..."
                  className="outline-none"
                  value={lostSearch}
                  onChange={(e) => setLostSearch(e.target.value)}
                />
              </div>
              <div className="filter-options flex items-center gap-4">
                <div>
                  <label className="mr-2 font-medium">Category:</label>
                  <select
                    value={lostCategory}
                    onChange={(e) => setLostCategory(e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
                <div>
                  <label className="mr-2 font-medium">Date:</label>
                  <select
                    value={lostDate}
                    onChange={(e) => setLostDate(e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="items-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderItems(lostItems, 'lost')}
            </div>
          </section>
        )}

        {activeSection === 'found' && (
          <section id="found-section" className="section">
            <div className="header mb-6">
              <h1 className="text-3xl font-bold">Found Items</h1>
              <p className="text-gray-700">
                Browse items found by others and claim what’s yours.
              </p>
            </div>
            <div className="filters mb-6 flex flex-col md:flex-row items-center gap-4">
              <div className="search-bar flex items-center bg-white p-2 rounded shadow">
                <span className="search-icon mr-2">🔍</span>
                <input
                  type="text"
                  placeholder="Search found items..."
                  className="outline-none"
                  value={foundSearch}
                  onChange={(e) => setFoundSearch(e.target.value)}
                />
              </div>
              <div className="filter-options flex items-center gap-4">
                <div>
                  <label className="mr-2 font-medium">Category:</label>
                  <select
                    value={foundCategory}
                    onChange={(e) => setFoundCategory(e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                  </select>
                </div>
                <div>
                  <label className="mr-2 font-medium">Date:</label>
                  <select
                    value={foundDate}
                    onChange={(e) => setFoundDate(e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="all">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="items-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderItems(foundItems, 'found')}
            </div>
          </section>
        )}
      </main>

      {/* Floating Images */}
      <div className="floating-images absolute inset-0 z-[-1] opacity-50">
        <img
          src="OIP"
          alt="Keys"
          className="img-keys absolute w-24 top-0 left-1/5"
        />
        <img
          src="images/phones.png"
          alt="Phones"
          className="img-phones absolute w-24 top-1/3 left-1/2"
        />
        <img
          src="images/bags.png"
          alt="Bags"
          className="img-bags absolute w-24 top-1/2 left-3/4"
        />
        <img
          src="images/books.png"
          alt="Books"
          className="img-books absolute w-24 top-3/4 left-1/3"
        />
      </div>

      {/* Report Lost Modal */}
      {showLostModal && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg w-full max-w-md mx-4 p-6 relative">
            <div className="modal-header flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Report Lost Item</h2>
              <button
                className="close-btn text-xl font-bold"
                onClick={() => setShowLostModal(false)}
              >
                &times;
              </button>
            </div>
            <form id="lost-form" onSubmit={handleLostSubmit}>
              <div className="form-group mb-4">
                <label htmlFor="lost-name" className="block font-medium mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id="lost-name"
                  name="name"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-cat" className="block font-medium mb-1">
                  Category
                </label>
                <select
                  id="lost-cat"
                  name="category"
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-date-lost" className="block font-medium mb-1">
                  Date Lost
                </label>
                <input
                  type="date"
                  id="lost-date-lost"
                  name="date"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-loc" className="block font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="lost-loc"
                  name="location"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-desc" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="lost-desc"
                  name="description"
                  required
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-email" className="block font-medium mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="lost-email"
                  name="email"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="lost-img" className="block font-medium mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="lost-img"
                  name="image"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-buttons flex justify-end gap-4">
                <button
                  type="button"
                  className="cancel-btn px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowLostModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Found Modal */}
      {showFoundModal && (
        <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal-content bg-white rounded-lg w-full max-w-md mx-4 p-6 relative">
            <div className="modal-header flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Report Found Item</h2>
              <button
                className="close-btn text-xl font-bold"
                onClick={() => setShowFoundModal(false)}
              >
                &times;
              </button>
            </div>
            <form id="found-form" onSubmit={handleFoundSubmit}>
              <div className="form-group mb-4">
                <label htmlFor="found-name" className="block font-medium mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id="found-name"
                  name="name"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-cat" className="block font-medium mb-1">
                  Category
                </label>
                <select
                  id="found-cat"
                  name="category"
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-date-found" className="block font-medium mb-1">
                  Date Found
                </label>
                <input
                  type="date"
                  id="found-date-found"
                  name="date"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-loc" className="block font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="found-loc"
                  name="location"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-desc" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="found-desc"
                  name="description"
                  required
                  className="w-full p-2 border rounded"
                ></textarea>
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-email" className="block font-medium mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="found-email"
                  name="email"
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-group mb-4">
                <label htmlFor="found-img" className="block font-medium mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="found-img"
                  name="image"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="form-buttons flex justify-end gap-4">
                <button
                  type="button"
                  className="cancel-btn px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowFoundModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFoundApp;
