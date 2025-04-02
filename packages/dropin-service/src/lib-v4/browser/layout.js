// @ts-nocheck
export const MOBILE = 'mobile';
export const DESKTOP = 'desktop';
export const NA = 'na';

const layouts = [
	{
		name: MOBILE,
		condition: canDisplayMobile,
		sizeRanges: [{ width: [300, 500], height: [250, 2000] }],
		isPhone: true
	},
	{
		name: DESKTOP,
		sizeRanges: [
			{ width: [970, 1000], height: [250, 250] },
			{ width: [800, 850], height: [497, 497] },
			{ width: [650, 720], height: [413, 420] },
			{ width: [400, 620], height: [182, 403] }
		]
	},
	{
		name: NA,
		sizeRanges: [{ width: [0, 0], height: [0, 0] }]
	}
];

function canDisplayMobile() {
	let ret = false;
	ret = window.innerWidth >= 300 && window.innerWidth <= 500;
	if (window.innerWidth > 360) {
		ret = ret && window.innerHeight > window.innerWidth;
	}
	//console.log("canDisplayMobile:", ret, "---", window.innerWidth, window.innerHeight, "---", window.screen.width, window.screen.height, "---", width, "---", window.visualViewport.width, window.visualViewport.height);
	return ret;
}

const defaultMargins = 2 * 2;

export function getContentSize(width, height) {
	let maxArea = -1;
	let framedLayout, framedWidth, framedMaxWidth, framedHeight, framedMaxHeight;
	for (let layout of layouts) {
		if (!layout.condition || layout.condition(width)) {
			let contentWidth = width;
			let contentHeight = height;

			if (layout.isFullscreen) {
				const margins = layout.isPhone ? 0 : defaultMargins;
				contentWidth = Math.max(width - margins, 0);
				contentHeight = Math.max(height - margins, 0);
			}

			for (let range of layout.sizeRanges) {
				const [minWidth, maxWidth] = range.width;
				const [minHeight, maxHeight] = range.height;
				if (contentWidth >= minWidth && contentHeight >= minHeight) {
					const layoutWidth = Math.min(contentWidth, maxWidth, 512); //512 is width of max-w-lg. Please change it, when we decide to expand it
					const layoutHeight = contentHeight; //Math.min(contentHeight, maxHeight);
					const area = Math.max(0, layoutWidth) * Math.max(0, layoutHeight);
					if (area > maxArea) {
						maxArea = area;
						framedLayout = layout;
						framedWidth = layoutWidth;
						framedMaxWidth = maxWidth;
						framedMaxHeight = maxHeight;
						framedHeight = layoutHeight;
					}
				}
			}
		}
	}
	return {
		layout: framedLayout,
		width: framedWidth,
		//maxWidth: framedMaxWidth,
		height: framedHeight,
		//maxHeight: framedMaxHeight,
		portrait: framedMaxHeight > framedMaxWidth
	};
}

export function setContentStyle(options) {
	const { viewportWidth, viewportHeight, contentElement } = options;
	let framedLayout = getContentSize(viewportWidth, viewportHeight);

	//Center layout in frame
	if (contentElement) {
		contentElement.style.left = ((viewportWidth - framedLayout.width) >> 1) + 'px';
		contentElement.style.top = ((viewportHeight - framedLayout.height) >> 1) + 'px';
		contentElement.style.width = framedLayout.width + 'px';
		contentElement.style.height = framedLayout.height + 'px';

		if (framedLayout.layout.name == MOBILE) {
			contentElement.style.marginTop = '0px';
			contentElement.style.marginBottom = '0px';
			contentElement.style.height = '100%';
		} else if (framedLayout.layout.name == DESKTOP) {
			contentElement.style.marginTop = '10vh';
			contentElement.style.marginBottom = '2vh';
			contentElement.style.height = '88vh';
		}
		//console.log("setContentStyle:", framedLayout.layout.name, framedLayout.width, framedLayout.height, framedLayout);
	}

	return framedLayout;
}
