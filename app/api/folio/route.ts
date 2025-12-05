import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Call the PostgreSQL function to get the next folio
    // Parameter name must match the SQL function definition: prefix
    const { data, error } = await supabase
      .rpc('get_next_folio', { prefix: 'CIC' });

    if (error) throw error;

    return NextResponse.json({ folio: data });
  } catch (error: any) {
    console.error('Error fetching folio:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch folio' },
      { status: 500 }
    );
  }
}
