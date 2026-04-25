const priceFmt = new Intl.NumberFormat('ru-RU');

export function formatPrice(p: number) {
  return `${priceFmt.format(p)} ₽`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}
