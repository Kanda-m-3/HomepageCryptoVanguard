import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Server, 
  Shield, 
  CheckCircle, 
  Code, 
  ExternalLink,
  Settings,
  Zap
} from "lucide-react";

interface DemoEnvironment {
  name: string;
  description: string;
  domain: string;
  features: string[];
  status: 'active' | 'simulated';
}

export default function CrossEnvironmentDemo() {
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  const fetchCurrentConfig = async () => {
    try {
      const response = await fetch('/api/auth/discord/config');
      const data = await response.json();
      setCurrentConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulatedEnvironments: DemoEnvironment[] = [
    {
      name: 'Development',
      description: 'ローカル開発環境',
      domain: 'localhost:5000',
      features: ['ホットリロード', 'デバッグモード', 'ローカルデータベース'],
      status: currentConfig?.currentEnvironment.name === 'development' ? 'active' : 'simulated'
    },
    {
      name: 'Preview',
      description: 'Replit開発プレビュー',
      domain: '*.janeway.replit.dev',
      features: ['動的ドメイン', 'プレビューUI', 'テスト環境'],
      status: currentConfig?.currentEnvironment.name === 'preview' ? 'active' : 'simulated'
    },
    {
      name: 'Production',
      description: '本番デプロイメント',
      domain: '*.replit.app',
      features: ['本番データベース', 'HTTPSアクセス', 'スケーラブル'],
      status: currentConfig?.currentEnvironment.name === 'production' ? 'active' : 'simulated'
    }
  ];

  const features = [
    {
      icon: Globe,
      title: '環境自動検出',
      description: 'リクエストヘッダーに基づいて現在の環境を自動判定',
      implemented: true
    },
    {
      icon: Shield,
      title: 'セキュアなリダイレクト',
      description: 'OAuth2リダイレクトURIの検証と動的生成',
      implemented: true
    },
    {
      icon: Server,
      title: 'マルチ環境対応',
      description: '開発・プレビュー・本番環境での一貫した動作',
      implemented: true
    },
    {
      icon: Settings,
      title: '設定ガイド生成',
      description: 'Discord Developer Portal設定の自動生成',
      implemented: true
    },
    {
      icon: Code,
      title: '開発者ツール',
      description: 'OAuth設定のデバッグとテスト用エンドポイント',
      implemented: true
    },
    {
      icon: Zap,
      title: '自動設定',
      description: '新しい環境での設定の自動適応',
      implemented: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Globe className="h-16 w-16 crypto-gold mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">
              Cross-Environment OAuth2 Generator
            </h1>
            <p className="text-xl text-neutral-400 mb-6">
              環境を跨いだOAuth2リダイレクトURI自動生成システム
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/oauth-setup'}
                className="bg-crypto-gold text-black hover:bg-yellow-400"
              >
                設定ガイドを見る
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/api/auth/discord/config'}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                APIエンドポイント
              </Button>
            </div>
          </div>

          {/* Current Environment Status */}
          {!loading && currentConfig && (
            <Card className="bg-neutral-800 border-neutral-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  現在の環境ステータス
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-neutral-400">環境タイプ</label>
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      {currentConfig.currentEnvironment.name}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">ドメイン</label>
                    <p className="mt-1 font-mono text-sm">{currentConfig.currentEnvironment.domain}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400">プロトコル</label>
                    <p className="mt-1 font-mono text-sm">{currentConfig.currentEnvironment.protocol}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Environment Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {simulatedEnvironments.map((env, index) => (
              <Card key={index} className="bg-neutral-800 border-neutral-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{env.name}</span>
                    <Badge 
                      className={env.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {env.status === 'active' ? 'アクティブ' : 'シミュレート'}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-neutral-400">{env.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">ドメインパターン</label>
                      <code className="block mt-1 bg-neutral-900 px-2 py-1 rounded text-sm">
                        {env.domain}
                      </code>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">機能</label>
                      <ul className="mt-1 text-sm space-y-1">
                        {env.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-neutral-800 border-neutral-700">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-crypto-gold/20 rounded-lg">
                      <feature.icon className="h-6 w-6 crypto-gold" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        {feature.title}
                        {feature.implemented && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Implementation Details */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle>実装詳細</CardTitle>
              <p className="text-sm text-neutral-400">
                Cross-Environment OAuth2 Generatorの技術的実装
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">主要機能</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-400" />
                      動的環境検出（Request Header分析）
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-400" />
                      OAuth2リダイレクトURI検証
                    </li>
                    <li className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-purple-400" />
                      マルチ環境対応設定生成
                    </li>
                    <li className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-orange-400" />
                      Discord Developer Portal設定ガイド
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">API エンドポイント</h4>
                  <div className="space-y-2 text-sm">
                    <code className="block bg-neutral-900 px-3 py-2 rounded">
                      GET /api/auth/discord/config
                    </code>
                    <code className="block bg-neutral-900 px-3 py-2 rounded">
                      GET /api/auth/discord/setup-guide
                    </code>
                    <code className="block bg-neutral-900 px-3 py-2 rounded">
                      GET /api/auth/discord
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}