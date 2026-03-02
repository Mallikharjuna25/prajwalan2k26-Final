import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import EventFormBuilder from '../../components/organizer/EventFormBuilder';
import toast from 'react-hot-toast';
import { FiImage, FiUploadCloud } from 'react-icons/fi';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Event Basic Details
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        venue: '',
        category: 'Tech',
        capacity: 100,
        registrationFee: 0
    });

    // Image Upload
    const [bannerImage, setBannerImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Custom Fields from Builder
    const [customFields, setCustomFields] = useState([]);

    const categories = ['Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setBannerImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.time || !formData.endDate || !formData.endTime || !formData.venue) {
            toast.error('Please fill required basic details');
            return;
        }

        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (endDateTime <= startDateTime) {
            toast.error('End date & time must be after the event start');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Image if exists
            let imagePath = '';
            if (bannerImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', bannerImage);
                const uploadRes = await axios.post('/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imagePath = uploadRes.data.imageUrl;
            }

            // 2. Create Event
            const payload = {
                ...formData,
                maxParticipants: formData.capacity,
                registrationFee: formData.registrationFee,
                bannerImage: imagePath,
                customFields,
            };

            await axios.post('/organizer/events', payload);
            toast.success('Event created successfully!');
            navigate('/organizer/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
                <p className="text-gray-400">Set up the details and customize the registration form.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="card border-primary/20">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-surface-border pb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Event Title *</label>
                            <input
                                type="text"
                                maxLength="100"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field text-lg"
                                placeholder="e.g. Annual Tech Hackathon 2026"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                            <textarea
                                rows="5"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field resize-none"
                                placeholder="Detailed description of the event..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Start Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Start Time *</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">End Date *</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="input-field border-pink-500/30 focus:border-pink-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">End Time *</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="input-field border-pink-500/30 focus:border-pink-500/50"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Venue *</label>
                            <input
                                type="text"
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                className="input-field"
                                placeholder="Main Auditorium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input-field"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Max Capacity *</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Registration Fee (₹) *</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.registrationFee}
                                onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) || 0 })}
                                className="input-field border-green-500/30 focus:border-green-500/50 focus:ring-green-500/20"
                                placeholder="0 for Free Event"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Banner Upload */}
                <div className="card border-accent/20">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-surface-border pb-4">Event Banner</h2>

                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-surface hover:bg-white/5 transition-colors group relative overflow-hidden">
                        {imagePreview ? (
                            <div className="relative w-full h-64">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <FiUploadCloud /> Change Image
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-surface-border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <FiImage className="text-3xl text-gray-400" />
                                </div>
                                <p className="text-white font-medium mb-1">Click or drag banner image</p>
                                <p className="text-sm text-gray-500">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                                <p className="text-xs text-primary-light mt-2">Recommended size: 1200 x 600px</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                </div>

                {/* Custom Form Builder */}
                <div className="card border-pink-500/20">
                    <h2 className="text-xl font-bold text-white mb-2 border-b border-surface-border pb-4">Registration Form Fields</h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Basic details (Name, Email, College, Reg No) are automatically collected. Add any event-specific fields below.
                    </p>
                    <EventFormBuilder customFields={customFields} setCustomFields={setCustomFields} />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full md:w-auto md:px-12 py-4 text-lg"
                    >
                        {loading ? 'Publishing Event...' : 'Publish Event'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEvent;
