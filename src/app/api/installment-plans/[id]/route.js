import { NextResponse } from 'next/server';

import connectDB from '@lib/mongodb';
import InstallmentPlan from '@app/models/InstallmentPlan';

// GET /api/installment-plans/[id] - Get installment plan by ID
export async function GET(request, { params }) {
  try {
    await connectDB();
    const {id} = await params

    console.log('📋 Fetching installment plan with ID:', id);

    const plan = await InstallmentPlan.findById(id);

    if (!plan) {
      console.log('❌ Installment plan not found for ID:', id);
      return NextResponse.json(
        { success: false, error: 'Installment plan not found' },
        { status: 404 }
      );
    }

    console.log('✅ Installment plan found:', plan.frequency, plan.num_installments);

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('❌ Error fetching installment plan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/installment-plans/[id] - Update installment plan
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { frequency, num_installments, description } = body;

    const updateData = {};
    if (frequency !== undefined) {
        if (!['weekly', 'monthly' , 'instant'].includes(frequency)) {
            return NextResponse.json(
                { success: false, error: 'Frequency must be either weekly or monthly' },
                { status: 400 }
            );
        }
        updateData.frequency = frequency;
    }
    
    
    if (num_installments !== undefined) {
        if (num_installments < 1 || num_installments > 7) {
            return NextResponse.json(
                { success: false, error: 'Number of installments must be between 1 and 7' },
                { status: 400 }
            );
        }
        updateData.num_installments = num_installments;
    }
    
    if (description !== undefined) updateData.description = description;
    const {id} = await params
    const plan = await InstallmentPlan.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
    );

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Installment plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan
    });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Plan with this frequency and installment count already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/installment-plans/[id] - Delete installment plan
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const {id} = await params
    const plan = await InstallmentPlan.findByIdAndDelete(id);
    
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Installment plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Installment plan deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}