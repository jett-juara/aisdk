import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-premium-gradient">
                    Privacy Policy
                </h1>
                <p className="text-xl text-text-200 max-w-2xl mx-auto">
                    Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
                </p>
            </div>

            <div className="glass-card-premium p-8 md:p-12 space-y-8 text-text-100">
                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">1. Introduction</h2>
                    <p className="leading-relaxed text-text-200">
                        Welcome to Juara. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">2. Information We Collect</h2>
                    <p className="leading-relaxed text-text-200">
                        We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website, or otherwise when you contact us.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-text-200">
                        <li>Personal Information (Name, Email, Phone Number)</li>
                        <li>Business Information (Company Name, Address, NIB)</li>
                        <li>Financial Information (Bank Account Details)</li>
                        <li>Professional Information (Portfolio, Specializations)</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">3. How We Use Your Information</h2>
                    <p className="leading-relaxed text-text-200">
                        We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">4. Sharing Your Information</h2>
                    <p className="leading-relaxed text-text-200">
                        We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell your personal information to third parties.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">5. Data Security</h2>
                    <p className="leading-relaxed text-text-200">
                        We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-heading font-semibold text-text-50">6. Contact Us</h2>
                    <p className="leading-relaxed text-text-200">
                        If you have questions or comments about this policy, you may email us at <span className="text-brand-500 font-medium">privacy@juara.com</span>.
                    </p>
                </section>
            </div>
        </div>
    );
}
