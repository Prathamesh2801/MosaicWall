import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Eye, Edit, Plus } from 'lucide-react';

export default function EntityForm({ fields = [], mode = 'create', data = {}, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('EntityForm useEffect:', { mode, data, fields });
    
    if (mode === 'create') {
      const init = {};
      fields.forEach(f => { 
        init[f.name] = f.default || (f.type === 'checkbox' ? false : '');
      });
      setFormData(init);
      setErrors({});
    } else {
      // For edit/view modes, use the provided data
      setFormData(data || {});
      setErrors({});
    }
  }, [fields, mode, data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const err = {};
    
    fields.forEach(f => {
      const value = formData[f.name];
      
      // Skip validation for auto-generated fields in create mode
      if (mode === 'create' && (f.name.includes('_ID') || f.name.includes('Created_At'))) {
        return;
      }
      
      // Required field validation
      if (f.required && (!value && value !== 0 && value !== false)) {
        err[f.name] = `${f.label} is required`;
        return;
      }
      
      // Custom validation
      if (f.validate && value) {
        const res = f.validate(value, formData);
        if (res !== true) {
          err[f.name] = res || 'Invalid value';
        }
      }
    });
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    if (!validate()) {
      console.log('Validation failed:', errors);
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting form data:', formData);
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f) => {
    const value = formData[f.name] ?? '';
    const isDisabled = mode === 'view' || submitting;
    const isReadOnly = f.readonly || (mode === 'edit' && f.name.includes('_ID'));
    
    const commonProps = {
      name: f.name,
      disabled: isDisabled || isReadOnly,
      placeholder: f.placeholder || `Enter ${f.label.toLowerCase()}`,
      className: `w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
        isDisabled || isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
      } ${errors[f.name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`
    };

    switch (f.type) {
      case 'textarea':
        return (
          <textarea 
            {...commonProps}
            value={value}
            onChange={handleChange}
            rows={f.rows || 4}
          />
        );
        
      case 'select':
        return (
          <select 
            {...commonProps}
            value={value}
            onChange={handleChange}
          >
            <option value="">Select {f.label}</option>
            {f.options?.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={f.name}
              checked={!!value}
              onChange={handleChange}
              disabled={isDisabled || isReadOnly}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="ml-2 text-sm text-gray-300">
              {f.checkboxLabel || 'Enable'}
            </label>
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            {...commonProps}
            value={value}
            onChange={handleChange}
            min={f.min}
            max={f.max}
            step={f.step}
          />
        );
        
      case 'email':
        return (
          <input
            type="email"
            {...commonProps}
            value={value}
            onChange={handleChange}
          />
        );
        
      case 'tel':
        return (
          <input
            type="tel"
            {...commonProps}
            value={value}
            onChange={handleChange}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            value={value}
            onChange={handleChange}
          />
        );
        
      case 'datetime-local':
        return (
          <input
            type="datetime-local"
            {...commonProps}
            value={value}
            onChange={handleChange}
          />
        );
        
      default:
        return (
          <input
            type={f.type || 'text'}
            {...commonProps}
            value={value}
            onChange={handleChange}
          />
        );
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'view': return <Eye className="h-5 w-5" />;
      case 'edit': return <Edit className="h-5 w-5" />;
      case 'create': return <Plus className="h-5 w-5" />;
      default: return <Plus className="h-5 w-5" />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'view': return 'View Details';
      case 'edit': return 'Edit Details';
      case 'create': return 'Create New';
      default: return 'Form';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'view': return 'Viewing record details';
      case 'edit': return 'Update and save changes';
      case 'create': return 'Fill in the details to create a new record';
      default: return 'Form';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                {getModeIcon()}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {getModeTitle()}
                </h2>
                <p className="text-sm text-gray-300">
                  {getModeDescription()}
                </p>
              </div>
            </div>
            
            {mode === 'view' && (
              <div className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30">
                Read Only
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(f => (
              <div 
                key={f.name} 
                className={`space-y-2 ${f.fullWidth ? 'md:col-span-2' : ''}`}
              >
                <label className="block text-sm font-medium text-gray-200">
                  {f.label}
                  {f.required && mode !== 'view' && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                  {f.description && (
                    <span className="text-gray-400 text-xs block mt-1">
                      {f.description}
                    </span>
                  )}
                </label>
                
                {renderField(f)}
                
                {errors[f.name] && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm flex items-center space-x-1"
                  >
                    <span>⚠</span>
                    <span>{errors[f.name]}</span>
                  </motion.p>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-700/50">
            <motion.button 
              type="button" 
              onClick={onCancel}
              className="px-6 py-3 text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg flex items-center space-x-2 transition-colors" 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="h-4 w-4" />
              <span>{mode === 'view' ? 'Close' : 'Cancel'}</span>
            </motion.button>

            {mode !== 'view' && (
              <motion.button 
                type="submit" 
                disabled={submitting}
                className={`px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center space-x-2 transition-all ${
                  submitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {mode === 'edit' ? 'Updating...' : 'Creating...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>
                      {mode === 'edit' ? 'Update' : 'Create'}
                    </span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}