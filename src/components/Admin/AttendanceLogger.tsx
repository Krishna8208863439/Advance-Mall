import React from 'react';
import { useMall } from '../../context/MallContext';
import { Users, CheckSquare, Clock } from 'lucide-react';

export const AttendanceLogger: React.FC = () => {
  const { attendance, updateAttendance } = useMall();

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center">
          <Users className="w-5 h-5 text-luxury-gold mr-2" />
          Employee Attendance Logger
        </h2>
        <p className="text-xs text-luxury-textMuted mt-1">
          Perform attendance check-ins, audit terminal shifts, and review clock-in logs.
        </p>
      </div>

      {/* Roster Overview Grid */}
      <div className="border border-luxury-darkBorder rounded-2xl glass-panel p-5 space-y-4">
        <div className="border-b border-luxury-darkBorder/40 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">Active Mall Staff Roster</h3>
            <p className="text-xs text-luxury-textMuted mt-0.5">Real-time status review for operations, maintenance, and security personnel</p>
          </div>

          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-luxury-darkBg px-3 py-1 rounded border border-luxury-darkBorder">
            Staff Size: {attendance.length}
          </span>
        </div>

        {/* Attendance Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-300">
            <thead>
              <tr className="border-b border-luxury-darkBorder/60 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                <th className="py-2.5 px-3">Employee ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Designation</th>
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

      {/* Informative Footer */}
      <div className="p-3 bg-luxury-darkCardLighter rounded-lg border border-luxury-darkBorder text-[10px] text-slate-400 flex items-start space-x-2">
        <CheckSquare className="w-3.5 h-3.5 text-luxury-gold shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Attendance entries automatically capture the local system time of check-in and are cached under browser storage.
        </p>
      </div>

    </div>
  );
};
