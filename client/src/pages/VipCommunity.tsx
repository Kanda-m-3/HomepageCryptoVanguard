import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Target, TrendingUp, Users, Zap, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function VipCommunity() {
  const benefits = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "エキスパート分析",
      description: "専門アナリストによる詳細な市場分析と投資レポートを毎週配信"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "トレーディングシグナル",
      description: "リアルタイムの売買シグナルと具体的なエントリー・エグジット戦略"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "独占インサイト",
      description: "一般には公開されない業界の内部情報と先行指標"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "専門家との直接ディスカッション",
      description: "暗号通貨専門家とのプライベートディスカッションルーム"
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
          <h1 className="text-4xl font-bold neutral-900 mb-4">
            VIP Exclusive Community
          </h1>
          <p className="text-xl neutral-600 max-w-2xl mx-auto leading-relaxed">
            エキスパート分析、トレーディングシグナル、独占インサイト、
            そして暗号通貨専門家との限定ディスカッションにアクセスできます。
          </p>
        </div>

        {/* Status Notice */}
        <Card className="mb-12 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Crown className="h-6 w-6 crypto-gold mr-2" />
              <span className="font-semibold neutral-900">VIPコミュニティ</span>
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">準備中</Badge>
            </div>
            <p className="neutral-600">
              VIPコミュニティは現在準備中です。既存のCryptoVanguardMembershipページで詳細をご確認いただけます。
              こちらは参照用のプレースホルダーページです。
            </p>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">
            VIPメンバー限定特典
          </h2>
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

        {/* Feature List */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl neutral-900 flex items-center">
              <TrendingUp className="h-6 w-6 crypto-gold mr-2" />
              提供サービス一覧
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="neutral-800">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">
            メンバーシッププラン
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-xl neutral-900">VIPベーシック</CardTitle>
                <div className="text-3xl font-bold crypto-gold">¥29,800<span className="text-base neutral-600">/月</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />週次市場分析レポート</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />基本的な売買シグナル</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />VIP限定ディスカッション</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />月次ウェビナー参加</li>
                </ul>
                <Button className="w-full bg-crypto-cyan hover:bg-blue-400 text-white" disabled>
                  準備中
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white ring-2 ring-crypto-gold relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-crypto-gold text-neutral-900">最人気</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl neutral-900">VIPプレミアム</CardTitle>
                <div className="text-3xl font-bold crypto-gold">¥59,800<span className="text-base neutral-600">/月</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />全ての基本プラン特典</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />リアルタイム売買シグナル</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />プレマーケット情報</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />個別ポートフォリオアドバイス</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />専門家との1対1相談</li>
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
