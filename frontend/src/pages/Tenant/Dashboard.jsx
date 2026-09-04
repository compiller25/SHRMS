import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rentalsAPI, paymentsAPI, marketplaceAPI } from '../../services/api';

const TenantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeRentals: 0,
    pendingApplications: 0,
    pendingPayments: 0,
    totalPaid: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch applications
      const applicationsRes = await rentalsAPI.getMyApplications();
      const applications = applicationsRes.data;
      const pendingApps = applications.filter(app => app.status === 'APPLIED');
      setRecentApplications(applications.slice(0, 3)); // Show latest 3

      // Fetch active rentals
      const rentalsRes = await rentalsAPI.getAll();
      const rentalsData = Array.isArray(rentalsRes.data) ? rentalsRes.data : rentalsRes.data.results || [];
      const activeRents = rentalsData.filter(rental => rental.status === 'ACTIVE');
      setActiveRentals(activeRents);

      // Fetch payments
      try {
        const paymentsRes = await paymentsAPI.getMyPayments();
        const payments = paymentsRes.data;
        const pending = payments.filter(p => p.status === 'PENDING');
        const paid = payments.filter(p => p.status === 'COMPLETED');
        const totalPaid = paid.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        setUpcomingPayments(pending.slice(0, 3));
        setStats({
          activeRentals: activeRents.length,
          pendingApplications: pendingApps.length,
          pendingPayments: pending.length,
          totalPaid: totalPaid,
        });
      } catch (paymentError) {
        // If payment endpoint fails, just set basic stats
        setStats({
          activeRentals: activeRents.length,
          pendingApplications: pendingApps.length,
          pendingPayments: 0,
          totalPaid: 0,
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003152] mb-2">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-[#003333]">Here's your rental overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Rentals"
            value={stats.activeRentals}
            icon="home"
            color="blue"
            link="/tenant/rentals"
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon="document"
            color="yellow"
            link="/tenant/applications"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon="credit-card"
            color="red"
            link="/tenant/payments"
          />
          <StatCard
            title="Total Paid"
            value={`${stats.totalPaid.toLocaleString()} TZS`}
            icon="cash"
            color="green"
            link="/tenant/payments"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Rentals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Active Rentals</h2>
              <Link
                to="/tenant/rentals"
                className="text-[#99CC33] hover:text-[#88BB22] text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            {activeRentals.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <p className="text-gray-500 mb-4">No active rentals yet</p>
                <Link
                  to="/marketplace"
                  className="inline-block px-4 py-2 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] font-medium"
                >
                  Browse Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRentals.map((rental) => (
                  <div key={rental.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#99CC33] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#003152]">
                          {rental.property_name || 'Property'}
                        </h3>
                        <p className="text-sm text-[#003333]">
                          Unit: {rental.unit_number || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Rent: {rental.monthly_rent?.toLocaleString()} TZS/month</p>
                      <p>Started: {formatDate(rental.start_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Recent Applications</h2>
              <Link
                to="/tenant/applications"
                className="text-[#99CC33] hover:text-[#88BB22] text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-4">No applications yet</p>
                <Link
                  to="/marketplace"
                  className="inline-block px-4 py-2 bg-[#99CC33] text-[#003152] rounded-lg hover:bg-[#88BB22] font-medium"
                >
                  Find Properties
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#99CC33] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-[#003152]">
                          {app.house_unit?.property_name || 'Property'}
                        </h3>
                        <p className="text-sm text-[#003333]">
                          Unit: {app.house_unit?.unit_number || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Applied: {formatDate(app.created_at)}</p>
                      <p>Move-in: {formatDate(app.start_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#003152]">Upcoming Payments</h2>
              <Link
                to="/tenant/payments"
                className="text-[#99CC33] hover:text-[#88BB22] text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#99CC33] transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-[#003152]">Rent Payment</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-[#003152] mb-1">
                    {payment.amount?.toLocaleString()} TZS
                  </p>
                  <p className="text-sm text-gray-600">Due: {formatDate(payment.due_date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-[#003152] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/marketplace"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-semibold text-[#003152]">Browse Properties</span>
            </Link>

            <Link
              to="/tenant/applications"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-[#003152]">My Applications</span>
            </Link>

            <Link
              to="/tenant/rentals"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-semibold text-[#003152]">My Rentals</span>
            </Link>

            <Link
              to="/tenant/payments"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="font-semibold text-[#003152]">Payments</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, link }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
  };

  const iconPaths = {
    home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    'credit-card': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
    cash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <Link to={link} className="block">
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#003333] mb-1">{title}</p>
            <p className="text-2xl font-bold text-[#003152]">{value}</p>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {iconPaths[icon]}
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TenantDashboard;
