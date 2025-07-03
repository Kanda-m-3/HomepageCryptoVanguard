import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, ShoppingCart, Gift, Calendar, DollarSign } from "lucide-react";
import type { AnalyticalReport } from "@shared/schema";

export default function AnalyticalReports() {
  const { toast } = useToast();
  const [downloadingReports, setDownloadingReports] = useState<Set<number>>(new Set());

  const { data: reports, isLoading, error } = useQuery<AnalyticalReport[]>({
    queryKey: ['/api/reports'],
  });

  const { data: sampleReports, isLoading: samplesLoading } = useQuery<AnalyticalReport[]>({
    queryKey: ['/api/reports/samples'],
  });

  const handleFreeSampleDownload = async (report: AnalyticalReport) => {
    if (downloadingReports.has(report.id)) return;

    setDownloadingReports(prev => new Set(prev).add(report.id));
    
    try {
      // Fetch the PDF content as blob from our API and create download
      const response = await fetch(`/api/reports/${report.id}/download-sample`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
      
      const result = await response.json();
      
      if (!result.success || !result.downloadUrl) {
        throw new Error(result.message || 'Failed to get download URL');
      }

      // Try to fetch the PDF directly from the presigned URL
      // If this fails due to DNS, we'll fall back to a different approach
      try {
        const pdfResponse = await fetch(result.downloadUrl);
        if (!pdfResponse.ok) {
          throw new Error('Failed to fetch PDF from storage');
        }
        
        const blob = await pdfResponse.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${report.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } catch (fetchError) {
        // If direct fetch fails, try opening in new window as fallback
        console.warn('Direct fetch failed, trying new window:', fetchError);
        window.open(result.downloadUrl, '_blank');
      }

      toast({
        title: "ダウンロード開始",
        description: `${report.title}のサンプルレポートをダウンロード中です。`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "ダウンロードエラー", 
        description: error instanceof Error ? error.message : "ファイルのダウンロードに失敗しました。",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setDownloadingReports(prev => {
          const newSet = new Set(prev);
          newSet.delete(report.id);
          return newSet;
        });
      }, 2000);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-red-500">
            レポートの読み込み中にエラーが発生しました。
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-crypto-cyan/10 rounded-full flex items-center justify-center">
              <FileText className="h-10 w-10 crypto-cyan" />
            </div>
          </div>
          <h1 className="text-4xl font-bold neutral-900 mb-4">
            分析レポート
          </h1>
          <p className="text-xl neutral-600 max-w-3xl mx-auto leading-relaxed">
            VIPメンバー向けに過去に配布された専門家による暗号資産レポートを、
            アラカルト形式でダウンロード購入いただけます。まずは無料サンプルをお試しください。
          </p>
        </div>

        {/* Free Sample Reports */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold neutral-900 mb-8 flex items-center">
            <Gift className="h-8 w-8 crypto-gold mr-3" />
            無料サンプルレポート
          </h2>
          
          {samplesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleReports?.map((report) => (
                <Card key={report.id} className="bg-white hover:shadow-lg transition-shadow duration-300 border-2 border-green-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg neutral-900 line-clamp-2">
                        {report.title}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800 ml-2">無料</Badge>
                    </div>
                    <div className="flex items-center text-sm neutral-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.createdAt!).toLocaleDateString('ja-JP')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="neutral-600 mb-6 line-clamp-3">
                      {report.description}
                    </p>
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleFreeSampleDownload(report)}
                      disabled={downloadingReports.has(report.id)}
                    >
                      {downloadingReports.has(report.id) ? (
                        <>
                          <Download className="mr-2 h-4 w-4 animate-bounce" />
                          ダウンロード中...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          無料ダウンロード
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Premium Reports */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold neutral-900 mb-8 flex items-center">
            <ShoppingCart className="h-8 w-8 crypto-cyan mr-3" />
            プレミアムレポート
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports?.filter(report => !report.isFreeSample).map((report) => (
                <Card key={report.id} className="bg-white hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg neutral-900 line-clamp-2">
                      {report.title}
                    </CardTitle>
                    <div className="flex items-center text-sm neutral-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(report.createdAt!).toLocaleDateString('ja-JP')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="neutral-600 mb-4 line-clamp-3">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 crypto-gold mr-1" />
                        <span className="text-2xl font-bold crypto-gold">
                          ¥{parseInt(report.price).toLocaleString()}
                        </span>
                      </div>
                      <Badge variant="secondary">プレミアム</Badge>
                    </div>
                    <Link href={`/checkout/${report.id}`}>
                      <Button className="w-full bg-crypto-cyan hover:bg-blue-400 text-white">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        購入する
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Information Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold neutral-900 mb-4">
              レポートについて
            </h3>
            <div className="space-y-2 neutral-600">
              <p>• 全てのレポートはPDF形式でダウンロード提供されます</p>
              <p>• 購入後すぐにダウンロードリンクが提供されます</p>
              <p>• レポートは日本語で作成されており、専門的な分析内容を含みます</p>
              <p>• VIPメンバーは月額料金に含まれているため、追加購入は不要です</p>
              <p>• 支払いはStripeを通じて安全に処理されます</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
