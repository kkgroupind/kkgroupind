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
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🌴' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const WORKER_LANG_STORAGE_KEY = 'kk_worker_preferred_language';

// Comprehensive Service Translations Dictionary for KK Group
const SERVICE_TRANSLATIONS: Record<string, { ml: string; hi: string; en: string }> = {
  // Plantation & Tree Services
  cococare: {
    en: 'Cococare - Palm Tree Harvesting & Maintenance',
    ml: 'കോക്കോകെയർ - തെങ്ങ് കയറ്റവും പരിപാലനവും',
    hi: 'कोकोकेयर - नारियल पेड़ कटाई एवं रखरखाव',
  },
  palm: {
    en: 'Cococare - Palm Tree Harvesting & Maintenance',
    ml: 'കോക്കോകെയർ - തെങ്ങ് കയറ്റവും പരിപാലനവും',
    hi: 'कोकोकेयर - नारियल पेड़ कटाई एवं रखरखाव',
  },
  'tree cutting': {
    en: 'Tree Cutting & Logging',
    ml: 'മരം മുറിക്കലും തടി മാറ്റലും',
    hi: 'पेड़ कटाई एवं लकड़ी हटाना',
  },
  'tree trimming': {
    en: 'Tree Trimming & Pruning',
    ml: 'മരച്ചില്ലകൾ വെട്ടിമാറ്റൽ',
    hi: 'पेड़ों की छंटाई और सफाई',
  },
  tree: {
    en: 'Tree Cutting & Clearing',
    ml: 'മരം മുറിക്കലും ക്ലിയറിംഗും',
    hi: 'पेड़ कटाई एवं सफाई',
  },
  'land clearing': {
    en: 'Land Clearing & Plot Cleaning',
    ml: 'സ്ഥലം കാടുവെട്ടി വെളിപ്പിക്കൽ',
    hi: 'भूमि एवं झाड़ी सफाई कार्य',
  },
  bush: {
    en: 'Bush Clearing & Site Prep',
    ml: 'പ്ലോട്ട് കാടുവെട്ടി വൃത്തിയാക്കൽ',
    hi: 'झाड़ी कटाई एवं प्लॉट सफाई',
  },

  // Heavy Machinery & Excavation
  jcb: {
    en: 'JCB Heavy Machinery & Earth Excavation',
    ml: 'ജെസിബി മണ്ണെടുക്കൽ സർവീസ്',
    hi: 'जेसीबी भारी मशीनरी एवं मिट्टी खुदाई',
  },
  excavator: {
    en: 'Excavator & Earthmoving',
    ml: 'എസ്കവേറ്റർ & മണ്ണെടുക്കൽ',
    hi: 'उत्खनन (एक्सावेटर) सेवा',
  },
  earthmoving: {
    en: 'Earthmoving & Trenching',
    ml: 'മണ്ണെടുക്കലും കുഴിയെടുക്കലും',
    hi: 'मिट्टी समतलीकरण और खुदाई',
  },
  crane: {
    en: 'Heavy Crane Operations',
    ml: 'ക്രെയിൻ സർവീസ്',
    hi: 'भारी क्रेन संचालन सेवा',
  },
  demolition: {
    en: 'Building Demolition & Breaking',
    ml: 'കെട്ടിടം പൊളിക്കൽ',
    hi: 'भवन विध्वंस एवं तोड़फोड़',
  },
  debris: {
    en: 'Debris Removal & Site Cleanup',
    ml: 'അവശിഷ്ടങ്ങൾ നീക്കം ചെയ്യൽ',
    hi: 'मलबा हटाना एवं साइट सफाई',
  },
  rock: {
    en: 'Rock Breaking & Crushing',
    ml: 'പാറ പൊട്ടിക്കലും മാറ്റലും',
    hi: 'चट्टान तोड़ना एवं क्रशिंग',
  },
  tipper: {
    en: 'Tipper Truck Transportation',
    ml: 'ടിപ്പർ ട്രക്ക് സർവീസ്',
    hi: 'टिपर ट्रक परिवहन सेवा',
  },
  truck: {
    en: 'Heavy Truck Hauling',
    ml: 'ലോറി ട്രാൻസ്‌പോർട്ട്',
    hi: 'भारी ट्रक परिवहन',
  },
  road: {
    en: 'Road Works & Paving',
    ml: 'റോഡ് നിർമ്മാണം',
    hi: 'सड़क निर्माण कार्य',
  },

  // Construction, Masonry & Finishing
  masonry: {
    en: 'Masonry & Brick Construction',
    ml: 'മതിൽ നിർമ്മാണവും കൊത്തുപണിയും',
    hi: 'राजमिस्त्री एवं ईंट निर्माण कार्य',
  },
  brick: {
    en: 'Masonry & Brick Construction',
    ml: 'ഇഷ്ടിക കെട്ട് പണി',
    hi: 'ईंट निर्माण कार्य',
  },
  plastering: {
    en: 'Exterior/Interior Plastering & Masonry',
    ml: 'പ്ലാസ്റ്ററിംഗ് & ഫിനിഷിംഗ്',
    hi: 'प्लास्टर एवं दीवार परिष्करण',
  },
  concrete: {
    en: 'Concrete & Masonry Works',
    ml: 'കോൺക്രീറ്റ് പ്രവൃത്തികൾ',
    hi: 'कंक्रीट एवं राजमिस्त्री कार्य',
  },
  tile: {
    en: 'Tile, Marble & Granite Laying',
    ml: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് വർക്ക്',
    hi: 'टाइल, मार्बल एवं ग्रेनाइट फिटिंग',
  },
  marble: {
    en: 'Tile, Marble & Granite Laying',
    ml: 'മാർബിൾ & ഗ്രാനൈറ്റ് വർക്ക്',
    hi: 'मार्बल एवं ग्रेनाइट फिटिंग',
  },
  granite: {
    en: 'Tile, Marble & Granite Laying',
    ml: 'ഗ്രാനൈറ്റ് വർക്ക്',
    hi: 'ग्रेनाइट फिटिंग कार्य',
  },
  painting: {
    en: 'Commercial & Residential Painting',
    ml: 'പെയിന്റിംഗ് സർവീസ്',
    hi: 'व्यावसायिक एवं आवासीय पेंटिंग',
  },

  // MEP & Technical
  electrical: {
    en: 'Electrical & Wiring Systems',
    ml: 'ഇലക്ട്രിക്കൽ & വയറിങ് വർക്ക്',
    hi: 'विद्युत एवं वायरिंग प्रणाली',
  },
  wiring: {
    en: 'Electrical Wiring Systems',
    ml: 'വൈദ്യുത വയറിംഗ്',
    hi: 'वायरिंग एवं विद्युत कार्य',
  },
  plumbing: {
    en: 'Plumbing & High-Pressure Piping',
    ml: 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ വർക്ക്',
    hi: 'प्लंबिंग एवं पाइपलाइन कार्य',
  },
  pipe: {
    en: 'Pipeline Trenching & Drainage',
    ml: 'പൈപ്പ് ലൈൻ & ഡ്രെയിനേജ്',
    hi: 'पाइपलाइन एवं जल निकासी कार्य',
  },
  borewell: {
    en: 'Borewell Drilling & Water Testing',
    ml: 'ബോർവെൽ ഡ്രില്ലിംഗ് & വാട്ടർ ടെസ്റ്റിംഗ്',
    hi: 'बोरवेल ड्रिलिंग एवं जल परीक्षण',
  },
  water: {
    en: 'Water Systems & Survey',
    ml: 'വാട്ടർ സിസ്റ്റം സർവേ',
    hi: 'जल प्रणाली सर्वेक्षण',
  },
  labour: {
    en: 'Field Labour Operations',
    ml: 'ഫീൽഡ് തൊഴിലാളി സേവനം',
    hi: 'फील्ड श्रमिक सेवा',
  },
};

