import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, X, Loader2 } from 'lucide-react';

export default function AddProduct() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        condition: 'Good',
        listingType: 'Sell',
        price: '',
        rentPrice: '',
        stock: 1,
    });

    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('/api/categories');
                setCategories(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, category: data[0]._id }));
                }
            } catch (error) {
                toast.error('Could not load categories');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0) {
            toast.error('At least one image is required');
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        images.forEach(img => {
            data.append('images', img);
        });

        setLoading(true);
        try {
            await axios.post('/api/products', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Product submitted for approval!');
            navigate('/dashboard/listings');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">List a Product</h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-8">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Basic Information</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="e.g. Engineering Mathematics by BS Grewal"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="Describe the condition, usage, and any other details..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                name="category"
                                required
                                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                            <select
                                name="condition"
                                required
                                className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                value={formData.condition}
                                onChange={handleChange}
                            >
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Pricing Structure</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Listing Type</label>
                        <select
                            name="listingType"
                            required
                            className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={formData.listingType}
                            onChange={handleChange}
                        >
                            <option value="Sell">Sell Only</option>
                            <option value="Rent">Rent Only</option>
                            <option value="Both">Both Sell and Rent</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(formData.listingType === 'Sell' || formData.listingType === 'Both') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        {(formData.listingType === 'Rent' || formData.listingType === 'Both') && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rent Price (₹ / day)</label>
                                <input
                                    type="number"
                                    name="rentPrice"
                                    min="0"
                                    required
                                    className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    value={formData.rentPrice}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Stock */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Available</label>
                    <input
                        type="number"
                        name="stock"
                        min="1"
                        required
                        className="w-full sm:w-1/2 rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        value={formData.stock}
                        onChange={handleChange}
                    />
                    <p className="text-xs text-slate-500 mt-1">If you have multiple identical items, set the quantity.</p>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">Product Images</h3>
                    <p className="text-sm text-slate-500">Upload up to 5 clear images of your item. First image will be the cover.</p>

                    <div className="flex flex-wrap gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 sm:w-32 sm:h-32 border rounded-lg overflow-hidden group">
                                <img src={url} alt={`preview-${index}`} className="object-cover w-full h-full" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {previewUrls.length < 5 && (
                            <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-primary-400 hover:text-primary-500 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg, image/png, image/jpg"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleImageChange}
                                />
                                <Upload size={24} className="mb-2" />
                                <span className="text-xs font-medium">Add Photo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center bg-primary-600 font-medium text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <><Loader2 size={20} className="animate-spin mr-2" /> Creating Listing...</> : 'Publish Listing'}
                    </button>
                </div>

            </form >
        </div >
    );
}
