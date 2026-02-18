import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Users, Clock, ChevronRight, Layout, CheckCircle } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="container flex-between">
                    <div className="flex-center gap-2">
                        <div className="auth-logo-icon" style={{ width: 32, height: 32, margin: 0 }}>
                            <BookOpen size={18} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>FYP Manager</span>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="container">
                    <div className="hero-badge">
                        <span className="flex-center gap-1"><Shield size={14} /> Official Babcock Portal</span>
                    </div>
                    <h1 className="hero-title">
                        Streamline Your <span className="gradient-text">Final Year Project</span>
                        <br /> from Proposal to Defense.
                    </h1>
                    <p className="hero-subtitle">
                        The all-in-one platform for Babcock University students and supervisors.
                        Manage proposals, track milestones, and grade projects with ease.
                    </p>
                    <div className="flex-center gap-2">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Your Project <ChevronRight size={20} />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Continue Work
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="container" style={{ paddingBottom: 80 }}>
                <div className="text-center mb-4">
                    <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Everything you need to succeed</h2>
                    <p className="text-secondary">Built for academic excellence and seamless collaboration.</p>
                </div>

                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Layout size={24} />
                        </div>
                        <h3>Smart Dashboard</h3>
                        <p className="text-secondary mt-2">
                            Get a bird's-eye view of your project status, upcoming deadlines, and recent feedback all in one place.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Users size={24} />
                        </div>
                        <h3>Real-time Collaboration</h3>
                        <p className="text-secondary mt-2">
                            Direct messaging between students and supervisors. Get instant feedback on your chapters and proposals.
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Clock size={24} />
                        </div>
                        <h3>Milestone Tracking</h3>
                        <p className="text-secondary mt-2">
                            Never miss a deadline. Automated timeline tracking ensures you stay on schedule for your defense.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats / Trust */}
            <section style={{ background: 'white', padding: '80px 0', borderTop: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div className="grid-3 text-center">
                        <div>
                            <h4 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800 }}>100%</h4>
                            <p className="text-secondary font-bold">Paperless Workflow</p>
                        </div>
                        <div>
                            <h4 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800 }}>24/7</h4>
                            <p className="text-secondary font-bold">System Availability</p>
                        </div>
                        <div>
                            <h4 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800 }}>Secure</h4>
                            <p className="text-secondary font-bold">Data Protection</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <div className="container">
                    <p>© 2026 Babcock University Computer Science Department. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
