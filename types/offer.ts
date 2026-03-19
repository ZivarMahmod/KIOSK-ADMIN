export interface OfferProduct {
  namn: string;
  antal: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  products: OfferProduct[];
  discount: number;
  offerPrice: number;
  isMainOffer: boolean;
  userId: string;
  createdAt: any;
}

export interface CreateOfferInput {
  title: string;
  description?: string;
  products?: OfferProduct[];
  discount?: number;
  offerPrice?: number;
  isMainOffer?: boolean;
}

export interface UpdateOfferInput {
  id: string;
  title?: string;
  description?: string;
  products?: OfferProduct[];
  discount?: number;
  offerPrice?: number;
  isMainOffer?: boolean;
}
