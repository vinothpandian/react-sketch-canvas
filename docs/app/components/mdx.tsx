import {
	IconBook2,
	IconCode,
	IconDeviceDesktop,
	IconDownload,
	IconEraser,
	IconGauge,
	IconHistory,
	IconLayoutGrid,
	IconLayoutRows,
	IconPencil,
	IconPhoto,
	IconPlayerPlay,
	IconPointer,
	IconResize,
	IconRotate,
	IconSignature,
	IconSunMoon,
} from "@tabler/icons-react";
import * as Twoslash from "fumadocs-twoslash/ui";
import { Cards, Card as FumadocsCard } from "fumadocs-ui/components/card";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";

const icons = {
	api: IconCode,
	background: IconPhoto,
	book: IconBook2,
	desktop: IconDeviceDesktop,
	download: IconDownload,
	erase: IconEraser,
	gauge: IconGauge,
	history: IconHistory,
	input: IconPointer,
	"layout-grid": IconLayoutGrid,
	pencil: IconPencil,
	resize: IconResize,
	rows: IconLayoutRows,
	play: IconPlayerPlay,
	reset: IconRotate,
	signature: IconSignature,
	"sun-moon": IconSunMoon,
};

type CardProps = ComponentProps<typeof FumadocsCard> & {
	icon?: keyof typeof icons | ReactNode;
};

function Card({ icon, ...props }: CardProps) {
	const Icon =
		typeof icon === "string" ? icons[icon as keyof typeof icons] : undefined;

	return (
		<FumadocsCard
			icon={Icon ? <Icon aria-hidden="true" size={18} /> : icon}
			{...props}
		/>
	);
}

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		Card,
		CardGrid: Cards,
		Tab,
		TabItem: Tab,
		Tabs,
		...Twoslash,
		...components,
	} satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
