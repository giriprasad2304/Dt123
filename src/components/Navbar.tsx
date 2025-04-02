import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-8 w-8" />
            <span className="text-xl font-bold">Canteen Express</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/" className="hover:bg-indigo-700 px-3 py-2 rounded-md">
              Home
            </Link>
            <Link
              to="/menu"
              className="hover:bg-indigo-700 px-3 py-2 rounded-md"
            >
              Menu
            </Link>
            <Link
              to="/order"
              className="hover:bg-indigo-700 px-3 py-2 rounded-md"
            >
              Order
            </Link>
            <Link
              to="/lost"
              className="hover:bg-indigo-700 px-3 py-2 rounded-md"
            >
              Lost
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
