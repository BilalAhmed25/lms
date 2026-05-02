import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Mail, Lock, LogIn } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import LandingHero from '../components/LandingHero';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.Role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (user.Role === 'Teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/student-dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Incorrect email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page animate-fade-in">
      <LandingHero 
        title={<>Find out the <br/> <span className="text-primary">Best</span> Way to Learn.</>}
        description="Unlock your potential with our award-winning curriculum and expert-led mentorship programs. Join a community of over 50,000 successful students worldwide."
        image="/hero_banner.png"
      >
        <div className="auth-container glass">
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

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                'Please wait...'
              ) : (
                <>
                  <LogIn size={20} />
                  Log In
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
          </p>
        </div>
      </LandingHero>
    </div>
  );
};

export default Login;
