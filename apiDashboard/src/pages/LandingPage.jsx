import conceptImage from '../assets/concept-image.png'
import conceptImage2 from '../assets/Concept-image2.png'
import NavBar from '../components/NavBar'

const GenericIcon = ({ className = '' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 12h6" />
        <path d="M12 9v6" />
    </svg>
);

const ArrowRight = ({ className = '' }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <path d="M5 12h14" />
        <path d="M13 5l7 7-7 7" />
    </svg>
);

const ShieldCheck = GenericIcon;
const Server = GenericIcon;
const Activity = GenericIcon;
const Users = GenericIcon;
const Code = GenericIcon;
const CheckCircle2 = GenericIcon;
const Headphones = GenericIcon;
const Zap = GenericIcon;
const Globe = GenericIcon;

const Hero = () => (
    <div className="relative pt-20 pb-20 lg:pt-28 lg:pb-32 overflow-hidden bg-slate-50">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-green-200/40 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-green-100 text-green-700 font-semibold text-sm mb-6 shadow-sm">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
                        </span>
                        Enterprise-Grade WhatsApp Solutions
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-[1.1]">
                        Reliable WhatsApp API & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">Fully Managed</span> Accounts.
                    </h1>
                    <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                        We deliver uncompromising quality and 99.99% uptime. From complex API integrations to green-tick verification and daily account management, we handle it all.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-green-300/50 flex items-center justify-center gap-2">
                            Talk to an Expert
                        </button>
                        <button className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm">
                            Explore Services
                        </button>
                    </div>
                    <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> No Setup Fees</div>
                        <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-[#25D366]" /> 24/7 Priority Support</div>
                    </div>
                </div>

                {/* Visual Mockup Area */}
                <div className="relative lg:ml-auto w-full max-w-lg">
                    <div className="relative z-10 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
                        <img
                            src={conceptImage}
                            alt="WhatsApp onboarding dashboard preview"
                            className="block h-full w-full object-cover"
                        />
                    </div>
                    {/* Decorative background elements */}
                    <div className="absolute top-10 -right-10 w-full h-full bg-[#128C7E]/5 rounded-2xl -z-10 blur-sm"></div>
                    <div className="absolute -bottom-10 -left-10 w-full h-full bg-[#25D366]/5 rounded-2xl -z-10 blur-sm"></div>
                </div>
            </div>
        </div>
    </div>
);

const Stats = () => (
    <div className="bg-[#128C7E] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
                <div>
                    <div className="text-4xl font-extrabold text-white mb-1">99.99%</div>
                    <div className="text-green-100 font-medium">API Uptime Guaranteed</div>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-white mb-1">50M+</div>
                    <div className="text-green-100 font-medium">Messages Processed Daily</div>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-white mb-1">500+</div>
                    <div className="text-green-100 font-medium">Enterprise Clients</div>
                </div>
                <div>
                    <div className="text-4xl font-extrabold text-white mb-1">&lt; 15ms</div>
                    <div className="text-green-100 font-medium">Average Latency</div>
                </div>
            </div>
        </div>
    </div>
);

function buildServiceBackground(svgMarkup) {
    return `url("data:image/svg+xml,${encodeURIComponent(svgMarkup)}")`;
}

const serviceBackgrounds = {
    integration: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#ecfdf5"/>
            <circle cx="120" cy="110" r="46" fill="#6ee7b7" opacity="0.85"/>
            <circle cx="300" cy="210" r="52" fill="#a7f3d0" opacity="0.75"/>
            <circle cx="470" cy="110" r="42" fill="#34d399" opacity="0.65"/>
            <circle cx="470" cy="310" r="50" fill="#bbf7d0" opacity="0.85"/>
            <path d="M160 120 L248 192 L422 120" stroke="#0f766e" stroke-width="10" stroke-linecap="round" opacity="0.7" fill="none"/>
            <path d="M340 244 L430 292" stroke="#0f766e" stroke-width="10" stroke-linecap="round" opacity="0.7" fill="none"/>
            <rect x="90" y="265" width="180" height="86" rx="18" fill="#d1fae5" opacity="0.92"/>
        </svg>
    `),
    verification: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#f0fdf4"/>
            <circle cx="300" cy="210" r="120" fill="#86efac" opacity="0.35"/>
            <path d="M300 80 L410 120 L430 245 C430 310 378 350 300 384 C222 350 170 310 170 245 L190 120 Z" fill="#ffffff" opacity="0.96"/>
            <path d="M245 220 L287 262 L360 176" stroke="#15803d" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg> 
    `),
    management: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#ecfeff"/>
            <rect x="90" y="88" width="180" height="230" rx="24" fill="#ffffff" opacity="0.95"/>
            <rect x="330" y="118" width="180" height="200" rx="24" fill="#cffafe" opacity="0.92"/>
            <circle cx="180" cy="150" r="34" fill="#67e8f9"/>
            <circle cx="420" cy="172" r="30" fill="#22d3ee"/>
            <rect x="132" y="210" width="96" height="14" rx="7" fill="#155e75" opacity="0.35"/>
            <rect x="132" y="242" width="108" height="14" rx="7" fill="#155e75" opacity="0.18"/>
            <rect x="372" y="226" width="96" height="14" rx="7" fill="#155e75" opacity="0.35"/>
            <rect x="372" y="258" width="78" height="14" rx="7" fill="#155e75" opacity="0.18"/>
        </svg>
    `),
    workflows: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#f5f3ff"/>
            <rect x="90" y="90" width="120" height="70" rx="18" fill="#ffffff"/>
            <rect x="245" y="176" width="120" height="70" rx="18" fill="#e9d5ff"/>
            <rect x="400" y="262" width="120" height="70" rx="18" fill="#ddd6fe"/>
            <path d="M210 125 H280" stroke="#7c3aed" stroke-width="12" stroke-linecap="round"/>
            <path d="M265 110 L290 125 L265 140" fill="none" stroke="#7c3aed" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M365 211 H435" stroke="#7c3aed" stroke-width="12" stroke-linecap="round"/>
            <path d="M420 196 L445 211 L420 226" fill="none" stroke="#7c3aed" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="120" cy="302" r="56" fill="#c4b5fd" opacity="0.45"/>
        </svg>
    `),
    campaigns: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#fff7ed"/>
            <path d="M150 255 L280 205 L280 120 L150 165 Z" fill="#ffffff"/>
            <rect x="118" y="246" width="42" height="88" rx="16" fill="#fdba74"/>
            <path d="M280 138 C360 150 420 188 470 248" stroke="#ea580c" stroke-width="16" stroke-linecap="round" fill="none" opacity="0.82"/>
            <path d="M306 108 C396 120 470 166 532 226" stroke="#fb923c" stroke-width="11" stroke-linecap="round" fill="none" opacity="0.58"/>
            <circle cx="456" cy="254" r="56" fill="#fed7aa" opacity="0.45"/>
        </svg>
    `),
    analytics: buildServiceBackground(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420">
            <rect width="600" height="420" fill="#eff6ff"/>
            <rect x="110" y="210" width="52" height="120" rx="14" fill="#dbeafe"/>
            <rect x="198" y="168" width="52" height="162" rx="14" fill="#bfdbfe"/>
            <rect x="286" y="132" width="52" height="198" rx="14" fill="#93c5fd"/>
            <rect x="374" y="94" width="52" height="236" rx="14" fill="#60a5fa"/>
            <path d="M112 126 C172 142 222 84 286 112 C346 136 392 62 482 88" stroke="#2563eb" stroke-width="12" stroke-linecap="round" fill="none"/>
            <circle cx="482" cy="88" r="18" fill="#2563eb"/>
        </svg>
    `),
};

