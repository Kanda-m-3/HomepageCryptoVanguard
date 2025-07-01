import { Bitcoin, DollarSign, Coins } from "lucide-react";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export default function CryptoPriceTicker() {
  const { data: prices, isLoading, error } = useCryptoPrices();

  const cryptoTokens = [
    { 
      key: 'bitcoin', 
      symbol: 'BTC', 
      icon: <Bitcoin className="crypto-gold mr-2 h-4 w-4" />,
      decimals: 0
    },
    { 
      key: 'ethereum', 
      symbol: 'ETH', 
      icon: <DollarSign className="crypto-cyan mr-2 h-4 w-4" />,
      decimals: 0
    },
    { 
      key: 'ripple', 
      symbol: 'XRP', 
      icon: <Coins className="text-blue-500 mr-2 h-4 w-4" />,
      decimals: 4
    },
    { 
      key: 'binancecoin', 
      symbol: 'BNB', 
      icon: <Coins className="text-yellow-500 mr-2 h-4 w-4" />,
      decimals: 0
    },
    { 
      key: 'solana', 
      symbol: 'SOL', 
      icon: <Coins className="text-purple-500 mr-2 h-4 w-4" />,
      decimals: 2
    },
    { 
      key: 'dogecoin', 
      symbol: 'DOGE', 
      icon: <Coins className="text-yellow-400 mr-2 h-4 w-4" />,
      decimals: 4
    },
    { 
      key: 'the-open-network', 
      symbol: 'TON', 
      icon: <Coins className="text-blue-400 mr-2 h-4 w-4" />,
      decimals: 2
    },
    { 
      key: 'shiba-inu', 
      symbol: 'SHIB', 
      icon: <Coins className="text-orange-500 mr-2 h-4 w-4" />,
      decimals: 6
    },
    { 
      key: 'cardano', 
      symbol: 'ADA', 
      icon: <Coins className="text-blue-600 mr-2 h-4 w-4" />,
      decimals: 4
    },
    { 
      key: 'avalanche-2', 
      symbol: 'AVAX', 
      icon: <Coins className="text-red-500 mr-2 h-4 w-4" />,
      decimals: 2
    }
  ];

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

  const getTokenPrice = (tokenKey: string) => {
    const token = prices?.[tokenKey as keyof typeof prices];
    return token;
  };

  const formatPrice = (price: number, decimals: number) => {
    if (decimals === 0) {
      return price.toLocaleString();
    }
    return price.toFixed(decimals);
  };

  const renderTokenItem = (token: any, key: string) => {
    const tokenData = getTokenPrice(token.key);
    return (
      <div key={key} className="flex items-center whitespace-nowrap px-8">
        {token.icon}
        <span className="font-medium">{token.symbol}</span>
        {isLoading ? (
          <Skeleton className="ml-2 h-4 w-20" />
        ) : (
          <span className="ml-2 neutral-600">
            ${tokenData?.usd ? formatPrice(tokenData.usd, token.decimals) : "---"}
            {tokenData?.usd_24h_change && (
              <span
                className={`ml-1 ${
                  tokenData.usd_24h_change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {tokenData.usd_24h_change >= 0 ? "+" : ""}
                {tokenData.usd_24h_change.toFixed(2)}%
              </span>
            )}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mt-16 bg-neutral-50 border-b border-gray-200">
      <div className="w-full overflow-hidden py-3">
        <div className="flex animate-scroll text-sm">
          {/* First set of tokens */}
          {cryptoTokens.map((token) => renderTokenItem(token, `first-${token.key}`))}
          {/* Duplicate set for seamless loop */}
          {cryptoTokens.map((token) => renderTokenItem(token, `second-${token.key}`))}
        </div>
      </div>
    </div>
  );
}
