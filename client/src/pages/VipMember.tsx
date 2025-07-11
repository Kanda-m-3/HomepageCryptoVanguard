import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, AlertTriangle, User, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface SubscriptionInfo {
  nextPaymentDate: string;
  nextPaymentAmount: number;
  serviceEndDate?: string;
  cancelAtPeriodEnd: boolean;
  status: string;
}

interface UserData {
  id: number;
  username: string;
  discordUsername: string;
  discordAvatar: string;
  isVipMember: boolean;
  subscriptionInfo?: SubscriptionInfo;
}

export default function VipMember() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const user = userData?.user;

  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/stripe/cancel-subscription"),
    onSuccess: () => {
      toast({
        title: "Cancellation Request Completed",
        description: "Your subscription cancellation request has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while processing your cancellation request.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Check for payment success parameter
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast({
        title: "Payment Completed",
        description: "Your VIP membership registration has been completed!",
      });
      // Clean up URL
      window.history.replaceState({}, '', '/vip-member');
    }

    if (!isLoading && (!user || !user.isVipMember)) {
      setLocation("/vip-community");
    }
  }, [user, isLoading, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-crypto-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !user.isVipMember) {
    return null;
  }

  const handleCancelSubscription = () => {
    if (window.confirm("本当にVIPメンバーを解約されますか?")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-crypto-gold" />
            <h1 className="text-4xl font-bold text-neutral-900">VIPメンバー 管理ページ</h1>
            <Crown className="h-8 w-8 text-crypto-gold" />
          </div>
          <p className="text-lg text-neutral-600">
            あなたはCrypto VanguardのVIPメンバーです
          </p>
        </div>

        {/* User Profile Card */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-crypto-gold border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-crypto-gold">
                <User className="h-5 w-5" />
                プロファイル情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {user.discordAvatar && (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                    alt="Discord Avatar"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold text-neutral-900">{user.username}</p>
                  <p className="text-sm text-neutral-600">Discord: {user.discordUsername}</p>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Badge variant="default" className="bg-crypto-gold text-white">
                <Crown className="h-3 w-3 mr-1" />
                VIP Member
              </Badge>
            </div>
          </Card>

          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                サブスクリプション情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.subscriptionInfo?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Subscription Information Error</span>
                  </div>
                  <p className="text-sm text-red-600">
                    Could not retrieve subscription information. Please wait a moment and reload the page.
                  </p>
                </div>
              ) : user.subscriptionInfo ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-600">ステータス</label>
                      <p className="text-lg font-semibold text-neutral-900 capitalize">
                        {user.subscriptionInfo.status === 'active' ? 'Active' : user.subscriptionInfo.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">次回課金額</label>
                      <p className="text-lg font-semibold text-neutral-900">{user.subscriptionInfo.nextPaymentAmount?.toLocaleString()}円
                      </p>
                    </div>
                  </div>
                  
                  {user.subscriptionInfo.nextPaymentDate ? (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">次回課金日</label>
                      <p className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(user.subscriptionInfo.nextPaymentDate).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">次回課金日</label>
                      <p className="text-lg font-semibold text-neutral-900 text-red-600">
                        Information retrieval error
                      </p>
                    </div>
                  )}

                  {user.subscriptionInfo.cancelAtPeriodEnd && user.subscriptionInfo.serviceEndDate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">解約スケジュール済み</span>
                      </div>
                      <p className="text-sm text-amber-600">
                        サービス終了日: {new Date(user.subscriptionInfo.serviceEndDate).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  )}

                  {!user.subscriptionInfo.cancelAtPeriodEnd && (
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={handleCancelSubscription}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      {cancelSubscriptionMutation.isPending ? "Processing..." : "VIPメンバーを解約"}
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center text-neutral-600">
                  <p>Loading subscription info...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* VIP Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-crypto-gold to-yellow-400 text-neutral-900">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">
              DiscordサーバーのVIP限定チャンネルにアクセス
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-semibold mb-2">市場分析チェット</h3>
                <p className="text-sm opacity-90">主要な暗号資産の市場分析を配信、VIPメンバーで意見交換</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">プレセール・ステーキング情報</h3>
                <p className="text-sm opacity-90">注目のプレセール、ステーキングサービス情報を配信</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">独占レポート</h3>
                <p className="text-sm opacity-90">新規プロジェクト、暗号資産関連の分析を定期レポート</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}