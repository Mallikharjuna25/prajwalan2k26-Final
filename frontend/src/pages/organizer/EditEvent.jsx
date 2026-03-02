// EditEvent.jsx - similar structure to CreateEvent but fetches data first
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../api/axios';
import EventFormBuilder from '../../components/organizer/EventFormBuilder';
import toast from 'react-hot-toast';
import { FiImage, FiUploadCloud } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Event Basic Details
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', time: '', endDate: '', endTime: '', venue: '', category: 'Tech', capacity: 100, registrationFee: 0
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [customFields, setCustomFields] = useState([]);

    const categories = ['Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`/events/${id}`);
                // Format date for input type=date
                const formattedDate = new Date(data.date).toISOString().split('T')[0];
                const formattedEndDate = data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : formattedDate;
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    date: formattedDate || '',
                    time: data.time || '',
                    endDate: formattedEndDate || '',
                    endTime: data.endTime || '',
                    venue: data.venue || '',
                    category: data.category || 'Tech',
                    capacity: data.capacity || 100,
                    registrationFee: data.registrationFee !== undefined ? data.registrationFee : 0
                });
                if (data.bannerImage) setImagePreview(`http://localhost:5000${data.bannerImage}`);
                setCustomFields(data.customFields || []);
            } catch (error) {
                toast.error("Failed to load event for editing");
                navigate('/organizer/dashboard');
            } finally {
                setInitialLoading(false);
            }
        }
        fetchEvent();
    }, [id, navigate]);

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

        const startDateTime = new Date(`${formData.date}T${formData.time}`);
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        if (endDateTime <= startDateTime) {
            toast.error('End date & time must be after the event start');
            return;
        }

        setLoading(true);
        try {
            let imagePath = undefined;
            if (bannerImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', bannerImage);
                const uploadRes = await axios.post('/upload', imageFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imagePath = uploadRes.data.imageUrl;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                endDate: formData.endDate,
                endTime: formData.endTime,
                venue: formData.venue,
                category: formData.category,
                capacity: formData.capacity,
                registrationFee: Number(formData.registrationFee),
                customFields,
            };

            if (imagePath) payload.bannerImage = imagePath;

            await axios.put(`/organizer/events/${id}`, payload);
            toast.success('Event updated successfully!');
            navigate('/organizer/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <Loader />

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Edit Event</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Same fields as CreateEvent */}
                <div className="card border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Event Title *</label>
                            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                            <textarea rows="5" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field resize-none" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Start Date *</label>
                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Start Time *</label>
                            <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">End Date *</label>
                            <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="input-field border-pink-500/30 focus:border-pink-500/50" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">End Time *</label>
                            <input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="input-field border-pink-500/30 focus:border-pink-500/50" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Venue *</label>
                            <input type="text" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category *</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input-field">
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Max Capacity *</label>
                            <input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Registration Fee (₹) *</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.registrationFee}
                                onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value === '' ? '' : Number(e.target.value) })}
                                className="input-field border-green-500/30 focus:border-green-500/50 focus:ring-green-500/20"
                                placeholder="0 for Free"
                                required
                            />
                        </div>
                    </div>
                </div>

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
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div className="card border-pink-500/20">
                    <h2 className="text-xl font-bold text-white mb-2 border-b border-surface-border pb-4">Registration Form Fields</h2>
                    <EventFormBuilder customFields={customFields} setCustomFields={setCustomFields} />
                </div>

                <div className="flex justify-end pt-6">
                    <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto md:px-12 py-4">
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditEvent;
