// src/models/subscriptionModel.ts
import mongoose, { Schema } from 'mongoose';



const SubscriptionSchema = new Schema({
    userId: { type: String, ref: 'Institute', required: true },
    services: [{
        serviceId: { type: String, ref: 'Service', required: true },
        baseCost: { type: Number, required: true },
        discountPercentage: { type: Number, required: true, default: 0 },
        finalCost: { type: Number, required: true }
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending'], required: true },
    domain: { type: String, required: true },
    access: { type: Boolean, required: true, default: false },
    totalBaseCost: { type: Number, required: true },
    totalDiscount: { type: Number, required: true, default: 0 },
    totalFinalCost: { type: Number, required: true },
    billingCycle: { type: String, enum: ['monthly', 'quarterly', 'annually'], required: true },
    autoRenew: { type: Boolean, required: true, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export default Subscription;
