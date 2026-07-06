import { Link } from 'react-router-dom';
import StarRating from './StarRating';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    media: { url: string; type: string }[];
    product_categories?: { id: number; name: string };
  };
  badge?: 'bestseller' | 'new' | 'sale' | null;
  rating?: number;
  reviewCount?: number;
  showCategory?: boolean;
  compact?: boolean;
  variant?: 'default' | 'horizontal';
}

export default function ProductCard({
  product,
  badge,
  rating = 5,
  reviewCount,
  showCategory = true,
  compact = false,
  variant = 'default',
}: ProductCardProps) {
  const badgeConfig = {
    bestseller: { text: 'Najprodavanije', bg: 'bg-red-500', textColor: 'text-white' },
    new: { text: 'Novo', bg: 'bg-emerald-500', textColor: 'text-white' },
    sale: { text: 'Akcija', bg: 'bg-brand-600', textColor: 'text-white' },
  };

  const hasPrice = product.price && product.price > 0;

  const stockUrgency = product.stock <= 3 && product.stock > 0
    ? '🔥 Preostalo samo ' + product.stock + ' kom.'
    : product.stock > 0
    ? 'Na stanju'
    : 'Nema na stanju';

  if (variant === 'horizontal') {
    return (
      <div className="group flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-xl border border-gray-100 hover:border-brand-200 transition-all duration-300 hover:shadow-lg">
        <Link to={'/proizvod/' + product.id} className="block p-3">
          <div className="relative bg-[#F8FBF8] rounded-lg p-3 mb-3">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={product.media?.[0]?.url}
                alt={product.name}
                className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {badge && (
              <span className={'absolute top-2 left-2 ' + badgeConfig[badge].bg + ' ' + badgeConfig[badge].textColor + ' text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full'}>
                {badgeConfig[badge].text}
              </span>
            )}
          </div>
          <div>
            {showCategory && product.product_categories && (
              <p className="text-[10px] text-brand-600 font-semibold tracking-wide uppercase mb-1">
                {product.product_categories.name}
              </p>
            )}
            <h3 className="text-[13px] font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 min-h-[2.4rem]">
              {product.name}
            </h3>
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={rating} />
              {reviewCount !== undefined && (
                <span className="text-[11px] text-gray-400">({reviewCount})</span>
              )}
            </div>
            {hasPrice ? (
              <p className="text-lg font-bold text-gray-900 mb-2">
                {product.price.toLocaleString('sr-RS')}
                <span className="text-[13px] font-medium text-gray-400 ml-1">RSD</span>
              </p>
            ) : (
              <p className="text-[13px] font-semibold text-brand-600 mb-2">Kontakt za upit</p>
            )}
            <span className="block bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-semibold py-2 rounded-lg transition-colors text-center">
              Saznaj više
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <Link
      to={'/proizvod/' + product.id}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-200 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
    >
      <div className={'relative bg-[#FFFDF9] ' + (compact ? 'p-3' : 'p-4 md:p-5')}>
        <div className={'relative ' + (compact ? 'aspect-[4/3]' : 'aspect-square') + ' overflow-hidden'}>
          <img
            src={product.media?.[0]?.url}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        {badge && (
          <span className={'absolute top-3 left-3 ' + badgeConfig[badge].bg + ' ' + badgeConfig[badge].textColor + ' text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm'}>
            {badgeConfig[badge].text}
          </span>
        )}
        {!badge && product.stock > 0 && product.stock <= 5 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm">
            Skoro rasprodato
          </span>
        )}
      </div>
      <div className={compact ? 'px-3 pb-3 pt-1' : 'px-4 md:px-5 pb-5 pt-1'}>
        {showCategory && product.product_categories && (
          <p className="text-[11px] text-brand-600 font-semibold tracking-wide uppercase mb-1">
            {product.product_categories.name}
          </p>
        )}
        <h3 className={'font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 ' + (compact ? 'text-[12px] min-h-[2.2rem]' : 'text-[13px] md:text-sm min-h-[2.4rem]')}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={rating} />
          {reviewCount !== undefined && (
            <span className="text-[11px] text-gray-400">({reviewCount})</span>
          )}
        </div>
        {hasPrice ? (
          <p className="text-lg font-bold text-gray-900">
            {product.price.toLocaleString('sr-RS')}
            <span className="text-[13px] font-medium text-gray-400 ml-1">RSD</span>
          </p>
        ) : (
          <p className="text-[13px] font-semibold text-brand-600">Kontakt za upit</p>
        )}
        <p className={'mt-1.5 text-[11px] font-medium ' + (product.stock > 0 ? 'text-emerald-600' : 'text-red-500')}>
          {stockUrgency}
        </p>
      </div>
    </Link>
  );
}
