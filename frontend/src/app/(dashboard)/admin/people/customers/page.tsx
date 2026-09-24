'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { api, User } from '@/services';
import { PeopleTable } from '@/components/Admin/people-table';
import { PeopleCards } from '@/components/Admin/people-cards';
import { PeopleSkeleton } from '@/components/Admin/people-skeleton';
import { CreatePersonModal } from '@/components/Admin/create-person-modal';
import { EditPersonModal } from '@/components/Admin/edit-person-modal';
import { Users, Plus, Search, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomersPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [people, setPeople] = useState<User[]>([]);
  const [meta, setMeta] = useState<
    { total: number; page: number; limit: number; totalPages: number } | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9; // 9 cards fit a 3-column grid nicely

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

  // Debounced search
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

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this customer?')) return;

    setIsDeleting(id);
    try {
      await api.deletePerson(id, token);
      loadPeople(searchTerm, page);
    } catch (error) {
      console.error('Failed to delete customer', error);
      alert('Failed to delete customer');
    } finally {
      setIsDeleting(null);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
        <PeopleSkeleton count={6} viewMode="grid" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Users className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Customers Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customer accounts, verify credentials, and view profiles
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* In-place Refetch Button */}
          <button
            onClick={handleReload}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-[#14151A] hover:bg-[#1A1C23] border border-gray-800 px-3.5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all disabled:opacity-50"
            title="Refetch without reloading the full page"
          >
            <RefreshCw
              className={`w-4 h-4 text-[#7B4DFF] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{isRefreshing ? 'Refetching...' : 'Reload'}</span>
          </button>

          {/* Add Customer Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search, Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#14151A] p-4 rounded-2xl border border-gray-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-[#1A1C23] border border-gray-800 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#7B4DFF] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {meta && (
            <span className="text-xs text-gray-500">
              Total: <span className="text-gray-300 font-medium">{meta.total}</span>
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#1A1C23] border border-gray-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-[#7B4DFF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
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
          onDelete={handleDelete}
          isDeleting={isDeleting}
          basePath="/admin/people/customers"
        />
      ) : (
        <PeopleTable
          people={people}
          meta={meta}
          onPageChange={setPage}
          onEdit={(person) => setEditingPerson(person)}
          onDelete={handleDelete}
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
    </div>
  );
}
