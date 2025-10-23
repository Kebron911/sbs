import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Activity, AlertCircle, CheckCircle, Clock, TrendingUp, Bell, MessageSquare, Play, Pause, RefreshCw, ChevronRight, BarChart3, Settings } from 'lucide-react';

const SBSDashboard = () => {
  const [systems, setSystems] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    activeSystems: 0,
    completedSteps: 0,
    pendingReviews: 0,
    activeRoutines: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Simulated data initialization
  useEffect(() => {
    initializeDemoData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateRealtimeUpdate();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const initializeDemoData = () => {
    const demoSystems = [
      {
        id: 1,
        name: 'Net Worth Tracker',
        category: 'Money Monday > Budgeting',
        purpose: 'Track and visualize net worth automatically',
        current_stage: 'automate',
        created_at: '2025-01-15',
        progress: 80,
        owner: 'Admin',
        next_routine: '2025-10-27'
      },
      {
        id: 2,
        name: 'Weekly Review System',
        category: 'Productivity',
        purpose: 'Structured weekly review and planning',
        current_stage: 'build',
        created_at: '2025-02-01',
        progress: 60,
        owner: 'Admin',
        next_routine: '2025-10-25'
      },
      {
        id: 3,
        name: 'Content Calendar',
        category: 'Marketing',
        purpose: 'Automated content scheduling and tracking',
        current_stage: 'design',
        created_at: '2025-10-20',
        progress: 40,
        owner: 'Admin',
        next_routine: '2025-10-23'
      }
    ];

    const demoRoutines = [
      { id: 1, system_id: 1, name: 'Monday Budget Check', day_of_week: 'Monday', status: 'active', last_run: '2025-10-21' },
      { id: 2, system_id: 1, name: 'Friday Net Worth Update', day_of_week: 'Friday', status: 'active', last_run: '2025-10-18' },
      { id: 3, system_id: 2, name: 'Weekly Review', day_of_week: 'Sunday', status: 'active', last_run: '2025-10-20' }
    ];

    const demoLogs = [
      { id: 1, system_id: 1, event: 'automation_configured', timestamp: '2025-10-22 09:15:00', details: 'Triggers setup completed' },
      { id: 2, system_id: 2, event: 'build_phase_started', timestamp: '2025-10-22 08:30:00', details: 'Infrastructure creation initiated' },
      { id: 3, system_id: 3, event: 'design_canvas_generated', timestamp: '2025-10-21 14:20:00', details: 'System design canvas created' }
    ];

    setSystems(demoSystems);
    setRoutines(demoRoutines);
    setLogs(demoLogs);
    setStats({
      activeSystems: demoSystems.length,
      completedSteps: 12,
      pendingReviews: 2,
      activeRoutines: demoRoutines.length
    });
  };

  const simulateRealtimeUpdate = () => {
    const updates = [
      'System "Net Worth Tracker" advanced to review stage',
      'Routine "Weekly Review" completed successfully',
      'New system "Email Automation" created'
    ];
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    setNotifications(prev => [{ id: Date.now(), message: randomUpdate, timestamp: new Date() }, ...prev.slice(0, 4)]);
  };

  const getStageColor = (stage) => {
    const colors = {
      define: 'bg-blue-100 text-blue-700',
      design: 'bg-purple-100 text-purple-700',
      build: 'bg-orange-100 text-orange-700',
      automate: 'bg-green-100 text-green-700',
      review: 'bg-indigo-100 text-indigo-700',
      complete: 'bg-gray-100 text-gray-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const getStageIcon = (stage) => {
    const icons = {
      define: <Search className="w-4 h-4" />,
      design: <Filter className="w-4 h-4" />,
      build: <Settings className="w-4 h-4" />,
      automate: <RefreshCw className="w-4 h-4" />,
      review: <CheckCircle className="w-4 h-4" />
    };
    return icons[stage] || <Clock className="w-4 h-4" />;
  };

  const advanceSystem = (systemId) => {
    setSystems(prev => prev.map(s => {
      if (s.id === systemId) {
        const stages = ['define', 'design', 'build', 'automate', 'review', 'complete'];
        const currentIndex = stages.indexOf(s.current_stage);
        const nextStage = stages[Math.min(currentIndex + 1, stages.length - 1)];
        return { ...s, current_stage: nextStage, progress: Math.min(s.progress + 20, 100) };
      }
      return s;
    }));
    setNotifications(prev => [{ id: Date.now(), message: `System advanced to next stage`, timestamp: new Date() }, ...prev.slice(0, 4)]);
  };

  const StatCard = ({ icon, label, value, trend, color }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-xl ${color} shadow-sm`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mt-3">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );

  const LifecycleTimeline = ({ stage, progress }) => {
    const stages = ['define', 'design', 'build', 'automate', 'review'];
    const currentIndex = stages.indexOf(stage);

    return (
      <div className="flex items-center gap-2">
        {stages.map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${idx <= currentIndex ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx <= currentIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {idx < currentIndex ? <CheckCircle className="w-5 h-5" /> : getStageIcon(s)}
              </div>
              <span className="text-xs font-medium capitalize">{s}</span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`flex-1 h-1 ${idx < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const CreateSystemModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      category: '',
      purpose: '',
      inputs: '',
      outputs: '',
      update_frequency: 'weekly'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newSystem = {
        id: systems.length + 1,
        ...formData,
        current_stage: 'define',
        created_at: new Date().toISOString().split('T')[0],
        progress: 20,
        owner: 'Admin',
        next_routine: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setSystems(prev => [...prev, newSystem]);
      setStats(prev => ({ ...prev, activeSystems: prev.activeSystems + 1 }));
      setShowCreateModal(false);
      setNotifications(prev => [{ id: Date.now(), message: `New system "${formData.name}" created`, timestamp: new Date() }, ...prev.slice(0, 4)]);
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Create New System</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">System Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Finance, Productivity, Health"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows="3"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Inputs</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.inputs}
                  onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                  placeholder="Data sources..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Outputs</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.outputs}
                  onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                  placeholder="Expected results..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Update Frequency</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.update_frequency}
                onChange={(e) => setFormData({ ...formData, update_frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Create System
              </button>
              <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredSystems = systems.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50">
      {/* Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-indigo-600">🧠 SBS Dashboard</h1>
              <div className="flex gap-6">
                {['overview', 'systems', 'routines', 'insights', 'logs'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`capitalize font-medium py-4 ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              <MessageSquare className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Action */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add System
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl">
              <StatCard
                icon={<Activity className="w-6 h-6 text-indigo-600" />}
                label="Active Systems"
                value={stats.activeSystems}
                trend="+12%"
                color="bg-gradient-to-br from-indigo-50 to-indigo-100"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                label="Completed Steps"
                value={stats.completedSteps}
                trend="+8%"
                color="bg-gradient-to-br from-green-50 to-green-100"
              />
              <StatCard
                icon={<Clock className="w-6 h-6 text-orange-600" />}
                label="Pending Reviews"
                value={stats.pendingReviews}
                color="bg-gradient-to-br from-orange-50 to-orange-100"
              />
              <StatCard
                icon={<RefreshCw className="w-6 h-6 text-purple-600" />}
                label="Active Routines"
                value={stats.activeRoutines}
                trend="+5%"
                color="bg-gradient-to-br from-purple-50 to-purple-100"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Recent Systems */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900">Active Systems</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {systems.slice(0, 3).map(system => (
                      <div key={system.id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedSystem(system)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{system.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{system.category}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(system.current_stage)} flex items-center gap-1`}>
                            {getStageIcon(system.current_stage)}
                            {system.current_stage}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{system.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${system.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Next routine: {system.next_routine}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); advanceSystem(system.id); }}
                            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                          >
                            Advance <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Logs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {logs.map(log => (
                      <div key={log.id} className="p-4 flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{log.details}</p>
                          <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                        </div>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{log.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Live Event Feed */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
                  <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <h3 className="font-semibold text-gray-900">Live Feed</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No recent updates</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="text-sm">
                          <p className="text-gray-900">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notif.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Routines */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h3 className="font-semibold text-gray-900">Upcoming Routines</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {routines.slice(0, 3).map(routine => (
                      <div key={routine.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{routine.name}</p>
                          <p className="text-xs text-gray-500">{routine.day_of_week}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Play className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Pause className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telegram Status */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md border border-white/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Telegram Bot</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
                    <span className="text-sm text-gray-700 font-medium">Connected</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Last message: 2 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Systems Tab */}
        {activeTab === 'systems' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">System Registry</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                Add System
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search systems..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Systems Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSystems.map(system => (
                    <tr key={system.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{system.name}</div>
                        <div className="text-sm text-gray-500">{system.purpose}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{system.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(system.current_stage)} flex items-center gap-1 w-fit`}>
                          {getStageIcon(system.current_stage)}
                          {system.current_stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${system.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{system.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{system.owner}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => advanceSystem(system.id)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Advance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Routines Tab */}
        {activeTab === 'routines' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Routine Scheduler</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="grid grid-cols-7 gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="text-center">
                      <div className="font-semibold text-sm mb-2">{day}</div>
                      <div className="space-y-2">
                        {routines.filter(r => r.day_of_week === day).map(routine => (
                          <div key={routine.id} className="bg-indigo-50 border border-indigo-200 rounded p-2">
                            <p className="text-xs font-medium text-indigo-900">{routine.name}</p>
                            <div className="flex gap-1 mt-1">
                              <button className="p-1 hover:bg-indigo-100 rounded">
                                <Play className="w-3 h-3 text-indigo-600" />
                              </button>
                              <button className="p-1 hover:bg-indigo-100 rounded">
                                <Pause className="w-3 h-3 text-indigo-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Routine List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">All Routines</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {routines.map(routine => (
                  <div key={routine.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{routine.name}</h4>
                          <p className="text-sm text-gray-600">
                            System #{routine.system_id} • {routine.day_of_week} • Last run: {routine.last_run}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${routine.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {routine.status}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Play className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Pause className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Settings className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Insights</h2>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Systems by Stage */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Systems by Lifecycle Stage</h3>
                <div className="space-y-3">
                  {['define', 'design', 'build', 'automate', 'review'].map(stage => {
                    const count = systems.filter(s => s.current_stage === stage).length;
                    const percentage = systems.length > 0 ? (count / systems.length) * 100 : 0;
                    return (
                      <div key={stage}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium">{stage}</span>
                          <span className="text-gray-600">{count} systems</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${stage === 'define' ? 'bg-blue-600' : stage === 'design' ? 'bg-purple-600' : stage === 'build' ? 'bg-orange-600' : stage === 'automate' ? 'bg-green-600' : 'bg-indigo-600'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion Rates */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">System Completion Rate</p>
                      <p className="text-2xl font-bold text-green-600">87%</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Cycle Time</p>
                      <p className="text-2xl font-bold text-blue-600">12 days</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Routine Success Rate</p>
                      <p className="text-2xl font-bold text-purple-600">94%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Systems by Category</h3>
                <div className="space-y-3">
                  {[...new Set(systems.map(s => s.category))].map(category => {
                    const count = systems.filter(s => s.category === category).length;
                    return (
                      <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-gray-600">{count} system{count !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-8 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">This Week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-8 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">Last Week</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-8 rounded-full" style={{ width: '45%' }} />
                    </div>
                    <span className="text-sm text-gray-600 whitespace-nowrap">2 Weeks Ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Systems */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Most Active Systems</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {systems.sort((a, b) => b.progress - a.progress).slice(0, 5).map((system, idx) => (
                  <div key={system.id} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{system.name}</p>
                      <p className="text-sm text-gray-600">{system.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{system.progress}%</p>
                      <p className="text-xs text-gray-500">progress</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
              <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4">
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>All Events</option>
                <option>system_spawned</option>
                <option>automation_configured</option>
                <option>design_canvas_generated</option>
                <option>routine_completed</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>All Systems</option>
                {systems.map(s => <option key={s.id}>{s.name}</option>)}
              </select>
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">System</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map(log => {
                    const system = systems.find(s => s.id === log.system_id);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{system?.name || 'Unknown'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {log.event}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                        <td className="px-6 py-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Log Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Event Statistics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">{logs.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Total Events</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{logs.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Errors</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Detail Modal */}
      {selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedSystem.name}</h2>
                <p className="text-gray-600 mt-1">{selectedSystem.category}</p>
              </div>
              <button onClick={() => setSelectedSystem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* System Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Purpose</label>
                  <p className="text-gray-900 mt-1">{selectedSystem.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Owner</label>
                  <p className="text-gray-900 mt-1">{selectedSystem.owner}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="text-gray-900 mt-1">{selectedSystem.created_at}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Next Routine</label>
                  <p className="text-gray-900 mt-1">{selectedSystem.next_routine}</p>
                </div>
              </div>

              {/* Lifecycle Timeline */}
              <div>
                <h3 className="font-semibold mb-3">Lifecycle Progress</h3>
                <LifecycleTimeline stage={selectedSystem.current_stage} progress={selectedSystem.progress} />
              </div>

              {/* Related Routines */}
              <div>
                <h3 className="font-semibold mb-3">Associated Routines</h3>
                <div className="space-y-2">
                  {routines.filter(r => r.system_id === selectedSystem.id).map(routine => (
                    <div key={routine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{routine.name}</p>
                        <p className="text-sm text-gray-600">{routine.day_of_week}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {routine.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h3 className="font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {logs.filter(l => l.system_id === selectedSystem.id).map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{log.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    advanceSystem(selectedSystem.id);
                    setSelectedSystem(null);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Advance Stage
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                  Edit System
                </button>
                <button
                  onClick={() => setSelectedSystem(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateSystemModal />
    </div>
  );
};

export default SBSDashboard;