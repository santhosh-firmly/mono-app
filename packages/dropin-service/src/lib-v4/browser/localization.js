// @ts-nocheck
export const Required = 'Required';
export const LastNameRequired = 'Last name is required';
const JWTValid = 'Should be a valid JSON web token';
export const ZipCodeValidation = 'Should be a valid Zip';
export const PhoneNumberValidation = 'Phone number is not valid';
export const ExpiryDateValidation = 'Expiry date is not valid';
export const CreditCardValidation = 'Enter a Valid Credit Card';
export const OTPValidation = 'Enter a valid OTP';

const required = (val) => `${val} ${Required}`;
export const minumum = (val) => `Minimum of ${val} characters required`;
export const maximum = (val) => `Maximum of ${val} characters required`;

const Return = 'Return';
const Change = 'Change';
const Close = 'Close';

const CreditCardInformation = 'Credit Card Information';
const ButtonCreditCard = 'Buy with Card';
const ButtonC2P = 'Continue with Click to Pay';
const ButtonBuyWith = 'Buy with';

const LinkResendOTP = 'Resend OTP';

const CreditCardValid = 'VALID THRU';

const FirstName = 'First name';
const LastName = 'Last name';
const Address1 = 'Street';
const Address2 = 'Apt/Suite/Building';
const City = 'City';
const State = 'State';
const Zip = 'Zip';
const Country = 'Country';
const CardNumber = 'Card Number';
const CardName = 'Name on Card';
const ExpiryDate = 'MM/YY';
const CVC = 'CVV';
const Payment = 'Payment';
const Phone = 'Phone';
const Email = 'Email';
const Next = 'Next';
const PlaceOrder = 'Place Order';
const OTP = 'OTP';
const SecureCheckout = 'Secure checkout';

const CartSubTotal = 'Subtotal';
const CartShipping = 'Shipping';
const CartTax = 'Tax';
const CartTotal = 'Total';
const CartDiscount = 'Discount';
const CartStoreCredit = 'Store Credits';

const PriceFree = 'FREE';

const SameAsShippingAddress = 'My billing address same as shipping';

const Password = 'Password';

// Payment
const NewCreditCard = 'New Card';

// Credit card
export const CreditCardExpires = 'Expires';
export const CreditCardExpired = 'expired';

// Footer
const FooterLine1 = 'Powered by firmly';
const FooterLine2 = 'Checkout securely with';

const ViewTitlePaymentOptions = 'Checkout';
const ViewTitleContact = 'Contact';
const ViewTitleShippingAddress = 'Shipping';
const ViewTitleShippingMethod = 'Shipping Method';
const ViewTitlePayment = 'Payment';
const ViewTitleReview = 'Review';
const ViewTitleOrderPlaced = 'Thank you';
const ViewTitleLoadingCart = 'Checking';

// Click to Pay
const ViewTitleC2PLogin = 'Pay with confidence with Click to Pay';
const ViewTitleC2POtp = 'Welcome back to Click to Pay';
const ViewTitleC2PStepUp = "Lets make sure it's you";
const ViewTitleC2PVerifyCode = 'Verify with code';

const InfoC2PPrivacy =
	"By checking this box, you consent and direct firmly to send your information to <span class='font-bold text-neutral-500'>Click to Pay</span> to check if you have any saved cards";
const InfoC2PDetail = 'Easy and smart online checkout';
const InfoC2PEmail = 'Enter your email to continue';
const InfoC2PTerms = "By continuing, you agree to Visa's Privacy Notice";
const InfoC2PRememberMe = 'Skip Verification next time';
export const InfoC2PRememberMeLong =
	'If you’re remembered, you won’t need to enter a code next time to securely access your saved cards.\n\nNot recommended for public or shared devices because this uses cookies.';

const InfoOTP = 'Enter the One-Time Passcode sent to';
const InfoPhone = 'Phone:';
const InfoEmail = 'Email:';

const InfoC2PShippingHeader = 'We found you!';
const InfoC2PShippingDetail = 'Add your shipping details to continue with the purchase';

const InfoMerchantOtpHeader = 'We noticed you already have an account with #MERCHANT#!';
const InfoMerchantOtpDetail =
	'Enter OTP to access your saved cards and complete the purchase in one click';

