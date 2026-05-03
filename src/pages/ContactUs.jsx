import React from 'react';
import ContactHero from '../components/Home/ContactHero';
import ContactSection from '../components/Home/ContactSection';
import FAQSection from '../components/Home/FAQSection';

const ContactUs = () => {
    return (
        <div className="contact-page animate-fade-in">
            <ContactHero />
            <ContactSection />
            <FAQSection />
        </div>
    );
};

export default ContactUs;
