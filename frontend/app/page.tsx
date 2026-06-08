'use client';

import { useState, useEffect } from 'react';

// Tipe data kendaraan sesuai dengan struct C
interface Kendaraan {
  plat: string;
  merk: string;
  tahun: number;
  pajak: number;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function DashboardPage() {
  // States untuk data utama
  const [vehicles, setVehicles] = useState<Kendaraan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States pencarian dan pengurutan
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSorted, setIsSorted] = useState<boolean>(false);

  // States modal tambah/edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [formPlat, setFormPlat] = useState<string>('');
  const [formMerk, setFormMerk] = useState<string>('');
  const [formTahun, setFormTahun] = useState<string>('');
  const [formPajak, setFormPajak] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // States modal konfirmasi hapus
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deleteTargetPlat, setDeleteTargetPlat] = useState<string>('');
  const [deleteSubmitting, setDeleteSubmitting] = useState<boolean>(false);

  // State toast notifikasi
  const [toast, setToast] = useState<Toast | null>(null);

  // Tampilkan toast selama 4 detik
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Ambil data semua kendaraan (GET /api/kendaraan)
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kendaraan');
      if (!res.ok) {
        throw new Error('Gagal mengambil data kendaraan');
      }
      const data = await res.json();
      setVehicles(data);
      setIsSorted(false);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      showToast('error', err.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // 2. Cari kendaraan (GET /api/kendaraan/search?plat=...)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchVehicles();
      return;
    }

    setLoading(true);
    setError(null);
    setIsSearching(true);

    try {
      const res = await fetch(`/api/kendaraan/search?plat=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Data tidak ditemukan');
      }
      const data = await res.json();
      
      if (data.status === 'success' && data.data) {
        setVehicles([data.data]);
        showToast('success', 'Data kendaraan berhasil ditemukan');
      } else {
        setVehicles([]);
      }
    } catch (err: any) {
      setVehicles([]);
      setError(err.message || 'Data kendaraan tidak ditemukan');
      showToast('error', err.message || 'Data tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  // Reset pencarian
  const handleResetSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchVehicles();
  };

  // 3. Urutkan kendaraan berdasarkan Pajak (GET /api/kendaraan/sort)
  const handleSort = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kendaraan/sort');
      if (!res.ok) {
        throw new Error('Gagal mengurutkan data');
      }
      const data = await res.json();
      setVehicles(data);
      setIsSorted(true);
      showToast('success', 'Data berhasil diurutkan berdasarkan Pajak');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal mengurutkan data');
    } finally {
      setLoading(false);
    }
  };

  // Buka modal untuk Tambah Data
  const openAddModal = () => {
    setModalType('add');
    setFormPlat('');
    setFormMerk('');
    setFormTahun('');
    setFormPajak('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Buka modal untuk Edit Data
  const openEditModal = (vehicle: Kendaraan) => {
    setModalType('edit');
    setFormPlat(vehicle.plat);
    setFormMerk(vehicle.merk);
    setFormTahun(vehicle.tahun.toString());
    setFormPajak(vehicle.pajak.toString());
    setFormError(null);
    setIsModalOpen(true);
  };

  // Submit form (Tambah / Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validasi input
    if (!formPlat.trim()) return setFormError('Plat nomor wajib diisi');
    if (!formMerk.trim()) return setFormError('Merk kendaraan wajib diisi');
    if (!formTahun.trim() || isNaN(Number(formTahun)) || Number(formTahun) <= 0) {
      return setFormError('Tahun harus berupa angka valid');
    }
    if (!formPajak.trim() || isNaN(Number(formPajak)) || Number(formPajak) < 0) {
      return setFormError('Pajak harus berupa angka valid');
    }

    setFormSubmitting(true);

    const payload = {
      plat: formPlat.trim().toUpperCase(),
      merk: formMerk.trim(),
      tahun: parseInt(formTahun),
      pajak: parseFloat(formPajak),
    };

    try {
      const url = '/api/kendaraan';
      const method = modalType === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal memproses data');
      }

      showToast('success', result.message || 'Operasi berhasil dilakukan');
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan');
      showToast('error', err.message || 'Gagal menyimpan data');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Buka dialog hapus
  const openDeleteDialog = (plat: string) => {
    setDeleteTargetPlat(plat);
    setIsDeleteOpen(true);
  };

  // Eksekusi hapus data
  const handleDeleteConfirm = async () => {
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`/api/kendaraan?plat=${encodeURIComponent(deleteTargetPlat)}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal menghapus data');
      }

      showToast('success', result.message || 'Data berhasil dihapus');
      setIsDeleteOpen(false);
      fetchVehicles();
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menghapus data');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Helper untuk formatting rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16">
      {/* Top Navbar */}
      <nav className="w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.113c0-.75-.533-1.354-1.258-1.42L7.5 5.25v2.625m6.75-1.177h-6.75m6.75 0v-1.5M6.75 7.875v-.113c0-.75.533-1.354 1.258-1.42L14.25 5.25v2.625M6.75 7.875h7.5" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight">CarRegistry</span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Sistem Pengelolaan Kendaraan</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Lokal (data.json)
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Data Registrasi Kendaraan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Kelola dan cari data plat nomor, merk, tahun pembuatan, beserta nilai pajak kendaraan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Button Sort Pajak */}
            <button
              onClick={handleSort}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSorted
                  ? 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Urut Pajak
            </button>

            {/* Button Tambah Data */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Data
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 mb-6 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Plat Nomor..."
                className="block w-full pl-9 pr-4 py-1.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/85 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                Cari
              </button>
              {(isSearching || searchQuery) && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 text-xs font-semibold transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table / Data View */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin" />
              <p className="mt-3.5 text-xs text-slate-500 font-medium">Memuat data...</p>
            </div>
          ) : error && vehicles.length === 0 ? (
            <div className="py-14 text-center px-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Data Tidak Ditemukan</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">{error}</p>
              <button
                onClick={handleResetSearch}
                className="mt-3.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 text-xs font-medium transition-all"
              >
                Muat Ulang Semua Data
              </button>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-0.5">Database Kosong</h3>
              <p className="text-slate-500 text-xs">Belum ada data kendaraan terdaftar.</p>
              <button
                onClick={openAddModal}
                className="mt-3.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs"
              >
                Tambah Kendaraan Baru
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Plat Nomor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Merk Kendaraan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tahun
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Nilai Pajak
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {vehicles.map((vehicle) => (
                    <tr 
                      key={vehicle.plat}
                      className="hover:bg-slate-50/40 transition-colors duration-100"
                    >
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 tracking-wider">
                          {vehicle.plat}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {vehicle.merk}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {vehicle.tahun}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {formatRupiah(vehicle.pajak)}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(vehicle)}
                            className="p-1 rounded-md bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-all shadow-xs"
                            title="Edit Data"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteDialog(vehicle.plat)}
                            className="p-1 rounded-md bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-100 transition-all shadow-xs"
                            title="Hapus Data"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL TAMBAH & EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => !formSubmitting && setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-xl relative z-10 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {modalType === 'add' ? 'Tambah Registrasi Kendaraan' : 'Edit Registrasi Kendaraan'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={formSubmitting}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold px-3 py-2 rounded-lg">
                  {formError}
                </div>
              )}

              {/* Plat Nomor */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Plat Nomor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: L1234AB"
                  value={formPlat}
                  onChange={(e) => setFormPlat(e.target.value)}
                  disabled={modalType === 'edit' || formSubmitting}
                  className={`block w-full px-3 py-2 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all ${
                    modalType === 'edit' ? 'border-slate-100 text-slate-400 bg-slate-50/50 cursor-not-allowed' : 'border-slate-200'
                  }`}
                />
                {modalType === 'edit' && (
                  <p className="text-[10px] text-slate-400 mt-1">Plat nomor sebagai identitas unik tidak dapat diubah.</p>
                )}
              </div>

              {/* Merk Kendaraan */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Merk Kendaraan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Toyota Avanza"
                  value={formMerk}
                  onChange={(e) => setFormMerk(e.target.value)}
                  disabled={formSubmitting}
                  className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tahun */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2020"
                    value={formTahun}
                    onChange={(e) => setFormTahun(e.target.value)}
                    disabled={formSubmitting}
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>

                {/* Pajak */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Pajak (Rupiah)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="3500000"
                    value={formPajak}
                    onChange={(e) => setFormPajak(e.target.value)}
                    disabled={formSubmitting}
                    className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => !deleteSubmitting && setIsDeleteOpen(false)}
          />
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-xl relative z-10 shadow-xl p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center mb-3.5 border border-rose-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Hapus Data Kendaraan?</h3>
            <p className="text-slate-500 text-xs mb-5">
              Apakah Anda yakin ingin menghapus data kendaraan dengan Plat Nomor <strong className="text-slate-800 tracking-wider font-mono">{deleteTargetPlat}</strong>? Tindakan ini bersifat permanen.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                {deleteSubmitting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg bg-white animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm border-slate-200">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {toast.type === 'success' ? 'Berhasil' : 'Pemberitahuan'}
            </p>
            <p className="text-xs text-slate-700 mt-0.5 leading-snug">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
