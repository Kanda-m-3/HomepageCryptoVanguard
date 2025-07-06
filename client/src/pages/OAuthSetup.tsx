import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OAuthConfig {
  clientId: string;
  currentEnvironment: {
    name: string;
    domain: string;
    protocol: string;
    redirectUri: string;
  };
  allPossibleRedirectUris: string[];
  setupInstructions: string;
}

export default function OAuthSetup() {
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOAuthConfig();
  }, []);

  const fetchOAuthConfig = async () => {
    try {
      const response = await fetch('/api/auth/discord/config');
      if (!response.ok) {
        throw new Error('Failed to fetch OAuth configuration');
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "コピーしました",
      description: "クリップボードにコピーされました",
    });
  };

  const getEnvironmentColor = (envName: string) => {
    switch (envName) {
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'production': return 'bg-green-100 text-green-800';
      case 'preview': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">設定の読み込みに失敗</h1>
            <p className="text-neutral-400 mb-6">{error}</p>
            <Button onClick={fetchOAuthConfig}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Settings className="h-12 w-12 crypto-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Discord OAuth2 設定ガイド</h1>
            <p className="text-neutral-400">
              環境別リダイレクトURI設定とDiscord Developer Portal設定手順
            </p>
          </div>

          {/* Current Environment */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                現在の環境
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400">環境タイプ</label>
                  <div className="mt-1">
                    <Badge className={getEnvironmentColor(config.currentEnvironment.name)}>
                      {config.currentEnvironment.name}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">ドメイン</label>
                  <p className="mt-1 font-mono text-sm">{config.currentEnvironment.domain}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-neutral-400">現在のリダイレクトURI</label>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm">
                      {config.currentEnvironment.redirectUri}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(config.currentEnvironment.redirectUri)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Redirect URIs */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle>すべてのリダイレクトURI</CardTitle>
              <p className="text-sm text-neutral-400">
                Discord Developer Portalに追加する必要があるすべてのURI
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {config.allPossibleRedirectUris.map((uri, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <code className="flex-1 bg-neutral-900 px-3 py-2 rounded text-sm">
                      {uri}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(uri)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-700">
                <Button
                  onClick={() => copyToClipboard(config.allPossibleRedirectUris.join('\n'))}
                  className="w-full"
                >
                  すべてのURIをコピー
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Discord Developer Portal 設定手順
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-neutral-900 p-4 rounded">
                  <h3 className="font-semibold mb-2">手順:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      <a 
                        href={`https://discord.com/developers/applications/${config.clientId}/oauth2`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Discord Developer Portal OAuth2設定 <ExternalLink className="inline h-3 w-3" />
                      </a>
                      を開く
                    </li>
                    <li>「Redirects」セクションで「Add Redirect」をクリック</li>
                    <li>上記のリダイレクトURIをすべて追加</li>
                    <li>「Save Changes」をクリックして保存</li>
                  </ol>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded">
                  <h4 className="font-semibold text-blue-300 mb-2">注意事項:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
                    <li>ワイルドカード（*.replit.app）はDiscordでサポートされていません</li>
                    <li>新しいデプロイメントドメインが利用可能になったら個別に追加してください</li>
                    <li>設定変更後は数分待ってからテストしてください</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Section */}
          <Card className="bg-neutral-800 border-neutral-700">
            <CardHeader>
              <CardTitle>認証テスト</CardTitle>
              <p className="text-sm text-neutral-400">
                設定完了後にDiscord認証をテストしてください
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.location.href = '/vip'}
                  className="flex-1"
                >
                  VIPコミュニティへ移動
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/api/auth/discord'}
                  className="flex-1"
                >
                  Discord認証テスト
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}