import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, BarChart3, Trophy, Crown, FileText, Users, Box, Network, Coins, TrendingUp, Bot, Gamepad2 } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="relative h-screen bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  次世代金融の最前線へ<br />
                  <span className="crypto-gold">Crypto Vanguard</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                  DeFi & Web3の先駆者として、暗号資産市場の最前線で情報を収集・分析し、<br className="hidden md:block" />
                  次の大きな波を掴むための洞察を提供します
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link href="/discord">
                  <Button size="lg" className="bg-crypto-gold hover:bg-yellow-400 text-neutral-900 font-semibold px-8 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <FaDiscord className="mr-2 h-5 w-5" />
                    Discordに参加する
                  </Button>
                </Link>
                <Link href="/vip">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-neutral-900 font-semibold px-8 py-4 transition-all duration-300"
                  >
                    VIPコミュニティを詳しく見る
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Web3 Icons Overlay */}
          <div className="absolute top-1/4 left-8 hidden lg:flex flex-col space-y-6 text-white/30">
            <Box className="h-8 w-8" />
            <Network className="h-8 w-8" />
            <Coins className="h-8 w-8" />
          </div>
          <div className="absolute top-1/3 right-8 hidden lg:flex flex-col space-y-6 text-white/30">
            <TrendingUp className="h-8 w-8" />
            <Bot className="h-8 w-8" />
            <Gamepad2 className="h-8 w-8" />
          </div>
        </div>
      </section>

      {/* Community Description */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold neutral-900 mb-6">
              Crypto Vanguardコミュニティとは
            </h2>
            <p className="text-xl neutral-600 max-w-3xl mx-auto leading-relaxed">
              次世代金融とWeb3エコシステムに特化した情報ネットワークとして、
              暗号資産市場の最前線で情報を収集・分析し、投資家が次の大きな波を掴むための洞察を提供します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-neutral-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-crypto-gold/10 rounded-full flex items-center justify-center mb-6">
                  <Rocket className="h-8 w-8 crypto-gold" />
                </div>
                <h3 className="text-xl font-semibold neutral-900 mb-4">DeFi & Web3の先駆者</h3>
                <p className="neutral-600 leading-relaxed">
                  DeFi、NFT、GameFi、Layer-2、AI×Cryptoなど、次世代Web3トレンドをタイムリーに共有し、最新の投資機会を見逃しません。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-crypto-cyan/10 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 crypto-cyan" />
                </div>
                <h3 className="text-xl font-semibold neutral-900 mb-4">オンチェーンデータ分析</h3>
                <p className="neutral-600 leading-relaxed">
                  オンチェーンデータ分析を通じてクジラの動きを予測し、市場の大きな変動を事前にキャッチします。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-neutral-50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-crypto-gold/10 rounded-full flex items-center justify-center mb-6">
                  <Trophy className="h-8 w-8 crypto-gold" />
                </div>
                <h3 className="text-xl font-semibold neutral-900 mb-4">リターン最大化戦略</h3>
                <p className="neutral-600 leading-relaxed">
                  ステーキング、エアドロップ、プレパブリック投資機会など、リターンを最大化するための戦略を学ぶ場を提供します。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold neutral-900 mb-6">
              提供サービス
            </h2>
            <p className="text-xl neutral-600 max-w-3xl mx-auto leading-relaxed">
              Crypto Vanguardでは、段階的なアクセスレベルにより、
              すべての投資家のニーズに応える包括的なサービスを提供しています。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Discord Community */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                alt="Cryptocurrency trading setup" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 crypto-cyan mr-3" />
                  <h3 className="text-xl font-semibold neutral-900">Discordコミュニティ</h3>
                </div>
                <p className="neutral-600 mb-6 leading-relaxed">
                  無料でアクセスできる基本コミュニティ。市場の基本トレンドや一般的な分析情報を共有し、暗号資産投資の基礎を学べます。
                </p>
                <Link href="/discord">
                  <Button className="w-full bg-crypto-cyan hover:bg-blue-400 text-white font-semibold">
                    参加ガイドを見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* VIP Community */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ring-2 ring-crypto-gold">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                alt="Private banking consultation" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Crown className="h-6 w-6 crypto-gold mr-3" />
                  <h3 className="text-xl font-semibold neutral-900">VIPコミュニティ</h3>
                  <span className="ml-auto bg-crypto-gold text-neutral-900 text-xs font-bold px-2 py-1 rounded">推奨</span>
                </div>
                <p className="neutral-600 mb-6 leading-relaxed">
                  エキスパート分析、トレーディングシグナル、独占インサイト、そして暗号通貨専門家との限定ディスカッションにアクセスできます。
                </p>
                <Link href="/vip">
                  <Button className="w-full bg-crypto-gold hover:bg-yellow-400 text-neutral-900 font-semibold">
                    詳細を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Analytical Reports */}
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                alt="Financial market analysis" 
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 crypto-cyan mr-3" />
                  <h3 className="text-xl font-semibold neutral-900">分析レポート</h3>
                </div>
                <p className="neutral-600 mb-6 leading-relaxed">
                  VIPメンバー向けに過去に配布された専門家による暗号資産レポートを、アラカルト形式でダウンロード購入いただけます。
                </p>
                <Link href="/reports">
                  <Button className="w-full bg-crypto-cyan hover:bg-blue-400 text-white font-semibold">
                    サンプルをダウンロード
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-neutral-900 to-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Vanguardになって、暗号通貨の波に乗ろう
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            次世代金融の最前線で、他の投資家より一歩先を行く洞察と機会を手に入れましょう。
            今すぐCrypto Vanguardコミュニティに参加して、暗号資産投資の新しい可能性を発見してください。
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/discord">
              <Button size="lg" className="bg-crypto-gold hover:bg-yellow-400 text-neutral-900 font-semibold px-8 py-4 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <FaDiscord className="mr-2 h-5 w-5" />
                無料でDiscordに参加
              </Button>
            </Link>
            <Link href="/vip">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-2 border-crypto-gold text-crypto-gold hover:bg-crypto-gold hover:text-neutral-900 font-semibold px-8 py-4 transition-all duration-300"
              >
                VIPコミュニティを詳しく見る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
