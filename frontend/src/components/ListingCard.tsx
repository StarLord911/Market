import { Link } from 'react-router-dom';
import type { Listing } from '../types';
import { formatDate, formatPrice, initial } from '../utils';

export default function ListingCard({ listing }: { listing: Listing }) {
  const cover = listing.photos?.[0];
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
      </div>
      <div className="card-body">
        <div className="card-price">{formatPrice(listing.price)}</div>
        <div className="card-title">{listing.title}</div>
        <div className="card-meta">{formatDate(listing.createdAt)}</div>
      </div>
    </Link>
  );
}
