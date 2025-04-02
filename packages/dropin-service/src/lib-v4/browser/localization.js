// @ts-nocheck
export const Required = 'Required';
export const LastNameRequired = 'Last name is required';
export const JWTValid = 'Should be a valid JSON web token';
export const ZipCodeValidation = 'Should be a valid Zip';
export const PhoneNumberValidation = 'Phone number is not valid';
export const ExpiryDateValidation = 'Expiry date is not valid';
export const CreditCardValidation = 'Enter a Valid Credit Card';
export const OTPValidation = 'Enter a valid OTP';

export const required = (val) => `${val} ${Required}`;
export const minumum = (val) => `Minimum of ${val} characters required`;
export const maximum = (val) => `Maximum of ${val} characters required`;

export const Return = 'Return';
export const Change = 'Change';
export const Close = 'Close';

export const CreditCardInformation = 'Credit Card Information';
export const ButtonCreditCard = 'Buy with Card';
export const ButtonC2P = 'Continue with Click to Pay';
export const ButtonBuyWith = 'Buy with';

export const LinkResendOTP = 'Resend OTP';

export const CreditCardValid = 'VALID THRU';

export const FirstName = 'First name';
export const LastName = 'Last name';
export const Address1 = 'Street';
export const Address2 = 'Apt/Suite/Building';
export const City = 'City';
export const State = 'State';
export const Zip = 'Zip';
export const Country = 'Country';
export const CardNumber = 'Card Number';
export const CardName = 'Name on Card';
export const ExpiryDate = 'MM/YY';
export const CVC = 'CVV';
export const Payment = 'Payment';
export const Phone = 'Phone';
export const Email = 'Email';
export const Next = 'Next';
export const PlaceOrder = 'Place Order';
export const OTP = 'OTP';
export const SecureCheckout = 'Secure checkout';

export const CartSubTotal = 'Subtotal';
export const CartShipping = 'Shipping';
export const CartTax = 'Tax';
export const CartTotal = 'Total';
export const CartDiscount = 'Discount';
export const CartStoreCredit = 'Store Credits';

export const PriceFree = 'FREE';

export const SameAsShippingAddress = 'My billing address same as shipping';

export const Password = 'Password';

// Payment
export const NewCreditCard = 'New Card';

// Credit card
export const CreditCardExpires = 'Expires';
export const CreditCardExpired = 'expired';

// Footer
export const FooterLine1 = 'Powered by firmly';
export const FooterLine2 = 'Checkout securely with';

export const ViewTitlePaymentOptions = 'Checkout';
export const ViewTitleContact = 'Contact';
export const ViewTitleShippingAddress = 'Shipping';
export const ViewTitleShippingMethod = 'Shipping Method';
export const ViewTitlePayment = 'Payment';
export const ViewTitleReview = 'Review';
export const ViewTitleOrderPlaced = 'Thank you';
export const ViewTitleLoadingCart = 'Checking';

// Click to Pay
export const ViewTitleC2PLogin = 'Pay with confidence with Click to Pay';
export const ViewTitleC2POtp = 'Welcome back to Click to Pay';
export const ViewTitleC2PStepUp = "Lets make sure it's you";
export const ViewTitleC2PVerifyCode = 'Verify with code';

export const InfoC2PPrivacy =
	"By checking this box, you consent and direct firmly to send your information to <span class='font-bold text-neutral-500'>Click to Pay</span> to check if you have any saved cards";
export const InfoC2PDetail = 'Easy and smart online checkout';
export const InfoC2PEmail = 'Enter your email to continue';
export const InfoC2PTerms = "By continuing, you agree to Visa's Privacy Notice";
export const InfoC2PRememberMe = 'Skip Verification next time';
export const InfoC2PRememberMeLong =
	'Select to be remembered on your device and browser at participating stores for faster checkout. Not recommended for shared devices.';

export const InfoOTP = 'Enter the One-Time Passcode sent to';
export const InfoPhone = 'Phone:';
export const InfoEmail = 'Email:';

export const InfoC2PShippingHeader = 'We found you!';
export const InfoC2PShippingDetail = 'Add your shipping details to continue with the purchase';

export const InfoMerchantOtpHeader = 'We noticed you already have an account with #MERCHANT#!';
export const InfoMerchantOtpDetail =
	'Enter OTP to access your saved cards and complete the purchase in one click';

export const InfoC2POTPHeader = 'We found your saved cards with Click to Pay!';
export const InfoC2POTPDetail = 'Enter OTP to access your saved cards and complete the purchase';

export const InfoC2PCVVHeader = 'Enter CVV to complete purchase';
export const InfoC2PCVVDetail = 'For your security please enter CVV to complete purchase';

export const InfoC2PNoCards = 'Please enter a credit card';

export const InfoC2PNeedToVerify =
	'For added security to complete your oder, you need to be verified with your bank.';
export const InfoC2PVerificationOptions = 'Select how you want to verify:';
export const InfoC2PVerifyBankApp = (cardNumber) =>
	`Verify this purchase in the bank app associated with card **** ${cardNumber}. Return to this page for order confirmation.`;
