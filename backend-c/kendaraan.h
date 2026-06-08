#ifndef KENDARAAN_H
#define KENDARAAN_H

// Struct untuk menyimpan data utama kendaraan
typedef struct {
    char plat[20];
    char merk[50];
    int tahun;
    float pajak;
} Kendaraan;

// Fungsi-fungsi manipulasi data (menggunakan pointer)

/**
 * Membaca data kendaraan dari file JSON lokal ke dalam array of struct.
 * @param data Pointer ke array of Kendaraan
 * @param filename Nama file sumber data (data.json)
 * @return Jumlah data yang berhasil dibaca
 */
int loadData(Kendaraan *data, const char *filename);

/**
 * Menyimpan seluruh data dari array of struct kembali ke file JSON lokal.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Jumlah data saat ini
 * @param filename Nama file tujuan penyimpanan
 */
void simpanData(const Kendaraan *data, int jumlah, const char *filename);

/**
 * Menambahkan data kendaraan baru ke dalam array of struct.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Pointer ke jumlah data saat ini (akan bertambah 1)
 * @param kbaru Pointer ke data kendaraan baru yang akan ditambahkan
 */
void tambahData(Kendaraan *data, int *jumlah, const Kendaraan *kbaru);

/**
 * Menampilkan seluruh data kendaraan dari array of struct ke stdout dalam format JSON.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Jumlah data saat ini
 */
void tampilkanData(const Kendaraan *data, int jumlah);

/**
 * Mencari data kendaraan berdasarkan Plat Nomor menggunakan Linear Search.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Jumlah data saat ini
 * @param plat String plat nomor yang dicari
 * @param hasil Pointer ke struct Kendaraan untuk menyimpan hasil pencarian jika ditemukan
 * @return Index kendaraan jika ditemukan, atau -1 jika tidak ditemukan
 */
int cariData(const Kendaraan *data, int jumlah, const char *plat, Kendaraan *hasil);

/**
 * Mengurutkan data kendaraan berdasarkan Pajak (Ascending) menggunakan Bubble Sort.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Jumlah data saat ini
 */
void bubbleSort(Kendaraan *data, int jumlah);

/**
 * Memperbarui data kendaraan berdasarkan Plat Nomor.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Jumlah data saat ini
 * @param plat String plat nomor kendaraan yang ingin diupdate
 * @param kbaru Pointer ke data baru kendaraan
 * @return 1 jika berhasil diupdate, 0 jika data tidak ditemukan
 */
int updateData(Kendaraan *data, int jumlah, const char *plat, const Kendaraan *kbaru);

/**
 * Menghapus data kendaraan berdasarkan Plat Nomor dari array.
 * @param data Pointer ke array of Kendaraan
 * @param jumlah Pointer ke jumlah data saat ini (akan berkurang 1)
 * @param plat String plat nomor kendaraan yang akan dihapus
 * @return 1 jika berhasil dihapus, 0 jika tidak ditemukan
 */
int hapusData(Kendaraan *data, int *jumlah, const char *plat);

#endif // KENDARAAN_H
