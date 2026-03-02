import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';

// @desc    Create Stripe Checkout Session (Redirects to EJS Mock Gateway)
// @route   POST /api/payment/create-checkout-session
// @access  Private / Student
export const createCheckoutSession = asyncHandler(async (req, res) => {
    const { amount, eventId, registrationId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    if (amount <= 0 || event.registrationFee <= 0) {
        res.status(400);
        throw new Error('This event does not require payment');
    }

    if (process.env.STRIPE_SECRET_KEY === 'mock_key_secret' || !process.env.STRIPE_SECRET_KEY) {
        // Redirect browser to our custom EJS Mock Gateway instead of instant success bypass
        return res.status(200).json({
            url: `http://localhost:5000/api/payment/gateway/${registrationId}?amount=${event.registrationFee}`,
            sessionId: `mock_session_${Date.now()}`
        });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Registration for ${event.title}`,
                            description: `Organized by ${event.organizerCollegeName}`,
                        },
                        unit_amount: amount, // amount is already in paise from frontend calculation typically, or multiply by 100 if receiving rupees
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            client_reference_id: registrationId,
            success_url: `http://localhost:5173/events/${eventId}?success=true&session_id={CHECKOUT_SESSION_ID}&registration_id=${registrationId}`,
            cancel_url: `http://localhost:5173/events/${eventId}?canceled=true&registration_id=${registrationId}`,
        });

        res.status(200).json({
            url: session.url,
            sessionId: session.id
        });
    } catch (error) {
        console.error("Stripe Session Error:", error);
        res.status(500);
        throw new Error('Failed to create Stripe checkout session');
    }
});

// @desc    Render Mock Payment Gateway UI
// @route   GET /api/payment/gateway/:registrationId
// @access  Public (Browser Redirect)
export const renderGateway = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { amount } = req.query;

    const registration = await Registration.findById(registrationId).populate('event');
    if (!registration || !registration.event) {
        return res.status(404).send('Registration or Event not found');
    }

    res.render('payment', {
        amount: amount || registration.event.registrationFee,
        eventId: registration.event._id,
        registrationId: registrationId,
        studentId: registration.student,
        studentName: registration.studentName,
        eventTitle: registration.event.title
    });
});

// @desc    Process Mock Payment and Redirect back to React App
// @route   POST /api/payment/process/:registrationId
// @access  Public (Form Submit)

export const processPayment = asyncHandler(async (req, res) => {
    const { registrationId } = req.params;
    const { amount, eventId, studentId } = req.body;

    // Simulate 90% success, 10% failure
    const isSuccess = Math.random() < 0.90;
    const status = isSuccess ? 'Success' : 'Failed';
    const transactionId = `mock_session_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // 1. Save local Payment record for gateway dashboard
    await Payment.create({
        student: studentId,
        registrationId,
        amount,
        status,
        transactionId
    });

    if (isSuccess) {
        // Redirect browser successfully back to React App
        res.redirect(`http://localhost:5173/events/${eventId}?success=true&session_id=${transactionId}&registration_id=${registrationId}`);
    } else {
        // Redirect browser to React App with canceled failure
        res.redirect(`http://localhost:5173/events/${eventId}?canceled=true&registration_id=${registrationId}`);
    }
});

// @desc    Render Mock Payments List UI
// @route   GET /api/payment/history
// @access  Public (Admin View)
export const renderPaymentsList = asyncHandler(async (req, res) => {
    const payments = await Payment.find().sort({ date: -1 });
    res.render('paymentsList', { payments });
});

// @desc    Verify Stripe Payment Session
// @route   POST /api/payment/verify-session
// @access  Private / Student
export const verifySession = asyncHandler(async (req, res) => {
    const { session_id, registrationId } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
        res.status(404);
        throw new Error('Registration not found');
    }

    if (registration.paymentStatus === 'PAID') {
        return res.status(200).json({ success: true, message: 'Payment already verified' });
    }

    let isPaid = false;
    let paymentIntentId = null;

    if (session_id.startsWith('mock_session_')) {
        // Bypass verification in mock mode
        isPaid = true;
        paymentIntentId = `mock_pi_${Date.now()}`;
    } else {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status === 'paid') {
                isPaid = true;
                paymentIntentId = session.payment_intent;
            }
        } catch (error) {
            console.error("Stripe Verification Error:", error);
            res.status(500);
            throw new Error('Failed to verify session with Stripe');
        }
    }

    if (isPaid) {
        registration.paymentStatus = 'PAID';
        registration.stripeSessionId = session_id;
        registration.stripePaymentIntentId = paymentIntentId;

        await registration.save();

        res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
        res.status(400);
        throw new Error('Payment not completed!');
    }
});
