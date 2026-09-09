import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products?sort=newest');
                setRecentProducts(data.products.slice(0, 4));
            } catch (error) {
                console.error(error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="relative bg-primary-900 rounded-3xl overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                <div className="relative px-8 py-24 sm:px-16 sm:py-32 flex flex-col items-center text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        The Marketplace for <span className="text-primary-300">Chitkara Students</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-xl text-primary-100">
                        Buy, sell, and rent books, electronics, drafters, and more. Safe, secure, and exclusively for our university community.
                    </p>
                    <div className="mt-10 flex gap-4">
                        <Link to="/marketplace" className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-primary-900 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                            Browse Marketplace
                        </Link>
                        <Link to="/dashboard/add-product" className="inline-flex items-center justify-center px-8 py-3.5 border border-white text-base font-medium rounded-full text-white hover:bg-primary-800 transition-colors">
                            Sell an Item
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="p-4 bg-primary-100 text-primary-600 rounded-full mb-4">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Verified Students Only</h3>
                    <p className="mt-2 text-slate-600">Strictly @chitkara.edu.in emails allowed. Trade safely with your peers.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="p-4 bg-primary-100 text-primary-600 rounded-full mb-4">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Buy, Sell & Rent</h3>
                    <p className="mt-2 text-slate-600">Don't want to buy? Rent expensive calculators or drafters for exactly how long you need them.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="p-4 bg-primary-100 text-primary-600 rounded-full mb-4">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Instant Payments & Chat</h3>
                    <p className="mt-2 text-slate-600">Directly chat with sellers or use our integrated Razorpay checkout for secure transactions.</p>
                </div>
            </section>

            {/* Recent Products */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Freshly Listed on Campus</h2>
                    <Link to="/marketplace" className="text-primary-600 font-medium hover:text-primary-700 flex items-center">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recentProducts.map(product => (
                        <Link key={product._id} to={`/product/${product._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-slate-200 xl:aspect-w-7 xl:aspect-h-8">
                                <img
                                    src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                                    alt={product.title}
                                    className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <div className="text-xs font-semibold text-primary-600 mb-1">{product.category?.name}</div>
                                <h3 className="text-sm font-medium text-slate-900 truncate">{product.title}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="font-bold text-lg text-slate-900">₹{product.price}</p>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                                        {product.condition}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
