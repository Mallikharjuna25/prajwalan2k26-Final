import { useState } from 'react';
import { FiPlus, FiTrash2, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EventFormBuilder = ({ customFields, setCustomFields }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState({
        fieldName: '',
        fieldType: 'text',
        required: false,
        options: ''
    });

    const handleAddField = () => {
        if (!newField.fieldName.trim()) return;

        const fieldToAdd = {
            ...newField,
            options: newField.fieldType === 'dropdown'
                ? newField.options.split(',').map(o => o.trim()).filter(Boolean)
                : []
        };

        setCustomFields([...customFields, fieldToAdd]);
        setIsAdding(false);
        setNewField({ fieldName: '', fieldType: 'text', required: false, options: '' });
    };

    const removeField = (index) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">

            {/* Default Locked Fields Info */}
            <div className="glass p-4 rounded-xl border-l-4 border-l-primary/50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h4 className="font-semibold text-white">Default Registration Fields</h4>
                    <p className="text-sm text-gray-400">Name, Email, and Register Number are automatically collected from the student's profile.</p>
                </div>
            </div>

            {/* Custom Fields List */}
            <div className="space-y-4">
                <h4 className="font-heading font-semibold text-lg flex items-center gap-2">
                    <FiSettings className="text-primary-light" />
                    Custom Form Fields
                </h4>

                {customFields.length === 0 && !isAdding && (
                    <p className="text-sm text-gray-500 italic">No custom fields added yet.</p>
                )}

                <AnimatePresence>
                    {customFields.map((field, index) => (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            key={index}
                            className="glass p-4 rounded-xl flex items-start justify-between group"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-semibold text-white">{field.fieldName}</span>
                                    {field.required && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Required</span>}
                                </div>
                                <div className="text-sm text-gray-400 flex items-center gap-2">
                                    <span className="uppercase text-xs tracking-wider">{field.fieldType}</span>
                                    {field.fieldType === 'dropdown' && (
                                        <span>• Options: {field.options.join(', ')}</span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => removeField(index)}
                                className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <FiTrash2 />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Add Field Area */}
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-surface-card p-5 rounded-xl border border-primary/30 shadow-neon-cyan/10"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Field Name / Label</label>
                                <input
                                    type="text"
                                    value={newField.fieldName}
                                    onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                                    className="input-field"
                                    placeholder="e.g. T-Shirt Size"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Input Type</label>
                                <select
                                    value={newField.fieldType}
                                    onChange={(e) => setNewField({ ...newField, fieldType: e.target.value })}
                                    className="input-field bg-surface-card"
                                >
                                    <option value="text">Short Text</option>
                                    <option value="number">Number</option>
                                    <option value="dropdown">Dropdown Options</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>
                        </div>

                        {newField.fieldType === 'dropdown' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-1">Options (Comma separated)</label>
                                <input
                                    type="text"
                                    value={newField.options}
                                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                                    className="input-field"
                                    placeholder="Small, Medium, Large"
                                />
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <input
                                type="checkbox"
                                id="req"
                                checked={newField.required}
                                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                                className="w-4 h-4 text-primary bg-surface-card border-gray-600 rounded focus:ring-primary focus:ring-2"
                            />
                            <label htmlFor="req" className="text-sm text-gray-300">Make this field required</label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAddField}
                                className="bg-primary/20 text-primary-light hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Save Field
                            </button>
                            <button
                                onClick={() => setIsAdding(false)}
                                className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-all text-gray-400 hover:text-white p-4 rounded-xl flex items-center justify-center gap-2 font-medium"
                    >
                        <FiPlus /> Add Custom Field
                    </button>
                )}
            </div>

        </div>
    );
};

export default EventFormBuilder;
