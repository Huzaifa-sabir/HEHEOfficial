"use client";
import React, { useEffect, useState } from "react";
import {
  MenuIcon,
  XIcon,
  UserIcon,
  LogOutIcon,
  SettingsIcon,
  LogInIcon,
  UserPlusIcon,
} from "lucide-react";
import Button from "@components/ui/Button";
import { useAuth } from "@hooks/useAuth";
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    user,
    isAuthenticated,
    authStatus,
    loadingStates,
    logout,
    getProfile,
  } = useAuth();
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    // Only fetch profile if we have a token but no user data
    const token = localStorage.getItem("authToken");
    if (token && !user && authStatus.isInitialized) {
      getProfile();
    }
  }, [user, getProfile, authStatus.isInitialized]);
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    // Optionally redirect to home
    window.location.href = "/";
  };
  const navItems = [
    {
      name: "ABOUT US",
      href: "/#about",
    },
    {
      name: "CONTACT",
      href: "/#contact",
    },
    {
      name: "REVIEWS",
      href: "/#reviews",
    },
    {
      name: "FAQs",
      href: "/#faq",
    },
  ];
  return (
    <>
      <div className="w-full py-[30px] bg-neutral-950"></div>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <a className="flex items-center -mt-2 cursor-pointer" href="/">
              <img
                height={50}
                width={50}
                src="/images/navbar-logo.png"
                alt="navbar logo"
                className="h-12 w-auto"
              />
            </a>
            <div className="hidden md:flex items-center space-x-8 lg:space-x-28">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-white hover:text-[#8abcb9] text-sm font-bold transition-colors duration-300"
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {!authStatus.isInitialized || loadingStates.profileLoading ? (
                <div className="text-white text-sm">Loading...</div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <a
                    className="flex items-center space-x-2 text-white"
                    href="/profile"
                  >
                    <UserIcon size={16} />
                    <span className="text-xs font-medium">Profile</span>
                  </a>
                  {user.isAdmin && (
                    <a href="/dashboard">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<SettingsIcon size={16} />}
                      >
                        <span>Dashboard</span>
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                    icon={<LogOutIcon size={16} />}
                  >
                    <span>Logout</span>
                  </Button>
                </div>
              ) : (
                <>
                  <a href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<LogInIcon size={16} />}
                    >
                      Login
                    </Button>
                  </a>
                  <a href="/signup">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<UserPlusIcon size={16} />}
                    >
                      Sign Up
                    </Button>
                  </a>
                </>
              )}
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XIcon size={24} />
                ) : (
                  <MenuIcon size={24} />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ${
            isMobileMenuOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block font-bold text-white hover:text-[#8abcb9] py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            {!authStatus.isInitialized || loadingStates.profileLoading ? (
              <div className="text-white text-sm py-2">Loading...</div>
            ) : isAuthenticated && user ? (
              <div className="space-y-2 py-2 border-t border-white/10">
                <a
                  className="flex items-center space-x-2 text-white py-2"
                  href="/profile"
                >
                  <UserIcon size={20} />
                  <span className="text-sm font-medium">
                    Welcome, {user.fullName}
                  </span>
                </a>
                {user.isAdmin && (
                  <a href="/dashboard">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<SettingsIcon size={16} />}
                    >
                      <span>Dashboard</span>
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOutIcon size={16} />}
                >
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 py-2 border-t border-white/10">
                <a href="/login">
                  <Button variant="outline" size="sm"
                  
                  icon={<LogInIcon size={16} />}
                  >
                    Login
                  </Button>
                </a>
                <a href="/signup">
                  <Button variant="primary" size="sm"
                  
                  icon={<UserPlusIcon size={16} />}
                  >
                    Sign Up
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
