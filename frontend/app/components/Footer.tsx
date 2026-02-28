import Link from "next/link";
import React from "react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-white/5 bg-black text-white/50 py-12 mt-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">

                    {/* Brand/Copyright Info */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <h3 className="text-xl font-bold tracking-tight text-white/90">
                            Paynexus
                        </h3>
                        <p className="text-sm max-w-xs text-center md:text-left">
                            Payment Infrastructure for the AI Era. Global, compliant, and zero-friction.
                        </p>
                        <p className="text-xs pt-2">
                            &copy; {currentYear} Paynexus Inc. All rights reserved.
                        </p>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm text-center md:text-left">

                        {/* Nav Links */}
                        <div className="flex flex-col space-y-3">
                            <h4 className="font-semibold text-white/80 mb-1">Company</h4>
                            <Link href="#" className="hover:text-white transition-colors duration-200">About</Link>
                            <Link href="#" className="hover:text-white transition-colors duration-200">Careers</Link>
                            <Link href="#" className="hover:text-white transition-colors duration-200">Blog</Link>
                        </div>

                        {/* Support Links */}
                        <div className="flex flex-col space-y-3">
                            <h4 className="font-semibold text-white/80 mb-1">Support</h4>
                            <Link href="/help" className="hover:text-white transition-colors duration-200">Help Center</Link>
                            <Link href="/help" className="hover:text-white transition-colors duration-200">Contact Us</Link>
                            <Link href="https://paynexus-docs.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">API Docs</Link>
                        </div>

                        {/* Legal Links */}
                        <div className="flex flex-col space-y-3 col-span-2 md:col-span-1">
                            <h4 className="font-semibold text-white/80 mb-1">Legal</h4>
                            <Link href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</Link>
                            <Link href="/compliance" className="hover:text-white transition-colors duration-200">Compliance Info</Link>
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}
