import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// GET - Récupérer toutes les catégories
export async function GET() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// POST - Créer une nouvelle catégorie
export async function POST(req: NextRequest) {
    const { name } = await req.json();

    if (!name) {
        return NextResponse.json(
            { error: 'Le nom est requis' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Code d'erreur PostgreSQL pour violation d'unicité
            return NextResponse.json(
                { error: 'Cette catégorie existe déjà' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
}

// PUT - Modifier une catégorie
export async function PUT(req: NextRequest) {
    const { id, name } = await req.json();

    if (!id || !name) {
        return NextResponse.json(
            { error: 'ID et nom sont requis' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json(
                { error: 'Cette catégorie existe déjà' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

// DELETE - Supprimer une catégorie
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    // Vérifier si la catégorie est utilisée
    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1);

    if (products && products.length > 0) {
        return NextResponse.json(
            { error: 'Cette catégorie est utilisée par des produits' },
            { status: 400 }
        );
    }

    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}