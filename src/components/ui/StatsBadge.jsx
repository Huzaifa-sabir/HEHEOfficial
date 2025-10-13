const StatsBadge = ({children, label, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
      {children}
      <span className="text-white text-sm font-semibold">{label}</span>
    </div>
  );
};

export default StatsBadge