const ServiceCard = ({ icon, title, description, backgroundImage }) => {
    const IconComponent = icon;

    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-200/60"
            style={{
                backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.5) 30%, rgba(255, 255, 255, 0.88) 100%), ${backgroundImage}`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-emerald-400/10 opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative flex min-h-[250px] flex-col justify-start p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white/70 backdrop-blur-sm transition-colors group-hover:bg-white/85">
                    <IconComponent className="w-5 h-5 text-[#128C7E] transition-colors" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-700">{description}</p>
            </div>
        </div>
    );
};

const Services = () => (
    <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-sm font-bold text-[#25D366] uppercase tracking-wider mb-2">Our Capabilities</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">End-to-End WhatsApp Solutions</h3>
                <p className="text-lg text-slate-600">We don't just give you an API key. We provide a complete suite of services to ensure your customer communication is flawless, compliant, and highly effective.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ServiceCard
                    icon={Code}
                    title="Robust API Integration"
                    description="Seamlessly connect WhatsApp to your CRM, ERP, or custom software. Built for developers, designed for absolute reliability."
                    backgroundImage={serviceBackgrounds.integration}
                />
                <ServiceCard
                    icon={ShieldCheck}
                    title="Green Tick Verification"
                    description="We navigate Meta's strict policies to get your business the Official Business Account status (Green Tick) quickly and efficiently."
                    backgroundImage={serviceBackgrounds.verification}
                />
                <ServiceCard
                    icon={Headphones}
                    title="Full Account Management"
                    description="Focus on your business while our dedicated team manages your WhatsApp templates, policy compliance, and account health daily."
                    backgroundImage={serviceBackgrounds.management}
                />
                <ServiceCard
                    icon={Zap}
                    title="Automated Workflows"
                    description="Deploy intelligent chatbots and automated reply systems that handle customer queries 24/7 without human intervention."
                    backgroundImage={serviceBackgrounds.workflows}
                />
                <ServiceCard
                    icon={Users}
                    title="Campaign Management"
                    description="Execute massive broadcast campaigns safely. We manage send rates, optimize message quality, and ensure you avoid bans."
                    backgroundImage={serviceBackgrounds.campaigns}
                />
                <ServiceCard
                    icon={Activity}
                    title="Advanced Analytics"
                    description="Gain deep insights into message delivery, open rates, and conversion metrics through our proprietary reporting dashboards."
                    backgroundImage={serviceBackgrounds.analytics}
                />
            </div>
        </div>
    </section>
);

const Reliability = () => (
    <section id="reliability" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Quality & Reliability Are In Our DNA</h2>
                    <p className="text-lg text-slate-600 mb-8">When your business depends on customer communication, downtime is not an option. Our infrastructure and processes are built to deliver perfection.</p>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="mt-1 bg-green-100 p-2 rounded-full h-fit">
                                <Server className="w-5 h-5 text-[#128C7E]" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">Redundant Infrastructure</h4>
                                <p className="text-slate-600">Multi-region server deployment ensures that even if one node fails, your messaging traffic routes automatically with zero drops.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-1 bg-green-100 p-2 rounded-full h-fit">
                                <ShieldCheck className="w-5 h-5 text-[#128C7E]" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">Strict Data Security</h4>
                                <p className="text-slate-600">End-to-end encryption combined with SOC2 compliant servers means your customer data is always protected and private.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-1 bg-green-100 p-2 rounded-full h-fit">
                                <Globe className="w-5 h-5 text-[#128C7E]" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">Meta Compliance Experts</h4>
                                <p className="text-slate-600">Our account managers proactively monitor policy changes from Meta to ensure your templates and broadcasts never result in account blocks.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Abstract Server/Reliability Visual */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#25D366] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#128C7E] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                    <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/20 backdrop-blur-sm">
                        <img
                            src={conceptImage2}
                            alt="WhatsApp reliability and support dashboard"
                            className="block min-h-[280px] w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="mb-6 flex justify-center md:justify-start">
                    <img
                        src="/company-logo.jpg"
                        alt="Manuen Infotech logo"
                        className="ml-20 h-12 w-auto rounded-xl object-contain"
                    />
                </div>
                <p className="max-w-md text-center text-slate-400 leading-relaxed  md:text-left">
                    The industry leader in premium WhatsApp Business API integration and fully managed account services. We ensure your communication never drops.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Solutions</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">API Integration</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Account Management</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Green Tick Verification</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Chatbot Automation</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Company</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Contact Support</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} MANUEN INFOTECH. All rights reserved.</p>
        </div>
    </footer>
);

export default function LandingPage({ activePath, onNavigate }) {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-green-200 selection:text-green-900">
            <NavBar
                activePath={activePath}
                onNavigate={onNavigate}
            />
            <Hero />
            <Stats />
            <Services />
            <Reliability />
            <Footer />
        </div>
    );
}
