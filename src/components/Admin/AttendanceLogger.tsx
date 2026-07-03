import React, { useState } from 'react';
import { useMall } from '../../context/MallContext';
import { Users, CheckSquare, Clock, Plus, CreditCard, DollarSign, X, CheckCircle, Receipt } from 'lucide-react';

export const AttendanceLogger: React.FC = () => {
  const { attendance, updateAttendance, addStaffMember, payroll, releaseSalary } = useMall();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'attendance' | 'payroll'>('attendance');
  const [currentMonth] = useState('July 2026');

  // Add staff modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'Security' | 'Maintenance' | 'Administration' | 'Customer Desk'>('Security');
  const [staffDept, setStaffDept] = useState('');
  const [staffSalary, setStaffSalary] = useState('');
  const [staffBank, setStaffBank] = useState('');
  const [addError, setAddError] = useState('');

  // Receipt modal state
  const [receiptData, setReceiptData] = useState<{
    employeeName: string;
    amount: number;
    month: string;
    bankAccount: string;
    reference: string;
    timestamp: string;
    payoutMethod?: string;
  } | null>(null);

  // Form submission handler
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!staffName.trim()) {
      setAddError('Employee name is required.');
      return;
    }
    if (!staffDept.trim()) {
      setAddError('Department is required.');
      return;
    }
    const salaryNum = parseFloat(staffSalary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      setAddError('Please enter a valid salary amount.');
      return;
    }
    if (!staffBank.trim()) {
      setAddError('Bank account number is required.');
      return;
    }

    const nextId = `emp_${attendance.length + 1}`;
    addStaffMember({
      id: nextId,
      name: staffName.trim(),
      role: staffRole,
      department: staffDept.trim(),
      salary: salaryNum,
      bankAccount: staffBank.trim()
    });

    // Reset state & close
    setStaffName('');
    setStaffRole('Security');
    setStaffDept('');
    setStaffSalary('');
    setStaffBank('');
    setShowAddModal(false);
  };

  // Salary release handler
  const handleReleaseSalary = (empId: string, payoutMethod: 'Razorpay Payouts' | 'Manual Bank' = 'Manual Bank') => {
    const emp = attendance.find(e => e.id === empId);
    if (!emp) return;

    const ref = releaseSalary(empId, currentMonth, payoutMethod);
    
    // Set receipt details for modal display
    setReceiptData({
      employeeName: emp.name,
      amount: emp.salary,
      month: currentMonth,
      bankAccount: emp.bankAccount,
      reference: ref,
      timestamp: new Date().toLocaleString(),
      payoutMethod
    });
  };

  // Check if salary paid for this month
  const isPaidThisMonth = (empId: string) => {
    return payroll.some(p => p.employeeId === empId && p.month === currentMonth && p.status === 'Paid');
  };

  // Get transaction details for employee
  const getPayoutInfo = (empId: string) => {
    return payroll.find(p => p.employeeId === empId && p.month === currentMonth);
  };

  // Budget calculations
  const totalMonthlyRosterCost = attendance.reduce((sum, e) => sum + e.salary, 0);
  const totalPaidThisMonth = payroll
    .filter(p => p.month === currentMonth && p.status === 'Paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPendingThisMonth = totalMonthlyRosterCost - totalPaidThisMonth;

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
            <Users className="w-5 h-5 text-luxury-gold mr-2" />
            Staff Management & Payroll Hub
          </h2>
          <p className="text-xs text-luxury-textMuted mt-1">
            Perform shifts audits, onboard new internal crew members, and process salaries payouts.
          </p>
        </div>

        {/* View Switcher Toggles */}
        <div className="bg-luxury-darkCard p-1 rounded-lg border border-luxury-darkBorder flex self-start sm:self-auto space-x-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center ${
              activeTab === 'attendance'
                ? 'bg-luxury-gold text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Shift Roster
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 flex items-center ${
              activeTab === 'payroll'
                ? 'bg-luxury-gold text-black shadow-gold-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Payroll Ledger
          </button>
        </div>
      </div>

      {activeTab === 'attendance' ? (
        /* ================= SHIFT ROSTER TAB ================= */
        <div className="space-y-6">
          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
            <div className="border-b border-luxury-darkBorder/40 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white text-base">Active Mall Staff Roster</h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Real-time status review for operations, maintenance, and security personnel</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-luxury-darkBg px-3 py-1.5 rounded border border-luxury-darkBorder">
                  Staff Size: {attendance.length}
                </span>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center space-x-1.5 bg-luxury-gold hover:bg-luxury-gold-dark text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-gold-glow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Crew Member</span>
                </button>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-2.5 px-3">Crew ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Base Salary</th>
                    <th className="py-2.5 px-3">Current Status</th>
                    <th className="py-2.5 px-3">Clock-In Time</th>
                    <th className="py-2.5 px-3 text-right">Attendance Audit Toggles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-darkBorder/40">
                  {attendance.map(emp => (
                    <tr key={emp.id} className="hover:bg-luxury-darkCard/20 transition-all">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">{emp.id}</td>
                      <td className="py-3 px-3 font-extrabold text-white">{emp.name}</td>
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-luxury-darkCard border border-luxury-darkBorder text-slate-300">
                          {emp.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{emp.department || 'Operations'}</td>
                      <td className="py-3 px-3 font-bold text-slate-200">₹{emp.salary ? emp.salary.toLocaleString() : '25,000'}</td>
                      <td className="py-3 px-3">
                        {emp.status === 'Present' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-emerald/15 text-luxury-emerald border border-luxury-emerald/30 uppercase">Present</span>
                        ) : emp.status === 'Late' ? (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-amber/15 text-luxury-amber border border-luxury-amber/30 uppercase">Late</span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-luxury-rose/15 text-luxury-rose border border-luxury-rose/30 uppercase">Absent</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-luxury-gold" />
                          <span>{emp.clockInTime}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => updateAttendance(emp.id, 'Present')}
                            className={`px-2 py-1 text-[9px] uppercase font-bold rounded transition-all border ${
                              emp.status === 'Present'
                                ? 'bg-luxury-emerald text-black border-luxury-emerald font-black'
                                : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white hover:border-luxury-emerald/40'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => updateAttendance(emp.id, 'Late')}
                            className={`px-2 py-1 text-[9px] uppercase font-bold rounded transition-all border ${
                              emp.status === 'Late'
                                ? 'bg-luxury-amber text-black border-luxury-amber font-black'
                                : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white hover:border-luxury-amber/40'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => updateAttendance(emp.id, 'Absent')}
                            className={`px-2 py-1 text-[9px] uppercase font-bold rounded transition-all border ${
                              emp.status === 'Absent'
                                ? 'bg-luxury-rose text-black border-luxury-rose font-black'
                                : 'bg-luxury-darkCard border-luxury-darkBorder text-slate-400 hover:text-white hover:border-luxury-rose/40'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 bg-luxury-darkCardLighter rounded-lg border border-luxury-darkBorder text-[10px] text-slate-400 flex items-start space-x-2">
            <CheckSquare className="w-3.5 h-3.5 text-luxury-gold shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              New crew members onboarded will automatically populate into the local state database. Clock-in updates will trigger logs inside the system activity database.
            </p>
          </div>
        </div>
      ) : (
        /* ================= PAYROLL LEDGER TAB ================= */
        <div className="space-y-6">
          {/* Budget Overview Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
              <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Total Budget ({currentMonth})</span>
                <span className="text-lg font-black text-white">₹{totalMonthlyRosterCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Salaries Released</span>
                <span className="text-lg font-black text-emerald-400">₹{totalPaidThisMonth.toLocaleString()}</span>
              </div>
            </div>

            <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-4 flex items-center space-x-3.5">
              <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block">Payouts Pending</span>
                <span className="text-lg font-black text-amber-400">₹{totalPendingThisMonth.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
            <div className="border-b border-luxury-darkBorder/40 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-white text-base">Monthly Salary Disbursement</h3>
                <p className="text-xs text-luxury-textMuted mt-0.5">Approve, release, and track monthly payouts for internal employees</p>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-luxury-gold bg-luxury-gold/10 px-2.5 py-1 rounded border border-luxury-gold/20">
                Active Cycle: {currentMonth}
              </span>
            </div>

            {/* Payroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-2.5 px-3">Crew ID</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Base Salary</th>
                    <th className="py-2.5 px-3">Bank Account</th>
                    <th className="py-2.5 px-3">Disbursement Status</th>
                    <th className="py-2.5 px-3 text-right">Payroll Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-darkBorder/40">
                  {attendance.map(emp => {
                    const paid = isPaidThisMonth(emp.id);
                    const payoutInfo = getPayoutInfo(emp.id);

                    return (
                      <tr key={emp.id} className="hover:bg-luxury-darkCard/20 transition-all">
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">{emp.id}</td>
                        <td className="py-3 px-3 font-extrabold text-white">{emp.name}</td>
                        <td className="py-3 px-3 text-slate-400">{emp.department || 'Operations'}</td>
                        <td className="py-3 px-3 font-extrabold text-white">₹{emp.salary ? emp.salary.toLocaleString() : '25,000'}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{emp.bankAccount || 'SBI-88771122'}</td>
                        <td className="py-3 px-3">
                          {paid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 uppercase">
                              <CheckCircle className="w-3 top-0.5 mr-1" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/35 uppercase">
                              <Clock className="w-3 top-0.5 mr-1 animate-pulse" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {paid ? (
                            <button
                              onClick={() => {
                                if (payoutInfo) {
                                  setReceiptData({
                                    employeeName: emp.name,
                                    amount: emp.salary,
                                    month: currentMonth,
                                    bankAccount: emp.bankAccount,
                                    reference: payoutInfo.transactionRef || 'N/A',
                                    timestamp: payoutInfo.timestamp || new Date().toLocaleString(),
                                    payoutMethod: payoutInfo.payoutMethod || 'Manual Bank'
                                  });
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 bg-luxury-darkCard hover:bg-luxury-darkCardLighter border border-luxury-darkBorder text-slate-300 hover:text-white rounded text-[10px] font-semibold transition"
                            >
                              <Receipt className="w-3 h-3 mr-1 text-luxury-gold" />
                              View Slip
                            </button>
                          ) : (
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleReleaseSalary(emp.id, 'Manual Bank')}
                                className="inline-flex items-center px-2 py-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-300 hover:text-white rounded text-[10px] font-extrabold transition-all"
                              >
                                Bank Transfer
                              </button>
                              <button
                                onClick={() => handleReleaseSalary(emp.id, 'Razorpay Payouts')}
                                className="inline-flex items-center px-2 py-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black rounded text-[10px] font-extrabold shadow-gold-glow transition-all"
                              >
                                <CreditCard className="w-3 h-3 mr-1" />
                                Razorpay API
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD STAFF MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md border border-luxury-darkBorder bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-luxury-darkBorder/40 pb-3 mb-4">
              <h3 className="font-extrabold text-white text-base flex items-center">
                <Users className="w-4 h-4 text-luxury-gold mr-2" />
                Register New Crew Member
              </h3>
              <p className="text-xs text-luxury-textMuted mt-0.5 font-light">Input primary credentials to onboard new mall employee.</p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              {addError && (
                <div className="p-2.5 rounded bg-luxury-rose/10 border border-luxury-rose/30 text-[11px] text-luxury-rose font-bold">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                  >
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Customer Desk">Customer Desk</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Facilities"
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Monthly Base Salary (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 30000"
                  value={staffSalary}
                  onChange={(e) => setStaffSalary(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC-99881122"
                  value={staffBank}
                  onChange={(e) => setStaffBank(e.target.value)}
                  className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-luxury-gold/50 font-mono"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-luxury-darkBg border border-luxury-darkBorder text-slate-400 text-xs font-bold py-2 rounded-lg hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-luxury-gold hover:bg-luxury-gold-dark text-black font-extrabold text-xs py-2 rounded-lg shadow-gold-glow transition-colors"
                >
                  Confirm Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SALARY TRANSACTION SLIP SLIDE RECEIPT ================= */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm border border-luxury-gold/30 bg-luxury-darkCard p-6 rounded-2xl glass-panel relative shadow-2xl flex flex-col items-center">
            
            {/* Visual Success Circle Badge */}
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-7 h-7" />
            </div>

            <h3 className="font-extrabold text-white text-base tracking-tight">Disbursement Complete</h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">Salary Transferred</p>
            
            {/* receipt card body */}
            <div className="w-full bg-luxury-darkBg border border-luxury-darkBorder rounded-xl p-4 mt-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-luxury-darkBorder/40 pb-2 mb-2">
                <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Payroll Receipt</span>
                <span className="text-[9px] font-mono text-slate-400">{receiptData.timestamp.split(',')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee Name:</span>
                <span className="font-semibold text-white">{receiptData.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">For Cycle:</span>
                <span className="font-semibold text-slate-300">{receiptData.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dest Account:</span>
                <span className="font-semibold text-slate-300 font-mono">{receiptData.bankAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursed Via:</span>
                <span className="font-semibold text-luxury-gold uppercase text-[10px]">{receiptData.payoutMethod || 'Manual Bank'}</span>
              </div>
              <div className="flex justify-between border-t border-luxury-darkBorder/40 pt-2 mt-2">
                <span className="text-slate-400 font-bold">Transferred Amount:</span>
                <span className="font-extrabold text-luxury-gold text-sm">
                  ₹{receiptData.amount.toLocaleString()}
                </span>
              </div>
              <div className="text-[9px] text-slate-500 font-mono mt-3 pt-2 border-t border-dashed border-luxury-darkBorder text-center">
                REF ID: {receiptData.reference}
              </div>
            </div>

            <button
              onClick={() => setReceiptData(null)}
              className="mt-5 w-full bg-luxury-darkBg hover:bg-luxury-darkCardLighter border border-luxury-darkBorder text-slate-300 hover:text-white font-bold text-xs py-2 rounded-lg transition"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
