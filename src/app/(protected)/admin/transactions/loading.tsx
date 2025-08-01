
export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
      </div>

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-4"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-4"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-20"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-16"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-12"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-8"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-8"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
        </div>
      </div>
    </div>
  );
}
