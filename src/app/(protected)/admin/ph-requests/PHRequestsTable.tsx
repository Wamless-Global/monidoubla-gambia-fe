import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { PHRequest } from './multiple-match/types';
import { getCurrencyFromLocalStorage, getSettings } from '@/lib/helpers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// NOTE: All original interfaces and logic are preserved.
interface PHRequestsTableProps {
	requests: PHRequest[];
	pageLoading: boolean;
	handleEditRequest: (request: PHRequest) => void;
	handleDeleteRequest: (request: PHRequest) => void;
}

export default function PHRequestsTable({ requests, pageLoading, handleEditRequest, handleDeleteRequest }: PHRequestsTableProps) {
	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'active':
			case 'completed':
				return 'success';
			case 'pending':
			case 'waiting-match':
				return 'warning';
			case 'partial-match':
			case 'matched':
				return 'info';
			case 'expired':
				return 'destructive';
			default:
				return 'secondary';
		}
	};

	if (pageLoading) {
		return <div className="text-center py-20 text-slate-500">Loading requests...</div>;
	}
	if (requests.length === 0) {
		return <div className="text-center py-20 text-slate-500">No requests found.</div>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-slate-200">
				<thead className="bg-slate-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">User</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
						<th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-slate-200">
					{requests.map((request) => (
						<tr key={request.id}>
							<td className="px-6 py-4 whitespace-nowrap">
								<div className="flex items-center gap-3">
									<img className="h-10 w-10 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${request.user.name.replace(' ', '+')}`} alt={request.user.name} />
									<div>
										<div className="text-sm font-medium text-slate-900">{request.user.name}</div>
										<div className="text-xs text-slate-500">{request.user.email}</div>
									</div>
								</div>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
								{request.amount.toLocaleString()} {getSettings()?.baseCurrency || getCurrencyFromLocalStorage()?.code}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(request.dateCreated).toLocaleDateString()}</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<Badge variant={getStatusVariant(request.status)} className="capitalize">
									{request.status.replace('-', ' ')}
								</Badge>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<i className="ri-more-2-fill"></i>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => handleEditRequest(request)}>Edit Request</DropdownMenuItem>
										<DropdownMenuItem onClick={() => handleDeleteRequest(request)} className="text-red-600">
											Delete Request
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
