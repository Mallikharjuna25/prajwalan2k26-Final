import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill all fields");
            return;
        }
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Message sent successfully! We will get back to you soon.");
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-6">

                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Get in <span className="text-gradient">Touch</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg"
                    >
                        Have a question, feedback, or need help setting up your institution? Send us a message and our team will respond quickly.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass p-8 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all"></div>
                            <h3 className="text-2xl font-bold mb-8 text-white">Contact Information</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface shadow-inner border border-white/10 flex items-center justify-center shrink-0">
                                        <FiMail className="text-primary-light text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase mb-1">Email Us</p>
                                        <p className="text-lg text-white font-medium">support@eventnexus.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface shadow-inner border border-white/10 flex items-center justify-center shrink-0">
                                        <FiPhone className="text-primary-light text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase mb-1">Call Us</p>
                                        <p className="text-lg text-white font-medium">+1 (555) 123-4567</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-surface shadow-inner border border-white/10 flex items-center justify-center shrink-0">
                                        <FiMapPin className="text-primary-light text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase mb-1">Headquarters</p>
                                        <p className="text-lg text-white font-medium">Innovation Hub, Silicon Valley, CA 94025</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dev Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 shrink-0"></div>
                                <div>
                                    <p className="font-bold text-white text-sm">Tech Lead</p>
                                    <p className="text-xs text-primary-light">Frontend Master</p>
                                </div>
                            </div>
                            <div className="glass p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-500 shrink-0"></div>
                                <div>
                                    <p className="font-bold text-white text-sm">Backend Lead</p>
                                    <p className="text-xs text-accent">API Architect</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    >
                        <form onSubmit={handleSubmit} className="glass border border-white/10 p-8 rounded-3xl shadow-glass flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-neon"></div>

                            <h3 className="text-2xl font-bold mb-6 text-white">Send a Message</h3>

                            <div className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field bg-surface/50 border-white/10"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field bg-surface/50 border-white/10"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Your Message</label>
                                    <textarea
                                        rows="5"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="input-field bg-surface/50 border-white/10 resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full mt-8 flex justify-center items-center gap-2"
                            >
                                {loading ? "Sending..." : <><FiSend /> Send Message</>}
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;
