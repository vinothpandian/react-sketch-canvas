import { IconArrowRight, IconBrandGithub } from "@tabler/icons-react";
import logo from "../assets/logo.svg";

const githubUrl = "https://github.com/vinothpandian/react-sketch-canvas";

export function HomePageHero() {
	return (
		<section className="not-prose mb-8 overflow-hidden px-2 py-10 md:py-14">
			<div className="grid justify-items-center gap-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-center md:justify-items-stretch">
				<div className="max-w-2xl text-center md:text-left">
					<h1 className="font-['Kalam',cursive] font-bold text-4xl leading-tight tracking-normal text-fd-foreground md:text-5xl lg:text-6xl">
						React Sketch Canvas
					</h1>
					<p className="mt-5 max-w-xl text-balance text-base leading-7 text-fd-muted-foreground md:text-lg">
						<span>
							Freehand vector drawing component for React using SVG as canvas
						</span>
					</p>
					<div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
						<a
							className="inline-flex h-10 items-center gap-2 rounded-md bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
							href="/react-sketch-canvas/guides/installation/"
						>
							<span>Get started</span>
							<IconArrowRight aria-hidden="true" size={18} stroke={2.4} />
						</a>
						<a
							className="inline-flex h-10 items-center gap-2 rounded-md border bg-fd-background px-4 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
							href={githubUrl}
							rel="noreferrer"
							target="_blank"
						>
							<span>View on GitHub</span>
							<IconBrandGithub aria-hidden="true" size={18} stroke={2.2} />
						</a>
					</div>
				</div>
				<div className="flex justify-center md:justify-end">
					<img
						alt=""
						className="h-auto w-44 max-w-full md:w-60 lg:w-72 p-4"
						src={logo}
					/>
				</div>
			</div>
		</section>
	);
}
