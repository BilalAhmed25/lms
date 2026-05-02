import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { User, Briefcase, Mail, Lock, UserPlus } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', profile: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          role: role.charAt(0).toUpperCase() + role.slice(1), // 'Student' or 'Teacher'
          name: formData.name 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error);
        return;
      }

      const data = await response.json();
      alert(data.message);
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Failed to register');
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-split-layout glass">
        <div className="auth-hero">
          <div className="hero-overlay"></div>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" alt="Register Hero" />
          <div className="hero-text">
            <h2>Join Our Global Community</h2>
            <p>Empower your future with industry-leading courses and expert-led mentorship.</p>
          </div>
        </div>

        <div className="auth-container">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join our learning community today</p>
          </div>

          <div className="role-selector">
            <button 
              className={`role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => setRole('student')}
            >
              <User size={20} />
              Student
            </button>
            <button 
              className={`role-btn ${role === 'teacher' ? 'active' : ''}`}
              onClick={() => setRole('teacher')}
            >
              <Briefcase size={20} />
              Teacher
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <FloatingLabelInput 
              label="Full Name"
              type="text"
              icon={User}
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mb-6"
            />

            <FloatingLabelInput 
              label="Email Address"
              type="email"
              icon={Mail}
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="mb-6"
            />

            <FloatingLabelInput 
              label="Password"
              type="password"
              icon={Lock}
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mb-6"
            />

            {role === 'teacher' && (
              <div className="floating-input-group mb-6">
                <div className="input-wrapper">
                  <textarea 
                    placeholder=" " 
                    required
                    rows="3"
                    value={formData.profile}
                    onChange={(e) => setFormData({...formData, profile: e.target.value})}
                  ></textarea>
                  <label className="floating-label">Professional Bio / Expertise</label>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full">
              <UserPlus size={20} />
              Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="text-primary">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
