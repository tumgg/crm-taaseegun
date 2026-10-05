import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MediaKitAnalytics from './components/MediaKitAnalytics';
import LeadManagementCrm from './components/LeadManagementCrm';
import UnifiedChatCenter from './components/UnifiedChatCenter';
import ApiIntegrationGuide from './components/ApiIntegrationGuide';
import SalesPipelineKanban from './components/SalesPipelineKanban';
import AddLeadModal from './components/AddLeadModal';
import TeamManagementModal from './components/TeamManagementModal';
import LoginScreen, { teamAccounts as defaultTeamAccounts } from './components/LoginScreen';
import { 
  initialFacebookPages, 
  initialLeads,
  REAL_GOOD_VIBES_PAGE_ID, 
  REAL_GOOD_VIBES_TOKEN,
  REAL_TAASEEGUN_PAGE_ID, 
  REAL_TAASEEGUN_TOKEN,
  REAL_ROOMS_PAINTING_PAGE_ID, 
  REAL_ROOMS_PAINTING_TOKEN,
  REAL_TEXTURE_BEAR_PAGE_ID, 
  REAL_TEXTURE_BEAR_TOKEN
} from './data/mockData';
import { fetchLiveFacebookConversations } from './utils/facebookLiveSync';
import { 
  loadStoredLeads, 
  saveStoredLeads, 
  loadStoredPages, 
  saveStoredPages, 
  exportBackupJson,
  resetToDefaults 
} from './utils/storage';

