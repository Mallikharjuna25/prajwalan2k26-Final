export const getEventStatus = (event) => {
    if (!event || !event.date || !event.endDateTime) return "PENDING"; // Fallback

    const now = new Date();
    if (event.status === 'CANCELLED') return "CANCELLED";

    // Reconstruct start date time safely regardless of backend date formatting
    const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0];
    const startDateTime = new Date(`${datePart}T${event.time || '00:00'}:00`);
    const endDateTime = new Date(event.endDateTime);

    if (endDateTime < now) return "COMPLETED";
    if (startDateTime <= now && endDateTime >= now) return "ONGOING";

    const timeDiff = startDateTime.getTime() - now.getTime();
    if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) return "UPCOMING";
    if (timeDiff > 0) return "PENDING";

    return "UNKNOWN";
};
