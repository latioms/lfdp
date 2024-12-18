import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET - Récupérer tous les clients
export async function GET(req: NextRequest) {
    const { data, error } = await supabase.from('customers').select('*');
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

// POST - Créer un nouveau client
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, email, phone, address } = body;

    const { data, error } = await supabase
        .from('customers')
        .insert([{ name, email, phone, address }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
}

// PUT - Mettre à jour un client existant
export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, name, email, phone, address } = body;

    const { data, error } = await supabase
        .from('customers')
        .update({ name, email, phone, address })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

// DELETE - Supprimer un client
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    const { data, error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}