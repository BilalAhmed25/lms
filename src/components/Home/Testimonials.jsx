import React, { useState, useEffect } from 'react';
import './Testimonials.css';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3);

  const reviews = [
    {
      name: "Sarah Ahmed",
      role: "A-Level Student",
      rating: 4.9,
      text: "Deenova's O & A level courses have been a game-changer for my studies. The integrated LMS makes it so easy to track my progress.",
      avatar: "https://ui-avatars.com/api/?background=random&name=Sarah+Ahmed"
    },
    {
      name: "Muhammad Bilal",
      role: "Senior Educator",
      rating: 4.9,
      text: "As a teacher, the training modules here have helped me adopt modern pedagogical techniques while staying rooted in Islamic values.",
      avatar: "https://ui-avatars.com/api/?background=random&name=Muhammad+Bilal"
    },
    {
      name: "Aisha Khan",
      role: "Parent",
      rating: 4.9,
      text: "I am so happy with the personality development courses for my children. The platform is safe and the community is wonderful.",
      avatar: "https://ui-avatars.com/api/?background=random&name=Aisha+Khan"
    },
    {
      name: "Omar Farooq",
      role: "O-Level Student",
      rating: 4.8,
      text: "The Islamic Studies courses are very well-structured. I've learned so much about our history in such a short time.",
      avatar: "https://ui-avatars.com/api/?background=random&name=Omar+Farooq"
    },
    {
      name: "Fatima Zahra",
      role: "Skill Learner",
      rating: 4.9,
      text: "The skills development courses are practical and easy to follow. I've already started applying what I learned in my projects.",
      avatar: "https://ui-avatars.com/api/?background=random&name=Fatima+Zahra"
    },
    {
      name: "Zainab Malik",
      role: "Teacher Trainee",
      rating: 5.0,
      text: "Deenova provides an incredible balance between academic excellence and spiritual growth. Highly recommended!",
      avatar: "https://ui-avatars.com/api/?background=random&name=Zainab+Malik"
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setSlidesToShow(1);
      else if (window.innerWidth <= 992) setSlidesToShow(2);
      else setSlidesToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (reviews.length - slidesToShow + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length, slidesToShow]);

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header testimonial-header">
          <div className="header-left">
            <span className="section-subtitle-small">TESTIMONIAL</span>
            <h2 className="testimonials-title">What our happy user says!</h2>
            <div className="title-line"></div>
          </div>
          <div className="header-right">
            <p className="testimonial-header-desc">
              Hear from our global community of students and teachers who have transformed 
              their learning journey through Deenova's integrated Islamic LMS.
            </p>
          </div>
        </div>

        <div className="testimonials-viewport">
          <div 
            className="testimonials-track" 
            style={{ transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)` }}
          >
            {reviews.map((review, index) => (
              <div key={index} className={`testimonial-card-wrapper`}>
                <div className={`testimonial-card ${currentIndex === index ? 'active' : ''}`}>
                  <div className="rating-row">
                    <Star size={16} fill="var(--accent)" color="var(--accent)" />
                    <span className="rating-num">{review.rating}</span>
                  </div>
                  <p className="testimonial-text">"{review.text}"</p>
                  <div className="testimonial-user">
                    <img src={review.avatar} alt={review.name} className="user-avatar" />
                    <div className="user-info">
                      <h4 className="user-name">{review.name}</h4>
                      <p className="user-role">{review.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots">
          {Array.from({ length: reviews.length - slidesToShow + 1 }).map((_, index) => (
            <span 
              key={index} 
              className={`dot ${currentIndex === index ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
