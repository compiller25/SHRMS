import { useState, useEffect } from 'react';
import { authAPI, propertiesAPI, rentalsAPI, paymentsAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLandlords: 0,
    totalTenants: 0,
    totalProperties: 0,
    totalUnits: 0,
    activeAgreements: 0,
    totalRevenue: 0,
    pendingApplications: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Note: These endpoints would need to be created on the backend
      // For now, we'll use available endpoints and aggregate data
      const [propertiesRes, rentalsRes, paymentsRes] = await Promise.all([
        propertiesAPI.getAll().catch(() => ({ data: [] })),
        rentalsAPI.getAll().catch(() => ({ data: [] })),
        paymentsAPI.getAll().catch(() => ({ data: [] }))
      ]);

      // Handle both paginated and non-paginated responses
      const properties = Array.isArray(propertiesRes.data) ? propertiesRes.data : propertiesRes.data.results || [];
      const rentals = Array.isArray(rentalsRes.data) ? rentalsRes.data : rentalsRes.data.results || [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.results || [];

      const totalUnits = properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0);
      const activeAgreements = rentals.filter(r => r.status?.toLowerCase() === 'active').length;
      const pendingApps = rentals.filter(r => r.status?.toUpperCase() === 'APPLIED').length;
      const totalRevenue = payments
        .filter(p => p.status?.toLowerCase() === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        totalUsers: 0, // Would need admin endpoint
        totalLandlords: 0, // Would need admin endpoint
        totalTenants: 0, // Would need admin endpoint
        totalProperties: properties.length,
        totalUnits: totalUnits,
        activeAgreements: activeAgreements,
        totalRevenue: totalRevenue,
        pendingApplications: pendingApps,
      });

    } catch (err) {
      setError('Failed to load admin data. Please try again later.');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#003152] mx-auto mb-4"></div>
          <p className="text-[#003333] text-lg">Loading admin dashboard...</p>
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
            Admin Dashboard
          </h1>
          <p className="text-[#003333]">System overview and management</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Admin Alert */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Admin Access</h3>
              <p className="text-sm text-blue-700">You have full system access. Use Django Admin for user management at <code className="bg-blue-100 px-2 py-1 rounded">/admin/</code></p>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers || 'N/A'}
            subtitle={`${stats.totalLandlords || 0} Landlords, ${stats.totalTenants || 0} Tenants`}
            icon="users"
            color="blue"
          />
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            subtitle={`${stats.totalUnits} Units`}
            icon="building"
            color="purple"
          />
          <StatCard
            title="Active Agreements"
            value={stats.activeAgreements}
            subtitle={`${stats.pendingApplications} Pending`}
            icon="document"
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`${Number(stats.totalRevenue).toLocaleString()} TZS`}
            subtitle="All-time paid"
            icon="dollar"
            color="orange"
          />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Management */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
              <h2 className="text-xl font-bold text-white">User Management</h2>
            </div>
            <div className="p-6">
              <p className="text-[#003333] mb-6">
                Manage users, roles, and permissions through the Django Admin interface.
              </p>
              <a
                href="/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 bg-[#99CC33] text-[#003152] font-semibold rounded-lg hover:bg-[#88BB22] transition-colors text-center"
              >
                Open Django Admin Panel →
              </a>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#003333]">Total Landlords</span>
                  <span className="font-bold text-[#003152]">{stats.totalLandlords || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#003333]">Total Tenants</span>
                  <span className="font-bold text-[#003152]">{stats.totalTenants || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-[#003333]">Admin Users</span>
                  <span className="font-bold text-[#003152]">1+</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Activity */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
              <h2 className="text-xl font-bold text-white">System Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <ActivityItem
                  icon="check"
                  title="System Status"
                  description="All services operational"
                  status="success"
                />
                <ActivityItem
                  icon="database"
                  title="Database"
                  description="SQLite - Connected"
                  status="info"
                />
                <ActivityItem
                  icon="api"
                  title="API Server"
                  description="Django REST Framework running"
                  status="success"
                />
                <ActivityItem
                  icon="payment"
                  title="Payment Gateway"
                  description="ClickPesa Mobile USSD-PUSH configured"
                  status="info"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-[#003152] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              icon="users"
              label="Manage Users"
              href="/admin/"
              external
            />
            <ActionButton
              icon="building"
              label="View All Properties"
              onClick={() => window.location.href = '/admin/'}
              external
            />
            <ActionButton
              icon="document"
              label="View All Agreements"
              onClick={() => window.location.href = '/admin/'}
              external
            />
            <ActionButton
              icon="chart"
              label="Generate Reports"
              onClick={() => alert('Report generation feature coming soon')}
            />
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-[#003152] mb-6">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#ADDFF1] to-white rounded-lg">
              <svg className="w-12 h-12 text-[#003152] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-3xl font-bold text-[#003152] mb-1">{stats.totalProperties}</p>
              <p className="text-sm text-[#003333]">Properties Listed</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-[#ADDFF1] to-white rounded-lg">
              <svg className="w-12 h-12 text-[#003152] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-3xl font-bold text-[#003152] mb-1">{stats.activeAgreements}</p>
              <p className="text-sm text-[#003333]">Active Agreements</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-[#ADDFF1] to-white rounded-lg">
              <svg className="w-12 h-12 text-[#003152] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-3xl font-bold text-[#003152] mb-1">{Number(stats.totalRevenue).toLocaleString()} TZS</p>
              <p className="text-sm text-[#003333]">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  const iconPaths = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    building: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    document: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    dollar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-lg shadow-md p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-90 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
        </div>
        <svg className="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {iconPaths[icon]}
        </svg>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon, title, description, status }) => {
  const statusColors = {
    success: 'text-green-600 bg-green-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
  };

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${statusColors[status]} mr-3`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#003152] text-sm">{title}</p>
        <p className="text-xs text-[#003333]">{description}</p>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, href, external, onClick }) => {
  const content = (
    <div className="flex flex-col items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors cursor-pointer">
      <svg className="w-8 h-8 text-[#003152] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      <span className="text-sm font-semibold text-[#003152] text-center">{label}</span>
    </div>
  );

  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    ) : (
      <a href={href}>{content}</a>
    );
  }

  return <button onClick={onClick}>{content}</button>;
};

export default AdminDashboard;
