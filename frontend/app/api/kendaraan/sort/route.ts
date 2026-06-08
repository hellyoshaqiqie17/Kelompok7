import { NextResponse } from 'next/server';
import { runKendaraan } from '@/lib/backend';

// GET /api/kendaraan/sort
export async function GET() {
  try {
    const sortedList = await runKendaraan(['sort']);
    return NextResponse.json(sortedList);
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Gagal mengurutkan data' },
      { status: 500 }
    );
  }
}
