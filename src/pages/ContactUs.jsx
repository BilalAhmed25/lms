import React from 'react';
import SEO from '../components/SEO';
import ContactHero from '../components/Home/ContactHero';
import ContactSection from '../components/Home/ContactSection';
import FAQSection from '../components/Home/FAQSection';

const ContactUs = () => {
    return (
        <div className="contact-page animate-fade-in">
            <SEO 
                title="Contact Us" 
                description="Have questions or need assistance? Reach out to Deenova Learning Hub. Our team is here to help you with your educational journey."
            />
            <ContactHero />
            <ContactSection />
            <FAQSection />
        </div>
    );
};

export default ContactUs;
