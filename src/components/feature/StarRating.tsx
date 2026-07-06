export default function StarRating({ rating = 5, size = 'sm' }: { rating?: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'text-base' : 'text-[11px]';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`ri-star-fill ${sizeClass} ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );
}