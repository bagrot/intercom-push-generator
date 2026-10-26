function addressWords(value: string): string[] {
  return value
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function searchAddresses(addresses: string[], query: string): string[] {
  const terms = addressWords(query);
  if (!terms.length) return addresses;

  return addresses.filter((address) => {
    const words = addressWords(address);
    return terms.every((term) => words.some((word) => word.startsWith(term)));
  });
}
