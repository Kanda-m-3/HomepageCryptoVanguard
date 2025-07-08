import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Target, TrendingUp, Users, Zap, Lock, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import DiscordJoinFlow from "@/components/DiscordJoinFlow";
import { useToast } from "@/hooks/use-toast";

export default function VipCommunity() {
  const [location] = useLocation();
  const [showJoinFlow, setShowJoinFlow] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleVipRegistration = async () => {
    if (!isAuthenticated) {
      toast({
        title: "認証が必要です",
        description: "VIP登録にはDiscordアカウントでのログインが必要です。",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/create-vip-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'VIP登録に失敗しました');
      }

      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('VIP registration error:', error);
      toast({
        title: "登録エラー",
        description: error.message || "VIP登録中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Check URL parameters for authentication state
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const auth = urlParams.get('auth');

    if (error === 'not_member') {
      setShowJoinFlow(true);
      toast({
        title: "Discord サーバー参加が必要",
        description: "VIPコミュニティにアクセスするには、まずDiscordサーバーに参加してください。",
        variant: "destructive",
      });
    } else if (error === 'auth_failed') {
      toast({
        title: "認証エラー",
        description: "Discord認証に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
      setIsAuthenticated(false);
    } else if (auth === 'success') {
      // Clean up URL parameters first
      window.history.replaceState({}, '', '/vip-community');
      
      setIsAuthenticated(true);
      toast({
        title: "Discord認証成功",
        description: "Discord認証が完了しました。VIPコミュニティへようこそ！",
      });
    }

    // Check current authentication status
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(!!data.user);
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      });
  }, [toast]);

  const benefits = [
    {
      icon: <Crown className="h-6 w-6" />,
      title: "限定VIPチャンネル",
      description: "プロの暗号資産アナリストによる独占分析と投資戦略を毎日配信。最新の市場動向をリアルタイムでお届けします。"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "専門的取引シグナル",
      description: "AIと専門家による高精度な取引シグナル。エントリー・エグジットポイントを明確に指示し、収益機会を最大化します。"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "詳細市場レポート",
      description: "月次・週次の包括的な市場分析レポート。技術分析、ファンダメンタル分析、マクロ経済の視点から投資戦略を構築します。"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "VIP限定コミュニティ",
      description: "経験豊富な投資家やトレーダーとの交流機会。成功事例の共有や疑問の解決で、より良い投資判断をサポートします。"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "即時アラート機能",
      description: "重要な市場変動や投資機会を瞬時に通知。価格アラート、ニュース速報で投資のタイミングを逃しません。"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "個別ポートフォリオ相談",
      description: "専門家による個別投資相談。あなたのリスク許容度と投資目標に基づいた最適なポートフォリオ構築をサポートします。"
    }
  ];

  const exclusiveServices = [
    "プライベートAMA（Ask Me Anything）セッション",
    "VIP限定ウェビナー",
    "ポートフォリオ最適化アドバイス",
    "税務・法務関連サポート"
  ];

  if (showJoinFlow) {
    return <DiscordJoinFlow onBack={() => setShowJoinFlow(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-crypto-gold/10 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 crypto-gold" />
            </div>
          </div>
          <h1 className="text-4xl font-bold neutral-900 mb-4">暗号資産のプレミアム情報を入手しよう</h1>
          <p className="text-xl neutral-600 max-w-2xl mx-auto leading-relaxed">限定VIPコミュニティに参加して、専門家による分析、取引シグナル、限定インサイト、専門家とのディスカッションにアクセスしましょう。</p>
        </div>

        {/* Authentication Status */}
        {isAuthenticated !== null && (
          <div className="mb-8 flex justify-center">
            <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-sm px-4 py-2">
              {isAuthenticated ? "Discord認証済み" : "Discord認証が必要"}
            </Badge>
          </div>
        )}

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">VIPメンバーの特典</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-crypto-gold/10 rounded-lg flex items-center justify-center crypto-gold">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold neutral-900 mb-2">
                        {benefit.title}
                      </h3>
                      <p className="neutral-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exclusive Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">VIP限定サービス</h2>
          <Card className="bg-white">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exclusiveServices.map((service, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-crypto-gold rounded-full"></div>
                    <span className="neutral-700">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">VIPメンバーに登録</h2>
          <div className="flex justify-center">
            <Card className="bg-white ring-2 ring-crypto-gold relative max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-xl neutral-900">VIPメンバー</CardTitle>
                <div className="text-3xl font-bold crypto-gold">¥10,000<span className="text-base neutral-600">/月</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />全てのDiscord VIPチャンネル</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />専門的なレポートの定期配信</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />いつでもキャンセル可能</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Stripeによる安全な支払い</li>
                </ul>
                <Button 
                  className="w-full bg-crypto-gold hover:bg-yellow-400 text-neutral-900" 
                  onClick={handleVipRegistration}
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? "登録" : "Discordログインが必要"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-crypto-gold to-yellow-400 text-neutral-900">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              プロフェッショナルレベルの投資戦略を手に入れよう
            </h2>
            <p className="text-lg mb-6 opacity-90">
              VIPコミュニティで、一歩先を行く投資家として成長しませんか？
            </p>
            <Button 
              size="lg"
              className="bg-neutral-900 text-white hover:bg-neutral-800 font-semibold px-8 py-4"
              onClick={handleVipRegistration}
              disabled={!isAuthenticated}
            >
              {isAuthenticated ? "今すぐVIP登録" : "Discordログインが必要"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {isAuthenticated ? (
              <p className="text-sm mt-4 opacity-75">
                ※ 月額¥10,000でいつでもキャンセル可能です
              </p>
            ) : (
              <p className="text-sm mt-4 opacity-75">
                ※ VIP登録にはDiscordアカウントでのログインが必要です
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}