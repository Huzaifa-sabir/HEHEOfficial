"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Star,
  Check,
  ArrowRight,
  Package,
  Shield,
  Truck,
  Clock,
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,

} from "lucide-react";

export const SkeletonCard = () => (
  <div className="animate-pulse p-6 rounded-xl border bg-white/5 border-white/10">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 w-32 bg-white/10 rounded" />
      <div className="h-6 w-6 bg-white/10 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-1/2 bg-white/10 rounded" />
      <div className="h-4 w-2/3 bg-white/10 rounded" />
    </div>
  </div>
);

export const SkeletonProduct = () => (
  <div className="animate-pulse flex items-center p-4 sm:p-6 rounded-xl border bg-[#8abcb9]/10 border-[#8abcb9]/20">
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-white/10 mr-4 sm:mr-6" />
    <div className="flex-1">
      <div className="h-5 sm:h-6 w-32 sm:w-40 bg-white/10 rounded mb-2" />
    </div>
    <div className="text-right space-y-2">
      <div className="h-5 sm:h-6 w-16 sm:w-20 bg-white/10 rounded" />
      <div className="h-3 sm:h-4 w-12 sm:w-16 bg-white/10 rounded" />
    </div>
  </div>
);



export const MobileStickyButton = ({
  showStickyButton,
  showMobileSummary,
  setShowMobileSummary,
  selectedPlan,
  getTotalWithPlan,
  getTotalAmount,
  getSavingsAmount,
  proceedToCheckout,
  isCheckoutLoading,
}) =>
  showStickyButton && (
    <div className="lg:hidden fixed bottom-0 left-0 right-0  bg-neutral-900 rounded-xl backdrop-blur-sm border-t border-white/10 p-4 z-50">
      <div className="max-w-md mx-auto space-y-3">
        <button
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 text-sm"
        >
          <div>
            <span className="text-white/85">Total: </span>
            <span className="font-semibold text-white/95">
              ${selectedPlan ? getTotalWithPlan : getTotalAmount}
            </span>
            {selectedPlan && getSavingsAmount > 0 && (
              <span className="ml-2 text-green-400 text-xs">
                (Save ${getSavingsAmount})
              </span>
            )}
          </div>
          {showMobileSummary ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={proceedToCheckout}
          disabled={!selectedPlan || isCheckoutLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center ${
            selectedPlan && !isCheckoutLoading
              ? "bg-[#8abcb9] text-zinc-950 shadow-lg"
              : "bg-white/20 text-white/50 cursor-not-allowed opacity-50"
          }`}
        >
          {isCheckoutLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              <span>Processing...</span>
            </>
          ) : selectedPlan ? (
            <>
              <span>Start My Treatment</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          ) : (
            "Select a Payment Plan"
          )}
        </button>
      </div>
    </div>
  );

export const MobileSummaryOverlay = ({
  showMobileSummary,
  setShowMobileSummary,
  selectedPlan,
  products,
  getAlignerDiscountedPrice,
  getSavingsAmount,
  getTotalWithPlan,
  getTotalAmount,
  calculateInstallmentAmount,
}) =>
  showMobileSummary && (
    <div
      className="lg:hidden fixed inset-0 bg-transparent backdrop-blur-sm z-40"
      onClick={() => setShowMobileSummary(false)}
    >
      <div
        className="fixed bottom-[150px] left-0 right-0 bg-zinc-900 rounded-t-xl p-6 max-h-[90vh] overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mb-6"></div>
        <h3 className="text-xl font-semibold mb-6 text-white/95">
          Order Summary
        </h3>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-white/85">Impression Kit</span>
            <span className="font-medium text-white/95">
              ${products.impressionKit?.price.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/85">Custom Aligner</span>
            <div className="text-right">
              {selectedPlan &&
              (selectedPlan.num_installments === 0 ||
                selectedPlan.frequency === "instant") &&
              products.aligner?.discountPrice > 0 ? (
                <div>
                  <span className="font-medium text-white/95">
                    ${getAlignerDiscountedPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-white/95">
                  ${products.aligner?.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          {selectedPlan && getSavingsAmount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount savings:</span>
              <span className="font-medium">-${getSavingsAmount}</span>
            </div>
          )}
          <hr className="my-4 border-white/10" />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-white/95">
              {selectedPlan ? "Total with Plan:" : "Total Treatment Cost:"}
            </span>
            <span className="text-white/95">
              ${selectedPlan ? getTotalWithPlan : getTotalAmount}
            </span>
          </div>
        </div>
        {selectedPlan && (
          <div className="rounded-lg p-4 mb-6 border bg-[#8abcb9]/10 border-[#8abcb9]/20">
            <h4 className="font-semibold mb-2 text-[#8abcb9]">
              Selected Plan: {selectedPlan.description}
            </h4>
            <div className="space-y-2 text-sm">
              {selectedPlan.num_installments > 0 &&
              selectedPlan.frequency !== "instant" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-white/85">Pay today:</span>
                    <span className="font-medium text-white/95">
                      ${products.impressionKit?.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/85">
                      {selectedPlan.num_installments} Installments:
                    </span>
                    <span className="font-medium text-white/95">
                      ${calculateInstallmentAmount(selectedPlan)} each
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-white/85">One Time Payment:</span>
                  <span className="font-medium text-white/95">
                    ${getTotalWithPlan}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3 text-sm text-white/70">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-[#8abcb9]" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center">
            <Truck className="w-4 h-4 mr-2 text-[#8abcb9]" />
            <span>Free shipping both ways</span>
          </div>
          <div className="flex items-center">
            <Check className="w-4 h-4 mr-2 text-[#8abcb9]" />
            <span>No hidden fees or interest</span>
          </div>
        </div>
      </div>
    </div>
  );

export default function PaymentPlans() {
  const router = useRouter();
  const [state, setState] = useState({
    products: { impressionKit: null, aligner: null },
    installmentPlans: [],
    selectedPlan: null,
    loading: true,
    error: null,
    userProfile: null,
    isCheckoutLoading: false,
  });

  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return null;
      }

      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          router.push("/login");
        } else {
          throw new Error("Failed to fetch profile");
        }
        return null;
      }

      const userData = await response.json();
      if (!userData.isVerified) {
        router.push("/verifyemailpage");
        return null;
      }
      setState((prev) => ({ ...prev, userProfile: userData }));
      return userData;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Network error while fetching profile",
      }));
      return null;
    }
  }, [router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, plansRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/installment-plans"),
        ]);

        if (!productsRes.ok || !plansRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [productsData, plansData] = await Promise.all([
          productsRes.json(),
          plansRes.json(),
        ]);

        if (!Array.isArray(productsData)) {
          throw new Error("Invalid products data format");
        }

        const impression = productsData.find(
          (p) => p.type === "impression-kit"
        );
        const aligner = productsData.find((p) => p.type === "aligners");

        if (!impression || !aligner) {
          throw new Error("Required products not found");
        }

        if (!plansData.success || !Array.isArray(plansData.data)) {
          throw new Error("Invalid installment plans data format");
        }

        setState((prev) => ({
          ...prev,
          products: { impressionKit: impression, aligner },
          installmentPlans: plansData.data,
          selectedPlan: plansData.data[0] || null,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err.message || "Failed to load data",
          loading: false,
        }));
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const paymentSection = document.getElementById("payment-plans-section");
      if (!paymentSection) return;

      const rect = paymentSection.getBoundingClientRect();
      const isInSection = rect.top < window.innerHeight && rect.bottom > 0;

      setShowStickyButton(isInSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [state.loading]);

  const handlePlanSelection = useCallback((plan) => {
    setState((prev) => ({ ...prev, selectedPlan: plan }));
  }, []);

  const proceedToCheckout = useCallback(async () => {
    if (!state.selectedPlan) {
      alert("Please select a payment plan");
      return;
    }

    try {
      setState((prev) => ({ ...prev, isCheckoutLoading: true }));
      const userData = state.userProfile || (await fetchUserProfile());
      if (userData?._id) {
        router.push(
          `/checkout?user_id=${userData._id}&plan_id=${state.selectedPlan._id}`
        );
      } else {
        router.push("/login");
      }
    } catch (error) {
      alert("Error proceeding to checkout. Please try again.");
    } finally {
      setState((prev) => ({ ...prev, isCheckoutLoading: false }));
    }
  }, [state.userProfile, state.selectedPlan, fetchUserProfile, router]);

  const getAlignerDiscountedPrice = useMemo(() => {
    if (!state.products.aligner) return 0;
    const originalPrice = state.products.aligner.price;
    const discountPercent = state.products.aligner.discountPrice || 0;
    return originalPrice - (originalPrice * discountPercent) / 100;
  }, [state.products.aligner]);

  const calculateInstallmentAmount = useCallback(
    (plan) => {
      if (!state.products.aligner || !plan) return 0;
      const originalPrice = state.products.aligner.price;
      const discountPercent = state.products.aligner.discountPrice || 0;

      if (plan.num_installments === 0 || plan.frequency === "instant") {
        return discountPercent > 0
          ? getAlignerDiscountedPrice.toFixed(2)
          : originalPrice.toFixed(2);
      }
      return (originalPrice / plan.num_installments).toFixed(2);
    },
    [state.products.aligner, getAlignerDiscountedPrice]
  );

  const getTotalAmount = useMemo(() => {
    if (!state.products.impressionKit || !state.products.aligner) return 0;
    return (
      state.products.impressionKit.price + state.products.aligner.price
    ).toFixed(2);
  }, [state.products.impressionKit, state.products.aligner]);

  const getTotalWithPlan = useMemo(() => {
    if (
      !state.products.impressionKit ||
      !state.products.aligner ||
      !state.selectedPlan
    )
      return 0;
    const impressionCost = state.products.impressionKit.price;
    if (
      state.selectedPlan.num_installments === 0 ||
      state.selectedPlan.frequency === "instant"
    ) {
      return (impressionCost + getAlignerDiscountedPrice).toFixed(2);
    }
    return getTotalAmount;
  }, [
    state.products.impressionKit,
    state.products.aligner,
    state.selectedPlan,
    getAlignerDiscountedPrice,
    getTotalAmount,
  ]);

  const getSavingsAmount = useMemo(() => {
    if (!state.products.aligner || !state.selectedPlan) return 0;
    const originalPrice = state.products.aligner.price;
    const discountPercent = state.products.aligner.discountPrice || 0;

    if (
      (state.selectedPlan.num_installments === 0 ||
        state.selectedPlan.frequency === "instant") &&
      discountPercent > 0
    ) {
      return ((originalPrice * discountPercent) / 100).toFixed(2);
    }
    return 0;
  }, [state.products.aligner, state.selectedPlan]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="animate-pulse text-center mb-8 sm:mb-16">
            <div className="h-16 sm:h-24 w-3/4 sm:w-1/2 bg-white/10 rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <SkeletonProduct />
                <SkeletonProduct />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
            <div className="lg:col-span-1">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white/95 font-sans scale-90 -my-20"
      id="payment-plans-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-40 lg:pb-16">
        {state.error && (
          <div className="mb-6 sm:mb-8 p-4 rounded-lg border bg-red-900/10 border-red-500/30 text-red-300 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">{state.error}</span>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Your Journey to a Perfect Smile
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Our process is simple, convenient, and designed with you in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {[
              {
                step: "1",
                title: "Order Impression Kit",
                description:
                  "We'll ship our professional impression kit right to your door",
                icon: ShoppingCart,
                image:
                  "/images/steps/step1-order.webp",
              },
              {
                step: "2",
                title: "Take Impressions",
                description:
                  "Follow our simple instructions to create your dental molds",
                icon: Package,
                image:
                  "/images/steps/step2-impressions.webp",
              },
              {
                step: "3",
                title: "Custom Manufacturing",
                description:
                  "Our experts craft your personalized aligners with precision",
                icon: Star,
                image:
                  "/images/steps/step3-manufacturing.webp",
              },
              {
                step: "4",
                title: "Start Treatment",
                description:
                  "Receive your aligners and begin your smile transformation",
                icon: Check,
                image:
                  "/images/steps/step4-treatment.webp",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group relative flex flex-col justify-between bg-gradient-to-b from-white/5 to-white/[0.02] rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-500 hover:border-[#8abcb9]/50 hover:shadow-[0_0_30px_rgba(138,188,185,0.2)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8abcb9]/80 to-[#8abcb9]/20"></div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#8abcb9]/20 flex items-center justify-center mr-4 border border-[#8abcb9]/30">
                    <step.icon className="w-6 h-6 text-[#8abcb9]" />
                  </div>
                  <h3 className="text-xl font-bold text-white/95">
                    Step {step.step}
                  </h3>
                </div>
                <h4 className="text-lg font-semibold mb-3 text-white/95">
                  {step.title}
                </h4>
                <p className="text-white/70 mb-6">{step.description}</p>
                <div className="w-full h-40 rounded-lg overflow-hidden mb-2">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="hidden w-full h-full bg-[#8abcb9]/20 items-center justify-center">
                    <step.icon className="w-12 h-12 text-[#8abcb9]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Treatment Package Section */}
            <div className="rounded-2xl p-8 border bg-white/[0.025] border-white/10 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8abcb9]/80 to-[#8abcb9]/10"></div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white/95">
                Your Treatment Package
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group flex flex-col h-full rounded-xl border bg-gradient-to-b from-[#8abcb9]/10 to-[#8abcb9]/5 border-[#8abcb9]/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(138,188,185,0.15)] hover:border-[#8abcb9]/40 overflow-hidden">
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src="/images/products/impression-kit.webp"
                      alt="Impression Kit"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-full bg-[#8abcb9]/20 items-center justify-center">
                      <Package className="w-12 h-12 text-zinc-950" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-white/95">
                      Impression Kit
                    </h3>
                    <p className="text-white/70 text-sm mb-4 flex-grow">
                      Professional-grade dental impression kit shipped directly
                      to your home.
                    </p>
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <div className="text-2xl font-bold text-[#8abcb9]">
                          ${state.products.impressionKit?.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-white/70">Pay today</div>
                      </div>
                      <div className="bg-[#8abcb9]/20 p-2 rounded-lg">
                        <Package className="w-6 h-6 text-[#8abcb9]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="group flex flex-col h-full rounded-xl border bg-gradient-to-b from-[#8abcb9]/10 to-[#8abcb9]/5 border-[#8abcb9]/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(138,188,185,0.15)] hover:border-[#8abcb9]/40 overflow-hidden">
                  <div className="w-full h-40 overflow-hidden">
                    <img
                      src="/images/products/clear-aligners.webp"
                      alt="Clear Aligners"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-full bg-[#8abcb9]/20 items-center justify-center">
                      <Star className="w-12 h-12 text-zinc-950" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2 text-white/95">
                      Custom Aligners
                    </h3>
                    <p className="text-white/70 text-sm mb-4 flex-grow">
                      Personalized clear aligners crafted specifically for your
                      smile.
                    </p>
                    <div className="flex items-end justify-between mt-auto">
                      <div>
                        <div className="text-2xl font-bold text-[#8abcb9]">
                          ${state.products.aligner?.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-white/70">
                          Flexible payments
                        </div>
                      </div>
                      <div className="bg-[#8abcb9]/20 p-2 rounded-lg">
                        <Star className="w-6 h-6 text-[#8abcb9]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Plans Section */}
            <div className="rounded-2xl p-8 border bg-white/[0.02] border-white/10 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8abcb9]/80 to-[#8abcb9]/10"></div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-white/95">
                Choose Your Payment Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {state.installmentPlans.map((plan) => {
                  const isInstantPlan =
                    plan.num_installments === 0 || plan.frequency === "instant";
                  const hasDiscount = state.products.aligner?.discountPrice > 0;
                  const showSavings = isInstantPlan && hasDiscount;
                  const isSelected = state.selectedPlan?._id === plan._id;

                  return (
                    <div
                      key={plan._id}
                      onClick={() => handlePlanSelection(plan)}
                      className={`relative rounded-xl transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#8abcb9] bg-[#8abcb9]/10 shadow-[0_0_30px_rgba(138,188,185,0.2)]"
                          : "border border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
                      }`}
                    >
                      {showSavings && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-400 text-zinc-950 px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-3">
                          SAVE ${getSavingsAmount}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white/95 pr-2">
                            {plan.description}
                          </h3>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#8abcb9] flex items-center justify-center">
                              <Check className="w-4 h-4 text-zinc-950" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">
                              Payment frequency:
                            </span>
                            <span className="font-medium capitalize text-white/95 bg-white/10 px-3 py-1 rounded-full text-sm">
                              {plan.frequency === "instant"
                                ? "One-time"
                                : plan.frequency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">
                              Number of payments:
                            </span>
                            <span className="font-medium text-white/95">
                              {plan.num_installments || "1 (Full payment)"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">
                              {isInstantPlan
                                ? hasDiscount
                                  ? "Discounted price:"
                                  : "Full price:"
                                : "Per payment:"}
                            </span>
                            <div className="text-right">
                              {isInstantPlan && hasDiscount && (
                                <div className="text-xs line-through text-white/40">
                                  ${state.products.aligner?.price.toFixed(2)}
                                </div>
                              )}
                              <span className="text-xl font-bold text-[#8abcb9]">
                                ${calculateInstallmentAmount(plan)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-4 pt-4 border-t border-white/10 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-[#8abcb9]" />
                            <span className="text-sm text-white/70">
                              {isInstantPlan
                                ? hasDiscount
                                  ? `Save ${state.products.aligner.discountPrice}% with one-time payment`
                                  : "Convenient one-time payment"
                                : "Payments begin after your aligner is ready"}
                            </span>
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute bottom-0 left-[1%] w-[98%] h-1 bg-[#8abcb9]"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Desktop Order Summary */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-20 rounded-2xl border bg-gradient-to-b from-white/5 to-white/[0.02] border-white/10 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8abcb9]/80 to-[#8abcb9]/10"></div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-white/95">
                  Order Summary
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-white/70">Impression Kit</span>
                    <span className="font-medium text-white/95">
                      ${state.products.impressionKit?.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Custom Aligners</span>
                    <div className="text-right">
                      {state.selectedPlan &&
                      (state.selectedPlan.num_installments === 0 ||
                        state.selectedPlan.frequency === "instant") &&
                      state.products.aligner?.discountPrice > 0 ? (
                        <div>
                          <div className="text-xs line-through text-white/40">
                            ${state.products.aligner?.price.toFixed(2)}
                          </div>
                          <span className="font-medium text-white/95">
                            ${getAlignerDiscountedPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-white/95">
                          ${state.products.aligner?.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {state.selectedPlan && getSavingsAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount savings:</span>
                      <span className="font-medium">-${getSavingsAmount}</span>
                    </div>
                  )}
                </div>
                <div className="my-6 border-t border-b border-white/10 py-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white/95">
                      {state.selectedPlan ? "Total with Plan:" : "Total Cost:"}
                    </span>
                    <span className="text-white/95">
                      ${state.selectedPlan ? getTotalWithPlan : getTotalAmount}
                    </span>
                  </div>
                </div>
                {state.selectedPlan && (
                  <div className="rounded-xl p-4 mb-6 border bg-[#8abcb9]/10 border-[#8abcb9]/20">
                    <h4 className="font-semibold mb-3 text-[#8abcb9]">
                      Selected Plan: {state.selectedPlan.description}
                    </h4>
                    <div className="space-y-3 text-sm">
                      {state.selectedPlan.num_installments > 0 &&
                      state.selectedPlan.frequency !== "instant" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-white/70">Pay today:</span>
                            <span className="font-medium text-white/95">
                              ${state.products.impressionKit?.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">
                              {state.selectedPlan.num_installments}{" "}
                              Installments:
                            </span>
                            <span className="font-medium text-white/95">
                              ${calculateInstallmentAmount(state.selectedPlan)}{" "}
                              each
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-white/70">
                            One Time Payment:
                          </span>
                          <span className="font-medium text-white/95">
                            ${getTotalWithPlan}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <button
                  onClick={proceedToCheckout}
                  disabled={!state.selectedPlan || state.isCheckoutLoading}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center ${
                    state.selectedPlan && !state.isCheckoutLoading
                      ? "bg-[#8abcb9] text-zinc-950 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                      : "bg-white/10 text-white/50 cursor-not-allowed"
                  }`}
                >
                  {state.isCheckoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : state.selectedPlan ? (
                    <>
                      <span>Start My Treatment</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    "Select a Payment Plan"
                  )}
                </button>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 mr-3 text-[#8abcb9] mt-0.5" />
                    <div>
                      <p className="font-medium text-white/90">
                        30-Day Guarantee
                      </p>
                      <p className="text-sm text-white/70">
                        Full refund within 30 days if you're not satisfied
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Truck className="w-5 h-5 mr-3 text-[#8abcb9] mt-0.5" />
                    <div>
                      <p className="font-medium text-white/90">Free Shipping</p>
                      <p className="text-sm text-white/70">
                        We cover shipping costs both ways
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-5 h-5 mr-3 text-[#8abcb9] mt-0.5" />
                    <div>
                      <p className="font-medium text-white/90">
                        No Hidden Costs
                      </p>
                      <p className="text-sm text-white/70">
                        Transparent pricing with no surprise fees
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Components */}
      <MobileStickyButton
        showStickyButton={showStickyButton}
        showMobileSummary={showMobileSummary}
        setShowMobileSummary={setShowMobileSummary}
        selectedPlan={state.selectedPlan}
        getTotalWithPlan={getTotalWithPlan}
        getTotalAmount={getTotalAmount}
        getSavingsAmount={getSavingsAmount}
        proceedToCheckout={proceedToCheckout}
        isCheckoutLoading={state.isCheckoutLoading}
      />
      <MobileSummaryOverlay
        showMobileSummary={showMobileSummary}
        setShowMobileSummary={setShowMobileSummary}
        selectedPlan={state.selectedPlan}
        products={state.products}
        getAlignerDiscountedPrice={getAlignerDiscountedPrice}
        getSavingsAmount={getSavingsAmount}
        getTotalWithPlan={getTotalWithPlan}
        getTotalAmount={getTotalAmount}
        calculateInstallmentAmount={calculateInstallmentAmount}
      />
    </div>
  );
}