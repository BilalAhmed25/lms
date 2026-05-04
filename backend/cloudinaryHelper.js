const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileData, folder = 'edunex') => {
    if (!fileData) return null;
    
    // If it's already a URL (e.g. from a previous upload), just return it
    if (fileData.startsWith('http')) return fileData;

    try {
        const result = await cloudinary.uploader.upload(fileData, {
            folder: folder,
            resource_type: 'auto',
            timeout: 120000 // 120 seconds
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        return null;
    }
};

module.exports = { uploadToCloudinary };
