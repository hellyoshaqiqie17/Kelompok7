#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "kendaraan.h"

#define MAX_KENDARAAN 1000

// Helper function: Menghapus spasi di awal dan akhir string
void trim(char *str) {
    int start = 0;
    while (str[start] != '\0' && isspace((unsigned char)str[start])) {
        start++;
    }
    
    int end = strlen(str) - 1;
    while (end >= start && isspace((unsigned char)str[end])) {
        end--;
    }
    
    int i;
    for (i = start; i <= end; i++) {
        str[i - start] = str[i];
    }
    str[i - start] = '\0';
}

// 1. Membaca data kendaraan dari file JSON lokal ke dalam array of struct
int loadData(Kendaraan *data, const char *filename) {
    FILE *file = fopen(filename, "r");
    if (!file) {
        // Jika file tidak ada, anggap data kosong (0 item)
        return 0;
    }

    // Cari ukuran file
    fseek(file, 0, SEEK_END);
    long length = ftell(file);
    fseek(file, 0, SEEK_SET);

    if (length <= 0) {
        fclose(file);
        return 0;
    }

    char *buffer = (char *)malloc(length + 1);
    if (!buffer) {
        fclose(file);
        return 0;
    }

    size_t read_bytes = fread(buffer, 1, length, file);
    buffer[read_bytes] = '\0';
    fclose(file);

    int count = 0;
    char *ptr = buffer;

    // Parsing JSON sederhana secara manual tanpa library external
    while ((ptr = strchr(ptr, '{')) != NULL && count < MAX_KENDARAAN) {
        char *end = strchr(ptr, '}');
        if (!end) break;

        // Ekstrak objek JSON {...}
        int obj_len = end - ptr + 1;
        char *obj = (char *)malloc(obj_len + 1);
        strncpy(obj, ptr, obj_len);
        obj[obj_len] = '\0';

        Kendaraan k = {0};

        // Parse plat
        char *plat_key = strstr(obj, "\"plat\"");
        if (plat_key) {
            char *colon = strchr(plat_key, ':');
            if (colon) {
                char *quote1 = strchr(colon, '\"');
                if (quote1) {
                    char *quote2 = strchr(quote1 + 1, '\"');
                    if (quote2) {
                        int len = quote2 - quote1 - 1;
                        if (len > 19) len = 19;
                        strncpy(k.plat, quote1 + 1, len);
                        k.plat[len] = '\0';
                        trim(k.plat);
                    }
                }
            }
        }

        // Parse merk
        char *merk_key = strstr(obj, "\"merk\"");
        if (merk_key) {
            char *colon = strchr(merk_key, ':');
            if (colon) {
                char *quote1 = strchr(colon, '\"');
                if (quote1) {
                    char *quote2 = strchr(quote1 + 1, '\"');
                    if (quote2) {
                        int len = quote2 - quote1 - 1;
                        if (len > 49) len = 49;
                        strncpy(k.merk, quote1 + 1, len);
                        k.merk[len] = '\0';
                        trim(k.merk);
                    }
                }
            }
        }

        // Parse tahun
        char *tahun_key = strstr(obj, "\"tahun\"");
        if (tahun_key) {
            char *colon = strchr(tahun_key, ':');
            if (colon) {
                k.tahun = atoi(colon + 1);
            }
        }

        // Parse pajak
        char *pajak_key = strstr(obj, "\"pajak\"");
        if (pajak_key) {
            char *colon = strchr(pajak_key, ':');
            if (colon) {
                k.pajak = (float)atof(colon + 1);
            }
        }

        // Simpan ke array
        data[count] = k;
        count++;

        free(obj);
        ptr = end + 1;
    }

    free(buffer);
    return count;
}

// 2. Menyimpan seluruh data dari array of struct kembali ke file JSON lokal
void simpanData(const Kendaraan *data, int jumlah, const char *filename) {
    FILE *file = fopen(filename, "w");
    if (!file) {
        printf("{\n  \"status\": \"error\",\n  \"message\": \"Gagal membuka file untuk menulis data\"\n}\n");
        return;
    }

    fprintf(file, "[\n");
    for (int i = 0; i < jumlah; i++) {
        fprintf(file, "  {\n");
        fprintf(file, "    \"plat\": \"%s\",\n", data[i].plat);
        fprintf(file, "    \"merk\": \"%s\",\n", data[i].merk);
        fprintf(file, "    \"tahun\": %d,\n", data[i].tahun);
        fprintf(file, "    \"pajak\": %.2f\n", data[i].pajak);
        fprintf(file, "  }%s\n", (i == jumlah - 1) ? "" : ",");
    }
    fprintf(file, "]\n");
    fclose(file);
}

