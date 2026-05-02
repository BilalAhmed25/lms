import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error);
        return;
      }

      alert('OTP sent to your email!');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-container glass">
        <Link to="/login" className="back-link">
          <ArrowLeft size={18} /> Back to Login
        </Link>
        <div className="auth-header">
          <h2>Forgot Password?</h2>
          <p>No worries! Enter your email and we'll send you an OTP to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <FloatingLabelInput 
            label="Email Address"
            type="email"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-6"
          />

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : (
              <>
                <Send size={20} />
                Send OTP
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
};

export default ForgotPassword;
