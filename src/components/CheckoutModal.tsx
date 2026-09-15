import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  KeyRound,
  FileCheck2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { 
  checkLuhn, 
  detectCardBrand, 
  formatCardNumber, 
  formatExpiry, 
  validateExpiry,
  TEST_CARDS,
  generateToken,
  generateTransactionId,
  generateAuthCode
} from '../utils/paymentSecurity';
import { PaymentMethod, CardDetails, ShippingAddress } from '../types';
import { formatINR } from '../utils/currency';

export const CheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    setIsCheckoutOpen, 
    cart, 
    cartSubtotal, 
    createOrder,
    products
  } = useCommerce();

  // Multi-step: 'details' | 'payment' | 'three_ds' | 'processing'
  const [step, setStep] = useState<'details' | 'payment' | 'three_ds' | 'processing'>('details');

  // Shipping details state
  const [shipping, setShipping] = useState<ShippingAddress>({
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@nexus.io',
    addressLine1: 'Indiranagar, 100 Feet Road',
    addressLine2: 'Suite 402',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [card, setCard] = useState<CardDetails>({
    cardNumber: '6074 1234 5678 9010',
    cardholderName: 'Aarav Sharma',
    expiryMonth: '09',
    expiryYear: '29',
    cvv: '542',
    cardBrand: 'rupay',
  });
  const [expiryInput, setExpiryInput] = useState('09/29');

  // 3D Secure simulation
  const [threeDsCode, setThreeDsCode] = useState('');
  const [threeDsError, setThreeDsError] = useState('');
  const DEMO_OTP = '729410';

  // Processing state progression
  const [processingStage, setProcessingStage] = useState<string>('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  // Pricing calculations (Rupees)
  const shippingCost = cartSubtotal >= 5000 ? 0 : 150;
  const estimatedTax = cartSubtotal * 0.18; // 18% GST
  const totalAmount = cartSubtotal + shippingCost + estimatedTax;

  // Validation
  const isCardLuhnValid = checkLuhn(card.cardNumber);
  const isCardExpiryValid = validateExpiry(expiryInput);
  const isCvvValid = card.cvv.length >= 3;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const brand = detectCardBrand(formatted);
    setCard((prev) => ({
      ...prev,
      cardNumber: formatted,
      cardBrand: brand,
    }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiryInput(formatted);
    const [month, year] = formatted.split('/');
    setCard((prev) => ({
      ...prev,
      expiryMonth: month || '',
      expiryYear: year || '',
    }));
  };

  const handleSelectTestCard = (testCard: typeof TEST_CARDS[0]) => {
    setCard({
      cardNumber: testCard.number,
      cardholderName: shipping.fullName || 'Authorized Tester',
      expiryMonth: testCard.exp.split('/')[0],
      expiryYear: testCard.exp.split('/')[1],
      cvv: testCard.cvv,
      cardBrand: testCard.brand,
    });
    setExpiryInput(testCard.exp);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.fullName || !shipping.email || !shipping.addressLine1 || !shipping.city || !shipping.postalCode) {
      setGeneralError('Please fill out all required address fields.');
      return;
    }
    setGeneralError(null);
    setStep('payment');
  };

  const handleTriggerPayment = async () => {
    setGeneralError(null);

    // Verify stock one last time before initiating checkout
    for (const item of cart) {
      const liveProd = products.find((p) => p.id === item.product.id);
      if (!liveProd || liveProd.stock < item.quantity) {
        setGeneralError(`Inventory conflict: ${item.product.name} is no longer available in the requested quantity.`);
        return;
      }
    }

    // If card payment, check Luhn & fields
    if (paymentMethod === 'card') {
      if (!isCardLuhnValid) {
        setGeneralError('Card number failed the Luhn checksum verification. Please verify card number.');
        return;
      }
      if (!isCardExpiryValid) {
        setGeneralError('Please enter a valid future expiration date (MM/YY).');
        return;
      }
      if (!isCvvValid) {
        setGeneralError('Please enter a valid 3 or 4-digit CVV security code.');
        return;
      }

      // Check if this card triggers 3D-Secure
      if (card.cardNumber.startsWith('5555') || card.cardNumber.startsWith('51') || card.cardNumber.startsWith('52')) {
        setStep('three_ds');
        return;
      }
    }

    // Proceed to executing payment pipeline
    await executePaymentPipeline();
  };

  const handleVerify3DS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (threeDsCode.trim() !== DEMO_OTP) {
      setThreeDsError(`Incorrect verification code. Please enter the demo OTP: ${DEMO_OTP}`);
      return;
    }
    setThreeDsError('');
    await executePaymentPipeline(true);
  };

  const executePaymentPipeline = async (threeDsVerified = false) => {
    setStep('processing');

    try {
      // Step 1: Simulated PCI DSS Tokenization
      setProcessingStage('Tokenizing payment credentials into encrypted PCI vault...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Fraud & Velocity Checks
      setProcessingStage('Running real-time automated fraud & AVS address checks...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 3: Atomic Inventory Lock
      setProcessingStage('Acquiring atomic warehouse inventory lock...');
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Gateway Authorization & Settlement
      setProcessingStage('Finalizing encrypted settlement & creating audit ledger...');
      await new Promise((r) => setTimeout(r, 600));

      // Create Order payload
      const cleanLast4 = card.cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      await createOrder({
        items: cart.map((i) => ({
          productId: i.product.id,
          name: i.product.name,
          sku: i.product.sku,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.images[0],
        })),
        subtotal: cartSubtotal,
        discount: 0,
        tax: estimatedTax,
        shipping: shippingCost,
        total: totalAmount,
        shippingAddress: shipping,
        paymentMethod,
        paymentDetails: {
          brand: card.cardBrand,
          last4: paymentMethod === 'card' ? cleanLast4 : '1-Click',
          transactionId: generateTransactionId(),
          authCode: generateAuthCode(),
          pciToken: generateToken(),
          fraudRiskScore: 4,
          threeDSecureVerified: threeDsVerified,
          timestamp: new Date().toISOString(),
        },
      });

      // Close checkout modal (Order confirmation opens automatically from context)
      setIsCheckoutOpen(false);
    } catch (err: any) {
      setStep('payment');
      setGeneralError(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        id="secure-checkout-container"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                PCI-DSS Encrypted Checkout
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  TLS 1.3
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">End-to-end tokenized payment processing gateway</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        {step !== 'processing' && (
          <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step === 'details' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'details' ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-700'}`}>
                1
              </span>
              <span>Shipping Address</span>
            </div>
            <div className="w-8 h-px bg-slate-300" />
            <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-slate-900 text-white' : 'bg-slate-300 text-slate-700'}`}>
                2
              </span>
              <span>Payment Method</span>
            </div>
            <div className="w-8 h-px bg-slate-300" />
            <div className={`flex items-center gap-1.5 ${step === 'three_ds' ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'three_ds' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-700'}`}>
                3
              </span>
              <span>3D-Secure Challenge</span>
            </div>
          </div>
        )}

        {/* General Error Notice */}
        {generalError && (
          <div className="m-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Content Stages */}
        <div className="p-6">
          {/* STEP 1: Shipping Details */}
          {step === 'details' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h4 className="font-display font-semibold text-sm text-slate-900 mb-2">
                Shipping & Customer Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={shipping.addressLine1}
                  onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
                  placeholder="e.g. 123 Tech Blvd, Suite 400"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Order Summary Mini Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Order Items ({cart.length}) • Express Air Shipping</span>
                <span className="font-bold text-slate-900 font-display text-sm">{formatINR(totalAmount)}</span>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Payment Method & Card Details */}
          {step === 'payment' && (
            <div className="space-y-5">
              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>RuPay / Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('klarna')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'klarna'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>No-Cost EMI</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {/* Visual Card Representation */}
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg relative overflow-hidden border border-slate-700">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-6 rounded-md bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                          <div className="w-6 h-3.5 border border-amber-600/40 rounded-xs" />
                        </div>
                        <span className="text-[10px] tracking-widest uppercase text-slate-300 font-mono">EMV CHIP</span>
                      </div>
                      <span className="text-xs font-bold tracking-widest uppercase text-slate-200 font-mono bg-white/10 px-2 py-0.5 rounded">
                        {card.cardBrand.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-5 font-mono text-lg tracking-widest text-slate-100">
                      {card.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="mt-4 flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Cardholder</span>
                        <span className="font-medium tracking-wide uppercase">{card.cardholderName || 'CARDHOLDER NAME'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Expires</span>
                        <span className="font-mono">{expiryInput || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Number Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">Card Number *</label>
                      {card.cardNumber.length >= 15 && (
                        <span className={`text-[11px] font-semibold flex items-center gap-1 ${isCardLuhnValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isCardLuhnValid ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid Luhn Checksum
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Invalid Luhn Checksum
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={19}
                        value={card.cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 tracking-wider"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                        {card.cardBrand}
                      </span>
                    </div>
                  </div>

                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={card.cardholderName}
                      onChange={(e) => setCard({ ...card, cardholderName: e.target.value })}
                      placeholder="Name as printed on card"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Expiry Date (MM/YY) *
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={expiryInput}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                      />
                    </div>
                  </div>

                  {/* Quick Test Cards Selector */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                      Sandbox Test Presets:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {TEST_CARDS.map((tc, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectTestCard(tc)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                        >
                          {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instant UPI Tab Content */}
              {paymentMethod === 'upi' && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
                  <Smartphone className="w-8 h-8 mx-auto text-slate-800" />
                  <h4 className="text-sm font-bold text-slate-900">Scan & Pay via UPI App</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Supports Google Pay, PhonePe, Paytm, BHIM, and any bank UPI app. Instant settlement with zero convenience fee.
                  </p>
                  <div className="max-w-xs mx-auto text-left pt-2">
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">Enter UPI VPA ID</label>
                    <input
                      type="text"
                      defaultValue="aarav@okhdfcbank"
                      placeholder="mobile@upi or id@bank"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* No Cost EMI Tab Content */}
              {paymentMethod === 'klarna' && (
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2">
                  <h4 className="text-sm font-bold">No-Cost Card & Bank EMI</h4>
                  <p className="text-xs text-indigo-900">
                    Pay in 3 monthly installments of <strong>{formatINR(totalAmount / 3)}</strong>. 0% interest, approved instantly via major Indian banks (HDFC, ICICI, SBI, Axis).
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  id="submit-payment-btn"
                  type="button"
                  onClick={handleTriggerPayment}
                  className="px-6 py-3 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize & Pay {formatINR(totalAmount)}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 3D Secure Verification Challenge Modal */}
          {step === 'three_ds' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold font-display">
                    Verified by RuPay / Visa / Mastercard 3D Secure
                  </h4>
                  <p className="text-xs text-indigo-800 mt-1">
                    Your issuing bank has triggered an OTP challenge for this transaction of <strong>{formatINR(totalAmount)}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600">
                  A 6-digit OTP passcode was sent to your registered mobile: <strong>+91 (•••) •••-8921</strong>
                </p>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={threeDsCode}
                    onChange={(e) => setThreeDsCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-48 text-center text-lg font-mono tracking-widest px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {threeDsError && (
                  <p className="text-xs font-semibold text-rose-600">{threeDsError}</p>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => setThreeDsCode(DEMO_OTP)}
                    className="text-xs text-indigo-600 font-semibold underline hover:text-indigo-800 cursor-pointer"
                  >
                    Click to auto-fill Sandbox Demo OTP ({DEMO_OTP})
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-3ds-btn"
                  type="button"
                  onClick={handleVerify3DS}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-md cursor-pointer"
                >
                  Confirm & Authorize
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Processing State Animation */}
          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto animate-spin">
                <Loader2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-lg font-bold font-display text-slate-900">
                Processing Secure Payment
              </h4>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                {processingStage || 'Communicating with banking gateway...'}
              </p>
              <div className="max-w-xs mx-auto text-left text-[11px] text-slate-600 space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit TLS Connection Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Luhn Checksum Algorithm Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Inventory Reserved & Locked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
