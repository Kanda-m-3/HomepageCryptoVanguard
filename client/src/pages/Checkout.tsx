import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, CreditCard, Shield, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import type { AnalyticalReport } from "@shared/schema";

function CheckoutForm({ report }: { report: AnalyticalReport }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "支払いエラー",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm purchase on the backend
        const response = await apiRequest("POST", "/api/confirm-purchase", {
          paymentIntentId: paymentIntent.id,
          reportId: report.id,
        });

        const result = await response.json();
        
        if (result.success) {
          setDownloadUrl(result.downloadUrl);
          setIsComplete(true);
          toast({
            title: "購入完了",
            description: "レポートの購入が完了しました。ダウンロードが可能です。",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "購入エラー",
        description: "購入処理中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${report.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "ダウンロード開始",
        description: "レポートのダウンロードを開始しました。",
      });
    }
  };

  if (isComplete) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold neutral-900 mb-4">購入完了</h2>
          <p className="neutral-600 mb-6">
            {report.title}の購入が完了しました。
          </p>
          <div className="space-y-4">
            <Button 
              onClick={handleDownload}
              className="w-full bg-crypto-gold hover:bg-yellow-400 text-neutral-900"
            >
              <FileText className="mr-2 h-4 w-4" />
              レポートをダウンロード
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation('/reports')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              レポート一覧に戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            支払い情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentElement />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-crypto-gold hover:bg-yellow-400 text-neutral-900 font-semibold py-3"
        size="lg"
      >
        {isProcessing ? (
          <>
            処理中...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            ¥{parseInt(report.price).toLocaleString()}を支払う
          </>
        )}
      </Button>

      <div className="text-center text-sm neutral-600">
        <p>支払いはStripeによって安全に処理されます</p>
      </div>
    </form>
  );
}

export default function Checkout() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const reportId = params.reportId ? parseInt(params.reportId) : null;
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { data: report, isLoading, error } = useQuery<AnalyticalReport>({
    queryKey: [`/api/reports/${reportId}`],
    enabled: !!reportId,
  });

  useEffect(() => {
    if (report && !report.isFreeSample) {
      // Create payment intent
      apiRequest("POST", "/api/create-payment-intent", { reportId: report.id })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error('Error creating payment intent:', error);
        });
    }
  }, [report]);

  if (!reportId) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-red-500">無効なレポートIDです。</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-red-500">レポートが見つかりません。</div>
          <Button 
            onClick={() => setLocation('/reports')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            レポート一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  if (report.isFreeSample) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-yellow-600">このレポートは無料サンプルです。</div>
          <Button 
            onClick={() => setLocation('/reports')}
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            レポート一覧に戻る
          </Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 neutral-600">支払い情報を準備中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold neutral-900 mb-4">
            レポート購入
          </h1>
          <Button 
            onClick={() => setLocation('/reports')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            レポート一覧に戻る
          </Button>
        </div>

        {/* Report Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              購入内容
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold neutral-900">{report.title}</h3>
                <p className="neutral-600 text-sm mt-1">{report.description}</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-semibold">合計金額:</span>
                <span className="text-2xl font-bold crypto-gold">
                  ¥{parseInt(report.price).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm report={report} />
        </Elements>
      </div>
    </div>
  );
}
