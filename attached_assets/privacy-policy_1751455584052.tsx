import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-black">プライバシーポリシー</h1>
          <p className="text-gray-600 mt-2">最終更新日：2025年6月19日</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-lg max-w-none">
          <div className="text-black space-y-6">
            <p>
              株式会社L'ART group（以下「当社」といいます。）は、当社が運営するDiscordサーバー「Crypto Vanguard」（以下「本サーバー」といいます。）において、利用者（以下「ユーザー」といいます。）の個人情報を含む利用者情報を次のとおり取り扱います。本ポリシーは、本サーバーに関連して当社が取得・利用するすべての利用者情報に適用されます。
            </p>

            <hr className="border-gray-300" />

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">1. 適用範囲</h2>
              <p>
                本ポリシーは、本サーバーの利用に際して当社が取得する利用者情報の取扱いに関して定めるものであり、Discord Inc. が提供するサービス自体のプライバシーポリシーには影響を与えません。Discord Inc. が取得・管理する利用者情報の詳細については、同社のプライバシーポリシーをご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">2. 取得する利用者情報</h2>
              <p className="mb-4">当社は、以下の利用者情報を取得する場合があります。</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong>アカウント情報</strong><br />
                  Discordアカウントに登録されたユーザー名、ユーザーID、アバター画像、メールアドレスなど。
                </li>
                <li>
                  <strong>コミュニケーション内容</strong><br />
                  本サーバー内でユーザーが投稿・送信するテキスト、画像、音声等のコンテンツ、およびそれらのタイムスタンプ。
                </li>
                <li>
                  <strong>ログ情報</strong><br />
                  チャンネル閲覧履歴、メッセージ閲覧・反応履歴、接続日時、IPアドレス、利用端末・ブラウザ情報等。
                </li>
                <li>
                  <strong>分析情報</strong><br />
                  本サーバーの利用状況を把握するために、Discordの組み込み分析ツールまたは外部分析サービスを通じて収集される統計情報（ユーザー属性の集計値、トラフィックデータ等）。
                </li>
                <li>
                  <strong>ユーザーから任意に提供される情報</strong><br />
                  アンケートやキャンペーン等でユーザーが自発的に提供する氏名、所属、所在地、ウォレットアドレス等。
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">3. 利用目的</h2>
              <p className="mb-4">当社は、取得した利用者情報を以下の目的で利用します。</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>本サーバーの円滑な運営、機能提供、トラブル対応のため</li>
                <li>コミュニティガイドラインや利用規約の遵守監視、違反行為の調査・是正のため</li>
                <li>本サーバーに関する通知、連絡、重要なお知らせの配信のため</li>
                <li>新機能、イベント、キャンペーン等に関する情報提供およびマーケティング調査のため</li>
                <li>利用状況の分析によるサービス改善・品質向上のため</li>
                <li>法令または行政機関の要請に基づく対応のため</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">4. 第三者提供</h2>
              <p className="mb-4">当社は、次の場合を除き、あらかじめユーザーの同意を得ることなく利用者情報を第三者に提供しません。</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>ユーザー本人が同意した場合</li>
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要であり、ユーザーの同意を得ることが困難な場合</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要であり、ユーザーの同意を得ることが困難な場合</li>
                <li>国の機関等に協力する必要があり、ユーザーの同意によると当該事務遂行に支障を及ぼすおそれがある場合</li>
                <li>事業譲渡、会社分割その他の組織再編に伴って利用者情報が移転される場合</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">5. 外部サービスへの送信</h2>
              <p>
                当社は、本サーバーの機能拡張のため、Discordのボットやウェブフック、外部分析プラットフォーム等（以下「外部サービス」）を利用する場合があります。外部サービスへの情報送信の目的、送信項目、送信先名称・所在地等は、個別のボット利用規約や当社ウェブサイト等にて開示します。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">6. 個人情報の管理</h2>
              <p>
                当社は、利用者情報への不正アクセス、紛失、破壊、改ざん、漏えい等を防止するため、適切な安全管理措置を講じます。当社従業員および委託先についても必要かつ適切な監督を行います。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">7. ユーザーの権利</h2>
              <p>
                ユーザーは、自己の個人情報について、開示、訂正、追加、削除、利用停止等を求める権利を有します。具体的な手続きは「10. お問い合わせ」までご連絡ください。ただし、Discordアカウント自体に関する変更・削除はDiscordの手続きに従う必要があります。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">8. 未成年の利用者</h2>
              <p>
                18歳未満のユーザーは、保護者の同意を得たうえで本サーバーを利用してください。当社が未成年であることを認識した場合には、法令に従い適切に取り扱います。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">9. 本ポリシーの改定</h2>
              <p>
                当社は、法令の改正やサービス内容の変更等に応じて、本ポリシーを随時改定することがあります。重要な変更を行う場合には、Discordサーバー上または当社ウェブサイト等で告知します。改定後、ユーザーが本サーバーを利用した場合、変更後のポリシーに同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-black mb-4">10. お問い合わせ</h2>
              <p className="mb-4">本ポリシーに関するお問い合わせは、下記窓口までご連絡ください。</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">株式会社L'ART group　プライバシー担当</p>
                <p>メールアドレス：privacy@lart-group.co.jp</p>
                <p>所在地：〒183‑0056　東京都府中市寿町1‑8‑8 ミルフィーユ・ドゥ１階</p>
              </div>
            </section>

            <hr className="border-gray-300" />
            <p className="text-center text-gray-600">以上</p>
          </div>
        </div>
      </main>
    </div>
  );
}