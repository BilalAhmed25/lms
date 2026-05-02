import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, LogIn } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.RoleName === 'Admin' || user.RoleName === 'SuperAdmin') {
        navigate('/admin-dashboard');
      } else if (user.RoleName === 'Teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Incorrect email or password');
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-split-layout glass">
        <div className="auth-hero">
          <div className="hero-overlay"></div>
          <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=1000" alt="Login Hero" />
          <div className="hero-text">
            <h2>Experience the Future of Learning</h2>
            <p>Join thousands of students and teachers in our world-class educational ecosystem.</p>
          </div>
        </div>
        
        <div className="auth-container">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Continue your learning journey</p>
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

            <div className="label-row-wrapper mb-6">
              <FloatingLabelInput
                label="Password"
                type="password"
                icon={Lock}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Link to="/forgot-password" className="text-primary forgot-link-standalone">Forgot Password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              <LogIn size={20} />
              Log In
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
