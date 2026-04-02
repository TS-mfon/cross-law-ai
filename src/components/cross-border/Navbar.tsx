import { Link, useLocation } from "react-router-dom";
import { useWallet, formatAddress } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Scale, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected, connectWallet, disconnectWallet, isLoading } = useWallet();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/disputes", label: "Disputes" },
    { to: "/jurisdictions", label: "Jurisdictions" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <Scale className="h-6 w-6 text-primary" />
          <span>CrossBorder</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="text-xs font-mono bg-secondary px-3 py-1.5 rounded-md text-secondary-foreground">
                {formatAddress(address, 14)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={connectWallet} disabled={isLoading}>
              {isLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card px-4 py-4 space-y-3">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {isConnected ? (
            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-mono bg-secondary px-3 py-1.5 rounded-md text-secondary-foreground">
                {formatAddress(address, 14)}
              </span>
              <Button variant="outline" size="sm" onClick={disconnectWallet}>Disconnect</Button>
            </div>
          ) : (
            <Button size="sm" className="w-full" onClick={connectWallet} disabled={isLoading}>
              Connect Wallet
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
