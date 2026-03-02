import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiCpu, FiAward } from 'react-icons/fi';

const AboutPage = () => {
    return (
        <div className="min-h-screen pt-28 pb-20 overflow-hidden">

            {/* Hero */}
            <div className="container mx-auto px-6 mb-24 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-6xl font-bold mb-6"
                >
                    About <span className="text-gradient">EventNexus</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
                >
                    We are on a mission to democratize collegiate event management. By providing a centralized, secure, and highly efficient platform, we bridge the gap between enthusiastic students and visionary event organizers.
                </motion.p>
            </div>

            {/* Grid of Values */}
            <div className="container mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="card p-10 bg-surface/80 border-primary/20 hover:border-primary/50 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center mb-6">
                            <FiTarget className="text-3xl text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            To eliminate the chaos of spreadsheets, physical tickets, and disorganized promotions. We aim to provide an elegant, unified ecosystem for all college activities.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                        className="card p-10 bg-surface/80 border-accent/20 hover:border-accent/50 transition-colors"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center mb-6">
                            <FiUsers className="text-3xl text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">For Everyone</h3>
                        <p className="text-gray-400 leading-relaxed text-lg">
                            Whether you are an attendee looking for the next hackathon, or a college committee hosting a national-level cultural fest, our tools scale to meet your needs perfectly.
                        </p>
                    </motion.div>

                </div>
            </div>

            {/* Tech Section */}
            <div className="relative py-24 bg-surface-card border-y border-white/5">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-16">Powered by the Future</h2>

                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-70">
                        <div className="flex flex-col items-center gap-4">
                            <FiCpu className="text-5xl text-primary" />
                            <span className="font-heading font-semibold tracking-wider uppercase">Smart Architecture</span>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <FiAward className="text-5xl text-accent" />
                            <span className="font-heading font-semibold tracking-wider uppercase">Secure Ecosystem</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AboutPage;
