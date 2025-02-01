// src/models/subscriptionModel.ts
import mongoose, { Schema } from 'mongoose';



const SubscriptionSchema = new Schema({
    userId: { type: String, ref: 'Institute', required: true },
    serviceId: { type: String, ref: 'Service', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive', 'pending'], required: true },
    domain: { type: String, required: true },
    access: { type: Boolean, required: true, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});



const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
export default Subscription;
