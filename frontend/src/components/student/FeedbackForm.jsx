import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';

const FeedbackForm = ({ eventId, registrationId, onFeedbackSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    useEffect(() => {
        const checkExistingFeedback = async () => {
            try {
                const { data } = await axios.get(`/feedback/check/${eventId}`);
                if (data.hasGivenFeedback) {
                    setAlreadySubmitted(true);
                }
            } catch (error) {
                console.error("Failed to check feedback status", error);
            } finally {
                setHasChecked(true);
            }
        };
        checkExistingFeedback();
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('/feedback/submit', {
                eventId,
                registrationId,
                rating,
                feedbackText
            });
            toast.success("Thank you for your feedback!");
            setAlreadySubmitted(true);
            if (onFeedbackSubmitted) {
                onFeedbackSubmitted();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit feedback");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!hasChecked) return null;
    if (alreadySubmitted) return null;

    return (
        <div className="bg-surface-card border border-primary/20 rounded-xl p-5 mt-6">
            <h4 className="text-lg font-bold text-white mb-2">Rate This Event</h4>
            <p className="text-sm text-gray-400 mb-4">How was your experience? Your feedback helps organizers improve.</p>

            <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <FiStar
                                className={`text-2xl ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                            />
                        </button>
                    ))}
                    <span className="ml-3 text-sm font-semibold text-primary-light">
                        {rating > 0 ? `${rating} / 5` : 'Select a rating'}
                    </span>
                </div>

                <div className="mb-4">
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Share details of your experience (optional)"
                        className="w-full bg-surface/50 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                        rows="3"
                        maxLength="1000"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
