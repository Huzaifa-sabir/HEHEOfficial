const Textarea = ({ label, placeholder, rows = 4, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-white text-sm font-medium">{label}</label>}
      <textarea
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#8abcb9] focus:outline-none focus:ring-2 focus:ring-[#8abcb9]/10 transition-all duration-300 resize-none ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea