/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Shield, Search, Plus, Key, ToggleLeft, ToggleRight, UserPlus, Trash, X } from 'lucide-react';
import { Employee } from '../../types';

interface UserManagementViewProps {
  employees: Employee[];
}

export default function UserManagementView({ employees }: UserManagementViewProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Mock users list with role permissions
  const [users, setUsers] = useState([
    { username: 'suherman_owner', name: 'H. Suherman', role: 'Owner', active: true, modules: ['All Dashboard', 'Keuangan', 'Laporan', 'Data Master'] },
    { username: 'siti_rahma', name: 'Siti Rahma', role: 'Kasir', active: true, modules: ['Dashboard', 'Timbangan', 'Keuangan'] },
    { username: 'budi_weighbridge', name: 'Budi Santoso', role: 'Operator Timbangan', active: true, modules: ['Dashboard', 'Timbangan'] },
    { username: 'sortasi_pandi', name: 'Pandi Sutarman', role: 'Quality Checker', active: true, modules: ['Dashboard', 'Sortasi TBS'] }
  ]);

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Operator Timbangan');
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const handleCreateUser = () => {
    if (!newUsername || !newPassword || !selectedEmpId) {
      alert('Mohon isi Username, Password, dan pilih karyawan!');
      return;
    }

    const isExist = users.some(u => u.username === newUsername);
    if (isExist) {
      alert('Username telah digunakan!');
      return;
    }

    const matchedEmp = employees.find(e => e.id === selectedEmpId);
    const mds = newRole === 'Owner' ? ['All Dashboard', 'Keuangan', 'Laporan', 'Data Master'] : ['Dashboard'];

    setUsers([...users, {
      username: newUsername,
      name: matchedEmp?.name || newUsername,
      role: newRole,
      active: true,
      modules: mds
    }]);

    setNewUsername('');
    setNewPassword('');
    setSelectedEmpId('');
    setShowForm(false);
  };

  const handleToggleStatus = (username: string) => {
    setUsers(users.map(u => u.username === username ? { ...u, active: !u.active } : u));
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'suherman_owner') {
      alert('Gagal! User Owner utama tidak boleh didelete.');
      return;
    }
    setUsers(users.filter(u => u.username !== username));
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6EBDD] pb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#102018]">Manajemen User & Hak Akses</h2>
          <p className="text-xs text-[#66736B] mt-1">
            Mengatur akun operator, pembagian hak akses menu, dan penonaktifan akses staf RAM secara terpusat.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#123C2B] hover:bg-[#1f6b4a] text-white font-bold px-4 py-2.5 rounded-xl text-xs md:text-sm shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#C6F24A]" />
            Tambah Operator Baru
          </button>
        )}
      </div>

      {/* CREATE NEW OPERATOR USER ACCOUNT */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-md space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#E6EBDD] pb-2">
            <h3 className="font-extrabold text-sm text-[#102018] flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-800" />
              REGISTRASI HAK AKSES OPERATOR BARU
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-[#66736B] hover:text-red-500 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
            {/* Field 1: Select Employee */}
            <div>
              <label className="block mb-1 text-[#102018]/80">Pilih Karyawan Terdaftar</label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
              >
                <option value="">-- Pilih Karyawan --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            {/* Field 2: Username */}
            <div>
              <label className="block mb-1 text-[#102018]/80">Username Login</label>
              <input
                type="text"
                placeholder="Contoh: sitirahma"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
              />
            </div>

            {/* Field 3: Password */}
            <div>
              <label className="block mb-1 text-[#102018]/80">Password Akses</label>
              <input
                type="password"
                placeholder="Password minimal 6 digit"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1F6B4A]"
              />
            </div>

            {/* Field 4: System Role */}
            <div>
              <label className="block mb-1 text-[#102018]/80">Kategori Peran (SaaS Per-User)</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
              >
                <option value="Operator Timbangan">Operator Timbangan</option>
                <option value="Kasir">Kasir Keuangan</option>
                <option value="Quality Checker">Quality Sortasi</option>
                <option value="Admin">Administrator</option>
                <option value="Owner">Pemilik RAM (Owner)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E6EBDD]/50">
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold px-4 py-2 hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              onClick={handleCreateUser}
              className="bg-[#123C2B] text-white hover:bg-emerald-950 font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-md"
            >
              Aktifkan Akses Operator
            </button>
          </div>
        </div>
      )}

      {/* USERS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-[#E6EBDD] p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#66736B] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama operator atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7FAF3] border border-[#E6EBDD] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#1F6B4A]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6EBDD] text-[#66736B] font-bold bg-[#F7FAF3]">
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Nama Pegawai</th>
                <th className="py-2.5 px-3">System Role</th>
                <th className="py-2.5 px-3">Hak Modul Aplikasi</th>
                <th className="py-2.5 px-3 text-center">Status Login</th>
                <th className="py-2.5 px-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.username.includes(search.toLowerCase())).map(u => (
                <tr key={u.username} className="border-b border-[#E6EBDD] hover:bg-[#F7FAF3]/40 transition-colors">
                  <td className="py-3 px-3 font-bold font-mono text-emerald-950">{u.username}</td>
                  <td className="py-3 px-3 font-semibold">{u.name}</td>
                  <td className="py-3 px-3">
                    <span className="bg-[#123C2B] text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {u.modules.map((m, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 text-[9px] px-2 py-0.5 rounded border border-emerald-100">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(u.username)}
                      className="focus:outline-none inline-block"
                      title="Klik untuk ubah status"
                    >
                      {u.active ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                          ● AKTIF
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[9px] font-black px-3 py-0.5 rounded-full inline-flex items-center gap-1">
                          ● MATI
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus Hak Akses"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
