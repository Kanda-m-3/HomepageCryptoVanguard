import { Bitcoin, DollarSign } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Skeleton } from "@/components/ui/skeleton";

export default function CryptoPriceTicker() {
  const { data: prices, isLoading, error } = useCryptoPrices();

  if (error) {
    return (
      <div className="mt-16 bg-neutral-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center text-sm text-red-500">
            価格データの取得に失敗しました
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 bg-neutral-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center space-x-8 text-sm">
          <div className="flex items-center">
            <Bitcoin className="crypto-gold mr-2 h-4 w-4" />
            <span className="font-medium">BTC</span>
            {isLoading ? (
              <Skeleton className="ml-2 h-4 w-20" />
            ) : (
              <span className="ml-2 neutral-600">
                ${prices?.bitcoin?.usd?.toLocaleString() || "---"}
                {prices?.bitcoin?.usd_24h_change && (
                  <span
                    className={`ml-1 ${
                      prices.bitcoin.usd_24h_change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {prices.bitcoin.usd_24h_change >= 0 ? "+" : ""}
                    {prices.bitcoin.usd_24h_change.toFixed(2)}%
                  </span>
                )}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <DollarSign className="crypto-cyan mr-2 h-4 w-4" />
            <span className="font-medium">ETH</span>
            {isLoading ? (
              <Skeleton className="ml-2 h-4 w-20" />
            ) : (
              <span className="ml-2 neutral-600">
                ${prices?.ethereum?.usd?.toLocaleString() || "---"}
                {prices?.ethereum?.usd_24h_change && (
                  <span
                    className={`ml-1 ${
                      prices.ethereum.usd_24h_change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {prices.ethereum.usd_24h_change >= 0 ? "+" : ""}
                    {prices.ethereum.usd_24h_change.toFixed(2)}%
                  </span>
                )}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <span className="font-medium">XRP</span>
            {isLoading ? (
              <Skeleton className="ml-2 h-4 w-20" />
            ) : (
              <span className="ml-2 neutral-600">
                ${prices?.ripple?.usd?.toFixed(4) || "---"}
                {prices?.ripple?.usd_24h_change && (
                  <span
                    className={`ml-1 ${
                      prices.ripple.usd_24h_change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {prices.ripple.usd_24h_change >= 0 ? "+" : ""}
                    {prices.ripple.usd_24h_change.toFixed(2)}%
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
