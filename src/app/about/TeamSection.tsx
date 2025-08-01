'use client';

export default function TeamSection() {
	const teamMembers = [
		{
			name: 'David Mensah',
			role: 'CEO & Founder',
			image: 'https://readdy.ai/api/search-image?query=Professional%20African%20business%20man%20CEO%20in%20modern%20suit%2C%20confident%20leader%2C%20corporate%20headshot%2C%20executive%20portrait%2C%20modern%20office%20background%2C%20successful%20entrepreneur%2C%20formal%20business%20attire&width=300&height=400&seq=team-ceo&orientation=portrait',
			bio: 'David founded Monidoubla with a vision to democratize financial growth through community-driven peer-to-peer giving.',
		},
		{
			name: 'Sarah Osei',
			role: 'Head of Operations',
			image: 'https://readdy.ai/api/search-image?query=Professional%20African%20business%20woman%20operations%20manager%2C%20confident%20female%20executive%2C%20corporate%20headshot%2C%20modern%20office%20setting%2C%20business%20suit%2C%20leadership%20portrait%2C%20professional%20smile&width=300&height=400&seq=team-operations&orientation=portrait',
			bio: 'Sarah ensures our platform runs smoothly and our community members have the best possible experience.',
		},
		{
			name: 'Michael Asante',
			role: 'Head of Technology',
			image: 'https://readdy.ai/api/search-image?query=Professional%20African%20tech%20executive%2C%20software%20engineer%2C%20modern%20workspace%2C%20technology%20leader%2C%20business%20casual%20attire%2C%20confident%20professional%2C%20innovation%20and%20technology%20background&width=300&height=400&seq=team-tech&orientation=portrait',
			bio: 'Michael leads our technical team in building secure, scalable solutions for our growing community.',
		},
		{
			name: 'Grace Boateng',
			role: 'Community Manager',
			image: 'https://readdy.ai/api/search-image?query=Professional%20African%20business%20woman%20community%20manager%2C%20friendly%20and%20approachable%2C%20modern%20office%20environment%2C%20professional%20attire%2C%20customer%20service%20excellence%2C%20warm%20smile%20and%20confident%20posture&width=300&height=400&seq=team-community&orientation=portrait',
			bio: 'Grace builds and nurtures our community, ensuring every member feels supported and valued.',
		},
	];

	return (
		<section className="py-16 sm:py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
					<p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Our dedicated team of professionals is committed to building a platform that empowers financial growth and strengthens communities.</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
					{teamMembers.map((member, index) => (
						<div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
							<div className="aspect-w-3 aspect-h-4">
								<img src={member.image} alt={member.name} className="w-full h-80 object-cover object-top" />
							</div>
							<div className="p-6">
								<h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
								<p className="text-blue-600 font-semibold mb-3">{member.role}</p>
								<p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
