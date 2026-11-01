'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type WorkerLanguage = 'en' | 'ml' | 'hi';

export interface LanguageOption {
  code: WorkerLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const WORKER_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
];

const WORKER_LANG_STORAGE_KEY = 'kk_worker_preferred_language';

// Comprehensive Service Translations Dictionary for KK Group
const SERVICE_TRANSLATIONS: Record<string, { ml?: string; hi?: string; en: string }> = {
  // Plantation & Tree Services
  cococare: {
    en: 'Cococare - Palm Tree Harvesting & Maintenance',
  },
  palm: {
    en: 'Cococare - Palm Tree Harvesting & Maintenance',
  },
  'tree cutting': {
    en: 'Tree Cutting & Logging',
  },
  'tree trimming': {
    en: 'Tree Trimming & Pruning',
  },
  tree: {
    en: 'Tree Cutting & Clearing',
  },
  'land clearing': {
    en: 'Land Clearing & Plot Cleaning',
  },
  bush: {
    en: 'Bush Clearing & Site Prep',
  },

  // Heavy Machinery & Excavation
  jcb: {
    en: 'JCB Heavy Machinery & Earth Excavation',
  },
  excavator: {
    en: 'Excavator & Earthmoving',
  },
  earthmoving: {
    en: 'Earthmoving & Trenching',
  },
  crane: {
    en: 'Heavy Crane Operations',
  },
  demolition: {
    en: 'Building Demolition & Breaking',
  },
  debris: {
    en: 'Debris Removal & Site Cleanup',
  },
  rock: {
    en: 'Rock Breaking & Crushing',
  },
  tipper: {
    en: 'Tipper Truck Transportation',
  },
  truck: {
    en: 'Heavy Truck Hauling',
  },
  road: {
    en: 'Road Works & Paving',
  },

  // Construction, Masonry & Finishing
  masonry: {
    en: 'Masonry & Brick Construction',
  },
  brick: {
    en: 'Masonry & Brick Construction',
  },
  plastering: {
    en: 'Exterior/Interior Plastering & Masonry',
  },
  concrete: {
    en: 'Concrete & Masonry Works',
  },
  tile: {
    en: 'Tile, Marble & Granite Laying',
  },
  marble: {
    en: 'Tile, Marble & Granite Laying',
  },
  granite: {
    en: 'Tile, Marble & Granite Laying',
  },
  painting: {
    en: 'Commercial & Residential Painting',
  },

  // MEP & Technical
  electrical: {
    en: 'Electrical & Wiring Systems',
  },
  wiring: {
    en: 'Electrical Wiring Systems',
  },
  plumbing: {
    en: 'Plumbing & High-Pressure Piping',
  },
  pipe: {
    en: 'Pipeline Trenching & Drainage',
  },
  borewell: {
    en: 'Borewell Drilling & Water Testing',
  },
  water: {
    en: 'Water Systems & Survey',
  },
  labour: {
    en: 'Field Labour Operations',
  },
};

