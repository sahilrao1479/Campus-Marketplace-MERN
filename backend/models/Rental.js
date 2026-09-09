import mongoose from 'mongoose';

const rentalSchema = mongoose.Schema(
    {
        renter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Active', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        razorpayOrderId: {
            type: String,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpaySignature: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Rental = mongoose.model('Rental', rentalSchema);

export default Rental;
