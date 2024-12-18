import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET - Récupérer toutes les commandes
export async function GET(req: NextRequest) {
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            customers (id, name),
            order_items (
                id,
                quantity,
                unit_price,
                products (id, name)
            )
        `);
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

// POST - Créer une nouvelle commande
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { customer_id, total_amount, items, created_by } = body;

    // Démarrer une transaction
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
            customer_id,
            total_amount,
            status: 'pending',
            created_by,
            sync_status: 'pending'
        }])
        .select()
        .single();

    if (orderError) {
        return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insérer les éléments de la commande
    const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Mettre à jour le stock des produits
    for (const item of items) {
        const { error: stockError } = await supabase.rpc('decrement_stock', { 
            product_id: item.product_id, 
            quantity: item.quantity 
        });

        if (stockError) {
            return NextResponse.json({ error: stockError.message }, { status: 500 });
        }
    }

    return NextResponse.json(order, { status: 201 });
}

// PUT - Mettre à jour une commande
export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, status, sync_status } = body;

    const { data, error } = await supabase
        .from('orders')
        .update({ status, sync_status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}

// DELETE - Supprimer une commande
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    // Supprimer d'abord les éléments de la commande
    const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

    if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Ensuite supprimer la commande
    const { data, error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 200 });
}