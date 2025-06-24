import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield } from "lucide-react";
import CryptoPriceTicker from "./CryptoPriceTicker";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "ホーム", id: "home" },
    { href: "/discord", label: "Discord", id: "discord" },
    { href: "/vip", label: "VIPコミュニティ", id: "vip" },
    { href: "/reports", label: "分析レポート", id: "reports" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <Shield className="h-8 w-8 crypto-gold mr-3" />
                <span className="text-xl font-bold neutral-900">Crypto Vanguard</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {navItems.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <span
                      className={`transition-colors duration-300 font-medium cursor-pointer hover:crypto-gold ${
                        isActive(item.href) ? "neutral-800" : "neutral-600"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="neutral-600 hover:crypto-gold">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link key={item.id} href={item.href}>
                        <span
                          className={`block px-3 py-2 transition-colors duration-300 font-medium cursor-pointer hover:crypto-gold ${
                            isActive(item.href) ? "neutral-800" : "neutral-600"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      
      <CryptoPriceTicker />
    </>
  );
}
