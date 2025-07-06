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
      setIsAuthenticated(true);
      toast({
        title: "認証成功",
        description: "Discord認証が完了しました。VIPコミュニティへようこそ！",
      });
      // Clean up URL parameters
      window.history.replaceState({}, '', '/vip-community');
    } else {
      // Check authentication status
      checkAuthenticationStatus();
    }
  }, [location, toast]);

  const checkAuthenticationStatus = async () => {
    try {
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setIsAuthenticated(!!data.user);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleDiscordLogin = async () => {
    try {
      // Get the Discord OAuth URL and navigate directly (exactly like debug method)
      const response = await fetch('/api/auth/discord/config');
      const config = await response.json();
      
      // Use the exact same method as the working debug test
      const discordUrl = config.fullOAuthUrl;
      console.log('Navigating to Discord URL:', discordUrl);
      
      // Direct navigation without any server redirect
      window.location.assign(discordUrl);
    } catch (error) {
      console.error('Discord authentication error:', error);
      toast({
        title: "認証エラー", 
        description: "Discord認証でエラーが発生しました。しばらく後にもう一度お試しください。",
        variant: "destructive",
      });
    }
  };

  // Debug function to test Discord configuration  
  const handleTestDiscordConfig = async () => {
    try {
      const response = await fetch('/api/auth/discord/config');
      const config = await response.json();
      console.log('Discord Config:', config);
      
      // Try to open Discord OAuth URL in a new tab for debugging
      const discordUrl = config.fullOAuthUrl;
      window.open(discordUrl, '_blank');
      
      toast({
        title: "デバッグ情報",
        description: "Discord設定をコンソールで確認してください。新しいタブでOAuth URLを開きました。",
      });
    } catch (error) {
      console.error('Config test error:', error);
    }
  };

  // Test function to simulate what happens in working debug flow
  const handleTestSameWindow = async () => {
    try {
      const response = await fetch('/api/auth/discord/config');
      const config = await response.json();
      
      // Use assign instead of href (different navigation method)
      window.location.assign(config.fullOAuthUrl);
    } catch (error) {
      console.error('Same window test error:', error);
    }
  };

  const handleBackFromJoinFlow = () => {
    setShowJoinFlow(false);
    setIsAuthenticated(false);
  };

  // Show Discord join flow if user is not a server member
  if (showJoinFlow) {
    return <DiscordJoinFlow onBack={handleBackFromJoinFlow} />;
  }

  // Show authentication prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-neutral-800/50 backdrop-blur border-neutral-700">
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-crypto-gold/20 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-crypto-gold" />
                </div>
                <CardTitle className="text-2xl font-bold text-crypto-gold mb-2">
                  VIPコミュニティ
                </CardTitle>
                <p className="text-neutral-300">
                  VIPコミュニティにアクセスするには、Discordアカウントでの認証が必要です
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-neutral-700/50 p-4 rounded-lg border border-neutral-600">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-500 mb-1">認証について</h3>
                      <p className="text-sm text-neutral-300">
                        VIPコミュニティへのアクセスには、Crypto Vanguard Discordサーバーのメンバーシップが必要です。
                        認証により、サーバー参加状況とVIPロールを確認します。
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleDiscordLogin}
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3"
                    size="lg"
                  >
                    Discordで認証
                  </Button>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={handleTestDiscordConfig}
                      variant="outline"
                      className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700"
                      size="sm"
                    >
                      Discord設定をテスト (デバッグ用)
                    </Button>
                    
                    <Button 
                      onClick={handleTestSameWindow}
                      variant="outline"
                      className="w-full border-yellow-600 text-yellow-300 hover:bg-yellow-700"
                      size="sm"
                    >
                      同じウィンドウでテスト
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin w-8 h-8 border-4 border-crypto-gold border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-neutral-300">認証状況を確認中...</p>
          </div>
        </div>
      </div>
    );
  }
  const benefits = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "独占レポート",
      description: "主要な暗号資産・新規プロジェクトに関する定期レポート"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "プレセール情報",
      description: "注目の暗号資産のプレセール情報をタイムリーに配信"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "ステーキング・利回り情報",
      description: "各種ステーキングサービスの概要と利回り情報を配信"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "市場分析チャット",
      description: "主要な暗号資産の市場分析を配信、VIPメンバー間で意見交換"
    }
  ];

  const features = [
    "週次詳細市場分析レポート",
    "リアルタイム売買シグナル",
    "プレマーケット情報の先行配信",
    "オンチェーン分析データ",
    "DeFiプロトコル深掘り分析", 
    "エアドロップ情報の先行通知",
    "プライベートAMA（Ask Me Anything）セッション",
    "VIP限定ウェビナー",
    "ポートフォリオ最適化アドバイス",
    "税務・法務関連サポート"
  ];

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
                <Button className="w-full bg-crypto-gold hover:bg-yellow-400 text-neutral-900" disabled>
                  準備中
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
              disabled
            >
              詳細情報を受け取る
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-sm mt-4 opacity-75">
              ※ VIPコミュニティは現在準備中です。詳細が決まり次第、お知らせいたします。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
