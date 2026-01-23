<script module>
	// Icon data imports - bundled at build time
	import mdiClose from '@iconify-icons/mdi/close';
	import mdiPlus from '@iconify-icons/mdi/plus';
	import mdiMinus from '@iconify-icons/mdi/minus';
	import mdiChevronUp from '@iconify-icons/mdi/chevron-up';
	import mdiChevronDown from '@iconify-icons/mdi/chevron-down';
	import mdiCheckBold from '@iconify-icons/mdi/check-bold';
	import mdiLock from '@iconify-icons/mdi/lock';
	import mdiTag from '@iconify-icons/mdi/tag';
	import mdiTagPlus from '@iconify-icons/mdi/tag-plus';
	import mdiAlertCircle from '@iconify-icons/mdi/alert-circle';
	import mdiCreditCard from '@iconify-icons/mdi/credit-card';
	import mdiImageOff from '@iconify-icons/mdi/image-off';
	import mdiImageOutline from '@iconify-icons/mdi/image-outline';
	import mdiEmailOutline from '@iconify-icons/mdi/email-outline';
	import mdiAccountCircleOutline from '@iconify-icons/mdi/account-circle-outline';
	import mdiPencil from '@iconify-icons/mdi/pencil';
	import mdiSwapHorizontal from '@iconify-icons/mdi/swap-horizontal';
	import mdiOpenInNew from '@iconify-icons/mdi/open-in-new';
	import fa6BrandsCcVisa from '@iconify-icons/fa6-brands/cc-visa';
	import fa6BrandsCcMastercard from '@iconify-icons/fa6-brands/cc-mastercard';
	import fa6BrandsCcAmex from '@iconify-icons/fa6-brands/cc-amex';
	import fa6BrandsCcJcb from '@iconify-icons/fa6-brands/cc-jcb';
	import fluentMdl2Back from '@iconify-icons/fluent-mdl2/back';
	import logosPaypal from '@iconify-icons/logos/paypal';
	import phCreditCardDuotone from '@iconify-icons/ph/credit-card-duotone';
	import eosIconsLoading from '@iconify-icons/eos-icons/loading';
	import svgSpinnersRingResize from '@iconify-icons/svg-spinners/ring-resize';
	import mdiCogOutline from '@iconify-icons/mdi/cog-outline';
	import mdiPaletteOutline from '@iconify-icons/mdi/palette-outline';
	import mdiCellphone from '@iconify-icons/mdi/cellphone';
	import mdiMonitor from '@iconify-icons/mdi/monitor';

	// Icon registry - maps icon names to bundled icon data
	export const icons = {
		'mdi:close': mdiClose,
		'mdi:plus': mdiPlus,
		'mdi:minus': mdiMinus,
		'mdi:chevron-up': mdiChevronUp,
		'mdi:chevron-down': mdiChevronDown,
		'mdi:check-bold': mdiCheckBold,
		'mdi:lock': mdiLock,
		'mdi:tag': mdiTag,
		'mdi:tag-plus': mdiTagPlus,
		'mdi:alert-circle': mdiAlertCircle,
		'mdi:credit-card': mdiCreditCard,
		'mdi:image-off': mdiImageOff,
		'mdi:image-outline': mdiImageOutline,
		'mdi:email-outline': mdiEmailOutline,
		'mdi:account-circle-outline': mdiAccountCircleOutline,
		'mdi:pencil': mdiPencil,
		'mdi:swap-horizontal': mdiSwapHorizontal,
		'mdi:open-in-new': mdiOpenInNew,
		'fa6-brands:cc-visa': fa6BrandsCcVisa,
		'fa6-brands:cc-mastercard': fa6BrandsCcMastercard,
		'fa6-brands:cc-amex': fa6BrandsCcAmex,
		'fa6-brands:cc-jcb': fa6BrandsCcJcb,
		'fluent-mdl2:back': fluentMdl2Back,
		'logos:paypal': logosPaypal,
		'ph:credit-card-duotone': phCreditCardDuotone,
		'eos-icons:loading': eosIconsLoading,
		'svg-spinners:ring-resize': svgSpinnersRingResize,
		'mdi:cog-outline': mdiCogOutline,
		'mdi:palette-outline': mdiPaletteOutline,
		'mdi:cellphone': mdiCellphone,
		'mdi:monitor': mdiMonitor
	};
</script>

<script>
	import Icon from '@iconify/svelte';

	/**
	 * @typedef {Object} IconProps
	 * @property {string} icon - Icon name (e.g., 'mdi:close', 'logos:paypal')
	 */

	/** @type {IconProps} */
	let { icon, ...props } = $props();

	// Resolve icon name to bundled data, fallback to name for API lookup
	let iconData = $derived(icons[icon] || icon);
</script>

<Icon icon={iconData} {...props} />
