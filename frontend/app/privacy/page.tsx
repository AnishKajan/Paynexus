import React from "react";
import LegalPageLayout from "../components/LegalPageLayout";

const tocSections = [
    { id: "collection", title: "1. Information We Collect" },
    { id: "usage", title: "2. How We Use Your Information" },
    { id: "cookies", title: "3. Cookies and Tracking Technologies" },
    { id: "sharing", title: "4. Data Sharing and Third Parties" },
    { id: "rights", title: "5. Your Data Protection Rights" },
    { id: "contact", title: "6. Contact Us" },
];

export default function PrivacyPolicyPage() {
    return (
        <LegalPageLayout
            title="Privacy Policy"
            lastUpdated="February 27, 2026"
            sections={tocSections}
        >
            <p className="mb-8 text-white/70 italic text-sm">
                Disclaimer: This is placeholder text for demonstration purposes only. It does not constitute legal advice and should not be used as an actual legal document. Please consult a legal professional to draft your final Privacy Policy.
            </p>

            <section id="collection" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    1. Information We Collect
                </h2>
                <p className="mb-4">
                    At Paynexus, we collect various types of information in connection with the
                    services we provide, including:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and billing information when you register for an account.</li>
                    <li><strong>Business Information:</strong> Company name, tax ID, business address, and website URL.</li>
                    <li><strong>Usage Data:</strong> Information about how you access and use our API, dashboard, and website (e.g., IP addresses, browser types, interaction metadata).</li>
                    <li><strong>Transaction Data:</strong> Details about payments processed through our platform, which may include end-customer partial metadata required for compliance (KYC/AML).</li>
                </ul>
            </section>

            <section id="usage" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    2. How We Use Your Information
                </h2>
                <p className="mb-4">
                    We use the collected data for various purposes, including to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Provide, maintain, and improve our Service.</li>
                    <li>Process transactions and send related information, including confirmations and invoices.</li>
                    <li>Detect, prevent, and address fraud, technical issues, and security breaches using our GNN-powered risk engine.</li>
                    <li>Comply with legal and regulatory obligations, including anti-money laundering (AML) and know-your-customer (KYC) requirements.</li>
                    <li>Provide customer support.</li>
                </ul>
            </section>

            <section id="cookies" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    3. Cookies and Tracking Technologies
                </h2>
                <p className="mb-4">
                    We use cookies and similar tracking technologies to track the activity on our
                    Service and hold certain information. Cookies are files with a small amount of
                    data which may include an anonymous unique identifier.
                </p>
                <p>
                    You can instruct your browser to refuse all cookies or to indicate when a
                    cookie is being sent. However, if you do not accept cookies, you may not be
                    able to use some portions of our Service (like secure login sessions).
                </p>
            </section>

            <section id="sharing" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    4. Data Sharing and Third Parties
                </h2>
                <p className="mb-4">
                    We do not sell your personal data. We may share your information with
                    third parties only in the ways that are described in this privacy policy:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li><strong>Service Providers:</strong> We may employ third-party companies (like IBM watsonx, AWS) to facilitate our Service or provide infrastructure.</li>
                    <li><strong>Financial Partners:</strong> Acquiring banks and payment networks necessary to process your transactions.</li>
                    <li><strong>Legal Requirements:</strong> We will disclose your Personal Data where required to do so by law or subpoena.</li>
                </ul>
            </section>

            <section id="rights" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    5. Your Data Protection Rights
                </h2>
                <p className="mb-4">
                    Depending on your location (e.g., if you are a resident of the European Economic Area (EEA) under GDPR, or California under CCPA), you have certain data protection rights:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>The right to access, update, or to delete the information we have on you.</li>
                    <li>The right of rectification (to fix inaccurate data).</li>
                    <li>The right to object to or restrict processing.</li>
                    <li>The right to data portability.</li>
                </ul>
                <p>
                    To exercise any of these rights, please contact our privacy team.
                </p>
            </section>

            <section id="contact" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    6. Contact Us
                </h2>
                <p className="mb-4">
                    If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>By visiting our Data Request page on our website: <a href="/help" className="text-purple-400 hover:text-purple-300 ml-1">Paynexus Help Center</a></li>
                    <li>By email: privacy@paynexus.example.com</li>
                </ul>
            </section>

        </LegalPageLayout>
    );
}
