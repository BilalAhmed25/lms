import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Star, ArrowRight, Play, CheckCircle, 
  Calculator, Lightbulb, Beaker, BarChart, Code, Mail, Shield, Monitor
} from 'lucide-react';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="cta-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'center' }}>
            <div className="hero-content">
              <div className="hero-subtitle">
                <Star size={18} fill="currentColor" />
                <span>Learn From 20,000+ Quality Courses</span>
              </div>
              <h1>Best to Platform <span>Empower</span> Skills</h1>
              <p className="text-muted mb-8" style={{ fontSize: '1.1rem' }}>
                Start your education journey for a better future. Join millions of learners worldwide and unlock your full potential today.
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="btn btn-primary" style={{ padding: '15px 35px' }}>Start Learning Now</Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000" alt="Student" />
              <div className="enrolled-badge glass">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} alt="User" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid white' }} />
                  ))}
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>2K+</div>
                </div>
                <div className="text-center">
                  <h4 style={{ margin: 0 }}>100K+</h4>
                  <p className="text-muted" style={{ fontSize: '12px', margin: 0 }}>Total Enrolled Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Top Categories</h2>
          </div>
          <div className="category-grid">
            {[
              { name: 'Mathematics', icon: <Calculator />, color: '#f3e8ff' },
              { name: 'Idea Generate', icon: <Lightbulb />, color: '#fff1f2' },
              { name: 'Chemistry', icon: <Beaker />, color: '#ecfeff' },
              { name: 'Business Analysis', icon: <BarChart />, color: '#fff7ed' },
              { name: 'Development', icon: <Code />, color: '#fffbeb' },
              { name: 'Email Marketing', icon: <Mail />, color: '#f5f3ff' },
              { name: 'Arestogoy', icon: <Shield />, color: '#fef2f2' },
              { name: 'IT / Technology', icon: <Monitor />, color: '#f0fdfa' }
            ].map((cat, i) => (
              <div key={i} className="category-card" style={{ background: cat.color }}>
                <div className="category-icon" style={{ background: 'white', color: 'var(--primary)' }}>
                  {cat.icon}
                </div>
                <h4>{cat.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature CTA Section */}
      <section className="section-padding" style={{ background: '#fafafa' }}>
        <div className="container">
          <div className="cta-grid">
            <div className="cta-card teacher">
              <div className="cta-card-content">
                <span className="text-primary font-bold">Learn together with</span>
                <h3>Expert Teacher</h3>
                <p className="text-muted mb-6">Gain access to top-tier expertise and personalized mentorship.</p>
                <Link to="/register" className="btn btn-primary">View All Courses</Link>
              </div>
              <div className="cta-image-group">
                <img src="https://images.unsplash.com/photo-1544717297-fa154da09f9b?auto=format&fit=crop&q=80&w=300" alt="Teacher" />
              </div>
            </div>
            <div className="cta-card student">
              <div className="cta-card-content">
                <span className="text-primary font-bold">Get the skills</span>
                <h3>For Individuals</h3>
                <p className="text-muted mb-6">Build your path with courses tailored for personal growth.</p>
                <Link to="/register" className="btn btn-primary">Find Your Course</Link>
              </div>
              <div className="cta-image-group">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=300" alt="Student" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="section-padding">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div className="section-header" style={{ textAlign: 'left', margin: 0 }}>
              <h2>Popular Courses</h2>
            </div>
            <Link to="/register" className="btn btn-secondary">View All Courses</Link>
          </div>

          <div className="category-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { title: 'Therapeutic Approaches in Mental Health', cat: 'DEVELOPMENT', price: 'Free', img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500' },
              { title: "Building Chatbots with OpenAI's GPT", cat: 'LANGUAGE', price: '$29', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=500' },
              { title: 'Mobile App Development with React Native', cat: 'DEVELOPMENT', price: 'Free', img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=500' },
              { title: '30-Day Fitness Challenge, Get Fit Fast', cat: 'FITNESS', price: 'Free', img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=500' }
            ].map((course, i) => (
              <div key={i} className="course-card">
                <div className="course-thumb">
                  <img src={course.img} alt={course.title} />
                  <span className="badge badge-primary" style={{ position: 'absolute', top: 20, left: 20 }}>{course.cat}</span>
                </div>
                <div className="course-meta">
                  <div className="course-instructor">
                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="Avatar" />
                    <span className="text-muted text-sm">Instructor Name</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', minHeight: '3rem' }}>{course.title}</h4>
                  <div className="flex items-center gap-2 mt-4 text-muted text-sm">
                    <BookOpen size={16} /> 14 Lessons
                  </div>
                </div>
                <div className="course-footer">
                  <span className={`course-price ${course.price === 'Free' ? 'free' : ''}`}>{course.price}</span>
                  <Link to="/register" className="btn-icon">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
