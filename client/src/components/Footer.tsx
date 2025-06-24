import { Link } from "wouter";
import { Shield } from "lucide-react";
import { FaDiscord, FaTwitter, FaTelegram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-6">
              <Shield className="h-8 w-8 crypto-gold mr-3" />
              <span className="text-2xl font-bold">Crypto Vanguard</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
              DeFi & Web3の先駆者として、暗号資産市場の最前線で情報を収集・分析し、
              投資家が次の大きな波を掴むための洞察を提供する専門コミュニティです。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                <FaDiscord className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                <FaTelegram className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">サービス</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discord">
                  <span className="text-gray-400 hover:crypto-gold transition-colors duration-300 cursor-pointer">
                    Discordコミュニティ
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/vip">
                  <span className="text-gray-400 hover:crypto-gold transition-colors duration-300 cursor-pointer">
                    VIPコミュニティ
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/reports">
                  <span className="text-gray-400 hover:crypto-gold transition-colors duration-300 cursor-pointer">
                    分析レポート
                  </span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                  プレミアムシグナル
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">サポート</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                  よくある質問
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                  お問い合わせ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                  利用規約
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:crypto-gold transition-colors duration-300">
                  プライバシーポリシー
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Crypto Vanguard. All rights reserved.{" "}
            <span className="crypto-gold">「Vanguardになって、暗号通貨の波に乗ろう」</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
