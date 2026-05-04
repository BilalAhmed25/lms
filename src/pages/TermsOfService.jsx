import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, Book, User, Info, Scale, CreditCard, AlertCircle } from 'lucide-react';
import '../styles/legal.css';

const TermsOfService = () => {
    return (
        <div className="legal-page-layout">
            <SEO
                title="Terms and Conditions | Deenova Learning Hub"
                description="Read our terms and conditions for using the Deenova Learning Hub platform."
            />
            <Navbar />

            <header className="legal-header">
                <div className="container">
                    <h1 className='text-white'>Terms and Conditions</h1>
                    <p className='text-white'>Last updated: May 2026</p>
                </div>
            </header>

            <main className="legal-content-section">
                <div className="container">
                    <div className="legal-grid">
                        <aside className="legal-sidebar">
                            <div className="toc-card">
                                <h3>Table of Contents</h3>
                                <nav className="toc-nav">
                                    <a href="#acceptance" className="toc-link"><Info size={16} /> 1. Acceptance of Terms</a>
                                    <a href="#property" className="toc-link"><Shield size={16} /> 2. Intellectual Property</a>
                                    <a href="#account" className="toc-link"><User size={16} /> 3. Account Security</a>
                                    <a href="#scope" className="toc-link"><Scale size={16} /> 4. Scope of Service</a>
                                    <a href="#refunds" className="toc-link"><CreditCard size={16} /> 5. Refunds & Subscriptions</a>
                                    <a href="#disciplinary" className="toc-link"><AlertCircle size={16} /> 6. Disciplinary Actions</a>
                                    <a href="#jurisdiction" className="toc-link"><Book size={16} /> 7. Jurisdictional Limits</a>
                                </nav>
                            </div>
                        </aside>

                        <div className="legal-card">
                            <section className="legal-section" id="acceptance">
                                <div className="section-title">
                                    <Info size={20} />
                                    <h2>1. Acceptance of Terms</h2>
                                </div>
                                <p>
                                    By accessing or using Deenova Learning Hub (the "Platform"), clicking the "Accept" button, or signing up for an account, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. These terms constitute a binding legal agreement between you and Deenova Learning Hub.
                                </p>
                                <p>
                                    Deenova reserves the right to modify, add, or remove portions of these terms at any time by issuing an addendum. Continued use of the platform following any changes implies your acceptance of the revised terms.
                                </p>
                            </section>

                            <section className="legal-section" id="property">
                                <div className="section-title">
                                    <Shield size={20} />
                                    <h2>2. Intellectual Property</h2>
                                </div>
                                <p>
                                    All materials available on the Platform, including but not limited to videos, study guides, notes, quizzes, and software, are the sole property of Deenova Learning Hub. Deenova retains absolute discretion in determining which materials are subject to a fee and which are provided free of charge.
                                </p>
                                <p>
                                    <strong>Anti-Counterfeiting:</strong> Unauthorized sharing, reproduction, or distribution of platform material outside of Deenova is strictly prohibited and constitutes a violation of international copyright laws.
                                </p>
                            </section>

                            <section className="legal-section" id="account">
                                <div className="section-title">
                                    <User size={20} />
                                    <h2>3. Account Security & Usage</h2>
                                </div>
                                <p>
                                    Each account is intended for individual use by the registered student only. Sharing login credentials, passwords, or progress data with any other person—including family members or friends—is strictly prohibited.
                                </p>
                                <p>
                                    Any attempt to share account access will be considered a violation of these terms and may result in immediate account termination without refund, and potential legal action.
                                </p>
                            </section>

                            <section className="legal-section" id="scope">
                                <div className="section-title">
                                    <Scale size={20} />
                                    <h2>4. Scope of Service</h2>
                                </div>
                                <p>
                                    Deenova Learning Hub provides educational guidance and supplementary material. We are not an assessment body or a substitute for formal education. Deenova does not guarantee specific academic results or performance in competitive examinations.
                                </p>
                                <p>
                                    Your relationship with the Platform is that of a student and a service provider. No agency, partnership, or principal-agent relationship is created through your use of the Platform.
                                </p>
                            </section>

                            <section className="legal-section" id="refunds">
                                <div className="section-title">
                                    <CreditCard size={20} />
                                    <h2>5. Refunds & Subscriptions</h2>
                                </div>
                                <p>
                                    <strong>Refund Policy:</strong> New subscriptions are eligible for a refund within 7 days of purchase, provided no significant violation of terms has occurred. Refunds are not applicable to subscription renewals or crash courses.
                                </p>
                                <p>
                                    <strong>Access:</strong> Continual access to materials requires an active subscription. Once a stipulated period ends, users must renew their subscription or join specific courses to maintain access.
                                </p>
                            </section>

                            <section className="legal-section" id="disciplinary">
                                <div className="section-title">
                                    <AlertCircle size={20} />
                                    <h2>6. Disciplinary Actions</h2>
                                </div>
                                <p>
                                    Deenova maintains a zero-tolerance policy for spamming, sharing prohibited content, or any form of disciplinary breach. We reserve the sole discretion to suspend or terminate any account found in violation of these policies immediately and without prior notice.
                                </p>
                                <p>
                                    Decisions regarding what constitutes a "serious breach" are at the sole discretion of Deenova Learning Hub.
                                </p>
                            </section>

                            <section className="legal-section" id="jurisdiction">
                                <div className="section-title">
                                    <Book size={20} />
                                    <h2>7. Jurisdictional Limits</h2>
                                </div>
                                <p>
                                    Deenova operates within the geographical and legal limits of Pakistan. All disputes arising from these terms shall fall under the exclusive jurisdiction of the competent courts in Pakistan.
                                </p>
                                <p>
                                    For users under the legal age of eighteen (18), it is deemed that access is provided under the supervision of a parent or guardian who has also understood and accepted these terms.
                                </p>
                            </section>

                            <div className="legal-footer">
                                <p>Copyright &copy; 2026 Deenova Learning Hub. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
