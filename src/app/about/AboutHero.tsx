'use client';

export default function AboutHero() {
	return (
		<section
			className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center relative"
			style={{
				backgroundImage: `url('/images/about-hero-bg.jpg')`,
			}}
		>
			<div className="absolute inset-0 bg-black/50"></div>
			<div className="relative z-10 text-white px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
				<div className="max-w-2xl">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">What Is Monidoubla</h1>
					<p className="text-lg sm:text-xl text-gray-200 leading-relaxed mb-8">
						Monidoubla is a peer-to-peer financial empowerment platform that empowers people to give whilst still allowing them to earn on their platform. We help you give into a transparent financial network whether you're giving to help others or to grow out your financial standing.
						Monidoubla gives you a fair and rewarding experience.
					</p>
				</div>
			</div>
		</section>
	);
}