const InfoC2POTPHeader = 'We found your saved cards with Click to Pay!';
const InfoC2POTPDetail = 'Enter OTP to access your saved cards and complete the purchase';

const InfoC2PCVVHeader = 'Enter CVV to complete purchase';
const InfoC2PCVVDetail = 'For your security please enter CVV to complete purchase';

const InfoC2PNoCards = 'Please enter a credit card';

const InfoC2PNeedToVerify =
	'For added security to complete your oder, you need to be verified with your bank.';
const InfoC2PVerificationOptions = 'Select how you want to verify:';
const InfoC2PVerifyBankApp = (cardNumber) =>
	`Verify this purchase in the bank app associated with card **** ${cardNumber}. Return to this page for order confirmation.`;
const InfoC2PVerifyOTPDestination = (method) =>
	`Enter the code sent to <strong>${method}</strong> to complete your order`;

// Shop Pay
const ViewTitleShopPayLogin = 'Pay with confidence with ShopPay';
const ViewTitleShopPayOtp = 'Welcome back to ShopPay';

const InfoShopPayEmail = 'Enter your email to continue';
const InfoShopPayOTP = 'Enter the One-Time Passcode ShopPay sent to';

const InfoShopPayShippingHeader = 'We found you!';
const InfoShopPayShippingDetail = 'Add your shipping details to continue with the purchase';

const ReviewContact = 'Contact';
const ReviewDeliveryMethod = 'Method';
const ReviewPayment = 'Payment';
const ReviewCVV = 'For additional security please enter the security code';
const ReviewCVVToolTip = "3 digits CVV from the back of your card (4 digits if it's an AmEx)";

const ReviewShippingAddress = 'Shipping';
const ReviewDelivery = 'Delivery';
const ReviewTerms =
	'By placing the order, you agree to the #terms# and #privacypolicy# of firmly and the merchant’s privacy policy. Your order will be processed and fulfilled by the merchant';

// Paypal
const InfoPaypalShippingHeader = 'We need additional information';
const InfoPaypalMissingPhone = 'Please have your phone information updated';
const InfoPaypalMissingEmail = 'Please have your email information updated';

// Store Login
const InfoStoreLoginHeader = (storeName) => `Welcome back to ${storeName}`;
const InfoStoreLoginDetail = (email) => `Enter the password for ${email}`;

// Order Placed
const OrderPlacedNotes = 'You will receive an email with order confirmation from the merchant.';
const OrderPlaced = 'Order Placed !';
const OrderNumber = 'Order Number:';
const OrderPlacedBuffer = 'Please wait, we are taking you to the thank you page...';

const OrderSummary = (count) =>
	count == 1 ? 'Order Summary (1 item)' : `Order Summary (${count} items)`;
const Carts = (count) => (count == 1 ? 'Cart (1 item)' : `Cart (${count} items)`);

// Product card
const ProductCheckout = 'Checkout';
const ProductSize = 'Size:';
const ProductComplimentaryGift = 'Complimentary Gift';
const ProductQuantity = 'Qty:';
const ProductRemove = 'Remove';

// Shipping Address
const ShippingAddressSearch = 'Search';

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

export const ProgressUnlockComplete = {
	header: 'Please wait...',
	info: 'We are validating the OTP.'
};

export const ProgressC2PTokenize = {
	header: 'Please wait...',
	info: 'We are checking with Click to Pay.'
};

const ProgressPaypalStart = {
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

const ErrorTransferCart = {
	header: 'Oops. Cart Preparation Failed',
	detail: 'We are checking on the issue.'
};

const ErrorDefault = {
	header: 'Error'
};

const itemsRemovedInfo = {
	header: 'Info',
	detail: 'Cart has changed. Please review the cart.'
};

const vipBenefits = [
	'Welcome offer, Up to 50% Off',
	'6th set FREE',
	'Member only access & sales',
	'$10 off every set',
	'Skip or cancel anytime'
];

const vipDescription = `As a VIP Member you'll be charged $39.95/month. This charge becomes store credit in your
account. You always have the option to Shop or Skip before the 6th of any month to avoid
being charged. Store credit can be used to shop anytime, is refundable for up to one year
and never expires`;