const translations = {
  // Navigation
  home: { en: 'Home', ml: 'ഹോം', hi: 'होम' },
  jobs: { en: 'Jobs', ml: 'ജോലികൾ', hi: 'काम / जॉब्स' },
  notifications: { en: 'Notification', ml: 'അറിയിപ്പുകൾ', hi: 'सूचनाएं' },
  profile: { en: 'Profile', ml: 'പ്രൊഫൈൽ', hi: 'प्रोफ़ाइल' },
  operative: { en: 'OPERATIVE', ml: 'തൊഴിലാളി', hi: 'कार्यकर्ता' },

  // Header
  primary: { en: 'Primary', ml: 'പ്രധാനപ്പെട്ടത്', hi: 'प्राथमिक' },
  dashboard: { en: 'Dashboard', ml: 'ഡാഷ്‌ബോർഡ്', hi: 'डैशबोर्ड' },
  workspaceTitle: {
    en: 'Field Operations Workspace',
    ml: 'ഫീൽഡ് ഓപ്പറേഷൻസ് വർക്ക്സ്പേസ്',
    hi: 'फील्ड ऑपरेशंस कार्यक्षेत्र',
  },

  // Dashboard & Shift
  todayShift: { en: "Today's Shift", ml: 'ഇന്നത്തെ ഷിഫ്റ്റ്', hi: 'आज की शिफ्ट' },
  todayDate: { en: "Today's Date", ml: 'ഇന്നത്തെ തീയതി', hi: 'आज की तारीख' },
  todayWork: { en: "Today's Active Work", ml: 'ഇന്നത്തെ ജോലി', hi: 'आज का कार्य' },
  currentWorkSubtitle: {
    en: 'Current work order requiring your operative field execution',
    ml: 'നിങ്ങൾ പൂർത്തിയാക്കേണ്ട നിലവിലെ വർക്ക് ഓർഡർ',
    hi: 'वर्तमान कार्य आदेश जिसके फील्ड निष्पादन की आवश्यकता है',
  },
  previousWorks: {
    en: 'Work History & Previous Works',
    ml: 'മുൻകാല ജോലികൾ',
    hi: 'पिछला कार्य इतिहास',
  },
  previousWorksSubtitle: {
    en: 'Complete record of your past completed work orders, dispatches, and dates',
    ml: 'പൂർത്തിയായ വർക്ക് ഓർഡറുകളുടെ മുഴുവൻ രേഖകൾ',
    hi: 'आपके पिछले पूर्ण किए गए कार्य आदेशों का संपूर्ण रिकॉर्ड',
  },
  activeWorkMetric: { en: 'Active Work', ml: 'സജീവ ജോലി', hi: 'सक्रिय कार्य' },
  assignedNewMetric: { en: 'Assigned New', ml: 'പുതിയവ', hi: 'नया आवंटित' },
  completedMetric: { en: 'Completed', ml: 'പൂർത്തിയായവ', hi: 'पूर्ण कार्य' },

  // Duty status
  onDuty: { en: 'On Duty', ml: 'ഡ്യൂട്ടിയിൽ', hi: 'ड्यूटी पर' },
  offDuty: { en: 'Off Duty', ml: 'അവധിയിൽ', hi: 'ड्यूटी बंद' },
  dutyAvailable: {
    en: 'Field Duty Active (Available)',
    ml: 'ഫീൽഡ് ഡ്യൂട്ടി സജീവം (ലഭ്യമാണ്)',
    hi: 'फील्ड ड्यूटी सक्रिय (उपलब्ध)',
  },
  dutyOff: {
    en: 'Off Duty (Standby)',
    ml: 'ഡ്യൂട്ടി അവധിയാണ് (സ്റ്റാൻഡ്‌ബൈ)',
    hi: 'ड्यूटी बंद (ऑफ ड्यूटी)',
  },
  fieldAttendance: {
    en: 'Field Attendance',
    ml: 'ഫീൽഡ് അറ്റൻഡൻസ്',
    hi: 'फील्ड उपस्थिति',
  },
  availableForWork: {
    en: 'Available for Work',
    ml: 'ഡ്യൂട്ടി ലഭ്യമാണ്',
    hi: 'काम के लिए उपलब्ध',
  },
  onLeaveOffDuty: {
    en: 'On Leave / Off Duty',
    ml: 'അവധിയിലാണ് (ഡ്യൂട്ടി ഓഫ്)',
    hi: 'छुट्टी पर / ड्यूटी बंद',
  },
  activeDispatch: {
    en: 'Active Dispatch',
    ml: 'സജീവ ഡിസ്പാച്ച്',
    hi: 'सक्रिय कार्य आदेश',
  },
  workOrdersCount: {
    en: 'Work Orders',
    ml: 'വർക്ക് ഓർഡറുകൾ',
    hi: 'कार्य आदेश',
  },
  toggle: { en: 'Toggle', ml: 'മാറ്റുക', hi: 'बदलें' },

  // Job Cards & Actions
  startJob: { en: 'Start Job', ml: 'ആരംഭിക്കുക', hi: 'काम शुरू करें' },
  markCompleted: { en: 'Mark Completed', ml: 'പൂർത്തിയായി', hi: 'पूर्ण मार्क करें' },
  viewDetails: { en: 'Full Details', ml: 'വിശദാംശങ്ങൾ', hi: 'पूरा विवरण' },
  customer: { en: 'Customer', ml: 'ഉപഭോക്താവ്', hi: 'ग्राहक' },
  phone: { en: 'Phone', ml: 'ഫോൺ', hi: 'फ़ोन' },
  site: { en: 'Site Location', ml: 'സ്ഥലം', hi: 'कार्य स्थल' },
  deadline: { en: 'Deadline', ml: 'സമയപരിധി', hi: 'समय सीमा' },
  duration: { en: 'Duration', ml: 'സമയം', hi: 'अवधि' },
  mins: { en: 'mins', ml: 'മിനിറ്റ്', hi: 'मिनट' },
  inProgress: { en: 'In Progress', ml: 'നടന്നുകൊണ്ടിരിക്കുന്നു', hi: 'प्रगति पर है' },
  assigned: { en: 'Assigned', ml: 'അനുവദിച്ചു', hi: 'आवंटित' },
  completedBadge: { en: 'Completed', ml: 'പൂർത്തിയായി', hi: 'पूर्ण' },
  starting: { en: 'Starting...', ml: 'ആരംഭിക്കുന്നു...', hi: 'शुरू हो रहा है...' },
  completing: { en: 'Completing...', ml: 'പൂർത്തിയാക്കുന്നു...', hi: 'पूर्ण किया जा रहा है...' },
  done: { en: 'Done', ml: 'പൂർത്തിയായി', hi: 'सम्पन्न' },

  noActiveWorkTitle: {
    en: 'Standby / No Active Work Order In Progress',
    ml: 'നിലവിൽ ആക്റ്റീവ് വർക്കുകൾ ഇല്ല / സ്റ്റാൻഡ്‌ബൈ',
    hi: 'स्टैंडबाय मोड / कोई सक्रिय कार्य नहीं',
  },
  noActiveWorkDesc: {
    en: 'You currently have no active jobs in progress. When the office dispatch desk allocates a new customer order to you, it will appear here instantly.',
    ml: 'ഓഫീസ് ഡിസ്‌പാച്ച് ഡെസ്‌കിൽ നിന്ന് പുതിയ ഓർഡർ നൽകുമ്പോൾ ഇവിടെ ഉടൻ ദൃശ്യമാകും.',
    hi: 'वर्तमान में आपके पास कोई सक्रिय कार्य नहीं है। जैसे ही कार्यालय से कार्य आवंटित होगा, वह तुरंत यहाँ दिखाई देगा।',
  },
  noPreviousWorkTitle: {
    en: 'No previous works recorded yet',
    ml: 'മുൻകാല ജോലികൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല',
    hi: 'अभी तक कोई पिछला कार्य दर्ज नहीं है',
  },
  noPreviousWorkDesc: {
    en: 'Once you complete assigned field work orders, your entire verified job ledger and history will be listed here.',
    ml: 'ഫീൽഡ് വർക്ക് ഓർഡറുകൾ പൂർത്തിയാക്കുമ്പോൾ മുൻകാല ചരിത്രം ഇവിടെ കാണാം.',
    hi: 'कार्य पूरा करने के बाद आपका पूरा कार्य इतिहास यहाँ दिखाई देगा।',
  },

  // Jobs Page Filters & Controls
  workOrdersTitle: {
    en: 'Jobs & Work Orders',
    ml: 'വർക്ക് ഓർഡറുകൾ',
    hi: 'कार्य आदेश एवं जॉब्स',
  },
  workOrdersSubtitle: {
    en: 'Browse all field dispatches, ongoing work orders, and past completion logs',
    ml: 'ഫീൽഡ് ഡിസ്പാച്ചുകളും വർക്ക് ഓർഡറുകളും ഇവിടെ കാണാം',
    hi: 'सभी फील्ड कार्य, जारी कार्य आदेश और पिछले पूरे किए गए काम यहाँ देखें',
  },
  allFilter: { en: 'All Time', ml: 'മുഴുവൻ', hi: 'सभी' },
  thisMonthFilter: { en: 'This Month', ml: 'ഈ മാസം', hi: 'इस महीने' },
  allFilterCount: { en: 'All Jobs', ml: 'എല്ലാ ജോലികളും', hi: 'सभी कार्य' },
  activeFilterCount: { en: 'In Progress', ml: 'നടക്കുന്നവ', hi: 'प्रगति पर' },
  assignedFilterCount: { en: 'Assigned', ml: 'അനുവദിച്ചവ', hi: 'आवंटित' },
  completedFilterCount: { en: 'Completed', ml: 'പൂർത്തിയായവ', hi: 'पूर्ण' },
  jobsCenter: { en: 'Jobs Center', ml: 'ജോബ് സെന്റർ', hi: 'जॉब्स सेंटर' },
  searchPlaceholder: {
    en: 'Search jobs, tracking ID, customer...',
    ml: 'ജോലികൾ, ഐഡി, ഉപഭോക്താവ് തിരയുക...',
    hi: 'काम, ट्रैकिंग नंबर, ग्राहक खोजें...',
  },
  noJobsFound: {
    en: 'No Jobs Found',
    ml: 'ജോലികൾ ഒന്നും കണ്ടെത്തിയില്ല',
    hi: 'कोई कार्य नहीं मिला',
  },
  noJobsFoundDesc: {
    en: 'There are currently no work orders under this status filter.',
    ml: 'ഈ ഫിൽട്ടറിന് കീഴിൽ ജോലികൾ ഒന്നും ലഭ്യമല്ല.',
    hi: 'इस फ़िल्टर के अंतर्गत वर्तमान में कोई कार्य आदेश नहीं है।',
  },

  // Notifications Page
  notificationsTitle: {
    en: 'Notifications & Operational Alerts',
    ml: 'അറിയിപ്പുകൾ & അലേർട്ടുകൾ',
    hi: 'सूचनाएं एवं फील्ड अलर्ट',
  },
  notificationsSubtitle: {
    en: 'Real-time operational alerts, newly dispatched customer orders, and field shift logs',
    ml: 'തത്സമയ ഫീൽഡ് അലേർട്ടുകളും പുതിയ ഡിസ്പാച്ചുകളും',
    hi: 'वास्तविक समय अलर्ट, नए कार्य आदेश और फील्ड शिफ्ट रिकॉर्ड',
  },
  allNotifications: { en: 'All Notifications', ml: 'എല്ലാ അറിയിപ്പുകളും', hi: 'सभी सूचनाएं' },
  newDispatches: { en: 'New Dispatches', ml: 'പുതിയ ഡിസ്പാച്ചുകൾ', hi: 'नए कार्य आदेश' },
  shiftStatus: { en: 'Shift Status', ml: 'ഷിഫ്റ്റ് അവസ്ഥ', hi: 'शिफ्ट स्थिति' },
  actionRequired: { en: 'Action Required', ml: 'നടപടി ആവശ്യം', hi: 'कार्रवाई आवश्यक' },
  inspectDispatch: { en: 'Inspect Dispatch', ml: 'വിശദാംശങ്ങൾ കാണുക', hi: 'विवरण जांचें' },
  changeShiftStatus: { en: 'Change Shift Status', ml: 'ഷിഫ്റ്റ് മാറ്റുക', hi: 'शिफ्ट स्थिति बदलें' },
  newOrderDispatched: {
    en: 'New Work Order Dispatched to You',
    ml: 'നിങ്ങൾക്ക് പുതിയ വർക്ക് ഓർഡർ അനുവദിച്ചു',
    hi: 'आपको नया कार्य आदेश आवंटित किया गया है',
  },
  urgentRequirement: {
    en: 'Customer requires immediate operational deployment.',
    ml: 'ഉപഭോക്താവിന് ഉടൻ സേവനം ആവശ്യമാണ്.',
    hi: 'ग्राहक को तत्काल फील्ड कार्य की आवश्यकता है।',
  },
  noNotificationsTitle: {
    en: 'No Notifications Yet',
    ml: 'പുതിയ അറിയിപ്പുകൾ ഇല്ല',
    hi: 'कोई नई सूचना नहीं है',
  },
  noNotificationsDesc: {
    en: 'You are all caught up! New dispatch alerts and work order assignments will appear here.',
    ml: 'എല്ലാം കണ്ടുകഴിഞ്ഞു. പുതിയ അറിയിപ്പുകൾ വരുമ്പോൾ ഇവിടെ കാണാം.',
    hi: 'सब कुछ अपडेट है! नए कार्य आदेश आने पर यहाँ दिखाई देंगे।',
  },

  // Sidebar & Squad
  fieldSquad: { en: 'Field Squad', ml: 'ഫീൽഡ് സ്ക്വാഡ്', hi: 'फील्ड टीम' },
  liveMap: { en: 'Live Operations Map', ml: 'തത്സമയ മാപ്പ്', hi: 'लाइव ऑपरेशंस मैप' },
  activeCrew: { en: 'Active', ml: 'സജീവം', hi: 'सक्रिय' },
  allSquad: { en: 'All Squad', ml: 'എല്ലാവരും', hi: 'पूरी टीम' },
  online: { en: 'Online Only', ml: 'ഓൺലൈൻ മാത്രം', hi: 'केवल ऑनलाइन' },
  gpsNavigation: { en: 'GPS Navigation', ml: 'ജിപിഎസ് നാവിഗേഷൻ', hi: 'जीपीएस नेविगेशन' },
  startNavigation: { en: 'Start Navigation', ml: 'നാവിഗേഷൻ ആരംഭിക്കുക', hi: 'नेविगेशन शुरू करें' },
  workSiteLocation: { en: 'Work Site Location', ml: 'ജോലി സ്ഥലം', hi: 'कार्य स्थल' },
  signOut: { en: 'Sign Out', ml: 'പുറത്തുകടക്കുക', hi: 'साइन आउट' },
  settings: { en: 'Settings', ml: 'ക്രമീകരണങ്ങൾ', hi: 'सेटिंग्स' },

  // Modals & Details
  workOrderDetails: {
    en: 'Work Order Details',
    ml: 'വർക്ക് ഓർഡർ വിവരങ്ങൾ',
    hi: 'कार्य आदेश विवरण',
  },
  close: { en: 'Close', ml: 'അടയ്ക്കുക', hi: 'बंद करें' },
  modalSubtitle: {
    en: 'Review site guidelines, navigate to coordinates, and manage execution progress',
    ml: 'സൈറ്റ് വിവരങ്ങളും ജിപിഎസ് ലൊക്കേഷനും പരിശോധിച്ച് ജോലി പൂർത്തിയാക്കുക',
    hi: 'साइट दिशानिर्देशों की समीक्षा करें, जीपीएस पर जाएं और कार्य प्रगति प्रबंधित करें',
  },
  acceptFinishToday: {
    en: 'Accept: Finish Today',
    ml: 'സ്വീകരിക്കുക: ഇന്ന് തന്നെ പൂർത്തിയാക്കും',
    hi: 'स्वीकार करें: आज ही पूरा करेंगे',
  },
  startWork: {
    en: 'Start Work',
    ml: 'ജോലി ആരംഭിക്കുക',
    hi: 'काम शुरू करें',
  },
  workSpecs: {
    en: 'Work Specifications & Requirements',
    ml: 'ജോലി വിവരങ്ങളും നിബന്ധനകളും',
    hi: 'कार्य विवरण एवं निर्देश',
  },
  officeInstructions: {
    en: 'Office Dispatch Instructions',
    ml: 'ഓഫീസ് നിർദ്ദേശങ്ങൾ',
    hi: 'कार्यालय निर्देश',
  },
  workerCommitment: {
    en: 'Worker Commitment',
    ml: 'തൊഴിലാളിയുടെ ഉറപ്പ്',
    hi: 'श्रमिक प्रतिबद्धता',
  },
  targetCompletion: {
    en: 'Target Completion',
    ml: 'പൂർത്തിയാക്കേണ്ട തീയതി',
    hi: 'लक्ष्य पूर्णता तिथि',
  },
  landmarks: {
    en: 'Access Remarks & Landmarks',
    ml: 'സ്ഥല അടയാളങ്ങൾ',
    hi: 'स्थान के लैंडमार्क एवं निर्देश',
  },

  // Profile Labels
  operativeProfile: {
    en: 'Operative Profile & Credentials',
    ml: 'തൊഴിലാളി വിവരങ്ങൾ & ക്രെഡൻഷ്യലുകൾ',
    hi: 'कार्यकर्ता प्रोफ़ाइल एवं प्रमाण-पत्र',
  },
  personalDetails: { en: 'Personal Details', ml: 'വ്യക്തിഗത വിവരങ്ങൾ', hi: 'व्यक्तिगत विवरण' },
  securityPassword: { en: 'Security & Password', ml: 'സുരക്ഷ & പാസ്‌വേഡ്', hi: 'सुरक्षा एवं पासवर्ड' },
  shiftAttendance: { en: 'Shift & Attendance', ml: 'ഷിഫ്റ്റ് & ഹാജർ', hi: 'शिफ्ट एवं उपस्थिति' },
  backToDashboard: { en: 'Back to Dashboard', ml: 'ഡാഷ്‌ബോർഡിലേക്ക്', hi: 'डैशबोर्ड पर वापस' },
  fullName: { en: 'Full Name', ml: 'പൂർണ്ണ നാമം', hi: 'पूरा नाम' },
  usernameLabel: { en: 'Username', ml: 'ഉപയോക്തൃനാമം', hi: 'यूज़रनेम' },
  mobileLabel: { en: 'Mobile Phone', ml: 'മൊബൈൽ നമ്പർ', hi: 'मोबाइल नंबर' },
  saveChanges: { en: 'Save Changes', ml: 'സേവ് ചെയ്യുക', hi: 'बदलाव सहेजें' },
  saving: { en: 'Saving...', ml: 'സേവ് ചെയ്യുന്നു...', hi: 'सहेजा जा रहा है...' },
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
  // Default set to English as requested
  const [language, setLanguageState] = useState<WorkerLanguage>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WORKER_LANG_STORAGE_KEY) as WorkerLanguage | null;
      if (saved === 'en' || saved === 'ml' || saved === 'hi') {
        setLanguageState(saved);
      } else {
        // Default to English
        setLanguageState('en');
      }
    } catch {
      // LocalStorage might be restricted
    }
  }, []);

  const setLanguage = (lang: WorkerLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(WORKER_LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t = (key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en;
  };

  const translateService = (serviceName?: string | null): string => {
    if (!serviceName) return '';
    if (language === 'en') return serviceName;

    const lower = serviceName.toLowerCase().trim();

    // Check exact or partial dictionary matches
    for (const [key, value] of Object.entries(SERVICE_TRANSLATIONS)) {
      if (lower.includes(key)) {
        return value[language] || serviceName;
      }
    }

    // Default fallback to raw serviceName
    return serviceName;
  };

  return (
    <WorkerLanguageContext.Provider value={{ language, setLanguage, t, translateService }}>
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
