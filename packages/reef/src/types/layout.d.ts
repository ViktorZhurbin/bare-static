import type { VNode } from "preact";

/**
 * Meta data parsed from pages
 */
export interface PageMeta {
	/** Optional page title (overrides filename) */
	title?: string;
	/** Optional layout name (defaults to 'default') */
	layout?: string;
	/** Any other custom fields */
	[key: string]: unknown;
}

/**
 * Props passed to layout component functions
 */
export interface LayoutProps {
	/** Page title */
	title: string;
	/** Rendered HTML content from markdown */
	content: string;
	/** Additional properties from meta are spread here */
	[key: string]: unknown;
}



/**
 * Layout component function type
 */
export type LayoutComponent = (props: LayoutProps) => VNode;
