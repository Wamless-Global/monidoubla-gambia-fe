import { Metadata } from 'next';
import Content from './content';

type Params = Promise<{ id: string }>;

interface Props {
	params: Params;
}

export async function generateStaticParams() {
	return [{ id: 'ph-001' }, { id: 'ph-002' }, { id: 'ph-003' }, { id: 'ph-004' }, { id: 'ph-005' }];
}

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
	const params = await props.params;

	return {
		title: `Product ${params.id}`,
		description: `Product page for ID ${params.id}.`,
	};
}

export default async function Page({ params }: Props) {
	const param = await params;
	return <Content id={param.id} />;
}
