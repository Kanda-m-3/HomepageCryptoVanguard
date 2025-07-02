import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, TrendingUp, BookOpen, ArrowRight, ExternalLink } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

export default function Discord() {
  const discordInviteUrl = "https://discord.gg/EP4dss5rB9";

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "リアルタイム市場ディスカッション",
      description: "24時間アクティブなコミュニティで、暗号資産市場の最新動向について議論"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "基本的な市場分析",
      description: "主要暗号資産の価格動向と基本的なテクニカル分析を毎日共有"
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "初心者向け教育コンテンツ",
      description: "暗号資産投資の基礎から学べる教材とガイドを無料で提供"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "投資家コミュニティ",
      description: "同じ志を持つ投資家たちとのネットワーキングと情報交換"
    }
  ];

  const channels = [
    { name: "🏛️ | 公式アナウンス", description: "重要な市場ニュースと公式情報" },
    { name: "💰 | 価格ディスカッション", description: "日々の価格動向について議論" },
    { name: "📊 | 基本分析", description: "市場の基本的な分析と見通し" },
    { name: "❓ | 初心者質問", description: "暗号資産投資の疑問を解決" },
    { name: "🔗 | ニュース共有", description: "業界の最新ニュースをシェア" },
    { name: "💬 | 雑談", description: "コミュニティメンバーとの交流" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-crypto-cyan/10 rounded-full flex items-center justify-center">
              <FaDiscord className="h-10 w-10 crypto-cyan" />
            </div>
          </div>
          <h1 className="text-4xl font-bold neutral-900 mb-4">
            Crypto Vanguard Discord サーバー
          </h1>
          <p className="text-xl neutral-600 max-w-2xl mx-auto leading-relaxed">
            無料でアクセスできる基本コミュニティ。暗号資産投資の基礎を学び、
            同じ志を持つ投資家たちと情報交換をしませんか？
          </p>
        </div>

        {/* Join Discord CTA */}
        <Card className="mb-12 bg-gradient-to-r from-crypto-cyan to-blue-500 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-[#030303]">今すぐ無料で参加しよう</h2>
            <p className="text-lg mb-6 opacity-90">
              クリック一つで、Crypto Vanguardの活発なコミュニティに参加できます
            </p>
            <Button 
              size="lg"
              className="bg-white text-crypto-cyan hover:bg-gray-100 font-semibold px-8 py-4"
              onClick={() => window.open(discordInviteUrl, '_blank')}
            >
              <FaDiscord className="mr-2 h-5 w-5" />
              Discordサーバーに参加
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 text-center">
            Discordコミュニティで得られるもの
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-crypto-cyan/10 rounded-lg flex items-center justify-center crypto-cyan">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold neutral-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="neutral-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Channel Structure */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl neutral-900">チャンネル構成</CardTitle>
            <p className="neutral-600">
              整理されたチャンネル構成で、効率的に情報収集ができます
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-semibold neutral-900">{channel.name}</span>
                    <p className="text-sm neutral-600 mt-1">{channel.description}</p>
                  </div>
                  <Badge variant="secondary">アクティブ</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Participation Guide */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl neutral-900">参加方法</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-crypto-gold rounded-full flex items-center justify-center text-neutral-900 font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold neutral-900 mb-2">Discord招待リンクをクリック</h3>
                  <p className="neutral-600">上記のボタンからDiscordサーバーの招待リンクにアクセスします。</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-crypto-gold rounded-full flex items-center justify-center text-neutral-900 font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold neutral-900 mb-2">Discordアカウントでログイン</h3>
                  <p className="neutral-600">既存のDiscordアカウントでログインするか、新規アカウントを作成します。</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-crypto-gold rounded-full flex items-center justify-center text-neutral-900 font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold neutral-900 mb-2">サーバールールを確認</h3>
                  <p className="neutral-600">コミュニティルールを読み、適切なマナーでディスカッションに参加します。</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-crypto-gold rounded-full flex items-center justify-center text-neutral-900 font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold neutral-900 mb-2">自己紹介とディスカッション開始</h3>
                  <p className="neutral-600">自己紹介チャンネルで挨拶し、興味のあるトピックでディスカッションを始めましょう。</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-bold neutral-900 mb-4">
            今すぐコミュニティに参加して、暗号資産投資の第一歩を踏み出しましょう
          </h2>
          <p className="neutral-600 mb-8">
            無料で参加でき、いつでも退会可能です。まずは気軽にのぞいてみてください。
          </p>
          <Button 
            size="lg"
            className="bg-crypto-cyan hover:bg-blue-400 text-white font-semibold px-8 py-4"
            onClick={() => window.open(discordInviteUrl, '_blank')}
          >
            <FaDiscord className="mr-2 h-5 w-5" />
            Discordサーバーに参加する
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
