import { execFile } from 'child_process';
import path from 'path';
import os from 'os';

/**
 * Helper untuk menjalankan binary C 'kendaraan' (Linux) atau 'kendaraan.exe' (Windows)
 * dengan argumen tertentu dan mengembalikan output JSON.
 */
export function runKendaraan(args: string[]): Promise<any> {
  // Gunakan variabel lingkungan jika diset (misalnya di Railway/Docker), 
  // jika tidak gunakan folder default relative ke frontend.
  const backendCwd = process.env.BACKEND_CWD 
    ? path.resolve(process.env.BACKEND_CWD) 
    : path.join(process.cwd(), '..', 'backend-c');
    
  // Deteksi sistem operasi untuk menentukan nama executable
  const isWindows = os.platform() === 'win32';
  const binaryName = isWindows ? 'kendaraan.exe' : 'kendaraan';
  const exePath = path.join(backendCwd, binaryName);

  return new Promise((resolve, reject) => {
    execFile(exePath, args, { cwd: backendCwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Gagal menjalankan ${exePath}:`, error);
        console.error('Stderr:', stderr);
        return reject({
          status: 'error',
          message: `Internal server error: Gagal menjalankan program C. ${error.message}`
        });
      }
      
      const cleanStdout = stdout.trim();
      if (!cleanStdout) {
        return resolve([]);
      }

      try {
        const data = JSON.parse(cleanStdout);
        resolve(data);
      } catch (parseError) {
        console.error('Gagal parse JSON dari stdout:', cleanStdout);
        console.error(parseError);
        reject({
          status: 'error',
          message: 'Gagal memproses response dari program C (invalid JSON).'
        });
      }
    });
  });
}

