import { Link } from 'react-router-dom';
import { UtensilsCrossed, Clock, Phone } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <UtensilsCrossed className="mx-auto h-16 w-16 text-indigo-600" />
          <h1 className="mt-4 text-4xl font-bold text-gray-900 sm:text-5xl">
            Welcome to Canteen Express
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Delicious meals, delivered fresh to your desk
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Clock className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold">Quick Service</h3>
            <p className="mt-2 text-gray-600">
              Order ahead and skip the queue. Your food will be ready when you are.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <UtensilsCrossed className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold">Fresh Menu Daily</h3>
            <p className="mt-2 text-gray-600">
              We update our menu daily with fresh and seasonal options.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Phone className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold">Easy Ordering</h3>
            <p className="mt-2 text-gray-600">
              Simple online ordering system with real-time updates.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center space-x-6">
          <Link
            to="/menu"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Menu
          </Link>
          <Link
            to="/order"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Place Order
          </Link>
        </div>
      </div>
    </div>
  );
}