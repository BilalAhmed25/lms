import React, { useState } from 'react';
import './FAQSection.css';
import { ChevronDown, ChevronUp, Mail } from 'lucide-react';

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "What are O and A Level certifications?",
            answer: "O and A Level certifications are internationally recognized qualifications provided by Cambridge Assessment International Education (CAIE). They are essential for students seeking higher education in global universities."
        },
        {
            question: "How do I enroll in a course on Deenova?",
            answer: "To enroll, simply create an account on our platform, browse the 'Courses' section, select your desired subject, and click the 'Enroll' button. You can manage all your learning from your personalized dashboard."
        },
        {
            question: "Are the teachers qualified for O/A Level subjects?",
            answer: "Yes, Deenova exclusively hires certified educators with years of experience in teaching the Cambridge curriculum. Our tutors are subject matter experts dedicated to student success."
        },
        {
            question: "Can I access course materials offline?",
            answer: "Our LMS provides downloadable resources such as PDFs, study guides, and past papers. However, video lectures and live sessions require an active internet connection."
        },
        {
            question: "How do I track my progress?",
            answer: "Your student dashboard provides real-time analytics on your course completion, module progress, and quiz scores, helping you stay on top of your learning journey."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section className="faq-section section">
            <div className="container">
                <div className="faq-grid">
                    <div className="faq-header-area">
                        <span className="section-subtitle-small">SUPPORT CENTER</span>
                        <h2 className="faq-main-title">Frequently asked <br />questions</h2>
                        
                        <div className="still-questions-card">
                            <h3>Still have a questions?</h3>
                            <p>Can't find the answer to your question? Send us an email and we'll get back to you as soon as possible!</p>
                            <button className="btn btn-primary send-email-btn">
                                <Mail size={18} />
                                Send email
                            </button>
                        </div>
                    </div>

                    <div className="faq-accordion">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item ${openIndex === index ? 'active' : ''}`}
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="faq-question">
                                    <h4>{faq.question}</h4>
                                    <div className="faq-icon">
                                        {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </div>
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
