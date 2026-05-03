import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { User, Briefcase, Mail, Lock, UserPlus, FileText } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import LandingHero from '../components/LandingHero';

import api from '../utils/api';

const Register = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', profile: '' });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.post('/auth/register', { 
        email: formData.email, 
        password: formData.password, 
        role: role.charAt(0).toUpperCase() + role.slice(1), 
        name: formData.name 
      });

      alert(data.message || 'Registration successful!');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page animate-fade-in">
      <LandingHero 
        title={<>Experience the <br/> <span className="text-primary">Future</span> of Education.</>}
        description="Join thousands of students and teachers in our world-class educational ecosystem. Start your journey today with our industry-leading platform."
        image="/hero_banner.png"
      >
        <div className="auth-container glass">
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
              <FloatingLabelInput 
                label="Professional Bio / Expertise"
                type="textarea"
                icon={FileText}
                required
                rows="3"
                value={formData.profile}
                onChange={(e) => setFormData({...formData, profile: e.target.value})}
                className="mb-6"
              />
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                'Please wait...'
              ) : (
                <>
                  <UserPlus size={20} />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login" className="text-primary">Log In</Link>
          </p>
        </div>
      </LandingHero>
    </div>
  );
};

export default Register;
