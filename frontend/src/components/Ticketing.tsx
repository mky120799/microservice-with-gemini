import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Shield, 
  Paperclip,
  Activity,
  ChevronDown,
  BarChart3,
  User
} from 'lucide-react';

export const Ticketing: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('General');
  const [attachment, setAttachment] = useState<File | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'finance';

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets', {
        headers: {
          'x-user-id': user?.id,
          'x-user-role': user?.role
        }
      });
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/tickets/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics');
    }
  };

  const fetchTicketDetails = async (id: number) => {
    try {
      const res = await api.get(`/api/tickets/${id}`);
      setSelectedTicket(res.data);
    } catch (err) {
      console.error('Failed to fetch ticket details');
    }
  };

  useEffect(() => {
    fetchTickets();
    if (isAdmin) fetchAnalytics();
  }, [user]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    formData.append('category', category);
    if (attachment) formData.append('attachment', attachment);

    try {
      await api.post('/api/tickets', formData, {
        headers: {
          'x-user-id': user?.id,
          'Content-Type': 'multipart/form-data'
        }
      });
      setIsCreateOpen(false);
      fetchTickets();
      setTitle('');
      setDescription('');
      setAttachment(null);
    } catch (err) {
      console.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/api/tickets/${id}/status`, { status }, {
        headers: { 'x-user-id': user?.id }
      });
      fetchTickets();
      if (selectedTicket?.id === id) fetchTicketDetails(id);
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Shield className="text-primary w-10 h-10" />
            Bank Assist
          </h1>
          <p className="text-gray-500 font-medium mt-1">Support & Internal Resolution System</p>
        </div>
        {!isAdmin && (
           <button 
             onClick={() => setIsCreateOpen(true)}
             className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-bold tracking-tight"
           >
             <Plus size={20} strokeWidth={3} />
             Report New Issue
           </button>
        )}
      </div>

      {/* Analytics (Admin Only) */}
      {isAdmin && analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Tickets', value: analytics.totalTickets, icon: MessageSquare, color: 'text-blue-400' },
            { label: 'Resolved', value: analytics.resolvedTickets, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Avg Resolution Rate', value: `${analytics.resolutionRate.toFixed(1)}%`, icon: BarChart3, color: 'text-violet-400' },
            { label: 'Active Queue', value: analytics.openTickets + analytics.inProgressTickets, icon: Clock, color: 'text-amber-400' },
          ].map((stat, i) => (
            <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass p-6 rounded-3xl"
            >
              <div className="flex items-center gap-4 mb-2">
                 <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={20} />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ticket List & Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Master Queue */}
        <div className={`${selectedTicket ? 'xl:col-span-12' : 'xl:col-span-12'} space-y-4`}>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Live Ticket Queue
             </h3>
             <div className="flex gap-2">
                <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-gray-400 focus:outline-none">
                   <option>All Categories</option>
                </select>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket, i) => (
               <motion.div 
                 key={ticket.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => fetchTicketDetails(ticket.id)}
                 className={`glass p-6 rounded-[2.5rem] cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden ${selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''}`}
               >
                 <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rotate-12 group-hover:scale-110 transition-transform`}>
                    <Shield size={128} />
                 </div>
                 
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        ticket.priority === 'URGENT' ? 'bg-red-500/20 text-red-500' :
                        ticket.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {ticket.priority}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500">#{ticket.id}</span>
                   </div>
                   
                   <h4 className="text-xl font-black text-white mb-2 line-clamp-1">{ticket.title}</h4>
                   <p className="text-sm text-gray-400 mb-6 line-clamp-2 font-medium leading-relaxed">
                     {ticket.description}
                   </p>
                   
                   <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${
                           ticket.status === 'RESOLVED' ? 'bg-green-500' :
                           ticket.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-blue-500'
                         }`} />
                         <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{ticket.status}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-600 uppercase">
                         {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                   </div>
                 </div>
               </motion.div>
            ))}
          </div>

          {tickets.length === 0 && (
             <div className="glass p-20 rounded-[2.5rem] text-center opacity-30">
                <MessageSquare className="mx-auto w-16 h-16 mb-6" />
                <p className="text-lg font-black uppercase tracking-widest">No Active Tickets</p>
             </div>
          )}
        </div>
      </div>

      {/* Ticket Details Drawer / Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setSelectedTicket(null)}
               className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
               className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#09090b] border-l border-white/10 p-8 md:p-12 z-[101] shadow-2xl overflow-y-auto custom-scrollbar"
            >
               <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                       <Shield size={24} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-white">Ticket #{selectedTicket.id}</h2>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Detailed Audit & Resolution</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicket(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-gray-400 transition-colors">
                     <ChevronDown size={24} />
                  </button>
               </div>

               <div className="space-y-10">
                  <section>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xl font-bold">Issue Overview</h3>
                       <div className="flex gap-3">
                          {isAdmin && (
                            <div className="flex gap-2">
                               <button 
                                 onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                                 className="px-4 py-2 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all uppercase"
                               >
                                  Process
                               </button>
                               <button 
                                 onClick={() => handleUpdateStatus(selectedTicket.id, 'RESOLVED')}
                                 className="px-4 py-2 bg-green-500/10 text-green-500 text-[10px] font-black rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-all uppercase"
                               >
                                  Resolve
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="glass p-8 rounded-[2rem]">
                       <h4 className="text-2xl font-black text-white mb-4 leading-tight">{selectedTicket.title}</h4>
                       <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8">{selectedTicket.description}</p>
                       
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-2xl">
                             <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Priority</p>
                             <p className="text-sm font-bold text-white">{selectedTicket.priority}</p>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl">
                             <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Reported By</p>
                             <p className="text-sm font-bold text-white">User #{selectedTicket.userId}</p>
                          </div>
                       </div>
                       
                       {selectedTicket.attachmentUrl && (
                          <div className="mt-8">
                             <p className="text-[10px] font-black text-gray-500 uppercase mb-4">Evidence Attachment</p>
                             <a 
                                href={selectedTicket.attachmentUrl} 
                                target="_blank" 
                                className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl group hover:bg-primary/10 transition-all"
                             >
                                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                                   <Paperclip size={20} />
                                </div>
                                <span className="text-sm font-bold text-primary group-hover:underline">View Attached Document</span>
                             </a>
                          </div>
                       )}
                    </div>
                  </section>

                  {/* Audit Trail */}
                  <section>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                       <Clock size={20} className="text-violet-400" />
                       Audit Trail History
                    </h3>
                    <div className="space-y-6 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                       {selectedTicket.auditLogs?.map((log: any, i: number) => (
                          <div key={i} className="relative pl-14">
                             <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-[#09090b] border-2 border-violet-500 z-10 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                             <div className="glass p-5 rounded-2xl">
                                <div className="flex justify-between items-start mb-2">
                                   <p className="text-sm font-bold text-white">
                                      {log.fieldChanged === 'TICKET_CREATED' ? 'Ticket Initialized' : `Property "${log.fieldChanged}" Changed`}
                                   </p>
                                   <span className="text-[10px] font-bold text-gray-500 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                   {log.oldValue && (
                                     <>
                                       <span className="text-gray-500 line-through">{log.oldValue}</span>
                                       <span className="text-gray-400">→</span>
                                     </>
                                   )}
                                   <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-md">{log.newValue}</span>
                                   <span className="text-gray-600 ml-auto flex items-center gap-1">
                                      <User size={12} /> User #{log.changedByUserId}
                                   </span>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  </section>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsCreateOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl glass p-10 rounded-[2.5rem] z-[101]"
            >
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black">Report an Issue</h2>
                  <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                     <AlertCircle size={24} className="text-gray-400" />
                  </button>
               </div>

               <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Subject</label>
                    <input 
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Loan disbursement stuck in pending"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white focus:border-primary outline-none"
                    >
                      <option className="bg-black">General Support</option>
                      <option className="bg-black">Loan Issues</option>
                      <option className="bg-black">Transaction Error</option>
                      <option className="bg-black">KYC Verification</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Priority Level</label>
                    <div className="grid grid-cols-4 gap-3">
                       {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                          <button 
                             key={p} 
                             type="button"
                             onClick={() => setPriority(p)}
                             className={`py-3 rounded-xl font-black text-[10px] tracking-widest transition-all ${
                               priority === p ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-gray-500'
                             }`}
                          >
                             {p}
                          </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Description</label>
                    <textarea 
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide all relevant details..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3 block">Evidence Attachment</label>
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-all bg-white/[0.02]">
                       <Paperclip size={24} className="text-gray-500 mb-2" />
                       <span className="text-xs font-bold text-gray-400">{attachment ? attachment.name : 'Upload Screenshots/PDFs'}</span>
                       <input 
                         type="file" 
                         className="hidden" 
                         onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                       />
                    </label>
                  </div>

                  <button 
                    disabled={loading}
                    className="btn-primary w-full py-5 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-lg"
                  >
                    {loading ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
