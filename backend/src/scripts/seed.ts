import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Brand from '../models/Brand.js';
import CarType from '../models/CarType.js';
import Car from '../models/Car.js';
import Post from '../models/Post.js';
import Setting from '../models/Setting.js';

dotenv.config();

const seedData = async () => {
    try {
        // Connect to DB
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined');
        }

        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional - comment out if you don't want to reset)
        await Car.deleteMany({});
        await Post.deleteMany({});
        await Brand.deleteMany({});
        await CarType.deleteMany({});
        await Setting.deleteMany({});
        console.log('🗑️ Cleared existing data');

        // Create super admin
        let adminId: mongoose.Types.ObjectId;
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const newAdmin = await Admin.create({
                username: 'admin',
                email: 'admin@carshowroom.com',
                password: 'admin123', // Will be hashed automatically
                fullName: 'Super Admin',
                role: 'super_admin',
                isActive: true,
            });
            adminId = newAdmin._id;
            console.log('✅ Created super admin (username: admin, password: admin123)');
        } else {
            adminId = existingAdmin._id;
            console.log('⏭️ Admin already exists, skipping...');
        }

        // Create brands with logos
        const brandsData = [
            { name: 'VinFast', country: 'Việt Nam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/VinFast_Logo.svg/1200px-VinFast_Logo.svg.png' },
            { name: 'Toyota', country: 'Nhật Bản', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carance_logo.svg/1200px-Toyota_carances_logo.svg.png' },
            { name: 'Honda', country: 'Nhật Bản', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Honda.svg/1200px-Honda.svg.png' },
            { name: 'Hyundai', country: 'Hàn Quốc', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Hyundai_Motor_Company_logo.svg/2560px-Hyundai_Motor_Company_logo.svg.png' },
            { name: 'Mercedes-Benz', country: 'Đức', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/800px-Mercedes-Logo.svg.png' },
            { name: 'BMW', country: 'Đức', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/800px-BMW.svg.png' },
            { name: 'Kia', country: 'Hàn Quốc', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia-logo.png/800px-Kia-logo.png' },
            { name: 'Mazda', country: 'Nhật Bản', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Mazda_logo_with_emblem.svg/1200px-Mazda_logo_with_emblem.svg.png' },
        ];

        const brands: { [key: string]: mongoose.Types.ObjectId } = {};
        for (const brand of brandsData) {
            const created = await Brand.create(brand);
            brands[brand.name] = created._id;
            console.log(`✅ Created brand: ${brand.name}`);
        }

        // Create car types
        const carTypesData = [
            { name: 'SUV', description: 'Xe thể thao đa dụng, phù hợp cho gia đình và địa hình đa dạng' },
            { name: 'Sedan', description: 'Xe 4 cửa truyền thống, thanh lịch và tiện nghi' },
            { name: 'Hatchback', description: 'Xe cỡ nhỏ linh hoạt, phù hợp di chuyển trong thành phố' },
            { name: 'Crossover', description: 'Kết hợp giữa SUV và sedan, linh hoạt mọi mục đích' },
            { name: 'Pickup', description: 'Xe bán tải, mạnh mẽ cho công việc và phiêu lưu' },
            { name: 'MPV', description: 'Xe đa dụng nhiều chỗ ngồi, lý tưởng cho gia đình đông' },
            { name: 'Coupe', description: 'Xe thể thao 2 cửa, phong cách và hiệu năng cao' },
        ];

        const carTypes: { [key: string]: mongoose.Types.ObjectId } = {};
        for (const carType of carTypesData) {
            const created = await CarType.create(carType);
            carTypes[carType.name] = created._id;
            console.log(`✅ Created car type: ${carType.name}`);
        }

        // Create cars with detailed info
        const carsData = [
            {
                name: 'VinFast VF 8',
                brand: brands['VinFast'],
                carType: carTypes['SUV'],
                price: 1059000000,
                priceRange: '1.05 - 1.26 tỷ',
                year: 2024,
                shortDescription: 'SUV điện thông minh đầu tiên của VinFast với công nghệ tự lái tiên tiến',
                description: 'VinFast VF 8 là mẫu SUV điện cỡ D thông minh, được trang bị công nghệ tự lái cấp độ 2+.\n\n🔋 CÔNG NGHỆ PIN TIÊN TIẾN\n- Pin LFP dung lượng 87.7 kWh\n- Quãng đường di chuyển: 471 km/lần sạc\n- Sạc nhanh DC: 35 phút từ 10-70%\n\n🚗 ĐỘNG CƠ MẠNH MẼ\n- 2 động cơ điện AWD\n- Công suất: 402 HP\n- Tăng tốc 0-100: 5.5 giây\n\n✨ TRANG BỊ TIỆN NGHI\n- Màn hình trung tâm 15.6 inch\n- Hệ thống lái tự động cấp độ 2+\n- 11 túi khí an toàn',
                specs: {
                    engine: 'Động cơ điện',
                    power: '402 HP',
                    torque: '620 Nm',
                    acceleration: '5.5 giây (0-100km/h)',
                    topSpeed: '200 km/h',
                    range: '471 km',
                    seats: 5,
                    transmission: 'Hộp số tự động 1 cấp',
                },
                thumbnail: 'https://storage.googleapis.com/vinfast-data-01/vf8-eco-standard-2024_1704166458.png',
                gallery: [
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
                    'https://images.unsplash.com/photo-1619976215542-c2c0fa284b27?w=800',
                ],
                // NEW: Exterior section
                exterior: {
                    description: 'VinFast VF 8 sở hữu thiết kế ngoại thất hiện đại, khí động học với các đường nét mạnh mẽ.\n\n• Đèn pha LED hình chữ V đặc trưng\n• Lưới tản nhiệt kín đặc trưng xe điện\n• Mâm hợp kim 20 inch thể thao\n• Gương chiếu hậu tích hợp camera\n• Cánh lướt gió chủ động',
                    images: [
                        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
                        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
                        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                    ],
                },
                // NEW: Interior section
                interior: {
                    description: 'Nội thất VF 8 mang đến không gian sang trọng và tiện nghi hàng đầu phân khúc.\n\n• Màn hình trung tâm 15.6 inch cảm ứng\n• Ghế da cao cấp chỉnh điện 12 hướng\n• Điều hòa 2 vùng độc lập\n• Hệ thống âm thanh 8 loa\n• Cửa sổ trời toàn cảnh Panorama',
                    images: [
                        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
                    ],
                },
                // NEW: Color options
                colorOptions: [
                    { name: 'Xanh Neptune', hexCode: '#1B4D5C', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800' },
                    { name: 'Đen Brahminy', hexCode: '#1A1A1A', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800' },
                    { name: 'Trắng Pristine', hexCode: '#F5F5F5', image: 'https://images.unsplash.com/photo-1619976215542-c2c0fa284b27?w=800' },
                    { name: 'Đỏ Crimson', hexCode: '#8B0000' },
                    { name: 'Xám Desat', hexCode: '#6B6B6B' },
                ],
                status: 'published',
                isFeatured: true,
                viewCount: 1520,
            },
            {
                name: 'VinFast VF 9',
                brand: brands['VinFast'],
                carType: carTypes['SUV'],
                price: 1490000000,
                priceRange: '1.49 - 1.89 tỷ',
                year: 2024,
                shortDescription: 'Flagship SUV điện 7 chỗ cao cấp nhất của VinFast',
                description: '<p>VinFast VF 9 là mẫu SUV điện hạng E, đầu bảng của VinFast. Xe sở hữu không gian nội thất 7 chỗ rộng rãi cùng nhiều trang bị cao cấp.</p>',
                specs: {
                    engine: 'Động cơ điện đôi AWD',
                    power: '402 HP',
                    torque: '620 Nm',
                    acceleration: '6.5 giây (0-100km/h)',
                    topSpeed: '200 km/h',
                    range: '594 km',
                    seats: 7,
                    transmission: 'Hộp số tự động 1 cấp',
                },
                thumbnail: 'https://storage.googleapis.com/vinfast-data-01/vf9-eco-standard-2024_1704166459.png',
                gallery: [],
                status: 'published',
                isFeatured: true,
                viewCount: 980,
            },
            {
                name: 'Toyota Camry 2.5Q',
                brand: brands['Toyota'],
                carType: carTypes['Sedan'],
                price: 1310000000,
                priceRange: '1.05 - 1.53 tỷ',
                year: 2024,
                shortDescription: 'Sedan hạng D bán chạy nhất với thiết kế sang trọng và động cơ hybrid tiết kiệm',
                description: '<p>Toyota Camry thế hệ mới với thiết kế hoàn toàn đổi mới, nội thất cao cấp và công nghệ hybrid tiên tiến. Camry 2.5Q là phiên bản cao cấp nhất với đầy đủ tiện nghi.</p>',
                specs: {
                    engine: 'Xăng 2.5L Hybrid',
                    power: '218 HP',
                    torque: '221 Nm',
                    acceleration: '8.3 giây (0-100km/h)',
                    topSpeed: '180 km/h',
                    fuelConsumption: '4.2L/100km',
                    seats: 5,
                    transmission: 'CVT',
                },
                thumbnail: 'https://toyota.com.vn/uploads/product/camry-2-5-q-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: true,
                viewCount: 2340,
            },
            {
                name: 'Honda CR-V L',
                brand: brands['Honda'],
                carType: carTypes['SUV'],
                price: 1190000000,
                priceRange: '1.05 - 1.31 tỷ',
                year: 2024,
                shortDescription: 'SUV 7 chỗ đa dụng với thiết kế hiện đại và không gian rộng rãi',
                description: '<p>Honda CR-V thế hệ mới mang đến không gian nội thất rộng rãi hơn, thiết kế hiện đại và nhiều tính năng an toàn Honda SENSING.</p>',
                specs: {
                    engine: 'Xăng 1.5L Turbo',
                    power: '188 HP',
                    torque: '240 Nm',
                    acceleration: '9.2 giây (0-100km/h)',
                    topSpeed: '200 km/h',
                    fuelConsumption: '7.6L/100km',
                    seats: 7,
                    transmission: 'CVT',
                },
                thumbnail: 'https://honda.com.vn/uploads/crv-l-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: false,
                viewCount: 1890,
            },
            {
                name: 'Hyundai Tucson 2.0 Đặc biệt',
                brand: brands['Hyundai'],
                carType: carTypes['Crossover'],
                price: 920000000,
                priceRange: '825 - 945 triệu',
                year: 2024,
                shortDescription: 'Crossover thiết kế tương lai với công nghệ tiên tiến',
                description: '<p>Hyundai Tucson thế hệ mới gây ấn tượng mạnh với thiết kế Parametric Hidden Lights độc đáo và nội thất sang trọng.</p>',
                specs: {
                    engine: 'Xăng 2.0L',
                    power: '156 HP',
                    torque: '192 Nm',
                    acceleration: '10.3 giây (0-100km/h)',
                    topSpeed: '192 km/h',
                    fuelConsumption: '8.5L/100km',
                    seats: 5,
                    transmission: '6AT',
                },
                thumbnail: 'https://hyundai.com.vn/uploads/tucson-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: false,
                viewCount: 1450,
            },
            {
                name: 'Mercedes-Benz GLC 300 4MATIC',
                brand: brands['Mercedes-Benz'],
                carType: carTypes['SUV'],
                price: 2399000000,
                priceRange: '2.29 - 2.84 tỷ',
                year: 2024,
                shortDescription: 'SUV hạng sang với động cơ mạnh mẽ và nội thất xa hoa',
                description: '<p>Mercedes-Benz GLC 300 4MATIC là mẫu SUV hạng sang với hệ dẫn động 4 bánh toàn thời gian, động cơ 2.0L Turbo mạnh mẽ và nội thất MBUX thông minh.</p>',
                specs: {
                    engine: 'Xăng 2.0L Turbo',
                    power: '258 HP',
                    torque: '400 Nm',
                    acceleration: '6.2 giây (0-100km/h)',
                    topSpeed: '240 km/h',
                    fuelConsumption: '8.1L/100km',
                    seats: 5,
                    transmission: '9G-TRONIC',
                },
                thumbnail: 'https://mercedes-benz.com.vn/uploads/glc-300-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: true,
                viewCount: 3200,
            },
            {
                name: 'BMW X3 xDrive30i',
                brand: brands['BMW'],
                carType: carTypes['SUV'],
                price: 2299000000,
                priceRange: '2.09 - 2.49 tỷ',
                year: 2024,
                shortDescription: 'SAV thể thao với khả năng vận hành đỉnh cao',
                description: '<p>BMW X3 xDrive30i mang đến trải nghiệm lái thể thao đặc trưng của BMW kết hợp với sự tiện nghi và tính thực dụng của một chiếc SUV.</p>',
                specs: {
                    engine: 'Xăng 2.0L TwinPower Turbo',
                    power: '252 HP',
                    torque: '350 Nm',
                    acceleration: '6.3 giây (0-100km/h)',
                    topSpeed: '235 km/h',
                    fuelConsumption: '7.2L/100km',
                    seats: 5,
                    transmission: '8AT Steptronic',
                },
                thumbnail: 'https://bmw.com.vn/uploads/x3-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: true,
                viewCount: 2100,
            },
            {
                name: 'Kia Sorento 2.5 Signature AWD',
                brand: brands['Kia'],
                carType: carTypes['SUV'],
                price: 1189000000,
                priceRange: '1.07 - 1.35 tỷ',
                year: 2024,
                shortDescription: 'SUV 7 chỗ đẳng cấp với thiết kế hiện đại',
                description: '<p>Kia Sorento thế hệ mới với thiết kế Tiger Nose Evolution, nội thất rộng rãi cho 7 người và hệ thống an toàn tiên tiến.</p>',
                specs: {
                    engine: 'Xăng 2.5L Smartstream',
                    power: '180 HP',
                    torque: '232 Nm',
                    acceleration: '9.8 giây (0-100km/h)',
                    topSpeed: '195 km/h',
                    fuelConsumption: '9.2L/100km',
                    seats: 7,
                    transmission: '8DCT',
                },
                thumbnail: 'https://kia.com.vn/uploads/sorento-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: false,
                viewCount: 1670,
            },
            {
                name: 'Mazda CX-5 Premium',
                brand: brands['Mazda'],
                carType: carTypes['Crossover'],
                price: 919000000,
                priceRange: '749 - 989 triệu',
                year: 2024,
                shortDescription: 'Crossover với thiết kế KODO và trải nghiệm lái đỉnh cao',
                description: '<p>Mazda CX-5 Premium sở hữu ngôn ngữ thiết kế KODO đặc trưng, nội thất chất lượng cao và khả năng vận hành tuyệt vời.</p>',
                specs: {
                    engine: 'Xăng 2.5L SkyActiv-G',
                    power: '188 HP',
                    torque: '252 Nm',
                    acceleration: '8.8 giây (0-100km/h)',
                    topSpeed: '200 km/h',
                    fuelConsumption: '7.1L/100km',
                    seats: 5,
                    transmission: '6AT SkyActiv',
                },
                thumbnail: 'https://mazda.com.vn/uploads/cx5-2024.png',
                gallery: [],
                status: 'published',
                isFeatured: false,
                viewCount: 1340,
            },
        ];

        const createdCars: { [key: string]: mongoose.Types.ObjectId } = {};
        for (const car of carsData) {
            const created = await Car.create(car);
            createdCars[car.name] = created._id;
            console.log(`✅ Created car: ${car.name}`);
        }

        // Create posts with new fields
        const postsData = [
            {
                title: 'VinFast VF 8 - Trải nghiệm SUV điện "Made in Vietnam" đầu tiên',
                excerpt: 'Đánh giá chi tiết về mẫu SUV điện VinFast VF 8 sau 1000km sử dụng thực tế.',
                content: '',
                contentBlocks: [
                    { type: 'text', content: 'VinFast VF 8 sở hữu thiết kế hiện đại, góc cạnh nhưng vẫn mềm mại. Đèn pha LED hình chữ V đặc trưng kết hợp với lưới tản nhiệt kín tạo nên vẻ ngoài năng động.' },
                    { type: 'image', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800', caption: 'Ngoại thất VinFast VF 8 hiện đại, sang trọng' },
                    { type: 'text', content: 'Nội thất VF 8 gây ấn tượng với màn hình trung tâm 15.6 inch lớn, hệ thống điều hòa 2 vùng độc lập và ghế da cao cấp. Hàng ghế sau rộng rãi, đủ chỗ cho 3 người lớn.' },
                    { type: 'car', car: createdCars['VinFast VF 8'], description: 'Xe đánh giá trong bài' },
                    { type: 'text', content: 'Công suất 402 HP từ 2 động cơ điện mang đến khả năng tăng tốc ấn tượng 0-100km/h chỉ trong 5.5 giây. Hệ thống treo độc lập cho cảm giác lái êm ái.\n\nKết luận: VinFast VF 8 là lựa chọn đáng cân nhắc cho ai đang tìm kiếm một chiếc SUV điện chất lượng với mức giá hợp lý.' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200',
                category: 'review',
                tags: ['VinFast', 'VF8', 'xe điện', 'SUV', 'đánh giá'],
                relatedCar: createdCars['VinFast VF 8'],
                status: 'published',
                viewCount: 5420,
                createdBy: adminId,
            },
            {
                title: 'KHUYẾN MÃI THÁNG 1: Giảm đến 100 TRIỆU cho VinFast VF8',
                excerpt: 'Ưu đãi cực khủng đầu năm mới - Giảm ngay 100 triệu khi mua VinFast VF 8!',
                content: '',
                contentBlocks: [
                    { type: 'text', content: '🎉 CHÀO NĂM MỚI - ƯU ĐÃI CỰC LỚN 🎉\n\nNhân dịp đầu năm mới 2024, showroom xin gửi tới quý khách hàng chương trình khuyến mãi hấp dẫn nhất năm!' },
                    { type: 'car', car: createdCars['VinFast VF 8'], description: '💰 GIẢM NGAY 100 TRIỆU' },
                    { type: 'text', content: '✅ Giảm 100 triệu tiền mặt\n✅ Tặng gói bảo dưỡng 3 năm trị giá 30 triệu\n✅ Hỗ trợ trả góp lãi suất 0% trong 6 tháng đầu\n✅ Giao xe ngay trong tuần\n\n📞 Liên hệ ngay Hotline: 0901 234 567' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1619976215542-c2c0fa284b27?w=1200',
                category: 'promotion',
                discountAmount: 100000000,
                discountDescription: 'Giảm 100tr + Tặng PK',
                tags: ['khuyến mãi', 'giảm giá', 'VinFast', 'VF8'],
                relatedCar: createdCars['VinFast VF 8'],
                status: 'published',
                viewCount: 8920,
                createdBy: adminId,
            },
            {
                title: 'Ưu đãi Honda CR-V: Giảm 15% - Còn 3 ngày!',
                excerpt: 'Cơ hội cuối cùng sở hữu Honda CR-V với mức giảm 15%!',
                content: '',
                contentBlocks: [
                    { type: 'text', content: '⏰ FLASH SALE - CHỈ CÒN 3 NGÀY!\n\nHonda CR-V L - Dòng SUV bán chạy nhất phân khúc!' },
                    { type: 'car', car: createdCars['Honda CR-V L'], description: '🏷️ GIẢM 15% - CHỈ CÒN 3 NGÀY' },
                    { type: 'text', content: '🔥 Giá gốc: 1.138 tỷ\n🔥 Giá sale: 967 triệu\n🔥 Tiết kiệm: 171 triệu đồng!\n\nĐừng bỏ lỡ cơ hội vàng này!' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1568844293986-8c3c13c96e31?w=1200',
                category: 'promotion',
                discountPercent: 15,
                discountDescription: 'Flash Sale -15%',
                tags: ['khuyến mãi', 'Honda', 'CR-V', 'flash sale'],
                relatedCar: createdCars['Honda CR-V L'],
                status: 'published',
                viewCount: 4560,
                createdBy: adminId,
            },
            {
                title: 'SỰ KIỆN LÁI THỬ VINFAST - Cuối tuần này!',
                excerpt: 'Tham gia sự kiện lái thử VinFast VF 8 & VF 9 miễn phí cuối tuần này.',
                content: '',
                contentBlocks: [
                    { type: 'text', content: '🚗 SỰ KIỆN LÁI THỬ XE ĐIỆN VINFAST 🚗\n\nTrải nghiệm thực tế các mẫu xe điện VinFast VF 8 & VF 9 hoàn toàn MIỄN PHÍ!' },
                    { type: 'image', url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800', caption: 'Trải nghiệm lái thử VinFast VF 8' },
                    { type: 'text', content: '📅 Thời gian: Thứ 7 - Chủ nhật (18-19/01/2024)\n⏰ Giờ mở cửa: 9h00 - 17h00\n📍 Địa điểm: VinFast Showroom - 123 Nguyễn Văn Linh, Đà Nẵng' },
                    { type: 'car', car: createdCars['VinFast VF 8'], description: 'Lái thử VinFast VF 8' },
                    { type: 'car', car: createdCars['VinFast VF 9'], description: 'Lái thử VinFast VF 9' },
                    { type: 'text', content: '🎁 QUÀ TẶNG HẤP DẪN:\n- Voucher giảm giá 20 triệu khi đặt cọc tại sự kiện\n- Áo thun VinFast chính hãng\n- Cơ hội trúng thưởng Airpods Pro\n\n📞 Đăng ký ngay: 0901 234 567' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200',
                category: 'event',
                eventStartDate: new Date('2024-01-18T09:00:00'),
                eventEndDate: new Date('2024-01-19T17:00:00'),
                tags: ['VinFast', 'lái thử', 'sự kiện', 'xe điện'],
                relatedCar: createdCars['VinFast VF 8'],
                status: 'published',
                viewCount: 3890,
                createdBy: adminId,
            },
            {
                title: 'TRIỂN LÃM Ô TÔ VIỆT NAM 2024 - Đến 31/01',
                excerpt: 'Triển lãm ô tô lớn nhất năm với hơn 50 mẫu xe mới. Đặc biệt giảm giá khi mua xe tại triển lãm!',
                content: '',
                contentBlocks: [
                    { type: 'text', content: '🚘 TRIỂN LÃM Ô TÔ VIỆT NAM 2024 🚘\n\nĐây là triển lãm ô tô lớn nhất Miền Trung với hơn 50 mẫu xe từ các hãng hàng đầu!' },
                    { type: 'image', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', caption: 'Triển lãm Ô tô Việt Nam 2024' },
                    { type: 'text', content: '📅 Thời gian: 15/01 - 31/01/2024\n⏰ Giờ mở cửa: 8h00 - 21h00\n📍 Địa điểm: Trung tâm Hội nghị Quốc gia - Đà Nẵng\n🎟️ Vé vào cửa: MIỄN PHÍ\n\n🎁 ƯU ĐÃI ĐẶC BIỆT KHI MUA XE TẠI TRIỂN LÃM:\n- Giảm thêm 50 triệu cho mọi dòng xe\n- Quà tặng phụ kiện chính hãng\n- Bốc thăm trúng thưởng xe máy điện VinFast' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200',
                category: 'event',
                eventStartDate: new Date('2024-01-15T08:00:00'),
                eventEndDate: new Date('2024-01-31T21:00:00'),
                tags: ['triển lãm', 'ô tô', 'sự kiện', '2024'],
                status: 'published',
                viewCount: 12450,
                createdBy: adminId,
            },
            {
                title: 'Top 5 mẫu SUV đáng mua nhất năm 2024',
                excerpt: 'Tổng hợp các mẫu SUV đang được ưa chuộng nhất tại thị trường Việt Nam.',
                content: '',
                contentBlocks: [
                    { type: 'text', content: 'Năm 2024 hứa hẹn là năm bùng nổ của phân khúc SUV tại Việt Nam. Dưới đây là Top 5 mẫu SUV đáng mua nhất do chúng tôi đánh giá:' },
                    { type: 'car', car: createdCars['VinFast VF 8'], description: '🥇 TOP 1 - SUV điện tốt nhất' },
                    { type: 'text', content: 'VinFast VF 8 dẫn đầu với công nghệ điện hiện đại, chi phí vận hành thấp và mức giá cạnh tranh.' },
                    { type: 'car', car: createdCars['Hyundai Tucson 2.0 Đặc biệt'], description: '🥈 TOP 2 - Thiết kế đột phá nhất' },
                    { type: 'text', content: 'Hyundai Tucson với ngôn ngữ thiết kế mới Parametric Hidden Lights gây ấn tượng mạnh.' },
                    { type: 'car', car: createdCars['Honda CR-V L'], description: '🥉 TOP 3 - Bền bỉ nhất' },
                    { type: 'text', content: 'Honda CR-V tiếp tục chinh phục khách hàng với độ tin cậy đã được chứng minh qua nhiều thế hệ.' },
                    { type: 'car', car: createdCars['Mazda CX-5 Premium'], description: '4️⃣ TOP 4 - Lái thú vị nhất' },
                    { type: 'car', car: createdCars['Kia Sorento Signature'], description: '5️⃣ TOP 5 - SUV 7 chỗ tốt nhất' },
                ],
                coverImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200',
                category: 'news',
                tags: ['SUV', 'top 5', '2024', 'tư vấn mua xe'],
                status: 'published',
                viewCount: 15780,
                createdBy: adminId,
            },
        ];

        for (const post of postsData) {
            await Post.create(post);
            console.log(`✅ Created post: ${post.title.substring(0, 50)}...`);
        }

        // Create default settings
        const settings = [
            {
                key: 'zalo_phone',
                value: '0901234567',
                description: 'Số điện thoại Zalo để liên hệ tư vấn',
                group: 'contact',
            },
            {
                key: 'zalo_greeting',
                value: 'Xin chào! Tôi quan tâm đến xe {car_name}. Vui lòng tư vấn cho tôi.',
                description: 'Tin nhắn chào mặc định khi mở Zalo chat',
                group: 'contact',
            },
            {
                key: 'site_name',
                value: 'VinFast Showroom',
                description: 'Tên website',
                group: 'general',
            },
            {
                key: 'site_description',
                value: 'Showroom xe hơi 3D - Trải nghiệm xem xe trực tuyến với công nghệ 3D tiên tiến',
                description: 'Mô tả website',
                group: 'general',
            },
            {
                key: 'address',
                value: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
                description: 'Địa chỉ showroom',
                group: 'contact',
            },
            {
                key: 'hotline',
                value: '1900 1234',
                description: 'Số hotline',
                group: 'contact',
            },
        ];

        for (const setting of settings) {
            await Setting.create(setting);
            console.log(`✅ Created setting: ${setting.key}`);
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   - Brands: ${brandsData.length}`);
        console.log(`   - Car Types: ${carTypesData.length}`);
        console.log(`   - Cars: ${carsData.length}`);
        console.log(`   - Posts: ${postsData.length}`);
        console.log(`   - Settings: ${settings.length}`);
        console.log('\n📋 Admin Login Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
