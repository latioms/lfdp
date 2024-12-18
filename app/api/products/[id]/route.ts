import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET - Récupérer un produit spécifique
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (id, name),
            stock_movements (
                id,
                quantity,
                movement_type,
                created_at
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json(
            { error: 'Produit non trouvé' },
            { status: 404 }
        );
    }

    return NextResponse.json(data);
}

// PUT - Mettre à jour un produit spécifique
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const body = await req.json();
    const { 
        name, 
        description, 
        price, 
        stock_quantity, 
        alert_threshold, 
        category_id, 
        image_url 
    } = body;

    // Vérifier si le produit existe
    const { data: existingProduct } = await supabase
        .from('products')
        .select()
        .eq('id', id)
        .single();

    if (!existingProduct) {
        return NextResponse.json(
            { error: 'Produit non trouvé' },
            { status: 404 }
        );
    }

    // Mise à jour du produit
    const { data, error } = await supabase
        .from('products')
        .update({
            name,
            description,
            price,
            stock_quantity,
            alert_threshold,
            category_id,
            image_url
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}

// DELETE - Supprimer un produit spécifique
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    // Vérifier si le produit a des commandes associées
    const { data: orderItems } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', id)
        .limit(1);

    if (orderItems && orderItems.length > 0) {
        return NextResponse.json(
            { error: 'Ce produit est utilisé dans des commandes et ne peut pas être supprimé' },
            { status: 400 }
        );
    }

    // Supprimer les mouvements de stock associés
    await supabase
        .from('stock_movements')
        .delete()
        .eq('product_id', id);

    // Supprimer le produit
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}