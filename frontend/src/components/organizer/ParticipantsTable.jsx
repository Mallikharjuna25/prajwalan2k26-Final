import { FiCheck, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';

const ParticipantsTable = ({ participants, eventTitle }) => {
    if (!participants || participants.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-gray-400">No participants registered yet.</p>
            </div>
        );
    }

    const handleExportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";

        // Headers
        const customFieldKeys = Object.keys(participants[0]?.customFieldData || {});
        const headers = [
            "Name", "Email", "Reg Number", "College", "Branch",
            "Grad Year", "Registration Date", "Payment Status", "Attended", ...customFieldKeys
        ];
        csvContent += headers.join(",") + "\n";

        // Rows
        participants.forEach(p => {
            const student = p.student || {};
            const row = [
                `"${p.studentName}"`,
                `"${p.studentEmail}"`,
                `"${p.registerNumber}"`,
                `"${student.collegeName || 'N/A'}"`,
                `"${student.branch || 'N/A'}"`,
                `"${student.graduationYear || 'N/A'}"`,
                `"${format(new Date(p.registeredAt), 'yyyy-MM-dd HH:mm')}"`,
                `"${p.paymentStatus || 'FREE'}"`,
                `"${p.attended ? 'Yes' : 'No'}"`,
            ];

            customFieldKeys.forEach(k => {
                row.push(`"${p.customFieldData?.[k] || ''}"`);
            });

            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${eventTitle.replace(/\s+/g, '_')}_Participants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                >
                    <FiDownload /> Export CSV
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-surface-border">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="text-xs uppercase bg-surface-card border-b border-surface-border text-gray-400">
                        <tr>
                            <th className="px-6 py-4 font-semibold tracking-wider">Participant</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Reg No</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">College</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Custom Fields</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Payment</th>
                            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border bg-surface">
                        {participants.map((p) => {
                            const customFields = p.customFieldData ? Object.entries(p.customFieldData) : [];

                            return (
                                <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white mb-0.5">{p.studentName}</div>
                                        <div className="text-xs text-gray-500">{p.studentEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{p.registerNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-[150px] truncate" title={p.student?.collegeName}>
                                            {p.student?.collegeName || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {customFields.length > 0 ? (
                                            <div className="space-y-1 text-xs max-w-[200px]">
                                                {customFields.map(([key, value]) => (
                                                    <div key={key} className="truncate" title={`${key}: ${value}`}>
                                                        <span className="text-gray-500">{key}:</span> <span className="text-white">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 text-xs italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex py-1 px-2.5 rounded-full text-xs font-medium border
                                            ${p.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                                            ${p.paymentStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                                            ${(!p.paymentStatus || p.paymentStatus === 'FREE') ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : ''}
                                        `}>
                                            {p.paymentStatus || 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.attended ? (
                                            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                <FiCheck /> Attended
                                            </span>
                                        ) : (
                                            <span className="inline-flex py-1 px-2.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipantsTable;
