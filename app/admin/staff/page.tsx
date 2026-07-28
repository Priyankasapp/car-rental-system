/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

import StatsCard from '@/components/ui/StatsCard';

import { staffStats, staffMembers } from '@/data/sraff';
import { StaffFilter, StaffMember } from '@/types/staff';

const filterOptions: StaffFilter[] = ['All', 'Active', 'Offline', 'Invited'];

const roleBadgeClass = (role: string) =>
  role === 'Super Admin'
    ? 'bg-primary text-on-primary'
    : 'bg-surface-container-highest text-primary';

function StatusIndicator({ status }: { status: StaffMember['status'] }) {
  if (status === 'Invited') {
    return (
      <div className="flex items-center gap-1.5 text-primary font-bold text-[12px]">
        <span className="material-symbols-outlined text-[16px]">schedule</span>
        Invited
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-[12px] font-medium ${
        status === 'Active' ? 'text-accent-success' : 'text-text-secondary'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          status === 'Active' ? 'bg-accent-success' : 'bg-outline'
        }`}
      />
      {status}
    </div>
  );
}

function StaffAvatar({ member }: { member: StaffMember }) {
  if (member.avatar) {
    return (
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-surface-container-highest mb-4">
        <img alt={member.name} className="w-full h-full object-cover" src={member.avatar} />
      </div>
    );
  }

  if (member.status === 'Invited') {
    return (
      <div className="w-20 h-20 rounded-full bg-surface-container border-2 border-surface-container-highest flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-outline text-[32px]">person</span>
      </div>
    );
  }

  const initials = member.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-full bg-primary-container border-2 border-surface-container-highest flex items-center justify-center mb-4">
      <span className="text-on-primary font-bold text-[20px]">{initials}</span>
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-executive relative group hover:scale-[1.02] transition-all duration-300">
      <button className="absolute top-4 right-4 text-text-secondary hover:text-primary transition-colors">
        <span className="material-symbols-outlined">more_vert</span>
      </button>

      <div className="flex flex-col items-center text-center">
        <StaffAvatar member={member} />

        <h4 className="font-bold text-on-surface body-lg mb-1">{member.name}</h4>
        <p className="text-text-secondary text-[12px] mb-4">{member.email}</p>

        <span
          className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-widest mb-4 ${roleBadgeClass(
            member.role
          )}`}
        >
          {member.role}
        </span>

        <div className="w-full pt-4 border-t border-border flex items-center justify-between">
          <StatusIndicator status={member.status} />
          <p className="text-text-secondary text-[12px]">{member.lastActive}</p>
        </div>
      </div>
    </div>
  );
}



export default function AdminStaffPage() {
  const [filter, setFilter] = useState<StaffFilter>('All');
  const [search, setSearch] = useState('');

  const filteredStaff = staffMembers.filter((member: { status: string; name: string; email: string; role: string; }) => {
    const matchesFilter = filter === 'All' || member.status === filter;
    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      member.name.toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term) ||
      member.role.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8">
      {/* Breadcrumb & Header */}
      <div className="flex items-center justify-between">
        <div>

          <h2 className="text-3xl font-bold tex-black">Staff Users</h2>
          <p className="mt-2 max-w-md text-gray-600">
            Manage your team, assign roles, and monitor account activity.
          </p>
        </div>

        <button className="rounded-lg bg-black  px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-nwutral-800">
          <span className="font-bold"> + Add New User</span>
        </button>
      </div>

    {/* Summary Stats */}
<div className="mb-12 mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
  <StatsCard
    label="Total Staff"
    value={String(staffStats.totalStaff)}
    icon="groups"
    sub={`${staffStats.totalStaffChange} this month`}
    subIcon="trending_up"
    subColor="text-green-600"
    index={0}
  />

  <StatsCard
    label="Online Now"
    value={String(staffStats.onlineNow)}
    icon="circle"
    sub="Real-time status"
    subColor="text-green-600"
    index={1}
  />

  <StatsCard
    label="Pending Invites"
    value={String(staffStats.pendingInvites).padStart(2, '0')}
    icon="mail"
    sub="Action required"
    subColor="text-red-500"
    index={2}
  />

  <StatsCard
    label="Active Sessions"
    value={String(staffStats.activeSessions)}
    icon="bolt"
    sub="Last 24 hours"
    subColor="text-gray-500"
    index={3}
  />
</div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-5 py-2 rounded-full text-[12px] font-bold transition-colors whitespace-nowrap ${
                filter === option
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff, roles..."
              className="bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 body-md focus:ring-1 focus:ring-primary transition-all outline-none"
            />
          </div>
          
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-xl">
          <span className="material-symbols-outlined text-outline text-[40px] mb-3 block">group_off</span>
          <h3 className="font-bold text-on-surface body-lg">No staff found</h3>
          <p className="text-text-secondary text-[13px] mt-1">
            {search ? 'Try a different search term.' : 'No staff match this filter yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((member) => (
            <StaffCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}