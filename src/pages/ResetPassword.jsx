import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Hash, ShieldCheck, Mail } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error);
        return;
      }

      alert('Password reset successfully! You can now login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-container glass">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter the 6-digit code sent to your email and your new password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FloatingLabelInput 
            label="Email Address"
            type="email"
            icon={Mail}
            readOnly
            value={formData.email}
            className="read-only-input mb-6"
          />

          <FloatingLabelInput 
            label="Verification Code (OTP)"
            type="text"
            icon={Hash}
            required
            maxLength="6"
            value={formData.otp}
            onChange={(e) => setFormData({...formData, otp: e.target.value})}
            className="mb-6"
          />

          <FloatingLabelInput 
            label="New Password"
            type="password"
            icon={Lock}
            required
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            className="mb-6"
          />

          <FloatingLabelInput 
            label="Confirm New Password"
            type="password"
            icon={ShieldCheck}
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            className="mb-6"
          />

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ResetPassword;
