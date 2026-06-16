'use client';

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input className={`input-field ${error ? 'border-danger-500 focus:ring-danger-500' : ''} ${className}`} {...props} />
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
