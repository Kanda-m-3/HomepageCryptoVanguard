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
        title: "解約リクエスト完了",
        description: "サブスクリプションの解約リクエストが正常に処理されました。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "解約リクエストの処理中にエラーが発生しました。",
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
        title: "決済完了",
        description: "VIPメンバーシップの登録が完了しました！",
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
    if (window.confirm("本当にVIPメンバーシップを解約しますか？")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-crypto-gold/10 rounded-full flex items-center justify-center">
              <Crown className="h-10 w-10 text-crypto-gold" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">VIPメンバーダッシュボード</h1>
          <p className="text-xl text-neutral-600">プレミアムコミュニティへようこそ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-6 w-6 text-crypto-gold" />
                プロフィール情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {user.discordAvatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discordUsername}/${user.discordAvatar}.png`}
                    alt="Discord Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-crypto-gold/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-crypto-gold" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">{user.discordUsername}</h3>
                  <Badge variant="secondary" className="bg-crypto-gold/10 text-crypto-gold">
                    <Crown className="h-3 w-3 mr-1" />
                    VIPメンバー
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-200">
                <h4 className="font-medium text-neutral-900 mb-2">アクセス権限</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-neutral-600">Discord VIPチャンネル</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-neutral-600">専門的なレポート配信</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm text-neutral-600">プレミアムサポート</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Info Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-crypto-gold" />
                サブスクリプション情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.subscriptionInfo ? (
                user.subscriptionInfo.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">サブスクリプション情報の取得エラー</span>
                    </div>
                    <p className="text-sm text-red-600">
                      サブスクリプション情報を取得できませんでした。しばらく時間をおいてからページを再読み込みしてください。
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Status</label>
                        <p className="text-lg font-semibold text-neutral-900 capitalize">
                          {user.subscriptionInfo.status === 'active' ? 'Active' : user.subscriptionInfo.status}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Next Payment Amount</label>
                        <p className="text-lg font-semibold text-neutral-900">
                          ¥{user.subscriptionInfo.nextPaymentAmount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {user.subscriptionInfo.nextPaymentDate ? (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Next Payment Date</label>
                        <p className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.subscriptionInfo.nextPaymentDate).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Next Payment Date</label>
                        <p className="text-lg font-semibold text-neutral-900 text-red-600">
                          Information retrieval error
                        </p>
                      </div>
                    )}

                  {user.subscriptionInfo.cancelAtPeriodEnd && user.subscriptionInfo.serviceEndDate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Cancellation Scheduled</span>
                      </div>
                      <p className="text-sm text-amber-600">
                        Service End Date: {new Date(user.subscriptionInfo.serviceEndDate).toLocaleDateString('en-US')}
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
                      {cancelSubscriptionMutation.isPending ? "Processing..." : "Cancel VIP Membership"}
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
              Enjoy Your VIP Member Exclusive Benefits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-semibold mb-2">Professional Analysis Reports</h3>
                <p className="text-sm opacity-90">Detailed market analysis and investment strategies</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">VIP Exclusive Channels</h3>
                <p className="text-sm opacity-90">Direct dialogue and discussions with experts</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-sm opacity-90">Quick responses to questions and support</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}