import React, { useState } from "react";
import {
  FaQuestionCircle,
  FaChevronDown,
  FaChevronUp,
  FaShieldAlt,
  FaRobot,
  FaEnvelopeOpen,
  FaExclamationTriangle,
} from "react-icons/fa";

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const faqs = [
    {
      q: "What is Cyber Sentinel?",
      icon: <FaRobot />,
      a: "Cyber Sentinel is an AI-powered email security system that detects phishing, spam, malware and suspicious behavior using advanced machine learning models trained on millions of real emails.",
    },
    {
      q: "How does Cyber Sentinel detect phishing?",
      icon: <FaShieldAlt />,
      a: "We analyze language patterns, sender spoofing, headers, URLs, attachments and behavioral indicators using a multi-layer AI architecture — far beyond traditional spam filters.",
    },
    {
      q: "Is Cyber Sentinel really free?",
      icon: <FaQuestionCircle />,
      a: "Yes. Unlimited threat detection is 100% free. Enterprises get optional premium features like API access, dashboards and advanced reporting.",
    },
    {
      q: "Do you store or view my emails?",
      icon: <FaShieldAlt />,
      a: "No. Emails are processed in-memory and immediately discarded. We never store, log or retain your content — full zero-knowledge privacy architecture.",
    },
    {
      q: "How accurate is Cyber Sentinel?",
      icon: <FaRobot />,
      a: "Our detection models maintain 94%+ accuracy and are continuously improved with real-time threat intelligence.",
    },
    {
      q: "Can Cyber Sentinel analyze forwarded or complex emails?",
      icon: <FaEnvelopeOpen />,
      a: "Absolutely. We handle long chains, forwarded threads, MIME formats and messy email structures from any client.",
    },
    {
      q: "Does Cyber Sentinel work with my email provider?",
      icon: <FaQuestionCircle />,
      a: "Yes — simply paste any email content. Native Gmail/Outlook integrations and browser extensions are in development.",
    },
    {
      q: "How does Cyber Sentinel pricing work?",
      icon: <FaQuestionCircle />,
      a: "Free tier: unlimited detection. Enterprise tier: API access, reporting dashboards, custom threat rules, compliance features and SLA-backed support.",
    },
    {
      q: "Is Cyber Sentinel suitable for enterprise deployment?",
      icon: <FaShieldAlt />,
      a: "Yes — our enterprise features include RBAC, audit logs, API integration, detailed analytics, and dedicated support.",
    },
    {
      q: "How does Cyber Sentinel stay updated with new threats?",
      icon: <FaRobot />,
      a: "We ingest global phishing data, monitor new attack patterns, and continuously retrain our ML models to detect emerging threats.",
    },
    {
      q: "Does Cyber Sentinel explain its analysis?",
      icon: <FaQuestionCircle />,
      a: "Yes — every analysis includes a human-readable breakdown showing exactly which indicators triggered the verdict.",
    },
    {
      q: "What does the confidence score mean?",
      icon: <FaQuestionCircle />,
      a: "It represents how certain the AI is (0–100%). Lower scores mean mixed signals and the email should be reviewed carefully.",
    },
    {
      q: "Can Cyber Sentinel detect zero-day threats?",
      icon: <FaExclamationTriangle />,
      a: "Yes — our behavior-based models catch novel phishing campaigns even before the industry adds signatures.",
    },
    {
      q: "Can I report false positives?",
      icon: <FaQuestionCircle />,
      a: "Yes. Feedback from users and enterprises helps refine and improve our detection models.",
    },
    {
      q: "Is my data ever sold or shared?",
      icon: <FaShieldAlt />,
      a: "Never. We don’t sell, share, or monetize your data. Only anonymized threat statistics may be used for research.",
    },
    {
      q: "Who maintains Cyber Sentinel?",
      icon: <FaRobot />,
      a: "Cyber Sentinel is maintained by a team of cybersecurity researchers, threat analysts and machine learning engineers.",
    },
    {
      q: "How do enterprises integrate Cyber Sentinel?",
      icon: <FaShieldAlt />,
      a: "Through our REST API with SDKs, authentication, custom rules and full technical documentation.",
    },
    {
      q: "How fast is the analysis?",
      icon: <FaRobot />,
      a: "Most emails are analyzed in under 500ms thanks to our distributed, scalable architecture.",
    },
    {
      q: "Can I use Cyber Sentinel offline?",
      icon: <FaQuestionCircle />,
      a: "Not currently — online processing ensures real-time threat intelligence. Offline enterprise deployment is being explored.",
    },
  ];

  return (
    <div className="faq-page-pro">
      <h1 className="main-title-pro">Frequently Asked Questions</h1>

      <p
        style={{
          fontSize: "1.06em",
          color: "#A4C7EC",
          marginBottom: "2.3em",
          lineHeight: 1.9,
        }}
      >
        Everything you need to know about Cyber Sentinel — accuracy, privacy,
        enterprise features, threat detection and how our AI protects your inbox.
      </p>

      <div className="faq-list-pro">
        {faqs.map((item, i) => (
          <div
            key={i}
            className={`faq-card ${openIndex === i ? "faq-open" : ""}`}
            onClick={() => toggle(i)}
          >
            <div className="faq-header">
              <span className="faq-icon">{item.icon}</span>

              <span className="faq-question">{item.q}</span>

              {openIndex === i ? (
                <FaChevronUp className="faq-arrow" />
              ) : (
                <FaChevronDown className="faq-arrow" />
              )}
            </div>

            {openIndex === i && (
              <div className="faq-answer">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQPage;
