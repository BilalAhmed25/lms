import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { Book, CreditCard, Clock, Star, Search, AlertCircle } from 'lucide-react';
import StudentEnrollment from '../components/StudentEnrollment';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [studentData, setStudentData] = useState(null);
  const [enrollmentHistory, setEnrollmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch student profile to check ClassId
      const profileRes = await fetch('http://localhost:3000/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profile = await profileRes.json();
      setStudentData(profile);

      // Fetch history
      const historyRes = await fetch('http://localhost:3000/enrollment/my-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const history = await historyRes.json();
      setEnrollmentHistory(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading dashboard...</div>;

  // If student is not enrolled in any class
  if (!studentData?.ClassId) {
    const pendingRequest = enrollmentHistory.find(h => h.Status === 'pending');
    
    if (pendingRequest) {
      return (
        <div className="dashboard-container container py-20 text-center">
          <div className="glass p-12 rounded-3xl max-w-2xl mx-auto">
            <Clock size={60} className="mx-auto text-primary animate-pulse" />
            <h2 className="mt-8">Enrollment Pending</h2>
            <p className="text-muted mt-4">
              Your request for <strong>{pendingRequest.ClassName}</strong> is currently being verified by our admin.
              Please check back later.
            </p>
            <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-3 justify-center">
              <AlertCircle size={20} />
              Verification usually takes 24 hours.
            </div>
          </div>
        </div>
      );
    }

    return <StudentEnrollment onEnrolled={fetchDashboardData} />;
  }

  return (
    <div className="dashboard-container container animate-fade-in">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user.Name}!</h1>
          <p className="text-muted">You are enrolled in {studentData.ClassName}</p>
        </div>
        <div className="search-bar glass">
          <Search size={20} className="text-muted" />
          <input type="text" placeholder="Search lessons..." />
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <Book size={18} /> My Learning
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={18} /> Payment History
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'courses' ? (
          <div className="courses-grid">
            {/* Real course content would be fetched here based on ClassId */}
            <div className="course-card glass">
              <div className="course-img-placeholder">
                <span className="badge badge-primary">Active Class</span>
              </div>
              <div className="course-info">
                <h3>{studentData.ClassName} Curriculum</h3>
                <p className="teacher-name">Access your lessons, assignments and assessments here.</p>
                <div className="progress-container">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `45%` }}></div>
                  </div>
                  <span className="progress-text">45% Course Complete</span>
                </div>
                <button className="btn btn-primary w-full">Enter Classroom</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="payments-table glass">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Class Name</th>
                  <th>Amount Paid</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enrollmentHistory.map(pay => (
                  <tr key={pay.ID}>
                    <td><span className="txn-id">REQ-{pay.ID}</span></td>
                    <td>{pay.ClassName}</td>
                    <td className="amount">${pay.AmountPaid}</td>
                    <td>{new Date(pay.CreatedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        pay.Status === 'approved' ? 'badge-success' : 
                        pay.Status === 'pending' ? 'badge-primary' : 'badge-danger'
                      }`}>
                        {pay.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;
