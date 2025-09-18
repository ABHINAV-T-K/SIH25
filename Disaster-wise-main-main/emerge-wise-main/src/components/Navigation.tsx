import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Shield, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Hospital, 
  Settings,
  Menu,
  Bell,
  LogOut,
  GraduationCap,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: Shield },
    { name: "Alerts", path: "/alerts", icon: AlertTriangle, badge: "3" },
    { name: "Report Incident", path: "/report", icon: FileText },
    { name: "Evacuation Routes", path: "/evacuation", icon: MapPin },
    { name: "Resources", path: "/resources", icon: Hospital },
    { name: "Training Modules", path: "/training", icon: GraduationCap },
    { name: "Account Settings", path: "/settings", icon: User },
    { name: "Admin Dashboard", path: "/admin", icon: Settings },
  ];

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0], mobile?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <Link
        to={item.path}
        onClick={() => mobile && setIsOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/80 hover:shadow-sm"
        }`}
      >
        <Icon className="h-5 w-5" />
        <span className={mobile ? "text-base" : "text-sm font-medium"}>{item.name}</span>
        {item.badge && (
          <Badge 
            variant={isActive ? "secondary" : "destructive"} 
            className="ml-auto animate-pulse-slow"
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  DisasterGuard
                </span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-2">
                {navItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-alert-pulse">
                        3
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>3 new alerts - Click to view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={signOut} className="hover:bg-destructive hover:text-destructive-foreground">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out of your account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DisasterGuard
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hover:bg-accent hover:text-accent-foreground">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-alert-pulse">
                        3
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>3 new alerts</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent hover:text-accent-foreground">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Open navigation menu</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col gap-4 mt-8">
                    {navItems.map((item) => (
                      <NavLink key={item.path} item={item} mobile />
                    ))}
                    <div className="border-t pt-4 space-y-2">
                      <div className="text-sm text-muted-foreground px-3">
                        {user?.email}
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" className="w-full hover:bg-destructive hover:text-destructive-foreground" onClick={signOut}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Sign Out
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Sign out of your account</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:h-18"></div>
    </>
  );
};

export default Navigation;