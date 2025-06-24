import { useQuery } from "@tanstack/react-query";

interface CryptoPriceData {
  usd: number;
  usd_24h_change: number;
}

interface CryptoPrices {
  bitcoin: CryptoPriceData;
  ethereum: CryptoPriceData;
  ripple: CryptoPriceData;
}

export function useCryptoPrices() {
  return useQuery<CryptoPrices>({
    queryKey: ['/api/crypto-prices'],
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 30000, // Consider data stale after 30 seconds
  });
}
