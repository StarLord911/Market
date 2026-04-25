export type Listing = {
  id: string;
  authorId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  photos: string[];
};

export type User = {
  id: string;
  username: string;
  email: string;
  phone: string | null;
  telegram: string | null;
  registeredAt: string;
};

export type Comment = {
  id: string;
  listingId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
};

export type CurrentUser = {
  id: string;
  username: string;
};

export const CATEGORIES = [
  'Электроника',
  'Одежда и обувь',
  'Дом и сад',
  'Спорт и отдых',
  'Транспорт',
  'Недвижимость',
  'Работа',
  'Услуги',
  'Другое',
] as const;
