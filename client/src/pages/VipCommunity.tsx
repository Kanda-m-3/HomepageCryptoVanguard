import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Target, TrendingUp, Users, Zap, Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function VipCommunity() {
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
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" />Discord VIPチャンネル</li>
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
