import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    stripeId: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    plan: {
        type: String,
    },
    credits: {
        type: Number,
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

export interface ITransaction {
    createdAt?: Date;
    stripeId: string;
    amount: number;
    plan?: string;
    credits?: number;
    buyer: object; // Assuming Schema.Types.ObjectId is defined somewhere
}


const Transaction = models?.Transaction || model("Transaction", TransactionSchema);

export default Transaction;