import { NextResponse } from 'next/server';
import { runKendaraan } from '@/lib/backend';

// GET /api/kendaraan - Mengambil semua data kendaraan
export async function GET() {
  try {
    const list = await runKendaraan(['list']);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal memuat data' },
      { status: 500 }
    );
  }
}

// POST /api/kendaraan - Menambahkan data kendaraan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plat, merk, tahun, pajak } = body;

    if (!plat || !merk || tahun === undefined || pajak === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Semua field (plat, merk, tahun, pajak) wajib diisi' },
        { status: 400 }
      );
    }

    const result = await runKendaraan([
      'add',
      plat.toString(),
      merk.toString(),
      tahun.toString(),
      pajak.toString()
    ]);

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal menambahkan data' },
      { status: 500 }
    );
  }
}

// PUT /api/kendaraan - Memperbarui data kendaraan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { plat, merk, tahun, pajak } = body;

    if (!plat || !merk || tahun === undefined || pajak === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Semua field (plat, merk, tahun, pajak) wajib diisi' },
        { status: 400 }
      );
    }

    const result = await runKendaraan([
      'update',
      plat.toString(),
      merk.toString(),
      tahun.toString(),
      pajak.toString()
    ]);

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal memperbarui data' },
      { status: 500 }
    );
  }
}

// DELETE /api/kendaraan?plat=... - Menghapus data kendaraan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plat = searchParams.get('plat');

    if (!plat) {
      return NextResponse.json(
        { status: 'error', message: 'Parameter plat wajib diisi' },
        { status: 400 }
      );
    }

    const result = await runKendaraan(['delete', plat]);

    if (result.status === 'error') {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal menghapus data' },
      { status: 500 }
    );
  }
}
