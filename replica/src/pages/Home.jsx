import { Link } from 'react-router-dom';
import {
  Home as HomeIcon,
  FileText,
  DollarSign,
  Search,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

const features = [
  { icon: HomeIcon, title: 'Property Management', text: 'Efficiently manage multiple properties and units with our intuitive dashboard' },
  { icon: FileText, title: 'Digital Agreements', text: 'Create and manage rental agreements digitally with secure document handling' },
  { icon: DollarSign, title: 'Payment Tracking', text: 'Track payments, monitor due dates, and generate financial reports automatically' },
  { icon: Search, title: 'Smart Search', text: 'Find your perfect rental with advanced filtering and search capabilities' },
  { icon: CheckCircle, title: 'Application Process', text: 'Streamlined application workflow from submission to approval' },
  { icon: BarChart3, title: 'Analytics Dashboard', text: 'Comprehensive insights with real-time data and performance metrics' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ADDFF1] to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#003152] mb-6">
              House Rental Management
            </h1>
            <p className="text-xl sm:text-2xl text-[#003333] mb-8 max-w-3xl mx-auto">
              Streamline your rental experience with our comprehensive property management platform
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Properties
              </Link>
              <Link
                to="/landlord"
                className="px-8 py-4 bg-[#003152] text-white font-semibold rounded-lg hover:bg-[#003333] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Landlord Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#003152] text-center mb-12">
            Why Choose House Rental System?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-gradient-to-br from-[#ADDFF1] to-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-[#99CC33] rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-[#003152]" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold text-[#003152] mb-3">{title}</h3>
                <p className="text-[#003333]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#003152] to-[#003333]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Rental Experience?
          </h2>
          <p className="text-xl text-[#ADDFF1] mb-8">
            Join thousands of landlords and tenants who trust our platform
          </p>
          <Link
            to="/marketplace"
            className="inline-block px-10 py-4 bg-[#99CC33] text-[#003152] font-bold text-lg rounded-lg hover:bg-[#88BB22] transition-all duration-300 shadow-2xl transform hover:-translate-y-1"
          >
            Explore Listings
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#99CC33] mb-2">10k+</div>
              <div className="text-[#003333] text-lg">Properties Listed</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#99CC33] mb-2">50k+</div>
              <div className="text-[#003333] text-lg">Happy Tenants</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#99CC33] mb-2">99.9%</div>
              <div className="text-[#003333] text-lg">Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
