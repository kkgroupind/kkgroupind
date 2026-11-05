'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminTheme } from '@/context/admin-theme-context';
import { api, User } from '@/services';
import { PeopleTable } from '@/components/Admin/people-table';
import { PeopleCards } from '@/components/Admin/people-cards';
import { PeopleSkeleton } from '@/components/Admin/people-skeleton';
import { CreatePersonModal } from '@/components/Admin/create-person-modal';
import { EditPersonModal } from '@/components/Admin/edit-person-modal';
import { ConfirmationModal } from '@/components/Admin/confirmation-modal';
import { Users, Plus, Search, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const { isDark } = useAdminTheme();
  const router = useRouter();

  const [people, setPeople] = useState<User[]>([]);
  const [meta, setMeta] = useState<
    { total: number; page: number; limit: number; totalPages: number } | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9;

  const loadPeople = useCallback(
    async (search: string, currentPage: number, showRefreshIndicator = false) => {
      if (!token) return;
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      try {
        const result = await api.listPeople(token, {
          role: 'CUSTOMER',
          search,
          page: currentPage,
          limit,
        });
        setPeople(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error('Failed to load customers', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, limit],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (token && user?.role === 'SUPER_ADMIN') {
        loadPeople(searchTerm, page);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, page, token, user, loadPeople]);

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      }
    }
  }, [authLoading, token, user, router]);

  const handleReload = () => {
    loadPeople(searchTerm, page, true);
  };

  const handleDeletePrompt = (id: string) => {
    const target = people.find((p) => p.id === id);
    if (target) {
      setDeleteTarget(target);
    }
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteTarget) return;

    setIsDeleting(deleteTarget.id);
    try {
      await api.deletePerson(deleteTarget.id, token);
      setDeleteTarget(null);
      loadPeople(searchTerm, page);
    } catch (error) {
      console.error('Failed to delete customer', error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <PeopleSkeleton count={6} viewMode="grid" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <div
              className={`p-2.5 rounded-[24px] border flex items-center justify-center ${
                isDark ? 'bg-[#12141A] border-white/[0.08] text-[#6366F1]' : 'bg-white border-slate-200 text-[#6366F1] shadow-xs'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            Customers &amp; Clients
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Customer accounts, contact numbers, and booked service history
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Reload Button */}
          <button
            onClick={handleReload}
            disabled={isRefreshing || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-all disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-[#12141A] hover:bg-[#161922] border-white/[0.08] text-zinc-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
            }`}
            title="Refetch without reloading the full page"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#6366F1] ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>{isRefreshing ? 'Reloading...' : 'Reload'}</span>
          </button>

          {/* Add Customer Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#5254E0] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold shadow-md shadow-[#6366F1]/20 transition-all ml-auto sm:ml-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search, Filters and View Toggle */}
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-3xl border ${
          isDark ? 'bg-[#181A20] border-white/[0.06]' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search customers by username, name, mobile..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs sm:text-sm border focus:outline-none focus:border-[#FF5C38] transition-colors ${
              isDark
                ? 'bg-[#121318] border-white/[0.06] text-white placeholder-zinc-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {meta && (
            <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Total Customers: <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{meta.total}</span>
            </span>
          )}

          {/* View Mode Toggle */}
          <div
            className={`flex items-center p-1 rounded-full border ${
              isDark ? 'bg-[#121318] border-white/[0.06]' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FF5C38] text-white shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#FF5C38] text-white shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Cards Grid or Table */}
      {isLoading && !isRefreshing ? (
        <PeopleSkeleton count={limit} viewMode={viewMode} />
      ) : viewMode === 'grid' ? (
        <PeopleCards
          people={people}
          meta={meta}
          onPageChange={setPage}
          onEdit={(person) => setEditingPerson(person)}
          onDelete={handleDeletePrompt}
          isDeleting={isDeleting}
          basePath="/admin/people/customers"
        />
      ) : (
        <PeopleTable
          people={people}
          meta={meta}
          onPageChange={setPage}
          onEdit={(person) => setEditingPerson(person)}
          onDelete={handleDeletePrompt}
          isDeleting={isDeleting}
          basePath="/admin/people/customers"
        />
      )}

      <CreatePersonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role="CUSTOMER"
        token={token!}
        onSuccess={() => loadPeople(searchTerm, page)}
      />

      <EditPersonModal
        isOpen={!!editingPerson}
        person={editingPerson}
        onClose={() => setEditingPerson(null)}
        token={token!}
        onSuccess={() => loadPeople(searchTerm, page)}
      />

      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Profile"
        message="Are you sure you want to permanently delete this customer profile? Any associated history and cyclic reminders may be impacted."
        confirmText="Delete Customer"
        variant="danger"
        isLoading={!!isDeleting}
        itemDetails={
          deleteTarget
            ? [
                { label: 'Name', value: deleteTarget.name },
                { label: 'Username', value: `@${deleteTarget.username}` },
                { label: 'Phone', value: deleteTarget.phone || 'N/A' },
              ]
            : undefined
        }
      />
    </div>
  );
}
