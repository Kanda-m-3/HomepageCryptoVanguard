import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  discordId: string;
  discordUsername: string;
  discordAvatar: string;
  isVipMember: boolean;
  subscriptionStatus: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function VipMember() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: true,
  });

  const cancelSubscription = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cancel-vip-subscription"),
    onSuccess: () => {
      toast({
        title: "解約リクエスト完了",
        description: "現在の請求期間終了時にサブスクリプションが終了します",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "解約リクエストに失敗しました。再試行してください。",
        variant: "destructive",
      });
    },
  });

  // Redirect if not VIP member
  useEffect(() => {
    if (!isLoading && user && !user.isVipMember) {
      window.location.href = '/vip';
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !user.isVipMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">アクセスが制限されています</h1>
            <p className="text-neutral-400 mb-6">このページはVIPメンバー限定です</p>
            <Link href="/vip">
              <Button>VIPコミュニティページへ戻る</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">アクティブ</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">支払い遅延</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">キャンセル済み</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/vip">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <Crown className="h-8 w-8 crypto-gold" />
            <h1 className="text-3xl font-bold">VIPメンバーダッシュボード</h1>
          </div>

          {/* User Info Card */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 crypto-gold" />
                プロフィール情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={user.discordAvatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png` : undefined}
                    alt={user.discordUsername || user.username}
                  />
                  <AvatarFallback className="text-2xl">
                    {(user.discordUsername || user.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{user.discordUsername || user.username}</h3>
                  <p className="text-neutral-400 mb-3">{user.email}</p>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 crypto-gold" />
                    <span className="font-semibold crypto-gold">VIPメンバー</span>
                    {getStatusBadge(user.subscriptionStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 crypto-gold" />
                サブスクリプション情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-neutral-400">ステータス</label>
                  <div className="mt-1">{getStatusBadge(user.subscriptionStatus)}</div>
                </div>
                <div>
                  <label className="text-sm text-neutral-400">月額料金</label>
                  <p className="mt-1 text-xl font-semibold crypto-gold">¥10,000</p>
                </div>
                {user.currentPeriodEnd && (
                  <div>
                    <label className="text-sm text-neutral-400">次回課金日</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(user.currentPeriodEnd)}</span>
                    </div>
                  </div>
                )}
                {user.cancelAtPeriodEnd && user.currentPeriodEnd && (
                  <div>
                    <label className="text-sm text-neutral-400">サービス終了予定日</label>
                    <div className="mt-1 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-red-400">{formatDate(user.currentPeriodEnd)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* VIP Benefits */}
          <Card className="bg-neutral-800 border-neutral-700 mb-6">
            <CardHeader>
              <CardTitle>VIPメンバー特典</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>全てのDiscord VIPチャンネル</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>専門的なレポートの定期配信</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>優先サポート</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>専用投資戦略セミナー</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discord Access */}
          <Card className="bg-gradient-to-r from-crypto-gold to-yellow-400 text-neutral-900 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Discord VIPチャンネルへアクセス</h3>
                  <p className="opacity-90">限定コンテンツと専門的な議論に参加しよう</p>
                </div>
                <Button 
                  size="lg"
                  className="bg-neutral-900 text-white hover:bg-neutral-800"
                  onClick={() => window.open('https://discord.gg/EP4dss5rB9', '_blank')}
                >
                  Discordを開く
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          {!user.cancelAtPeriodEnd && (
            <Card className="bg-neutral-800 border-neutral-700">
              <CardHeader>
                <CardTitle className="text-red-400">サブスクリプション管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-400 mb-4">
                  VIPメンバーシップを解約したい場合は、下のボタンをクリックしてください。
                  解約後も現在の請求期間終了まではVIP特典をご利用いただけます。
                </p>
                <Button 
                  variant="destructive"
                  onClick={() => cancelSubscription.mutate()}
                  disabled={cancelSubscription.isPending}
                >
                  {cancelSubscription.isPending ? '処理中...' : 'VIPメンバー解約'}
                </Button>
              </CardContent>
            </Card>
          )}

          {user.cancelAtPeriodEnd && (
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-yellow-300">解約予定</h3>
                    <p className="text-yellow-200">
                      {user.currentPeriodEnd && `${formatDate(user.currentPeriodEnd)}にVIPメンバーシップが終了します`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}