export const InfoC2PVerifyOTPDestination = (method) =>
	`Enter the code sent to <strong>${method}</strong> to complete your order`;

// Shop Pay
export const ViewTitleShopPayLogin = 'Pay with confidence with ShopPay';
export const ViewTitleShopPayOtp = 'Welcome back to ShopPay';

export const InfoShopPayEmail = 'Enter your email to continue';
export const InfoShopPayOTP = 'Enter the One-Time Passcode ShopPay sent to';

export const InfoShopPayShippingHeader = 'We found you!';
export const InfoShopPayShippingDetail = 'Add your shipping details to continue with the purchase';

export const ReviewContact = 'Contact';
export const ReviewDeliveryMethod = 'Method';
export const ReviewPayment = 'Payment';
export const ReviewCVV = 'For additional security please enter the security code';
export const ReviewCVVToolTip =
	"3 digits CVV from the back of your card (4 digits if it's an AmEx)";

export const ReviewShippingAddress = 'Shipping';
export const ReviewDelivery = 'Delivery';
export const ReviewTerms =
	'By placing the order, you agree to the #terms# and #privacypolicy# of firmly and the merchant’s privacy policy. Your order will be processed and fulfilled by the merchant';

// Paypal
export const InfoPaypalShippingHeader = 'We need additional information';
export const InfoPaypalMissingPhone = 'Please have your phone information updated';
export const InfoPaypalMissingEmail = 'Please have your email information updated';

// Store Login
export const InfoStoreLoginHeader = (storeName) => `Welcome back to ${storeName}`;
export const InfoStoreLoginDetail = (email) => `Enter the password for ${email}`;

// Order Placed
export const OrderPlacedNotes =
	'You will receive an email with order confirmation from the merchant.';
export const OrderPlaced = 'Order Placed !';
export const OrderNumber = 'Order Number:';
export const OrderPlacedBuffer = 'Please wait, we are taking you to the thank you page...';

export const OrderSummary = (count) =>
	count == 1 ? 'Order Summary (1 item)' : `Order Summary (${count} items)`;
export const Carts = (count) => (count == 1 ? 'Cart (1 item)' : `Cart (${count} items)`);

// Product card
export const ProductCheckout = 'Checkout';
export const ProductSize = 'Size:';
export const ProductComplimentaryGift = 'Complimentary Gift';
export const ProductQuantity = 'Qty:';
export const ProductRemove = 'Remove';

// Shipping Address
export const ShippingAddressSearch = 'Search';

// Progress

export const ProgressEmpty = {
	header: null,
	info: null
};

export const ProgressTransferCart = {
	header: 'Preparing Cart',
	info: 'We are preparting the cart for the checkout.'
};

export const ProgressShippingInfo = {
	header: 'Please wait...',
	info: 'We are setting the shipping address information.'
};

export const ProgressDelivery = {
	header: 'Please wait...',
	info: 'We are setting the delivery method information.'
};

export const ProgressPaymentToken = {
	header: 'Please wait...',
	info: 'We are sending the Payment information to the Vault.'
};

export const ProgressOrderPlacement = {
	header: 'Please wait...',
	info: 'We are placing the order.'
};

export const ProgressC2PUnlockStart = {
	header: 'Please wait...',
	info: 'We are checking with Click to Pay to see if you have any saved cards…'
};

export const ProgressShoppayUnlockStart = {
	header: 'Please wait...',
	info: 'We are checking with Shoppay.'
};

export const ProgressUnlockComplete = {
	header: 'Please wait...',
	info: 'We are validating the OTP.'
};

export const ProgressC2PTokenize = {
	header: 'Please wait...',
	info: 'We are checking with Click to Pay.'
};

export const ProgressShoppayTokenize = {
	header: 'Please wait...',
	info: 'We are checking the Shoppay Payment.'
};

export const ProgressPaypalStart = {
	header: 'Please wait...',
	info: 'We are preparing for Paypal payment.'
};

export const ProgressPaypalComplete = {
	header: 'Please wait...',
	info: 'We are getting the information from Paypal payment.'
};

export const ProgressCartUpdate = {
	header: 'Please wait...',
	info: 'We are updating the cart.'
};

export const ProgressSessionJoin = {
	header: 'Please wait...',
	info: 'We are logging in'
};

export const ProgressSessionCreateOtp = {
	header: 'Please wait...',
	info: 'We are sending you an OTP'
};

// Errors

export const ErrorTransferCart = {
	header: 'Oops. Cart Preparation Failed',
	detail: 'We are checking on the issue.'
};

export const ErrorDefault = {
	header: 'Error'
};

export const itemsRemovedInfo = {
	header: 'Info',
	detail: 'Cart has changed. Please review the cart.'
};

export const vipBenefits = [
	'Welcome offer, Up to 50% Off',
	'6th set FREE',
	'Member only access & sales',
	'$10 off every set',
	'Skip or cancel anytime'
];

export const vipDescription = `As a VIP Member you'll be charged $39.95/month. This charge becomes store credit in your
account. You always have the option to Shop or Skip before the 6th of any month to avoid
being charged. Store credit can be used to shop anytime, is refundable for up to one year
and never expires`;
