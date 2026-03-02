import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#06b6d4', '#c084fc', '#67e8f9', '#ec4899', '#fef08a'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass px-4 py-3 border border-white/10 rounded-xl shadow-glass">
                <p className="text-gray-300 text-xs tracking-wider uppercase mb-1">{label}</p>
                <p className="text-white font-bold text-lg">{payload[0].value} Events</p>
            </div>
        );
    }
    return null;
};

export const AnalyticsCharts = ({ eventsByMonth, eventsByCategory }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Events By Month */}
            <div className="card">
                <h3 className="text-lg font-bold text-white mb-6">Events Attended per Month</h3>
                <div className="h-72 w-full">
                    {eventsByMonth && eventsByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={eventsByMonth}>
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                    )}
                </div>
            </div>

            {/* Pie Chart: Events By Category */}
            <div className="card">
                <h3 className="text-lg font-bold text-white mb-6">Event Categories</h3>
                <div className="h-72 w-full flex items-center justify-center">
                    {eventsByCategory && eventsByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={eventsByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {eventsByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
                    )}
                </div>

                {/* Custom Legend */}
                {eventsByCategory && eventsByCategory.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                        {eventsByCategory.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-xs text-gray-400">{entry.name} ({entry.value})</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCharts;
