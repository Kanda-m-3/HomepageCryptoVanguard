import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ExternalLink, ArrowLeft } from "lucide-react";

interface DiscordJoinFlowProps {
  onBack: () => void;
}

export default function DiscordJoinFlow({ onBack }: DiscordJoinFlowProps) {
  const [, setLocation] = useLocation();
  
  const handleJoinDiscord = () => {
    // Open Discord invite in new tab
    window.open('https://discord.gg/EP4dss5rB9', '_blank');
  };

  const handleRetryAuth = () => {
    // Redirect to Discord OAuth after user has joined
    window.location.href = '/api/auth/discord';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-neutral-800/50 backdrop-blur border-neutral-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-crypto-gold mb-2">
                Discord サーバー参加が必要です
              </CardTitle>
              <p className="text-neutral-300">
                VIPコミュニティに参加するには、Crypto Vanguard Discord サーバーのメンバーである必要があります
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600">
                <h3 className="font-semibold text-crypto-gold mb-2">参加手順:</h3>
                <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                  <li>下の「Discordサーバーに参加」ボタンをクリック</li>
                  <li>Discord アプリまたはブラウザで招待を承認</li>
                  <li>サーバー参加後、「認証を再試行」ボタンをクリック</li>
                </ol>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleJoinDiscord}
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white flex items-center gap-2"
                  size="lg"
                >
                  <ExternalLink className="h-4 w-4" />
                  Discordサーバーに参加
                </Button>
                
                <Button 
                  onClick={handleRetryAuth}
                  variant="outline"
                  className="border-crypto-gold text-crypto-gold hover:bg-crypto-gold hover:text-neutral-900"
                  size="lg"
                >
                  認証を再試行
                </Button>
              </div>

              <div className="pt-4 border-t border-neutral-700">
                <Button 
                  onClick={onBack}
                  variant="ghost"
                  className="text-neutral-400 hover:text-white flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  戻る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}