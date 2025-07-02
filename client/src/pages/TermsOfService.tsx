import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>ホームに戻る</span>
              </Button>
            </Link>
            
            <h1 className="text-xl font-bold text-neutral-900">
              Crypto Vanguard
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-neutral-900">
              利用規約
            </CardTitle>
            <p className="text-center text-gray-600">最終更新日：2025年6月22日</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-black">
              <p>
                株式会社L'ART group（以下「当社」といいます。）が運営するDiscordサーバー「Crypto Vanguard」（以下「本サーバー」といいます。）の利用者（以下「ユーザー」といいます。）は、本利用規約（以下「本規約」といいます。）に同意のうえ、本サーバーを利用するものとします。本サーバーの利用に際しては、別途定める「プライバシーポリシー」および関連する規約・ガイドラインも適用されます。
              </p>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">1. 適用範囲および同意</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>本規約は、本サーバーにおいて当社が提供するすべてのサービス（以下「本サービス」といいます。）の利用に関する当社とユーザー間の一切の関係に適用されます。</li>
                  <li>ユーザーは、本サーバーに参加し、または本サービスを利用した時点で、本規約およびプライバシーポリシーに同意したものとみなされます。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">2. 定義</h2>
                <p className="mb-2">本規約において使用する用語の定義は、次のとおりとします。</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li><strong>無料サービス</strong>：ユーザーがDiscordアカウントのみでアクセスできる公開チャンネルその他の機能。</li>
                  <li><strong>サブスクリプションサービス</strong>：月額料金を支払ったユーザー（以下「サブスクライバー」）のみがアクセスできる非公開チャンネルその他の特典機能。</li>
                  <li><strong>投稿コンテンツ</strong>：ユーザーが本サーバー内で送信またはアップロードするメッセージ、画像、音声、ファイル、その他一切の情報。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">3. 本サービスの内容</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>当社は、暗号資産・ブロックチェーン領域に関する情報提供およびコミュニティ交流の場として本サーバーを運営します。</li>
                  <li>基本機能は無料で提供されますが、一定の追加機能・チャンネルへのアクセスにはサブスクリプション登録が必要です。</li>
                  <li>当社は、事前の通知なく本サービスの全部または一部を追加、変更、停止、終了できるものとします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">4. アカウントおよび登録情報</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>ユーザーは、Discord Inc.が提供するアカウント（以下「Discordアカウント」）を用いて本サーバーに参加します。</li>
                  <li>ユーザーは、Discordアカウントの管理責任を負い、不正利用による損害について当社は責任を負いません。</li>
                  <li>ユーザーは、登録情報が虚偽または不正確であってはならず、変更が生じた場合は速やかに更新するものとします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">5. サブスクリプション</h2>
                
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">5.1 登録手続</h3>
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    <li>サブスクリプションサービスの利用を希望するユーザーは、当社所定の方法により申し込み、所定の月額料金（以下「利用料金」）を支払うものとします。</li>
                    <li>未成年者がサブスクリプション登録を行う場合、法定代理人の同意を得たものとみなします。</li>
                  </ol>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">5.2 利用料金および支払方法</h3>
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    <li>利用料金および支払方法は当社が別途定めるとおりとします。</li>
                    <li>利用料金は前払方式とし、当社が指定する決済代行サービスを通じて決済されます。</li>
                  </ol>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">5.3 更新・解約</h3>
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    <li>サブスクリプションは、ユーザーが解約手続きを行わない限り、課金期間満了時に同一条件で自動更新されます。</li>
                    <li>ユーザーは、次回更新日の24時間前までに当社所定の方法で解約手続きを行うことで、更新を停止できます。</li>
                    <li>解約後も、既に支払われた利用料金は理由の如何を問わず返金されません。</li>
                  </ol>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">5.4 サービス停止・解除</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>ユーザーが本規約に違反した場合、当社はサブスクリプションを含む本サービスの利用停止または契約解除を行うことができます。</li>
                    <li>上記停止・解除により当社または第三者に損害が生じた場合、ユーザーはその損害を賠償する責任を負います。</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">6. ユーザーの責任</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>ユーザーは、自己の責任で本サービスを利用し、投稿コンテンツについて一切の責任を負います。</li>
                  <li>投稿コンテンツが第三者の権利を侵害した場合、ユーザーは自己の費用と責任で解決するものとします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">7. 禁止事項</h2>
                <p className="mb-2">ユーザーは、以下の行為を行ってはなりません。</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>他のユーザー、第三者または当社の権利・利益を侵害する行為</li>
                  <li>詐欺的行為、マネーロンダリング、テロ資金供与につながる行為</li>
                  <li>無許可の広告・勧誘・営業行為</li>
                  <li>本サーバーの運営・ネットワーク・システムを妨害する行為</li>
                  <li>Discord Inc.の利用規約・ガイドラインに違反する行為</li>
                  <li>その他当社が不適切と判断する行為</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">8. 知的財産権</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>本サーバーおよび本サービスに関する一切の知的財産権は当社または当該権利者に帰属します。</li>
                  <li>ユーザーは、自ら投稿したコンテンツについて、当社に対し本サービスの運営・宣伝等の目的で無償かつ非独占的に利用（複製、公衆送信、翻訳・翻案を含む）する権利を許諾するものとします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">9. 免責事項</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>当社は、本サーバー内で提供される情報の正確性、完全性、有用性を保証しません。</li>
                  <li>本サーバーで取り扱う暗号資産・投資情報は、投資勧誘またはアドバイスを目的としたものではありません。投資判断はユーザー自身の責任と判断で行ってください。</li>
                  <li>当社は、ユーザー間またはユーザーと第三者との間に生じたトラブルについて一切責任を負いません。</li>
                  <li>当社の故意または重過失による場合を除き、当社は本サービスに起因または関連してユーザーに生じた損害（間接損害を含む）について責任を負いません。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">10. リスク開示（暗号資産等）</h2>
                <p>
                  暗号資産は価格変動が大きく、価値が失われるリスクがあります。ユーザーはこれらのリスクを十分理解し、本サーバーの情報を参考にする場合でも最終的な判断は自己責任で行うものとします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">11. 退会・利用停止</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>ユーザーは、Discordアプリ上で本サーバーから退出することで退会できます。ただし、サブスクリプションの解約は別途手続きが必要です。</li>
                  <li>当社は、ユーザーが本規約に違反し、または当社が不適切と判断した場合、事前通知なく本サービスの全部または一部の利用を停止し、または退会処分を行うことができます。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">12. 規約の変更</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>当社は、本規約を随時変更できます。変更内容は、本サーバー上または当社ウェブサイト等で周知します。</li>
                  <li>本規約を改定した後にユーザーが本サービスを利用した場合、変更後の規約に同意したものとみなします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">13. 権利義務の譲渡禁止</h2>
                <p>
                  ユーザーは、当社の書面による事前の承諾なく、本規約上の地位または権利義務を第三者に譲渡・担保設定できません。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">14. 分離可能性</h2>
                <p>
                  本規約のいずれかの条項が無効または執行不能と判断された場合でも、その他の条項は継続して完全に効力を有するものとします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">15. 準拠法および管轄裁判所</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>本規約は、日本法に準拠し解釈されるものとします。</li>
                  <li>本サービスに関連して当社とユーザーとの間で生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold text-neutral-900 mb-3">16. お問い合わせ</h2>
                <p className="mb-2">本規約に関するお問い合わせは、下記窓口までご連絡ください。</p>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium">株式会社L'ART group　Crypto Vanguard担当</p>
                  <p>メールアドレス：support@lart-group.co.jp</p>
                  <p>所在地：〒183‑0056　東京都府中市寿町1‑8‑8 ミルフィーユ・ドゥ１階</p>
                </div>
              </section>

              <div className="text-center pt-8 border-t">
                <p className="text-gray-600">以上</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}