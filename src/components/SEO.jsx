import { useEffect } from 'react';

const SEO = ({ title, description }) => {
  useEffect(() => {
    const siteName = 'Deenova Learning Hub';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    document.title = fullTitle;
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || 'Deenova Learning Hub - Premium LMS Platform for students and teachers.');
  }, [title, description]);

  return null;
};

export default SEO;
