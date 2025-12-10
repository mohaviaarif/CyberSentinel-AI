import React, { useState } from "react";
import { FaUser, FaEnvelope, FaTag, FaPaperPlane, FaCheckCircle } from "react-icons/fa";

function ContactPage({ notify }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  /* ------------------------------------------
      🔧 Input Handler
  ------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------------------
      🚀 Submit Handler
  ------------------------------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Trigger toast
    if (notify) {
      notify("Message sent successfully!", "success");
    }

    setSubmitted(true);

    setTimeout(() => {
      setFormState({ name: "", email: "", subject: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="contact-page-pro">
      {/* ------------------------- HEADER ------------------------------ */}
      <h1 className="main-title-pro">Contact Us</h1>

      <p
        style={{
          fontSize: "1.1em",
          color: "#A4C7EC",
          marginBottom: "2.3em",
          lineHeight: 1.8,
        }}
      >
        Got questions, feedback, or partnership ideas? We're here for you.
        Our Cyber Sentinel team typically replies within 24 hours.
      </p>

      {/* ------------------------- CONTACT CARDS ------------------------------ */}
      <div className="contact-info-pro">
        <div className="contact-info-item">
          <h3>📧 Email Support</h3>
          <p>
            <a
              href="mailto:support@cybersentinel.com"
              style={{ color: "#2979FF", textDecoration: "none" }}
            >
              support@cybersentinel.com
            </a>
          </p>
          <p style={{ fontSize: "0.85em" }}>General questions & assistance</p>
        </div>

        <div className="contact-info-item">
          <h3>🏢 Enterprise</h3>
          <p>
            <a
              href="mailto:enterprise@cybersentinel.com"
              style={{ color: "#2979FF", textDecoration: "none" }}
            >
              enterprise@cybersentinel.com
            </a>
          </p>
          <p style={{ fontSize: "0.85em" }}>
            API integration, enterprise plans, partnerships
          </p>
        </div>

        <div className="contact-info-item">
          <h3>🔒 Security Desk</h3>
          <p>
            <a
              href="mailto:security@cybersentinel.com"
              style={{ color: "#2979FF", textDecoration: "none" }}
            >
              security@cybersentinel.com
            </a>
          </p>
          <p style={{ fontSize: "0.85em" }}>Responsible disclosure & vulnerabilities</p>
        </div>
      </div>

      {/* ------------------------- FORM ------------------------------ */}
      <form className="contact-form-pro" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div>
          <label htmlFor="name">Full Name (optional)</label>
          <div style={{ position: "relative" }}>
            <FaUser
              style={{
                position: "absolute",
                top: "50%",
                left: "15px",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Your name"
              style={{ paddingLeft: "45px" }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email">Email Address</label>
          <div style={{ position: "relative" }}>
            <FaEnvelope
              style={{
                position: "absolute",
                top: "50%",
                left: "15px",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formState.email}
              onChange={handleChange}
              placeholder="your@email.com"
              style={{ paddingLeft: "45px" }}
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject">Subject</label>
          <div style={{ position: "relative" }}>
            <FaTag
              style={{
                position: "absolute",
                top: "50%",
                left: "15px",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formState.subject}
              onChange={handleChange}
              placeholder="What is this about?"
              style={{ paddingLeft: "45px" }}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            name="message"
            rows="7"
            required
            value={formState.message}
            onChange={handleChange}
            placeholder="Tell us how we can help..."
          />
        </div>

        {/* Submit Button */}
        <button type="submit" style={{ marginTop: "1.3em" }}>
          {submitted ? (
            <>
              <FaCheckCircle /> Message Sent!
            </>
          ) : (
            <>
              <FaPaperPlane /> Send Message
            </>
          )}
        </button>
      </form>

      {/* ------------------------- SUCCESS BOX ------------------------------ */}
      {submitted && (
        <div
          style={{
            marginTop: "2em",
            padding: "1.6em",
            borderRadius: "1.2em",
            textAlign: "center",
            background: "rgba(0, 191, 174, 0.13)",
            border: "1px solid rgba(0, 191, 174, 0.4)",
            color: "#00BFAE",
            fontWeight: 600,
          }}
        >
          <FaCheckCircle size={20} /> Your message has been delivered!
        </div>
      )}

      {/* ------------------------- EXTERNAL LINKS SECTION ------------------------------ */}
      <section
        style={{
          marginTop: "3em",
          padding: "2.5em",
          borderRadius: "1.8em",
          background: "rgba(41, 121, 255, 0.08)",
          border: "1px solid rgba(41, 121, 255, 0.25)",
        }}
      >
        <h2 style={{ color: "#2979FF", fontSize: "1.9em", marginTop: 0 }}>
          Other Ways to Connect
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2em",
            marginTop: "1.6em",
          }}
        >
          <div>
            <h3 style={{ color: "#00BFAE" }}>Documentation</h3>
            <p style={{ color: "#A4C7EC", lineHeight: 1.7 }}>
              Explore our full API reference, model parameters, and technical guides.
            </p>
            <a style={{ color: "#2979FF", fontWeight: 600, textDecoration: "none" }} href="#">
              View Documentation →
            </a>
          </div>

          <div>
            <h3 style={{ color: "#00BFAE" }}>Blog & Research</h3>
            <p style={{ color: "#A4C7EC", lineHeight: 1.7 }}>
              Read insights about phishing trends, ML model improvements, and threat analysis.
            </p>
            <a style={{ color: "#2979FF", fontWeight: 600, textDecoration: "none" }} href="#">
              Read Our Blog →
            </a>
          </div>

          <div>
            <h3 style={{ color: "#00BFAE" }}>Community</h3>
            <p style={{ color: "#A4C7EC", lineHeight: 1.7 }}>
              Join cybersecurity experts discussing attack trends and best practices.
            </p>
            <a style={{ color: "#2979FF", fontWeight: 600, textDecoration: "none" }} href="#">
              Visit Community →
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------- SUPPORT TABLE ------------------------------ */}
      <section
        style={{
          marginTop: "3em",
          padding: "2.5em",
          borderRadius: "1.8em",
          background: "rgba(41, 121, 255, 0.08)",
          border: "1px solid rgba(41, 121, 255, 0.25)",
        }}
      >
        <h2 style={{ color: "#2979FF", fontSize: "1.9em" }}>
          Response Times & Support Levels
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "#B6D4FF",
            marginTop: "1.7em",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(41, 121, 255, 0.3)" }}>
              <th style={{ textAlign: "left", padding: "1em", color: "#00BFAE" }}>
                Inquiry Type
              </th>
              <th style={{ textAlign: "center", padding: "1em", color: "#00BFAE" }}>
                Priority
              </th>
              <th style={{ textAlign: "left", padding: "1em", color: "#00BFAE" }}>
                Response Time
              </th>
            </tr>
          </thead>

          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
              <td style={{ padding: "1em" }}>Security Vulnerability</td>
              <td style={{ textAlign: "center", padding: "1em", color: "#ff6b6b" }}>🔴 Critical</td>
              <td style={{ padding: "1em" }}>2 hours</td>
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
              <td style={{ padding: "1em" }}>Enterprise Support</td>
              <td style={{ textAlign: "center", padding: "1em", color: "#ffa500" }}>🟠 High</td>
              <td style={{ padding: "1em" }}>4 hours</td>
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(41, 121, 255, 0.15)" }}>
              <td style={{ padding: "1em" }}>General Inquiry</td>
              <td style={{ textAlign: "center", padding: "1em", color: "#00BFAE" }}>🟢 Standard</td>
              <td style={{ padding: "1em" }}>24 hours</td>
            </tr>

            <tr>
              <td style={{ padding: "1em" }}>Sales Inquiry</td>
              <td style={{ textAlign: "center", padding: "1em", color: "#2979FF" }}>🔵 Normal</td>
              <td style={{ padding: "1em" }}>24 hours</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ContactPage;