// 3. Menambahkan data kendaraan baru ke dalam array of struct
void tambahData(Kendaraan *data, int *jumlah, const Kendaraan *kbaru) {
    // Menambahkan data baru di index ke-*jumlah
    data[*jumlah] = *kbaru;
    // Increment pointer jumlah data
    (*jumlah)++;
}

// 4. Menampilkan seluruh data kendaraan dari array of struct ke stdout dalam format JSON
void tampilkanData(const Kendaraan *data, int jumlah) {
    printf("[\n");
    for (int i = 0; i < jumlah; i++) {
        printf("  {\n");
        printf("    \"plat\": \"%s\",\n", data[i].plat);
        printf("    \"merk\": \"%s\",\n", data[i].merk);
        printf("    \"tahun\": %d,\n", data[i].tahun);
        printf("    \"pajak\": %.2f\n", data[i].pajak);
        printf("  }%s\n", (i == jumlah - 1) ? "" : ",");
    }
    printf("]\n");
}

// 5. Mencari data kendaraan berdasarkan Plat Nomor menggunakan Linear Search (Mencocokkan Case Insensitive)
int cariData(const Kendaraan *data, int jumlah, const char *plat, Kendaraan *hasil) {
    for (int i = 0; i < jumlah; i++) {
        // Melakukan pencarian linier dengan membandingkan string plat nomor secara case-insensitive
        // Kita bandingkan plat di data dengan parameter plat yang dicari
        // Untuk kemudahan, kita bandingkan dengan strcasecmp (atau _stricmp di Windows)
#ifdef _WIN32
        if (_stricmp(data[i].plat, plat) == 0) {
#else
        if (strcasecmp(data[i].plat, plat) == 0) {
#endif
            // Jika ketemu, salin data ke pointer hasil pencarian
            *hasil = data[i];
            return i; // Kembalikan index penemuan
        }
    }
    return -1; // Tidak ditemukan
}

// 6. Mengurutkan data kendaraan berdasarkan Pajak menggunakan Bubble Sort
void bubbleSort(Kendaraan *data, int jumlah) {
    for (int i = 0; i < jumlah - 1; i++) {
        for (int j = 0; j < jumlah - i - 1; j++) {
            // Membandingkan data.pajak melalui pointer dan mengurutkan secara menaik (Ascending)
            if (data[j].pajak > data[j + 1].pajak) {
                // Swap struct
                Kendaraan temp = data[j];
                data[j] = data[j + 1];
                data[j + 1] = temp;
            }
        }
    }
}

// 7. Memperbarui data kendaraan berdasarkan Plat Nomor
int updateData(Kendaraan *data, int jumlah, const char *plat, const Kendaraan *kbaru) {
    Kendaraan dummy;
    // Cari index kendaraan yang plat nomornya cocok
    int index = cariData(data, jumlah, plat, &dummy);
    if (index != -1) {
        // Melakukan update field menggunakan pointer kendaraan di array
        Kendaraan *target = &data[index];
        
        // Plat nomor tidak bisa diubah karena merupakan primary key, tapi field lain diupdate
        strncpy(target->merk, kbaru->merk, sizeof(target->merk) - 1);
        target->merk[sizeof(target->merk) - 1] = '\0';
        
        target->tahun = kbaru->tahun;
        target->pajak = kbaru->pajak;
        return 1; // Success
    }
    return 0; // Not found
}

// 8. Menghapus data kendaraan berdasarkan Plat Nomor dari array
int hapusData(Kendaraan *data, int *jumlah, const char *plat) {
    Kendaraan dummy;
    int index = cariData(data, *jumlah, plat, &dummy);
    if (index != -1) {
        // Geser data kendaraan setelah index ke kiri
        for (int i = index; i < (*jumlah) - 1; i++) {
            data[i] = data[i + 1];
        }
        // Kurangi jumlah data total
        (*jumlah)--;
        return 1; // Success
    }
    return 0; // Not found
}

// Entry Point CLI Program
int main(int argc, char *argv[]) {
    // Inisialisasi array of struct untuk menampung data
    Kendaraan data[MAX_KENDARAAN];
    const char *db_file = "data.json";

    // Membaca data awal dari file data.json
    int jumlah = loadData(data, db_file);

    if (argc < 2) {
        printf("{\n  \"status\": \"error\",\n  \"message\": \"Argumen tidak cukup. Penggunaan: kendaraan.exe <cmd> [args]\"\n}\n");
        return 1;
    }

    const char *command = argv[1];

    if (strcmp(command, "list") == 0) {
        tampilkanData(data, jumlah);
    } 
    else if (strcmp(command, "add") == 0) {
        if (argc < 6) {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Format add salah. Penggunaan: add <plat> <merk> <tahun> <pajak>\"\n}\n");
            return 1;
        }
        
        Kendaraan kbaru;
        strncpy(kbaru.plat, argv[2], sizeof(kbaru.plat) - 1);
        kbaru.plat[sizeof(kbaru.plat) - 1] = '\0';
        trim(kbaru.plat);

        // Periksa apakah plat nomor sudah ada
        Kendaraan cari_dummy;
        if (cariData(data, jumlah, kbaru.plat, &cari_dummy) != -1) {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Kendaraan dengan Plat Nomor %s sudah terdaftar!\"\n}\n", kbaru.plat);
            return 0;
        }

        strncpy(kbaru.merk, argv[3], sizeof(kbaru.merk) - 1);
        kbaru.merk[sizeof(kbaru.merk) - 1] = '\0';
        trim(kbaru.merk);

        kbaru.tahun = atoi(argv[4]);
        kbaru.pajak = (float)atof(argv[5]);

        tambahData(data, &jumlah, &kbaru);
        simpanData(data, jumlah, db_file);
        
        printf("{\n  \"status\": \"success\",\n  \"message\": \"Data kendaraan berhasil ditambahkan\"\n}\n");
    } 
    else if (strcmp(command, "update") == 0) {
        if (argc < 6) {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Format update salah. Penggunaan: update <plat> <merk> <tahun> <pajak>\"\n}\n");
            return 1;
        }
        
        const char *plat = argv[2];
        Kendaraan kbaru;
        strncpy(kbaru.merk, argv[3], sizeof(kbaru.merk) - 1);
        kbaru.merk[sizeof(kbaru.merk) - 1] = '\0';
        trim(kbaru.merk);

        kbaru.tahun = atoi(argv[4]);
        kbaru.pajak = (float)atof(argv[5]);

        int updated = updateData(data, jumlah, plat, &kbaru);
        if (updated) {
            simpanData(data, jumlah, db_file);
            printf("{\n  \"status\": \"success\",\n  \"message\": \"Data kendaraan berhasil diperbarui\"\n}\n");
        } else {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Data kendaraan dengan Plat Nomor %s tidak ditemukan\"\n}\n", plat);
        }
    } 
    else if (strcmp(command, "delete") == 0) {
        if (argc < 3) {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Format delete salah. Penggunaan: delete <plat>\"\n}\n");
            return 1;
        }
        
        const char *plat = argv[2];
        int deleted = hapusData(data, &jumlah, plat);
        if (deleted) {
            simpanData(data, jumlah, db_file);
            printf("{\n  \"status\": \"success\",\n  \"message\": \"Data kendaraan berhasil dihapus\"\n}\n");
        } else {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Data kendaraan dengan Plat Nomor %s tidak ditemukan\"\n}\n", plat);
        }
    } 
    else if (strcmp(command, "search") == 0) {
        if (argc < 3) {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Format search salah. Penggunaan: search <plat>\"\n}\n");
            return 1;
        }
        
        const char *plat = argv[2];
        Kendaraan hasil;
        int index = cariData(data, jumlah, plat, &hasil);
        if (index != -1) {
            printf("{\n");
            printf("  \"status\": \"success\",\n");
            printf("  \"data\": {\n");
            printf("    \"plat\": \"%s\",\n", hasil.plat);
            printf("    \"merk\": \"%s\",\n", hasil.merk);
            printf("    \"tahun\": %d,\n", hasil.tahun);
            printf("    \"pajak\": %.2f\n", hasil.pajak);
            printf("  }\n");
            printf("}\n");
        } else {
            printf("{\n  \"status\": \"error\",\n  \"message\": \"Data kendaraan dengan Plat Nomor %s tidak ditemukan\"\n}\n", plat);
        }
    } 
    else if (strcmp(command, "sort") == 0) {
        bubbleSort(data, jumlah);
        tampilkanData(data, jumlah);
    } 
    else {
        printf("{\n  \"status\": \"error\",\n  \"message\": \"Command tidak dikenal\"\n}\n");
    }

    return 0;
}
