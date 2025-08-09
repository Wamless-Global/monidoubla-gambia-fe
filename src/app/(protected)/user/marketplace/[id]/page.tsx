import { Metadata } from 'next';
import Content from './content';

type Params = Promise<{ id: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
	const params = await props.params;

	return {
		title: `Product ${params.id}`,
		description: `Product page for ID ${params.id}.`,
	};
}

interface Props {
	params: Params;
}

export default async function Page({ params }: Props) {
	const param = await params;
	return <Content productId={param.id} />;
}
