import React from "react";
import LegalPageLayout from "../components/LegalPageLayout";

const tocSections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. User Accounts & Responsibilities" },
    { id: "acceptable-use", title: "3. Acceptable Use Policy" },
    { id: "payment", title: "4. Payment and Billing" },
    { id: "termination", title: "5. Termination of Service" },
    { id: "liability", title: "6. Limitation of Liability" },
    { id: "changes", title: "7. Changes to Terms" },
];

export default function TermsOfServicePage() {
    return (
        <LegalPageLayout
            title="Terms of Service"
            lastUpdated="February 27, 2026"
            sections={tocSections}
        >
            <p className="mb-8 text-white/70 italic text-sm">
                Disclaimer: This is placeholder text for demonstration purposes only. It does not constitute legal advice and should not be used as an actual legal document. Please consult a legal professional to draft your final Terms of Service.
            </p>

            <section id="acceptance" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                    By accessing or using the Paynexus API, dashboard, and related services
                    (collectively, the "Services"), you agree to be bound by these Terms of Service.
                    If you do not agree to all the terms and conditions in this agreement, you
                    may not access or use our Services.
                </p>
                <p>
                    These Terms apply to all visitors, users, merchants, and others who access
                    or use the Service.
                </p>
            </section>

            <section id="accounts" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    2. User Accounts and Responsibilities
                </h2>
                <p className="mb-4">
                    To use certain features of the Service, you must register for an account.
                    You agree to provide true, accurate, current, and complete information
                    about yourself and your business as prompted by the registration form.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>You are responsible for maintaining the confidentiality of your API keys and account credentials.</li>
                    <li>You are absolutely responsible for all activities that occur under your account.</li>
                    <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                </ul>
            </section>

            <section id="acceptable-use" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    3. Acceptable Use Policy
                </h2>
                <p className="mb-4">
                    You agree not to use the Services for any unlawful purpose or in any way
                    that interrupts, damages, or impairs the functionality of the system.
                    Specifically, you may not use Paynexus to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Process payments for illegal goods, prohibited services, or restricted industries without express written consent.</li>
                    <li>Engage in fraudulent activities, money laundering, or terrorist financing.</li>
                    <li>Attempt to circumvent our security protocols or automated fraud detection risk engines (including the GNN systems).</li>
                    <li>Transmit any viruses, malware, or destructive code.</li>
                </ul>
            </section>

            <section id="payment" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    4. Payment and Billing
                </h2>
                <p className="mb-4">
                    Paynexus operates as a Payment Service Provider and/or Merchant of Record
                    depending on your configured integration.
                </p>
                <p className="mb-4">
                    <strong>Fees:</strong> By using the Services, you agree to pay all applicable
                    fees as outlined in your specific pricing plan or enterprise agreement.
                    Fees are calculated in real-time and deducted directly from your settlement
                    payouts.
                </p>
                <p>
                    <strong>Chargebacks and Refunds:</strong> You are fully liable for all
                    chargebacks, refunds, and associated fees incurred by your customers unless
                    expressly covered under the Paynexus Fraud Protection Guarantee program.
                </p>
            </section>

            <section id="termination" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    5. Termination of Service
                </h2>
                <p className="mb-4">
                    We may terminate or suspend your account and bar access to the Service
                    immediately, without prior notice or liability, under our sole discretion,
                    for any reason whatsoever and without limitation, including but not limited
                    to a breach of the Terms.
                </p>
                <p>
                    Upon termination, your right to use the Service will immediately cease.
                    If you wish to terminate your account, you may simply discontinue using the Service.
                </p>
            </section>

            <section id="liability" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    6. Limitation of Liability
                </h2>
                <p className="mb-4">
                    In no event shall Paynexus, nor its directors, employees, partners,
                    agents, suppliers, or affiliates, be liable for any indirect, incidental,
                    special, consequential or punitive damages, including without limitation,
                    loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                    <li>Your access to or use of or inability to access or use the Service.</li>
                    <li>Any conduct or content of any third party on the Service.</li>
                    <li>Any content obtained from the Service.</li>
                    <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                </ul>
            </section>

            <section id="changes" className="scroll-mt-32 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-white/90 border-b border-white/10 pb-2">
                    7. Changes to Terms
                </h2>
                <p className="mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these
                    Terms at any time. If a revision is material, we will provide at least
                    30 days' notice prior to any new terms taking effect. What constitutes
                    a material change will be determined at our sole discretion.
                </p>
                <p>
                    By continuing to access or use our Service after any revisions become
                    effective, you agree to be bound by the revised terms.
                </p>
            </section>

        </LegalPageLayout>
    );
}