const translations = {
  // Navigation
  home: { en: 'Home', },
  jobs: { en: 'Jobs', },
  notifications: { en: 'Notification', },
  profile: { en: 'Profile', },
  operative: { en: 'OPERATIVE', },

  // Header
  primary: { en: 'Primary', },
  dashboard: { en: 'Dashboard', },
  workspaceTitle: {
    en: 'Field Operations Workspace',
  },

  // Dashboard & Shift
  todayShift: { en: "Today's Shift", },
  todayDate: { en: "Today's Date", },
  todayWork: { en: "Today's Active Work", },
  currentWorkSubtitle: {
    en: 'Current work order requiring your operative field execution',
  },
  previousWorks: {
    en: 'Work History & Previous Works',
  },
  previousWorksSubtitle: {
    en: 'Complete record of your past completed work orders, dispatches, and dates',
  },
  activeWorkMetric: { en: 'Active Work', },
  assignedNewMetric: { en: 'Assigned New', },
  completedMetric: { en: 'Completed', },

  // Duty status
  onDuty: { en: 'On Duty', },
  offDuty: { en: 'Off Duty', },
  dutyAvailable: {
    en: 'Field Duty Active (Available)',
  },
  dutyOff: {
    en: 'Off Duty (Standby)',
  },
  fieldAttendance: {
    en: 'Field Attendance',
  },
  availableForWork: {
    en: 'Available for Work',
  },
  onLeaveOffDuty: {
    en: 'On Leave / Off Duty',
  },
  activeDispatch: {
    en: 'Active Dispatch',
  },
  workOrdersCount: {
    en: 'Work Orders',
  },
  toggle: { en: 'Toggle', },

  // Job Cards & Actions
  startJob: { en: 'Start Job', },
  markCompleted: { en: 'Mark Completed', },
  viewDetails: { en: 'Full Details', },
  customer: { en: 'Customer', },
  phone: { en: 'Phone', },
  site: { en: 'Site Location', },
  deadline: { en: 'Deadline', },
  duration: { en: 'Duration', },
  mins: { en: 'mins', },
  inProgress: { en: 'In Progress', },
  assigned: { en: 'Assigned', },
  completedBadge: { en: 'Completed', },
  starting: { en: 'Starting...', },
  completing: { en: 'Completing...', },
  done: { en: 'Done', },

  noActiveWorkTitle: {
    en: 'Standby / No Active Work Order In Progress',
  },
  noActiveWorkDesc: {
    en: 'You currently have no active jobs in progress. When the office dispatch desk allocates a new customer order to you, it will appear here instantly.',
  },
  noPreviousWorkTitle: {
    en: 'No previous works recorded yet',
  },
  noPreviousWorkDesc: {
    en: 'Once you complete assigned field work orders, your entire verified job ledger and history will be listed here.',
  },

  // Jobs Page Filters & Controls
  workOrdersTitle: {
    en: 'Jobs & Work Orders',
  },
  workOrdersSubtitle: {
    en: 'Browse all field dispatches, ongoing work orders, and past completion logs',
  },
  allFilter: { en: 'All Time', },
  thisMonthFilter: { en: 'This Month', },
  allFilterCount: { en: 'All Jobs', },
  activeFilterCount: { en: 'In Progress', },
  assignedFilterCount: { en: 'Assigned', },
  completedFilterCount: { en: 'Completed', },
  jobsCenter: { en: 'Jobs Center', },
  searchPlaceholder: {
    en: 'Search jobs, tracking ID, customer...',
  },
  noJobsFound: {
    en: 'No Jobs Found',
  },
  noJobsFoundDesc: {
    en: 'There are currently no work orders under this status filter.',
  },

  // Notifications Page
  notificationsTitle: {
    en: 'Notifications & Operational Alerts',
  },
  notificationsSubtitle: {
    en: 'Real-time operational alerts, newly dispatched customer orders, and field shift logs',
  },
  allNotifications: { en: 'All Notifications', },
  newDispatches: { en: 'New Dispatches', },
  shiftStatus: { en: 'Shift Status', },
  actionRequired: { en: 'Action Required', },
  inspectDispatch: { en: 'Inspect Dispatch', },
  changeShiftStatus: { en: 'Change Shift Status', },
  newOrderDispatched: {
    en: 'New Work Order Dispatched to You',
  },
  urgentRequirement: {
    en: 'Customer requires immediate operational deployment.',
  },
  noNotificationsTitle: {
    en: 'No Notifications Yet',
  },
  noNotificationsDesc: {
    en: 'You are all caught up! New dispatch alerts and work order assignments will appear here.',
  },

  // Sidebar & Squad
  fieldSquad: { en: 'Field Squad', },
  liveMap: { en: 'Live Operations Map', },
  activeCrew: { en: 'Active', },
  allSquad: { en: 'All Squad', },
  online: { en: 'Online Only', },
  gpsNavigation: { en: 'GPS Navigation', },
  startNavigation: { en: 'Start Navigation', },
  workSiteLocation: { en: 'Work Site Location', },
  signOut: { en: 'Sign Out', },
  settings: { en: 'Settings', },

  // Modals & Details
  workOrderDetails: {
    en: 'Work Order Details',
  },
  close: { en: 'Close', },
  modalSubtitle: {
    en: 'Review site guidelines, navigate to coordinates, and manage execution progress',
  },
  acceptFinishToday: {
    en: 'Accept: Finish Today',
  },
  startWork: {
    en: 'Start Work',
  },
  workSpecs: {
    en: 'Work Specifications & Requirements',
  },
  officeInstructions: {
    en: 'Office Dispatch Instructions',
  },
  workerCommitment: {
    en: 'Worker Commitment',
  },
  targetCompletion: {
    en: 'Target Completion',
  },
  landmarks: {
    en: 'Access Remarks & Landmarks',
  },

  // Profile Labels
  operativeProfile: {
    en: 'Operative Profile & Credentials',
  },
  personalDetails: { en: 'Personal Details', },
  securityPassword: { en: 'Security & Password', },
  shiftAttendance: { en: 'Shift & Attendance', },
  backToDashboard: { en: 'Back to Dashboard', },
  fullName: { en: 'Full Name', },
  usernameLabel: { en: 'Username', },
  mobileLabel: { en: 'Mobile Phone', },
  saveChanges: { en: 'Save Changes', },
  saving: { en: 'Saving...', },
} as const;

export type TranslationKey = keyof typeof translations;

interface WorkerLanguageContextType {
  language: WorkerLanguage;
  setLanguage: (lang: WorkerLanguage) => void;
  t: (key: TranslationKey) => string;
  translateService: (serviceName?: string | null) => string;
}

const WorkerLanguageContext = createContext<WorkerLanguageContextType | undefined>(undefined);

export function WorkerLanguageProvider({ children }: { children: React.ReactNode }) {
  // Worker side is strictly English only
  const [language, setLanguageState] = useState<WorkerLanguage>('en');

  useEffect(() => {
    try {
      localStorage.setItem(WORKER_LANG_STORAGE_KEY, 'en');
    } catch {
      // LocalStorage might be restricted
    }
  }, []);

  const setLanguage = (_lang: WorkerLanguage) => {
    // English only across worker interface
    setLanguageState('en');
  };

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry.en || key;
  };

  const translateService = (serviceName?: string | null): string => {
    if (!serviceName) return '';
    const lower = serviceName.toLowerCase().trim();

    // Check exact or partial dictionary matches
    for (const [key, value] of Object.entries(SERVICE_TRANSLATIONS)) {
      if (lower.includes(key)) {
        return value.en || serviceName;
      }
    }

    // Default fallback to raw serviceName
    return serviceName;
  };

  return (
    <WorkerLanguageContext.Provider value={{ language: 'en', setLanguage, t, translateService }}>
      {children}
    </WorkerLanguageContext.Provider>
  );
}

export function useWorkerLanguage(): WorkerLanguageContextType {
  const context = useContext(WorkerLanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: TranslationKey) => translations[key]?.en || key,
      translateService: (name?: string | null) => name || '',
    };
  }
  return context;
}