export default function App() {
  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const stored = localStorage.getItem('omnisocial_team_accounts');
      return stored ? JSON.parse(stored) : defaultTeamAccounts;
    } catch {
      return defaultTeamAccounts;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('omnisocial_current_user');
      return stored ? JSON.parse(stored) : defaultTeamAccounts[0]; // Default to พี่ตั้ม for immediate testing
    } catch {
      return defaultTeamAccounts[0];
    }
  });

  const [activeTab, setActiveTab] = useState('chat'); // Default to 'chat' for instant unified replying!
  const [facebookPages, setFacebookPages] = useState(() => loadStoredPages(initialFacebookPages));
  const [leads, setLeads] = useState(() => loadStoredLeads(initialLeads));
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('all');

  // Auto-save team members to localStorage and sync current user profile
  const handleSaveTeamMembers = (updatedMembers) => {
    setTeamMembers(updatedMembers);
    localStorage.setItem('omnisocial_team_accounts', JSON.stringify(updatedMembers));
    if (currentUser) {
      const match = updatedMembers.find(m => m.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
      }
    }
  };

  // Auto-save to localStorage on any lead or page updates
  useEffect(() => {
    saveStoredLeads(leads);
  }, [leads]);

  useEffect(() => {
    saveStoredPages(facebookPages);
  }, [facebookPages]);

  // Save current user on login/logout
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('omnisocial_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('omnisocial_current_user');
    }
  }, [currentUser]);

  // Auto-fetch real Facebook conversations on app mount for all devices/admins
  useEffect(() => {
    async function autoFetchOnMount() {
      try {
        const pagesToSync = [
          { id: REAL_GOOD_VIBES_PAGE_ID, name: 'รับพ่นสี Texture By Good Vibes', activePageToken: REAL_GOOD_VIBES_TOKEN },
          { id: REAL_TAASEEGUN_PAGE_ID, name: 'บริษัท ทาสีกัน จำกัด - ช่างเสือ ทาสี', activePageToken: REAL_TAASEEGUN_TOKEN },
          { id: REAL_ROOMS_PAINTING_PAGE_ID, name: 'ทาสีคอนโด ทาสีภายใน - RoomsPainting', activePageToken: REAL_ROOMS_PAINTING_TOKEN },
          { id: REAL_TEXTURE_BEAR_PAGE_ID, name: 'รับทำสีเทกเจอร์ by ช่างหมี', activePageToken: REAL_TEXTURE_BEAR_TOKEN }
        ];

        const syncPromises = pagesToSync.map(async (page) => {
          try {
            return await fetchLiveFacebookConversations(page.id, page.activePageToken, page.name);
          } catch (err) {
            console.warn(`Sync error for ${page.name}:`, err);
            return [];
          }
        });

        const results = await Promise.all(syncPromises);
        const allFetchedLeads = results.flat().filter(Boolean);

        if (allFetchedLeads.length > 0) {
          setLeads(prev => {
            const incomingMap = new Map(allFetchedLeads.map(l => [l.id, l]));
            const updatedExisting = prev.map(oldLead => {
              const incoming = incomingMap.get(oldLead.id);
              if (!incoming) return oldLead;
              incomingMap.delete(oldLead.id);
              return {
                ...oldLead,
                ...incoming,
                status: oldLead.status || incoming.status,
                admin: oldLead.admin || incoming.admin,
                dealValue: oldLead.dealValue || incoming.dealValue,
                notes: oldLead.notes || incoming.notes,
                messages: (incoming.messages && incoming.messages.length > 0) ? incoming.messages : oldLead.messages
              };
            });
            const completelyNew = Array.from(incomingMap.values());
            return [...completelyNew, ...updatedExisting];
          });
        }
      } catch (err) {
        console.warn('Auto fetch on app mount error:', err);
      }
    }

    autoFetchOnMount();
  }, []);

  // Set default selected lead
  useEffect(() => {
    if (!selectedLeadId && leads.length > 0) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  // Authentication handlers
  const handleLoginSuccess = (account) => {
    setCurrentUser(account);
  };

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      setCurrentUser(null);
    }
  };

  // Handle jump from Analytics page directly to CRM filtered by that Facebook page
  const handleSelectPageForCrm = (pageId) => {
    setSelectedChannelFilter(pageId);
    setActiveTab('crm');
  };

  // Open Chat directly for a specific customer from CRM table
  const handleOpenChat = (leadId) => {
    setSelectedLeadId(leadId);
    setActiveTab('chat');
  };

  // Add new lead handler
  const handleAddLead = (newLead) => {
    setLeads(prev => [newLead, ...prev]);
    setSelectedLeadId(newLead.id);
    setActiveTab('chat'); // Jump into chat immediately to reply!
    alert(`บันทึกข้อมูลลูกค้า "${newLead.name}" เรียบร้อยแล้ว!`);
  };

  // Backup JSON export handler
  const handleExportBackup = () => {
    exportBackupJson(leads, facebookPages);
  };

  // Reset to default data handler
  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลเป็นตัวอย่างตั้งต้นใช่หรือไม่? ข้อมูลที่บันทึกไว้ในเบราว์เซอร์จะถูกแทนที่ด้วยข้อมูลทดสอบเริ่มต้น')) {
      const reset = resetToDefaults(initialLeads, initialFacebookPages);
      setLeads(reset.leads);
      setFacebookPages(reset.pages);
      setSelectedLeadId(reset.leads[0]?.id || null);
      alert('รีเซ็ตข้อมูลตัวอย่างเริ่มต้นเรียบร้อยแล้วครับ!');
    }
  };

  // Export CSV handler with UTF-8 BOM for Thai characters support in Excel
  const handleExportCsv = () => {
    if (leads.length === 0) {
      alert('ไม่มีข้อมูลลูกค้าในตารางสำหรับส่งออก');
      return;
    }

    const headers = ['ชื่อลูกค้า', 'ช่องทาง/เพจ', 'แพลตฟอร์ม', 'ประเภทข้อความ (Inbox/คอมเมนต์)', 'โพสต์หรือคลิปต้นทาง', 'ข้อความที่ติดต่อมา', 'เบอร์โทร/ช่องทางติดต่อ', 'มูลค่าดีล (บาท)', 'สถานะ', 'วันที่', 'ผู้ดูแล', 'โน้ต'];
    const rows = leads.map(l => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.channelName || '').replace(/"/g, '""')}"`,
      `"${(l.platform || '').replace(/"/g, '""')}"`,
      `"${l.sourceType === 'inbox' ? 'Inbox แชทส่วนตัว' : l.sourceType === 'post_comment' ? 'คอมเมนต์หน้าเพจ' : 'คอมเมนต์ใต้คลิป/Reels'}"`,
      `"${(l.sourceTitle || '').replace(/"/g, '""')}"`,
      `"${(l.inquiry || '').replace(/"/g, '""')}"`,
      `"${(l.contact || '').replace(/"/g, '""')}"`,
      l.dealValue || 0,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${l.date || ''}"`,
      `"${(l.admin || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customer_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If not logged in, show the sleek Login Screen!
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} teamMembers={teamMembers} />;
  }

  return (
    <div className={`app-container ${activeTab === 'chat' || activeTab === 'pipeline' ? 'chat-mode' : ''}`}>
      {/* Global Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
        onExportCsv={handleExportCsv}
        onExportBackup={handleExportBackup}
        onResetData={handleResetData}
        totalLeadsCount={leads.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        teamMembersCount={teamMembers.length}
      />

      {/* Main Content Area based on Tab */}
      <main className="app-main-content">
        {activeTab === 'chat' && (
          <UnifiedChatCenter
            leads={leads}
            setLeads={setLeads}
            facebookPages={facebookPages}
            selectedLeadId={selectedLeadId}
            setSelectedLeadId={setSelectedLeadId}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'pipeline' && (
          <SalesPipelineKanban
            leads={leads}
            setLeads={setLeads}
            facebookPages={facebookPages}
            onOpenChat={handleOpenChat}
            onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
          />
        )}

        {activeTab === 'crm' && (
          <LeadManagementCrm
            leads={leads}
            setLeads={setLeads}
            facebookPages={facebookPages}
            onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
            selectedChannelFilter={selectedChannelFilter}
            setSelectedChannelFilter={setSelectedChannelFilter}
            onOpenChat={handleOpenChat}
          />
        )}

        {activeTab === 'analytics' && (
          <MediaKitAnalytics
            facebookPages={facebookPages}
            onSelectPageForCrm={handleSelectPageForCrm}
          />
        )}

        {activeTab === 'api-setup' && (
          <ApiIntegrationGuide
            facebookPages={facebookPages}
            setFacebookPages={setFacebookPages}
          />
        )}
      </main>

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onAddLead={handleAddLead}
        facebookPages={facebookPages}
      />

      {/* Team Management Modal */}
      <TeamManagementModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        teamMembers={teamMembers}
        onSaveTeamMembers={handleSaveTeamMembers}
        currentUser={currentUser}
      />
    </div>
  );
}
