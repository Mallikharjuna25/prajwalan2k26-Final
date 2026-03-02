import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import ParticipantsTable from '../../components/organizer/ParticipantsTable';
import { FiArrowLeft, FiUsers, FiCheckCircle } from 'react-icons/fi';

const EventParticipants = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const [eventRes, partRes] = await Promise.all([
                    axios.get(`/events/${id}`),
                    axios.get(`/organizer/events/${id}/participants`)
                ]);
                setEvent(eventRes.data);
                setParticipants(partRes.data);
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, [id]);

    if (loading) return <Loader />;
    if (!event) return <div className="text-white">Event not found</div>;

    const attendedCount = participants.filter(p => p.attended).length;

    return (
        <div>
            <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <FiArrowLeft /> Back to Events
            </Link>

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Guest List: {event.title}</h1>
                    <p className="text-gray-400">Manage all registered participants for this event.</p>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="card p-5 border-primary/20 bg-surface/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary-light">
                            <FiUsers className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Registered</p>
                            <h3 className="text-2xl font-bold text-white">{participants.length} <span className="text-sm text-gray-500 font-normal">/ {event.capacity}</span></h3>
                        </div>
                    </div>
                </div>

                <div className="card p-5 border-green-500/20 bg-surface/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                            <FiCheckCircle className="text-xl" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Attended</p>
                            <h3 className="text-2xl font-bold text-white">{attendedCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-0 overflow-hidden border-surface-border">
                <ParticipantsTable participants={participants} eventTitle={event.title} />
            </div>
        </div>
    );
};

export default EventParticipants;
