'use client';

import StatsCard from '@/components/ui/StatsCard';
import { statsData, staffData } from '@/data/master';
import { StaffType } from '@/types/master';

const StaffMasterPage = () => {
  // Function to get status badge color
  const getStatusBadge = (status: 'Active' | 'Inactive') => {
    if (status === 'Active') {
      return 'bg-accent-success/10 text-accent-success';
    }
    return 'bg-accent-error/10 text-accent-error';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Staff Master
          </h1>

          <p className="mt-2 max-w-md text-gray-600">
            Define staff roles, manage access permissions, and control staff
            account access with precision and security.
          </p>
        </div>

        <button className="rounded-lg bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-neutral-800">
          + ADD STAFF TYPE
        </button>
      </header>

      {/* Stats Cards */}
      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statsData.map((item, index) => (
          <StatsCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            sub={item.sub}
            subIcon={item.subIcon}
            subColor={item.subColor}
            index={index}
          />
        ))}
      </section>

      {/* Table Section */}
      <section className='mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'> 
        {/* Table Header */}
        <div className='border-b border-gray-200 px-6 py-5'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Staff Types 
          </h2>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Staff Type
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Permission Modules
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Staff Members
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Last Updated
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {staffData.map((staff) => (
                <tr 
                  key={staff.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  {/* Staff Type */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{staff.name}</p>
                      <p className="text-sm text-gray-500">{staff.description}</p>
                    </div>
                  </td>

                  {/* Permission Modules */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {staff.permissionModules} Modules
                    </span>
                  </td>

                  {/* Staff Members */}
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {Array.isArray(staff.staffMembers) && 
                        staff.staffMembers.slice(0, 3).map((member, idx) => (
                          <div
                            key={idx}
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-2 ring-white ${member.bg} ${member.color}`}
                            title={member.initials}
                          >
                            {member.initials}
                          </div>
                        ))}
                      {Array.isArray(staff.staffMembers) && staff.staffMembers.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white">
                          +{staff.staffMembers.length - 3}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(staff.status)}`}>
                      <span className={`mr-1.5 h-2 w-2 rounded-full ${
                        staff.status === 'Active' ? 'bg-accent-success' : 'bg-accent-error'
                      }`} />
                      {staff.status}
                    </span>
                  </td>

                  {/* Last Updated */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {staff.lastUpdated}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors mr-3">
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button className="text-gray-400 hover:text-accent-error transition-colors">
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Showing count */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-500">
            Showing {staffData.length} staff types
          </p>
        </div>
      </section>
    </div>
  );
};

export default StaffMasterPage;