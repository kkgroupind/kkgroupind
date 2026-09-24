'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
} from 'lucide-react';
import { CreateWorkModal } from '@/components/OfficeStaff/CreateWorkModal';
import { EnquiryService, WorkerWithAvailability } from '@/services';

const SERVICES_MASTER = [
  {
    id: 'cococare',
    title: 'Cococare - Palm Tree Harvesting & Maintenance',
    category: 'Agricultural',
    description:
      'Climbing, crown clearing, organic pest management, and fruit harvesting across plantations and residential properties.',
    squadLead: 'Ratheesh V.',
    turnaround: '2-4 Hours',
    coverage: 'Statewide',
    activeSquads: 4,
  },
  {
    id: 'jcb',
    title: 'JCB Heavy Machinery & Earth Excavation',
    category: 'Heavy Equipment',
    description:
      'Site clearing, foundation trenching, agricultural pond digging, and road formation with hydraulic excavators.',
    squadLead: 'Karan Kumar',
    turnaround: 'Same Day Dispatch',
    coverage: 'Central & South Zones',
    activeSquads: 6,
  },
  {
    id: 'masonry',
    title: 'Plastering & Masonry Services',
    category: 'Civil Construction',
    description:
      'Wall rendering, smooth cement finishing, brick laying, concrete reinforcement, and structural foundation repair.',
    squadLead: 'Ajsal Rahman',
    turnaround: '1-2 Days',
    coverage: 'Statewide',
    activeSquads: 5,
  },
  {
    id: 'painting',
    title: 'Commercial & Residential Painting',
    category: 'Finishing Works',
    description:
      'Exterior weatherproofing, interior emulsion, anti-fungal treatments, and high-pressure spray finishing.',
    squadLead: 'Suresh Kumar',
    turnaround: 'Scheduled',
    coverage: 'Statewide',
    activeSquads: 3,
  },
  {
    id: 'tiling',
    title: 'Tile, Marble & Granite Installation',
    category: 'Finishing Works',
    description:
      'Laser leveling, diamond edge cutting, bathroom waterproofing, and vitrified tile & marble laying.',
    squadLead: 'Biju George',
    turnaround: 'Scheduled',
    coverage: 'Major Metros',
    activeSquads: 4,
  },
  {
    id: 'electrical',
    title: 'Electrical & 3-Phase Wiring Systems',
    category: 'Utilities',
    description:
      'Industrial panel configuration, 3-phase wiring, inverter cabling, switchboard maintenance, and safety inspections.',
    squadLead: 'Manoj Pillai',
    turnaround: 'Immediate Dispatch',
    coverage: 'Statewide',
    activeSquads: 8,
  },
  {
    id: 'plumbing',
    title: 'Plumbing & Drainage Systems',
    category: 'Utilities',
    description:
      'Underground pipeline trenching, high-pressure PVC/CPVC installations, septic line repairs, and fixture replacement.',
    squadLead: 'Anoop Nair',
    turnaround: 'Immediate Dispatch',
    coverage: 'Statewide',
    activeSquads: 7,
  },
  {
    id: 'borewell',
    title: 'Borewell Drilling & Groundwater Testing',
    category: 'Heavy Equipment',
    description:
      'Deep aquifer drilling, 6-inch casing pipe installation, submersible pump fitting, and yield testing.',
    squadLead: 'Rajesh Sharma',
    turnaround: 'Scheduled',
    coverage: 'Highland & Coastal',
    activeSquads: 2,
  },
];

export default function AdminServicesPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!token || user?.role !== 'SUPER_ADMIN') {
        router.push('/admin/login');
      } else {
        EnquiryService.getActiveWorkers(token).then((res) => {
          setWorkers(res.workers || []);
        });
      }
    }
  }, [authLoading, token, user, router]);

  const categories = ['ALL', 'Agricultural', 'Heavy Equipment', 'Civil Construction', 'Finishing Works', 'Utilities'];

  const filteredServices = SERVICES_MASTER.filter((s) => {
    const matchesSearch =
      searchTerm === '' ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.squadLead.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10 text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-[#1A1C23] border border-gray-800 rounded-xl">
              <Layers className="w-6 h-6 text-[#7B4DFF]" />
            </div>
            Services Catalog
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage operational service capabilities, coverage zones, and assigned team leads
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#7B4DFF] hover:bg-[#6A3DEE] px-4 py-2 rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(123,77,255,0.3)] transition-all ml-auto sm:ml-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#14151A] border border-gray-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search service name, lead, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E12] border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1A1C23] text-white border border-gray-700'
                  : 'bg-[#0D0E12] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((svc) => (
          <div
            key={svc.id}
            className="p-5 rounded-xl bg-[#14151A] border border-gray-800 hover:border-gray-700 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                  {svc.category}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span>{svc.turnaround}</span>
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-100">{svc.title}</h3>

              <p className="text-xs text-gray-400 leading-relaxed">{svc.description}</p>
            </div>

            <div className="pt-3 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="text-gray-500">Squad Lead:</span>
                <span className="font-medium text-gray-200">{svc.squadLead}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="text-gray-500">Coverage:</span>
                <span className="text-gray-300">{svc.coverage}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-emerald-400 font-medium">{svc.activeSquads} Active Squads</span>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[#7B4DFF] hover:underline font-medium flex items-center gap-1"
                >
                  <span>Dispatch Job</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <CreateWorkModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {}}
        token={token}
        workers={workers}
      />
    </div>
  );
}
