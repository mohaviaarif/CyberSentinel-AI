import React from 'react';

export function FAQPage() {
  return (
    <div className="faq-page-pro">
      <h1 className="main-title-pro">Frequently Asked Questions</h1>
      <p style={{fontSize: '1.05em', color: '#A4C7EC', marginBottom: '2.5em', lineHeight: 1.8}}>
        Find answers to common questions about Cyber Sentinell's capabilities, privacy, and pricing.
      </p>
      <div className="faq-list-pro">
        
        <details className="faq-item-pro">
          <summary>What is Cyber Sentinell?</summary>
          <div>Cyber Sentinell is an AI-powered email security platform that analyzes incoming emails to detect phishing attacks, spam, and malware. We use advanced machine learning models trained on millions of real-world emails to identify threats with high accuracy. Our platform provides instant results with detailed explanations of detected threats.</div>
        </details>

        <details className="faq-item-pro">
          <summary>How does Cyber Sentinell detect phishing?</summary>
          <div>We employ multiple detection layers: content analysis for phishing language patterns, header inspection for authentication failures and spoofing indicators, URL scanning for malicious links, and machine learning models that recognize complex behavioral patterns. This multi-faceted approach catches sophisticated attacks that traditional filters miss.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Is Cyber Sentinell really free?</summary>
          <div>Yes! Our core email threat detection service is completely free with unlimited usage. We offer premium enterprise features (API access, advanced reporting, dedicated support, custom rules) for organizations that require them. But basic users never pay anything.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Do you store or view my emails?</summary>
          <div>No, absolutely not. Emails are processed in-memory and immediately discarded after analysis. We never store, log, retain, or forward your email content anywhere. We don't have access to your emails after the analysis completes. Your privacy is protected through our zero-knowledge architecture.</div>
        </details>

        <details className="faq-item-pro">
          <summary>How accurate is Cyber Sentinell?</summary>
          <div>Our machine learning models achieve 94%+ accuracy in distinguishing phishing/spam from legitimate emails. Accuracy varies based on attack sophistication, but our models are continuously updated with new threat intelligence to improve detection rates. We publish annual accuracy reports for transparency.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Can I use it with forwarded or complex emails?</summary>
          <div>Yes! Our email parser is designed to handle forwarded messages, email chains, multi-part MIME formats, and various email clients. We extract the relevant content from complex email threads to provide accurate threat analysis regardless of format.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Does Cyber Sentinell work with my email provider?</summary>
          <div>Currently, Cyber Sentinell operates as a standalone analyzer – simply paste or upload the email content. We're developing integrations with major email providers (Gmail, Outlook, etc.) for seamless browser extension compatibility. Enterprise customers can integrate via our REST API.</div>
        </details>

        <details className="faq-item-pro">
          <summary>How does your pricing work?</summary>
          <div>Free tier: Unlimited email analysis, basic threat detection. Enterprise tier: Custom pricing for API access, advanced reporting, dedicated support, compliance features, and custom threat rules. Contact our sales team for enterprise quotes.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Is Cyber Sentinell suitable for enterprise deployment?</summary>
          <div>Absolutely! We support enterprise features including role-based access control, audit trails for compliance, API integration with existing systems, advanced threat reporting, custom threat rules, dedicated technical support.</div>
        </details>

        <details className="faq-item-pro">
          <summary>How does Cyber Sentinell stay updated with new threats?</summary>
          <div>Our team monitors emerging phishing campaigns and malware variants daily. We integrate real-time threat feeds from leading security providers, continuously retrain our ML models with new attack patterns, and publish regular threat intelligence reports sharing insights with the security community.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Can I get explanations for the analysis results?</summary>
          <div>Yes! Every detection includes a detailed explanation of which indicators triggered the verdict. We explain suspicious links, phishing language patterns, authentication failures, and other risk factors in plain English so you understand exactly why an email was flagged.</div>
        </details>

        <details className="faq-item-pro">
          <summary>What does the confidence score mean?</summary>
          <div>The confidence score (0-100%) indicates how certain our analysis is about the verdict. A high confidence score means our models are very confident the email is legitimate/phishing/spam. Lower scores suggest the email has mixed signals and warrants careful review.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Does Cyber Sentinell detect zero-day threats?</summary>
          <div>Yes! Unlike signature-based filters that only catch known malware, our machine learning models can detect novel phishing techniques and zero-day attacks by analyzing behavioral patterns and content indicators. This is why we often catch attacks before they're added to threat databases.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Can I report false positives?</summary>
          <div>Yes! We welcome feedback about false positives or false negatives. Reporting helps us improve our models. Enterprise customers have direct feedback channels; free users can report via our contact form.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Is my data sold to third parties?</summary>
          <div>Never. We don't monetize user data. Your email content is never sold, shared with advertisers, or used for any purpose other than improving your security. We may use anonymized, aggregated threat statistics for research purposes only.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Who maintains Cyber Sentinell?</summary>
          <div>Our team consists of security researchers, machine learning engineers, and cybersecurity veterans with combined experience in threat analysis, incident response, and AI security. We're committed to advancing email security through research and innovation.</div>
        </details>

        <details className="faq-item-pro">
          <summary>How do I integrate Cyber Sentinell with my organization?</summary>
          <div>Enterprise users can integrate via our REST API for programmatic email analysis. We provide comprehensive API documentation, SDKs for popular languages, and technical support. Contact our enterprise team to discuss integration options for your environment.</div>
        </details>

        <details className="faq-item-pro">
          <summary>What's the response time for email analysis?</summary>
          <div>Most analyses complete in under 500 milliseconds. Heavy load times rarely exceed 2 seconds. Our distributed architecture scales to handle millions of simultaneous analyses with consistent performance.</div>
        </details>

        <details className="faq-item-pro">
          <summary>Can I use Cyber Sentinell offline?</summary>
          <div>Currently, Cyber Sentinell requires internet connectivity as analyses are processed on our secure servers. We're exploring local deployment options for enterprise customers in regulated environments.</div>
        </details>
      </div>
    </div>
  );
}

export default FAQPage;
