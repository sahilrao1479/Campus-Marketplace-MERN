import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';
import { MessageSquare, Heart, ShieldCheck, User } from 'lucide-react';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { user } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();

    // Load Razorpay SDK
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`/api/products/${id}`);
                setProduct(data);
            } catch (error) {
                toast.error('Could not load product details');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleCheckout = async (type) => {
        if (!user) {
            toast('Please login to continue', { icon: '🔒' });
            navigate('/login');
            return;
        }

        const unitPrice = type === 'Buy' ? product.price : product.rentPrice;
        const amount = unitPrice * quantity;

        try {
            // 1. Create order on backend
            const { data: order } = await axios.post('/api/payments/create-order', {
                amount,
                productId: product._id,
                type
            });

            // 2a. DEV MODE: Always bypass Razorpay widget in development
            if (import.meta.env.DEV || order._isMock || order.id?.startsWith('mock_')) {
                const loadingToast = toast.loading('Processing payment (Dev Mode)...');
                const verifyPayload = {
                    razorpayOrderId: order.id,
                    razorpayPaymentId: `mock_pay_${Date.now()}`,
                    razorpaySignature: 'mock_sig',
                    productId: product._id,
                    amount,
                    quantity,
                    type,
                };
                if (type === 'Rent') {
                    verifyPayload.startDate = new Date();
                    verifyPayload.endDate = new Date(new Date().setDate(new Date().getDate() + 7));
                }
                await axios.post('/api/payments/verify', verifyPayload);
                toast.dismiss(loadingToast);
                toast.success(`✅ ${type === 'Buy' ? 'Purchased' : 'Rented'} successfully!`);
                navigate('/dashboard/purchases');
                return;
            }

            // 2b. PRODUCTION: Open Razorpay Widget
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx',
                amount: order.amount,
                currency: order.currency,
                name: 'Campus Thrift Store',
                description: `${type} - ${product.title}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verifyPayload = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            productId: product._id,
                            amount: amount,
                            quantity,
                            type,
                        };
                        if (type === 'Rent') {
                            verifyPayload.startDate = new Date();
                            verifyPayload.endDate = new Date(new Date().setDate(new Date().getDate() + 7));
                        }
                        await axios.post('/api/payments/verify', verifyPayload);
                        toast.success(`Successfully ${type === 'Buy' ? 'purchased' : 'rented'}!`);
                        navigate('/dashboard/purchases');
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: '#16a34a',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error('Could not initiate checkout');
            console.error(error);
        }
    };

    const handleContactSeller = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Initiate chat API request or simply navigate to chat with predefined user
        navigate(`/dashboard/messages?user=${product.seller._id}`);
    };

    const toggleWishlist = async () => {
        if (!user) {
            toast('Please login to add to wishlist');
            return;
        }
        try {
            await axios.post('/api/users/wishlist', { productId: product._id });
            toast.success('Wishlist updated');
        } catch (err) {
            toast.error('Could not update wishlist');
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading product details...</div>;
    if (!product) return <div className="text-center py-20 text-slate-900 font-bold">Product not found.</div>;

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">

                {/* Image Gallery */}
                <div className="p-8 lg:p-12 bg-slate-50 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
                    <img
                        src={product.images[0]?.url || 'https://via.placeholder.com/600'}
                        alt={product.title}
                        className="rounded-2xl max-h-[500px] object-cover shadow-md"
                    />
                </div>

                {/* Product Info */}
                <div className="p-8 lg:p-12 flex flex-col">
                    <div className="mb-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-primary-600 tracking-wide uppercase">{product.category?.name}</span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800">
                                {product.condition}
                            </span>
                        </div>

                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                            {product.title}
                        </h1>

                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-slate-700 whitespace-pre-line leading-relaxed">
                                {product.description}
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Listed by</p>
                                <p className="font-semibold text-slate-900">{product.seller?.name || 'A Student'}</p>
                            </div>
                            <div className="ml-auto flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                <ShieldCheck size={16} className="mr-1" /> Verified
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 border-t border-slate-100 pt-8 space-y-6">
                        {/* Prices */}
                        <div className="flex gap-8">
                            {product.listingType !== 'Rent' && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Buy For</h3>
                                    <p className="text-4xl font-extrabold text-slate-900">₹{product.price}</p>
                                </div>
                            )}
                            {product.listingType !== 'Sell' && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Rent For</h3>
                                    <p className="text-4xl font-extrabold text-primary-600">₹{product.rentPrice}<span className="text-lg text-slate-500 font-normal">/day</span></p>
                                </div>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        {product.status === 'Available' && product.stock > 1 && (
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-medium text-slate-700">Quantity:</label>
                                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                                    >-</button>
                                    <div className="px-4 py-1 text-sm font-semibold text-slate-900 border-x border-slate-200">
                                        {quantity}
                                    </div>
                                    <button
                                        onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                                        className="px-3 py-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold"
                                    >+</button>
                                </div>
                                <span className="text-xs text-slate-500">({product.stock} available)</span>
                            </div>
                        )}

                        {/* Actions */}
                        {product.status === 'Available' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {product.listingType !== 'Rent' && (
                                    <button onClick={() => handleCheckout('Buy')} className="flex-1 bg-primary-600 text-white hover:bg-primary-700 font-bold py-4 px-8 rounded-xl shadow-sm transition-transform active:scale-95 text-lg">
                                        Buy Now
                                    </button>
                                )}
                                {product.listingType !== 'Sell' && (
                                    <button onClick={() => handleCheckout('Rent')} className="flex-1 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-xl transition-transform active:scale-95 text-lg">
                                        Rent It
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-600 font-bold text-center py-4 rounded-xl border border-red-100 uppercase tracking-widest">
                                {product.status}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={handleContactSeller} className="flex-1 flex justify-center items-center gap-2 bg-slate-900 border-2 border-slate-900 text-white hover:bg-slate-800 font-bold py-3 px-6 rounded-xl transition-colors">
                                <MessageSquare size={20} /> Chat with Seller
                            </button>
                            <button onClick={toggleWishlist} className="flex items-center justify-center p-3 sm:px-6 sm:w-auto text-slate-400 border-2 border-slate-200 hover:text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl transition-all" title="Add to Wishlist">
                                <Heart size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
