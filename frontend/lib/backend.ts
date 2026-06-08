import { execFile } from 'child_process';
import path from 'path';

/**
 * Helper untuk menjalankan binary C 'kendaraan.exe'
 * dengan argumen tertentu dan mengembalikan output JSON.
 */
export function runKendaraan(args: string[]): Promise<any> {
  const backendCwd = path.join(process.cwd(), '..', 'backend-c');
  const exePath = path.join(backendCwd, 'kendaraan.exe');

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
