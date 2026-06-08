import { NextResponse } from 'next/server';
import { runKendaraan } from '@/lib/backend';

// GET /api/kendaraan/search?plat=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plat = searchParams.get('plat');

    if (!plat) {
      return NextResponse.json(
        { status: 'error', message: 'Parameter plat wajib diisi untuk pencarian' },
        { status: 400 }
      );
    }

    const result = await runKendaraan(['search', plat]);

    if (result.status === 'error') {
      // Return 404 if vehicle not found
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal mencari data' },
      { status: 500 }
    );
  }
}
