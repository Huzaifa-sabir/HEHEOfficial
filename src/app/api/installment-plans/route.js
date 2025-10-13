import { NextResponse } from "next/server";
import connectDB from "@lib/mongodb";
import InstallmentPlan from "@app/models/InstallmentPlan";

// GET /api/installment-plans - Get all installment plans
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const frequency = searchParams.get("frequency");
    const num_installments = searchParams.get("num_installments");

    let query = {};
    if (frequency) query.frequency = frequency;
    if (num_installments) query.num_installments = parseInt(num_installments);

    const plans = await InstallmentPlan.find(query).sort({
      frequency: 1,
      num_installments: 1,
    });

    return NextResponse.json(
      {
        success: true,
        data: plans,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/installment-plans - Create new installment plan
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { frequency, num_installments, description } = body;

    if (
      !frequency ||
      num_installments === undefined ||
      num_installments === null ||
      num_installments === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Frequency and number of installments are required",
        },
        { status: 400 }
      );
    }

    if (!["weekly", "monthly", "instant"].includes(frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Frequency must be either instant , weekly or monthly",
        },
        { status: 400 }
      );
    }

    if (num_installments < 0 || num_installments > 7) {
      return NextResponse.json(
        {
          success: false,
          error: "Number of installments must be between 1 and 7",
        },
        { status: 400 }
      );
    }

    const existingPlan = await InstallmentPlan.findOne({
      frequency,
      num_installments,
    });
    if (existingPlan) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Plan with this frequency and installment count already exists",
        },
        { status: 400 }
      );
    }

    const plan = new InstallmentPlan({
      frequency,
      num_installments,
      description:
        description || `${num_installments} ${frequency} installments`,
    });
    await plan.save();

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Plan with this frequency and installment count already exists",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
