import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

import { FiUploadCloud, FiFileText, FiX, FiCheckCircle } from 'react-icons/fi';

const StudentSignup = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', collegeName: '', branch: '', graduationYear: '', registerNumber: '', password: '', confirmPassword: ''
    });
    const [idCardFile, setIdCardFile] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // NEW: Verification States
    const [verifying, setVerifying] = useState(false);
    const [verificationData, setVerificationData] = useState(null);
    const [verificationId, setVerificationId] = useState(null);

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setIdCardFile(null);
            setIdCardPreview(null);
            return;
        }

        // Validate size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            e.target.value = null;
            return;
        }

        // Validate type
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
            toast.error('Only JPG, PNG, and PDF files are allowed');
            e.target.value = null;
            return;
        }

        setIdCardFile(file);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdCardPreview(reader.result);
                // Trigger auto-verification when file is selected
                autoVerify(file, formData.name, formData.registerNumber);
            };
            reader.readAsDataURL(file);
        } else {
            setIdCardPreview('pdf'); // Indicator for PDF
            toast.error('Please upload a valid image (JPG/PNG) for verification.');
            e.target.value = null;
            setIdCardFile(null);
        }
    };

    const autoVerify = async (file, name, regNo) => {
        if (!name || !regNo) {
            toast.error('Please enter Name and Register Number before uploading ID');
            return;
        }

        setVerifying(true);
        setVerificationData(null);

        const fd = new FormData();
        fd.append('idCardImage', file);
        fd.append('enteredName', name);
        fd.append('enteredRegNo', regNo);

        try {
            const { data } = await axios.post('/verify/id-card', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVerificationData(data);
            setVerificationId(data.verificationId);

            if (data.rejected) {
                // Technically this won't hit due to engine updates, but fallback
                toast.error(data.message || 'Verification Failed');
            } else if (data.autoApproved) {
                toast.success('ID Card Verified Successfully');
            } else {
                toast.success('Submitted for Manual Review');
            }
        } catch (error) {
            setVerificationData({
                rejected: true,
                message: error.response?.data?.error || 'Verification Service Error'
            });
            toast.error('Verification failed. Plase try a clearer photo.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).some(val => !val)) {
            toast.error('Please fill in all fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!verificationId) {
            toast.error('You must pass ID verification first');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                graduationYear: parseInt(formData.graduationYear),
                verificationId: verificationId
            };
            delete payload.confirmPassword;

            const { data } = await axios.post('/auth/student/signup', payload);
            toast.success(data.message || 'Registration successful!');
            navigate('/review-pending');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-6 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-surface/90"></div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-heading font-bold text-gradient inline-block mb-2">EventNexus</Link>
                    <h2 className="text-2xl font-bold text-white">Student Registration</h2>
                </div>

                <div className="card shadow-neon">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">College Name</label>
                                <input type="text" value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Register / Roll Number</label>
                                <input type="text" value={formData.registerNumber} onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Branch / Course</label>
                                <input type="text" value={formData.branch} onChange={(e) => setFormData({ ...formData, branch: e.target.value })} className="input-field" placeholder="e.g. Computer Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Graduation Year</label>
                                <input type="number" value={formData.graduationYear} onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })} className="input-field" placeholder="e.g. 2026" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-field" />
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="mt-6 border-t border-white/10 pt-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Upload Student ID Card *</label>

                            {!idCardFile ? (
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-surface/50">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,application/pdf"
                                        required
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="id-upload"
                                    />
                                    <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary-light mb-3">
                                            <FiUploadCloud className="text-2xl" />
                                        </div>
                                        <span className="text-white font-medium mb-1">Click to upload</span>
                                        <span className="text-xs text-gray-500">📎 Only Image files (JPG/PNG). Must enter Name & Reg Number first!</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="border border-white/20 rounded-xl p-4 flex items-center justify-between bg-surface/80">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                                            {idCardPreview === 'pdf' ? (
                                                <FiFileText className="text-3xl text-red-400" />
                                            ) : (
                                                <img src={idCardPreview} alt="ID Preview" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5 text-green-400 font-medium text-sm mb-1">
                                                <FiCheckCircle /> ID Card uploaded
                                            </div>
                                            <span className="text-white text-sm font-medium line-clamp-1 break-all">{idCardFile.name}</span>
                                            <span className="text-xs text-gray-500">{(idCardFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIdCardFile(null);
                                            setIdCardPreview(null);
                                        }}
                                        className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20 transition-colors"
                                    >
                                        Change File
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* LIVE VERIFICATION STATUS UI */}
                        {(verifying || verificationData) && (
                            <div className={`p-5 rounded-xl border mt-4 transition-all ${verifying ? 'border-primary/50 bg-primary/10 animate-pulse' :
                                verificationData?.autoApproved ? 'border-green-500/50 bg-green-500/10' :
                                    verificationData?.requiresReview ? 'border-yellow-500/50 bg-yellow-500/10' :
                                        'border-red-500/50 bg-red-500/10'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 ${verifying ? 'border-primary border-t-transparent animate-spin' :
                                            verificationData?.autoApproved ? 'border-green-500 bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                                                verificationData?.requiresReview ? 'border-yellow-500 bg-yellow-600' :
                                                    'border-red-500 bg-red-600'
                                            }`}>
                                            {verifying ? '' : `${verificationData?.finalScore || 0}`}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${verifying ? 'text-primary' :
                                            verificationData?.autoApproved ? 'text-green-400' :
                                                verificationData?.requiresReview ? 'text-yellow-400' :
                                                    'text-red-400'
                                            }`}>
                                            {verifying ? 'Verifying AI Authenticity...' :
                                                verificationData?.autoApproved ? 'Verification Passed!' :
                                                    'Manual Review Required'}
                                        </h4>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {verifying ? 'Running OCR & Fraud checks...' :
                                                verificationData?.message}
                                        </p>
                                    </div>
                                </div>

                                {!verifying && verificationData?.redFlags?.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <span className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 block">Detected Flags:</span>
                                        <ul className="text-xs text-red-300 space-y-1 ml-4 list-disc">
                                            {verificationData.redFlags.map((flag, idx) => (
                                                <li key={idx}>{flag}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || verifying || !verificationData}
                            className={`btn-primary w-full mt-8 ${(!verificationData) ? 'opacity-50 cursor-not-allowed bg-gray-600 hover:bg-gray-600' : ''
                                }`}
                        >
                            {loading ? 'Submitting...' :
                                verifying ? 'Verifying Identity...' :
                                    'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Already have an account? <Link to="/student/login" className="text-primary-light hover:text-primary transition-colors font-semibold">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSignup;
