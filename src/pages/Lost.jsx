import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import './style.css'; // assume your CSS styles are in this file

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
      <div className="item-card" key={item.id}>
        <h3>{item.item_name || 'Unnamed'}</h3>
        <p>Category: {item.category || 'N/A'}</p>
        <p>
          Date {type === 'lost' ? 'Lost' : 'Found'}:{' '}
          {type === 'lost' ? item.date_lost || 'N/A' : item.date_found || 'N/A'}
        </p>
        <p>Location: {item.location || 'N/A'}</p>
        <p>Description: {item.description || 'No description'}</p>
        <p>Contact: {item.contact_email || 'N/A'}</p>
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.item_name || 'Image'}
            style={{ maxWidth: '100%' }}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="lost-found-app">
      <header>
        <div className="logo">Lost &amp; Found</div>
        <nav>
          <button className="nav-item" onClick={() => setActiveSection('home')}>
            Home
          </button>
          <button className="nav-item" onClick={() => setActiveSection('lost')}>
            Browse Lost Items
          </button>
          <button
            className="nav-item"
            onClick={() => setActiveSection('found')}
          >
            Browse Found Items
          </button>
          <a className="nav-item" href="/frontend/home/home.html">
            Back To Main Page
          </a>
          <button
            className="nav-item btn"
            onClick={() => setShowLostModal(true)}
          >
            Report Lost Item
          </button>
          <button
            className="nav-item btn"
            onClick={() => setShowFoundModal(true)}
          >
            Report Found Item
          </button>
        </nav>
      </header>

      <main>
        {activeSection === 'home' && (
          <section id="home-section" className="section">
            <h1>Have you Lost something?</h1>
            <section>
              <h1>Have you Found something?</h1>
            </section>
            <p>Our platform helps reunite lost items with their owners.</p>
            <div className="hero-buttons">
              <button className="btn" onClick={() => setActiveSection('lost')}>
                Browse Lost Items
              </button>
              <button className="btn" onClick={() => setActiveSection('found')}>
                Browse Found Items
              </button>
            </div>
          </section>
        )}

        {activeSection === 'lost' && (
          <section id="lost-section" className="section">
            <div className="header">
              <h1>Lost Items</h1>
              <p>
                Browse reported lost items and help reunite them with their
                owners.
              </p>
            </div>
            <div className="filters">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search lost items..."
                  value={lostSearch}
                  onChange={(e) => setLostSearch(e.target.value)}
                />
              </div>
              <div className="filter-options">
                <label>Category:</label>
                <select
                  value={lostCategory}
                  onChange={(e) => setLostCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                </select>
                <label>Date:</label>
                <select
                  value={lostDate}
                  onChange={(e) => setLostDate(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
            <div className="items-grid">{renderItems(lostItems, 'lost')}</div>
          </section>
        )}

        {activeSection === 'found' && (
          <section id="found-section" className="section">
            <div className="header">
              <h1>Found Items</h1>
              <p>Browse items found by others and claim what’s yours.</p>
            </div>
            <div className="filters">
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search found items..."
                  value={foundSearch}
                  onChange={(e) => setFoundSearch(e.target.value)}
                />
              </div>
              <div className="filter-options">
                <label>Category:</label>
                <select
                  value={foundCategory}
                  onChange={(e) => setFoundCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                </select>
                <label>Date:</label>
                <select
                  value={foundDate}
                  onChange={(e) => setFoundDate(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
            <div className="items-grid">{renderItems(foundItems, 'found')}</div>
          </section>
        )}
      </main>

      {/* Floating Images */}
      <div
        className="floating-images"
        style={{ position: 'absolute', zIndex: -1, opacity: 0.5 }}
      >
        <img
          src="OIP"
          alt="Keys"
          className="img-keys"
          style={{
            position: 'absolute',
            width: '100px',
            top: '0%',
            left: '20%',
          }}
        />
        <img
          src="images/phones.png"
          alt="Phones"
          className="img-phones"
          style={{
            position: 'absolute',
            width: '100px',
            top: '30%',
            left: '50%',
          }}
        />
        <img
          src="images/bags.png"
          alt="Bags"
          className="img-bags"
          style={{
            position: 'absolute',
            width: '100px',
            top: '50%',
            left: '70%',
          }}
        />
        <img
          src="images/books.png"
          alt="Books"
          className="img-books"
          style={{
            position: 'absolute',
            width: '100px',
            top: '70%',
            left: '30%',
          }}
        />
      </div>

      {/* Report Lost Modal */}
      {showLostModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Report Lost Item</h2>
              <button
                className="close-btn"
                onClick={() => setShowLostModal(false)}
              >
                ×
              </button>
            </div>
            <form id="lost-form" onSubmit={handleLostSubmit}>
              <div className="form-group">
                <label htmlFor="lost-name">Item Name</label>
                <input type="text" id="lost-name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="lost-cat">Category</label>
                <select id="lost-cat" name="category" required>
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="lost-date-lost">Date Lost</label>
                <input type="date" id="lost-date-lost" name="date" required />
              </div>
              <div className="form-group">
                <label htmlFor="lost-loc">Location</label>
                <input type="text" id="lost-loc" name="location" required />
              </div>
              <div className="form-group">
                <label htmlFor="lost-desc">Description</label>
                <textarea id="lost-desc" name="description" required></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="lost-email">Contact Email</label>
                <input type="email" id="lost-email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="lost-img">Image URL (Optional)</label>
                <input type="url" id="lost-img" name="image" />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowLostModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Found Modal */}
      {showFoundModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Report Found Item</h2>
              <button
                className="close-btn"
                onClick={() => setShowFoundModal(false)}
              >
                ×
              </button>
            </div>
            <form id="found-form" onSubmit={handleFoundSubmit}>
              <div className="form-group">
                <label htmlFor="found-name">Item Name</label>
                <input type="text" id="found-name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="found-cat">Category</label>
                <select id="found-cat" name="category" required>
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Bags">Bags</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="found-date-found">Date Found</label>
                <input type="date" id="found-date-found" name="date" required />
              </div>
              <div className="form-group">
                <label htmlFor="found-loc">Location</label>
                <input type="text" id="found-loc" name="location" required />
              </div>
              <div className="form-group">
                <label htmlFor="found-desc">Description</label>
                <textarea
                  id="found-desc"
                  name="description"
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="found-email">Contact Email</label>
                <input type="email" id="found-email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="found-img">Image URL (Optional)</label>
                <input type="url" id="found-img" name="image" />
              </div>
              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowFoundModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
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
