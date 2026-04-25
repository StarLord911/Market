import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { formatDate, formatPrice, initial } from '../utils';

interface Props {
  listing: Listing;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function ListingCard({ listing, isFavorited, onToggleFavorite }: Props) {
  const cover = listing.photos?.[0];

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(listing.id);
  };

  return (
    <Link to={`/listings/${listing.id}`} className="card">
      <div
        className="card-img"
        style={cover ? {
          backgroundImage: `url(${cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          fontSize: 0,
        } : undefined}
      >
        {!cover && initial(listing.title)}
        {onToggleFavorite && (
          <button
            className={`fav-btn${isFavorited ? ' fav-btn--active' : ''}`}
            onClick={handleFav}
            title={isFavorited ? 'Убрать из избранного' : 'В избранное'}
          >
            {isFavorited ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="card-price">{formatPrice(listing.price)}</div>
        <div className="card-title">{listing.title}</div>
        <div className="card-meta">{formatDate(listing.createdAt)}</div>
      </div>
    </Link>
  );
}
