import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [condition, setCondition] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = '/api/products?';
                if (keyword) url += `keyword=${keyword}&`;
                if (category) url += `category=${category}&`;
                if (condition) url += `condition=${condition}&`;
                if (type) url += `type=${type}&`;

                const { data } = await axios.get(url);
                setProducts(data.products);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search slightly
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword, category, condition, type]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                        <Filter className="w-5 h-5" /> Filters
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Macbook, Drafter..."
                                    className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Any</option>
                                <option value="Sell">For Sale</option>
                                <option value="Rent">For Rent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                            <select
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                            >
                                <option value="">Any Condition</option>
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>

                        <button
                            onClick={() => { setKeyword(''); setCategory(''); setCondition(''); setType(''); }}
                            className="w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                                <div className="h-48 bg-slate-200 w-full mb-4"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-medium text-slate-900">No products found</h3>
                        <p className="mt-1 text-slate-500">Try adjusting your filters or search constraints.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <Link key={product._id} to={`/product/${product._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all flex flex-col h-full">
                                <div className="w-full overflow-hidden bg-slate-200 relative h-48">
                                    <img
                                        src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                                        alt={product.title}
                                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.listingType !== 'Sell' && (
                                        <span className="absolute top-2 right-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Rentable
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <div className="text-xs font-semibold text-primary-600 mb-1">{product.category?.name}</div>
                                    <h3 className="text-sm font-medium text-slate-900 truncate mb-auto line-clamp-2 white-space-normal">{product.title}</h3>
                                    <div className="mt-4 flex items-end justify-between">
                                        <div>
                                            {product.listingType !== 'Rent' && (
                                                <p className="font-bold text-lg text-slate-900 leading-none">₹{product.price}</p>
                                            )}
                                            {product.listingType !== 'Sell' && (
                                                <p className="text-sm font-medium text-slate-600 mt-1">Rent: ₹{product.rentPrice}/day</p>
                                            )}
                                        </div>
                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
                                            {product.condition}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
