import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(req: NextRequest) {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, description, price, stock_quantity, alert_threshold, category_id, image_url } = body;

    const { data, error } = await supabase
        .from('products')
        .insert([{ name, description, price, stock_quantity, alert_threshold, category_id, image_url }]);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, name, description, price, stock_quantity, alert_threshold, category_id, image_url } = body;

    const { data, error } = await supabase
        .from('products')
        .update({ name, description, price, stock_quantity, alert_threshold, category_id, image_url })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}