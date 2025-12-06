import React, { useState } from 'react';

export function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a backend
    setSubmitted(true);
    setTimeout(() => {
      setFormState({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-page-pro">
      <h1 className="main-title-pro">Contact Us</h1>
      <p style={{fontSize: '1.08em', color: '#A4C7EC', marginBottom: '2em', lineHeight: 1.7}}>
        Have questions about Cyber Sentinell? Found a bug? Want to discuss partnership opportunities? We'd love to hear from you. Our team typically responds within 24 hours.
      </p>

      <div className="contact-info-pro">
        <div className="contact-info-item">
          <h3>📧 Email</h3>
          <p><a href="mailto:support@cybersentinell.com" style={{color: '#2979FF', textDecoration: 'none'}}>support@cybersentinell.com</a></p>
          <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>General inquiries and support</p>
        </div>
        <div className="contact-info-item">
          <h3>🏢 Enterprise</h3>
          <p><a href="mailto:enterprise@cybersentinell.com" style={{color: '#2979FF', textDecoration: 'none'}}>enterprise@cybersentinell.com</a></p>
          <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Enterprise and API integration</p>
        </div>
        <div className="contact-info-item">
          <h3>🔒 Security</h3>
          <p><a href="mailto:security@cybersentinell.com" style={{color: '#2979FF', textDecoration: 'none'}}>security@cybersentinell.com</a></p>
          <p style={{fontSize: '0.85em', marginTop: '0.5em'}}>Report security vulnerabilities</p>
        </div>
      </div>

      <form className="contact-form-pro" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Full Name (optional)</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            value={formState.name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        <div>
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            value={formState.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject">Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            value={formState.subject}
            onChange={handleChange}
            required
            placeholder="What is this about?"
          />
        </div>

        <div>
          <label htmlFor="message">Your Message</label>
          <textarea 
            id="message" 
            name="message" 
            value={formState.message}
            onChange={handleChange}
            required
            rows="8"
            placeholder="Tell us how we can help..."
          />
        </div>

        <button type="submit" style={{marginTop: '1em'}}>
          {submitted ? '✓ Message Sent!' : 'Send Message'}
        </button>
      </form>

      {submitted && (
        <div style={{marginTop: '2em', padding: '1.5em', background: 'rgba(0, 191, 174, 0.1)', border: '1px solid rgba(0, 191, 174, 0.3)', borderRadius: '1.2em', color: '#00BFAE', textAlign: 'center'}}>
          Thank you for your message! We'll get back to you shortly.
        </div>
      )}

      <section style={{marginTop: '3em', padding: '2.5em', background: 'rgba(41, 121, 255, 0.08)', border: '1px solid rgba(41, 121, 255, 0.2)', borderRadius: '1.8em'}}>
        <h2 style={{color: '#2979FF', fontSize: '1.8em', marginTop: 0}}>Other Ways to Connect</h2>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2em', marginTop: '1.5em'}}>
          <div>
            <h3 style={{color: '#00BFAE', marginTop: 0}}>Documentation</h3>
            <p style={{color: '#A4C7EC', lineHeight: 1.7}}>Check out our comprehensive API documentation, integration guides, and technical resources to get the most out of Cyber Sentinell.</p>
            <a href="#" style={{color: '#2979FF', textDecoration: 'none', fontWeight: 600}}>View Documentation →</a>
          </div>

          <div>
            <h3 style={{color: '#00BFAE', marginTop: 0}}>Blog & Research</h3>
            <p style={{color: '#A4C7EC', lineHeight: 1.7}}>Read our latest threat analysis reports, security research, and insights into emerging email attack trends.</p>
            <a href="#" style={{color: '#2979FF', textDecoration: 'none', fontWeight: 600}}>Read Our Blog →</a>
          </div>

          <div>
            <h3 style={{color: '#00BFAE', marginTop: 0}}>Community</h3>
            <p style={{color: '#A4C7EC', lineHeight: 1.7}}>Join our growing community of security professionals and discuss threat detection strategies, best practices, and insights.</p>
            <a href="#" style={{color: '#2979FF', textDecoration: 'none', fontWeight: 600}}>Visit Community →</a>
          </div>
        </div>
      </section>

      <section style={{marginTop: '3em', padding: '2.5em', background: 'rgba(41, 121, 255, 0.08)', border: '1px solid rgba(41, 121, 255, 0.2)', borderRadius: '1.8em'}}>
        <h2 style={{color: '#2979FF', fontSize: '1.8em', marginTop: 0}}>Response Times & Support Levels</h2>
        <table style={{width: '100%', borderCollapse: 'collapse', color: '#B6D4FF', marginTop: '1.5em'}}>
          <thead>
            <tr style={{borderBottom: '2px solid rgba(41, 121, 255, 0.3)'}}>
              <th style={{textAlign: 'left', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Inquiry Type</th>
              <th style={{textAlign: 'center', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Priority</th>
              <th style={{textAlign: 'left', padding: '1em', color: '#00BFAE', fontWeight: 700}}>Response Time</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
              <td style={{padding: '1em'}}>Security Vulnerability</td>
              <td style={{textAlign: 'center', padding: '1em', color: '#ff6b6b'}}>🔴 Critical</td>
              <td style={{padding: '1em'}}>2 hours</td>
            </tr>
            <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
              <td style={{padding: '1em'}}>Enterprise Support</td>
              <td style={{textAlign: 'center', padding: '1em', color: '#ffa500'}}>🟠 High</td>
              <td style={{padding: '1em'}}>4 hours</td>
            </tr>
            <tr style={{borderBottom: '1px solid rgba(41, 121, 255, 0.15)'}}>
              <td style={{padding: '1em'}}>General Inquiry</td>
              <td style={{textAlign: 'center', padding: '1em', color: '#00BFAE'}}>🟢 Standard</td>
              <td style={{padding: '1em'}}>24 hours</td>
            </tr>
            <tr>
              <td style={{padding: '1em'}}>Sales Inquiry</td>
              <td style={{textAlign: 'center', padding: '1em', color: '#2979FF'}}>🔵 Normal</td>
              <td style={{padding: '1em'}}>24 hours</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ContactPage;
