import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertiesAPI, rentalsAPI, paymentsAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    pendingApplications: 0,
    activeAgreements: 0,
    monthlyRevenue: 0,
    overduePayments: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propertiesRes, rentalsRes, paymentsRes, overdueRes] = await Promise.all([
        propertiesAPI.getAll(),
        rentalsAPI.getAll(),
        paymentsAPI.getAll(),
        paymentsAPI.getOverdue().catch(() => ({ data: [] }))
      ]);

      // Handle both paginated and non-paginated responses
      const properties = Array.isArray(propertiesRes.data) ? propertiesRes.data : propertiesRes.data.results || [];
      const rentals = Array.isArray(rentalsRes.data) ? rentalsRes.data : rentalsRes.data.results || [];
      const payments = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data.results || [];
      const overduePayments = Array.isArray(overdueRes.data) ? overdueRes.data : overdueRes.data.results || [];

      // Calculate statistics
      const totalUnits = properties.reduce((sum, prop) => sum + (prop.total_units || 0), 0);
      const occupiedUnits = properties.reduce(
        (sum, prop) => sum + ((prop.total_units || 0) - (prop.available_units || 0)),
        0
      );
      const pendingApps = rentals.filter(r => r.status?.toUpperCase() === 'APPLIED').length;
      const activeAgreements = rentals.filter(r => r.status?.toLowerCase() === 'active').length;
      const monthlyRevenue = rentals
        .filter(r => r.status?.toLowerCase() === 'active')
        .reduce((sum, r) => sum + parseFloat(r.monthly_rent || 0), 0);

      setStats({
        totalProperties: properties.length,
        totalUnits: totalUnits,
        occupiedUnits: occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        pendingApplications: pendingApps,
        activeAgreements: activeAgreements,
        monthlyRevenue: monthlyRevenue,
        overduePayments: overduePayments.length,
      });

      // Get recent applications (pending ones)
      setRecentApplications(
        rentals
          .filter(r => r.status?.toUpperCase() === 'APPLIED')
          .slice(0, 5)
      );

      // Get recent payments
      setRecentPayments(
        payments
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );

    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const occupancyRate = stats.totalUnits > 0
    ? ((stats.occupiedUnits / stats.totalUnits) * 100).toFixed(1)
    : 0;

  const handleGenerateReport = async () => {
    try {
      const res = await paymentsAPI.downloadReport();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'payment-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate the report. Please try again.');
    }
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
            Landlord Dashboard
          </h1>
          <p className="text-[#003333]">Overview of your rental portfolio</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Properties"
            value={stats.totalProperties}
            icon="building"
            color="blue"
            link="/landlord/properties"
          />
          <MetricCard
            title="Total Units"
            value={stats.totalUnits}
            subtitle={`${stats.occupiedUnits} Occupied, ${stats.vacantUnits} Vacant`}
            icon="grid"
            color="purple"
          />
          <MetricCard
            title="Occupancy Rate"
            value={`${occupancyRate}%`}
            icon="chart"
            color={occupancyRate >= 80 ? 'green' : occupancyRate >= 60 ? 'yellow' : 'red'}
          />
          <MetricCard
            title="Monthly Revenue"
            value={`${Number(stats.monthlyRevenue).toLocaleString()} TZS`}
            icon="dollar"
            color="green"
          />
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.pendingApplications > 0 && (
            <Link
              to="/landlord/agreements"
              className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 p-6 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {stats.pendingApplications} Pending Application{stats.pendingApplications !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-yellow-700">Review and respond to tenant applications</p>
                </div>
              </div>
            </Link>
          )}

          {stats.overduePayments > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-800">
                    {stats.overduePayments} Overdue Payment{stats.overduePayments !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-700">Follow up on late payments</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
              <h2 className="text-xl font-bold text-white">Recent Applications</h2>
            </div>
            <div className="p-6">
              {recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No pending applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <ApplicationItem key={app.id} application={app} />
                  ))}
                  <Link
                    to="/landlord/agreements"
                    className="block text-center py-2 text-[#003152] hover:text-[#99CC33] font-medium transition-colors"
                  >
                    View All Applications →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#003152] to-[#003333] p-6">
              <h2 className="text-xl font-bold text-white">Recent Payments</h2>
            </div>
            <div className="p-6">
              {recentPayments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500">No recent payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <PaymentItem key={payment.id} payment={payment} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-[#003152] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/landlord/properties"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold text-[#003152]">Add New Property</span>
            </Link>
            <Link
              to="/landlord/agreements"
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-semibold text-[#003152]">View Applications</span>
            </Link>
            <button
              onClick={handleGenerateReport}
              className="flex items-center p-4 bg-[#ADDFF1] bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              <svg className="w-8 h-8 text-[#003152] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-[#003152]">Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color, link }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  const iconPaths = {
    building: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    dollar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  const content = (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow`}>
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

  return link ? <Link to={link}>{content}</Link> : content;
};

const ApplicationItem = ({ application }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-semibold text-[#003152]">
          {application.tenant_name || 'Applicant'}
        </p>
        <p className="text-sm text-[#003333]">
          {application.property_name} - Unit {application.unit_number}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">{formatDate(application.created_at)}</p>
      </div>
    </div>
  );
};

const PaymentItem = ({ payment }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <p className="font-semibold text-[#003152]">{payment.amount} TZS</p>
        <p className="text-sm text-[#003333]">
          {payment.property_name || 'N/A'}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${getStatusColor(payment.status)}`}>
          {payment.status}
        </p>
        <p className="text-xs text-gray-500">{formatDate(payment.due_date)}</p>
      </div>
    </div>
  );
};

export default Dashboard;
