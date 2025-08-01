import { Metadata } from 'next';
import Content from './content';

type Params = Promise<{ id: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
	const params = await props.params;

	return {
		title: `${params.id}`,
	};
}

export async function generateStaticParams() {
	return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }];
}

interface Props {
	params: Params;
}

export default async function Page({ params }: Props) {
	const param = await params;
	return <Content username={param.id} />;
}
