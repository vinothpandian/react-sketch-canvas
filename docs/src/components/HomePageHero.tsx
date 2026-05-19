import {
	IconArrowRight,
	IconBrandGithub,
	IconPencil,
} from "@tabler/icons-react";
import logo from "../assets/logo.svg";

const githubUrl = "https://github.com/vinothpandian/react-sketch-canvas";

export function HomePageHero() {
	return (
		<section className="not-prose mb-10 overflow-hidden px-6 py-14 md:px-12 md:py-20">
			<div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
				<div className="max-w-3xl">
					<h1 className="font-bold text-5xl leading-tight tracking-normal md:text-7xl lg:text-8xl">
						React Sketch Canvas
					</h1>
					<p className="mt-8 flex flex-wrap items-center gap-2 text-2xl  md:text-3xl">
						<span>
							Freehand vector drawing component for React using SVG as canvas
						</span>
					</p>
					<div className="mt-10 flex flex-wrap items-center gap-5">
						<a
							className="inline-flex h-14 items-center gap-4 rounded-full px-7 font-medium text-xl transition-colors"
							href="/guides/installation/"
						>
							<span>Get started</span>
							<IconArrowRight aria-hidden="true" size={24} stroke={2.5} />
						</a>
						<a
							className="inline-flex h-14 items-center gap-3 rounded-full px-4 font-medium text-xl transition-colors"
							href={githubUrl}
							rel="noreferrer"
							target="_blank"
						>
							<span>View on GitHub</span>
							<IconBrandGithub aria-hidden="true" size={25} stroke={2.2} />
						</a>
					</div>
				</div>
				<div className="flex justify-center lg:justify-end">
					<img
						alt=""
						className="h-auto w-64 max-w-full md:w-80 lg:w-96"
						src={logo}
					/>
				</div>
			</div>
		</section>
	);
}
