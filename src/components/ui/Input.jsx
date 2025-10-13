const Input = ({ label, type = 'text', placeholder, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-white text-sm font-medium">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-[#8abcb9] focus:outline-none focus:ring-2 focus:ring-[#8abcb9]/10 transition-all duration-300 ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input