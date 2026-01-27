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

    // Clear existing data
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
        email: 'admin@vinfast.com',
        password: 'admin123',
        fullName: 'VinFast Admin',
        role: 'super_admin',
        isActive: true,
      });
      adminId = newAdmin._id;
      console.log('✅ Created super admin (username: admin, password: admin123)');
    } else {
      adminId = existingAdmin._id;
      console.log('⏭️ Admin already exists, skipping...');
    }

    // Create VinFast brand
    const vinfast = await Brand.create({
      name: 'VinFast',
      country: 'Việt Nam',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/VinFast_Logo.svg/1200px-VinFast_Logo.svg.png',
    });
    console.log('✅ Created brand: VinFast');

    // Create car types
    const carTypesData = [
      { name: 'SUV', description: 'Xe thể thao đa dụng' },
      { name: 'Sedan', description: 'Xe 4 cửa thanh lịch' },
      { name: 'Hatchback', description: 'Xe cỡ nhỏ linh hoạt' },
      { name: 'Mini SUV', description: 'SUV cỡ nhỏ đô thị' },
      { name: 'Crossover', description: 'Kết hợp SUV và Sedan' },
    ];

    const carTypes: { [key: string]: mongoose.Types.ObjectId } = {};
    for (const ct of carTypesData) {
      const created = await CarType.create(ct);
      carTypes[ct.name] = created._id;
      console.log(`✅ Created car type: ${ct.name}`);
    }

    // ============ 10 VinFast Cars with Real Images ============
    const carsData = [
      {
        name: 'VinFast VF 3',
        brand: vinfast._id,
        carType: carTypes['Mini SUV'],
        price: 315000000,
        priceRange: '315 - 360 triệu',
        year: 2024,
        shortDescription: 'Mini SUV điện cỡ A giá rẻ nhất Việt Nam, phù hợp đô thị',
        description: 'VinFast VF 3 là mẫu xe điện cỡ nhỏ đầu tiên tại Việt Nam với mức giá phải chăng. Xe phù hợp cho di chuyển đô thị với quãng đường lên đến 210km/lần sạc.',
        specs: {
          engine: 'Động cơ điện',
          power: '43 HP',
          torque: '110 Nm',
          acceleration: '13s (0-100km/h)',
          topSpeed: '120 km/h',
          range: '210 km',
          seats: 4,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-interior-1.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Cyan', hexCode: '#00CED1' },
          { name: 'Hồng Flamingo', hexCode: '#FC8EAC' },
          { name: 'Vàng Citron', hexCode: '#E4D00A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
        ],
        exterior: {
          title: 'Ngoại thất VF 3',
          description: 'Thiết kế nhỏ gọn, đèn LED hiện đại, mâm hợp kim 15 inch, gương chiếu hậu chỉnh điện.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 3',
          description: 'Màn hình 10 inch, điều hòa tự động, ghế nỉ chất lượng cao, sao, khung chất lượng.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF 5',
        brand: vinfast._id,
        carType: carTypes['Mini SUV'],
        price: 458000000,
        priceRange: '458 - 528 triệu',
        year: 2024,
        shortDescription: 'Mini SUV điện 5 chỗ với giá tốt nhất phân khúc',
        description: 'VinFast VF 5 Plus là mẫu mini SUV điện 5 chỗ với thiết kế trẻ trung, năng động. Xe có quãng đường di chuyển 326km/lần sạc, phù hợp cho di chuyển hàng ngày.',
        specs: {
          engine: 'Động cơ điện',
          power: '134 HP',
          torque: '135 Nm',
          acceleration: '10.9s (0-100km/h)',
          topSpeed: '150 km/h',
          range: '326 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-interior-1.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đỏ Crimson', hexCode: '#8B0000' },
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
        ],
        exterior: {
          title: 'Ngoại thất VF 5',
          description: 'Đèn LED hình chữ V, lưới tản nhiệt kín, mâm hợp kim 17 inch, thiết kế khí động học.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 5',
          description: 'Màn hình 10 inch, điều hòa tự động, ghế da tổng hợp, hệ thống âm thanh 6 loa.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF 6',
        brand: vinfast._id,
        carType: carTypes['Crossover'],
        price: 675000000,
        priceRange: '675 - 765 triệu',
        year: 2024,
        shortDescription: 'Crossover điện cỡ B+ với thiết kế thể thao',
        description: 'VinFast VF 6 là mẫu crossover điện cỡ B+ với thiết kế thể thao, mạnh mẽ. Xe trang bị động cơ 201HP, tăng tốc 0-100km/h trong 7.5 giây.',
        specs: {
          engine: 'Động cơ điện',
          power: '201 HP',
          torque: '310 Nm',
          acceleration: '7.5s (0-100km/h)',
          topSpeed: '175 km/h',
          range: '399 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-interior-1.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
          { name: 'Đỏ Crimson', hexCode: '#8B0000' },
        ],
        exterior: {
          title: 'Ngoại thất VF 6',
          description: 'Thiết kế thể thao, đèn LED hình chữ V, mâm 19 inch, cánh lướt gió trên nóc.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 6',
          description: 'Màn hình 12.9 inch, ghế da cao cấp chỉnh điện, điều hòa 2 vùng, sạc không dây.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF 7',
        brand: vinfast._id,
        carType: carTypes['Crossover'],
        price: 850000000,
        priceRange: '850 - 999 triệu',
        year: 2024,
        shortDescription: 'Coupe SUV điện với thiết kế độc đáo, thể thao',
        description: 'VinFast VF 7 là mẫu coupe SUV điện với thiết kế độc đáo, thể thao. Xe có 2 phiên bản động cơ với công suất lên đến 349HP.',
        specs: {
          engine: 'Động cơ điện',
          power: '349 HP',
          torque: '500 Nm',
          acceleration: '5.8s (0-100km/h)',
          topSpeed: '200 km/h',
          range: '431 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-interior-1.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
        ],
        exterior: {
          title: 'Ngoại thất VF 7',
          description: 'Thiết kế Coupe SUV độc đáo, đèn LED thành dải, mâm 20 inch, đuôi xe vuốt thể thao.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 7',
          description: 'Màn hình 12.9 inch, ghế da thể thao, cửa sổ trời Panorama, vành lái thể thao.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF 8',
        brand: vinfast._id,
        carType: carTypes['SUV'],
        price: 1059000000,
        priceRange: '1.05 - 1.26 tỷ',
        year: 2024,
        shortDescription: 'SUV điện cỡ D với công nghệ tự lái ADAS tiên tiến',
        description: 'VinFast VF 8 là mẫu SUV điện cỡ D với thiết kế hiện đại, trang bị hệ thống ADAS tự lái cấp độ 2+. Xe có 2 động cơ điện AWD với công suất 402HP.',
        specs: {
          engine: 'Động cơ điện đôi AWD',
          power: '402 HP',
          torque: '620 Nm',
          acceleration: '5.5s (0-100km/h)',
          topSpeed: '200 km/h',
          range: '471 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-1.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-2.jpg',
        ],
        exterior: {
          title: 'Ngoại thất VF 8',
          description: 'Thiết kế khí động học với đèn LED hình chữ V đặc trưng, lưới tản nhiệt kín, mâm 20 inch.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 8',
          description: 'Màn hình 15.6 inch, ghế da cao cấp, điều hòa 2 vùng, hệ thống âm thanh 8 loa.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-2.jpg',
          ],
        },
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
          { name: 'Đỏ Crimson', hexCode: '#8B0000' },
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
        ],
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF 9',
        brand: vinfast._id,
        carType: carTypes['SUV'],
        price: 1490000000,
        priceRange: '1.49 - 1.89 tỷ',
        year: 2024,
        shortDescription: 'Flagship SUV điện 7 chỗ cao cấp nhất của VinFast',
        description: 'VinFast VF 9 là mẫu SUV điện hạng E full-size với 7 chỗ ngồi rộng rãi. Xe có quãng đường di chuyển lên tới 594km/lần sạc.',
        specs: {
          engine: 'Động cơ điện đôi AWD',
          power: '402 HP',
          torque: '620 Nm',
          acceleration: '6.5s (0-100km/h)',
          topSpeed: '200 km/h',
          range: '594 km',
          seats: 7,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-interior-1.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
        ],
        exterior: {
          title: 'Ngoại thất VF 9',
          description: 'SUV full-size 7 chỗ, đèn LED đặc trưng, mâm 21 inch, thiết kế uy nghiêm.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-2.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF 9',
          description: 'Nội thất 7 chỗ rộng rãi, màn hình 15.6 inch, ghế da Nappa, âm thanh 8 loa.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: true,
        viewCount: 0,
      },
      {
        name: 'VinFast VF e34',
        brand: vinfast._id,
        carType: carTypes['Crossover'],
        price: 690000000,
        priceRange: '690 triệu',
        year: 2023,
        shortDescription: 'Mẫu xe điện đầu tiên của VinFast giao tới khách hàng',
        description: 'VinFast VF e34 là mẫu xe điện đầu tiên của VinFast được giao tới tay khách hàng Việt Nam vào cuối năm 2021.',
        specs: {
          engine: 'Động cơ điện',
          power: '148 HP',
          torque: '242 Nm',
          acceleration: '9.5s (0-100km/h)',
          topSpeed: '165 km/h',
          range: '318 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
        ],
        exterior: {
          title: 'Ngoại thất VF e34',
          description: 'Thiết kế hiện đại, đèn LED, lưới tản nhiệt kín, mâm hợp kim 18 inch.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-exterior-1.jpg',
          ],
        },
        interior: {
          title: 'Nội thất VF e34',
          description: 'Màn hình 10 inch, ghế da, điều hòa tự động, hệ thống âm thanh 6 loa.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: false,
        viewCount: 0,
      },
      {
        name: 'VinFast Lux A2.0',
        brand: vinfast._id,
        carType: carTypes['Sedan'],
        price: 851000000,
        priceRange: '851 triệu - 1.1 tỷ',
        year: 2023,
        shortDescription: 'Sedan hạng D sang trọng với thiết kế của BMW',
        description: 'VinFast Lux A2.0 là mẫu sedan hạng D với thiết kế do Pininfarina và BMW phát triển. Xe trang bị động cơ 2.0L Turbo của BMW.',
        specs: {
          engine: 'Xăng 2.0L Turbo',
          power: '228 HP',
          torque: '350 Nm',
          acceleration: '7.1s (0-100km/h)',
          topSpeed: '220 km/h',
          fuelConsumption: '8.5L/100km',
          seats: 5,
          transmission: '8AT ZF',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen Mystique', hexCode: '#1A1A1A' },
          { name: 'Trắng Lustrous', hexCode: '#F5F5F5' },
          { name: 'Đỏ Burgundy', hexCode: '#800020' },
        ],
        exterior: {
          title: 'Ngoại thất Lux A2.0',
          description: 'Thiết kế Pininfarina sang trọng, đèn LED cao cấp, mâm 18 inch.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-exterior-1.jpg',
          ],
        },
        interior: {
          title: 'Nội thất Lux A2.0',
          description: 'Nội thất da Nappa, ghế chỉnh điện 12 hướng, màn hình 10.4 inch, âm thanh 8 loa.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: false,
        viewCount: 0,
      },
      {
        name: 'VinFast Lux SA2.0',
        brand: vinfast._id,
        carType: carTypes['SUV'],
        price: 1028000000,
        priceRange: '1.02 - 1.35 tỷ',
        year: 2023,
        shortDescription: 'SUV hạng D sang trọng với nền tảng BMW',
        description: 'VinFast Lux SA2.0 là mẫu SUV hạng D 7 chỗ với thiết kế Pininfarina và nền tảng BMW. Xe sử dụng động cơ 2.0L Turbo mạnh mẽ.',
        specs: {
          engine: 'Xăng 2.0L Turbo',
          power: '228 HP',
          torque: '350 Nm',
          acceleration: '8.9s (0-100km/h)',
          topSpeed: '200 km/h',
          fuelConsumption: '9.2L/100km',
          seats: 7,
          transmission: '8AT ZF',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen Mystique', hexCode: '#1A1A1A' },
          { name: 'Trắng Lustrous', hexCode: '#F5F5F5' },
          { name: 'Xanh Twilight', hexCode: '#1B4D5C' },
        ],
        exterior: {
          title: 'Ngoại thất Lux SA2.0',
          description: 'SUV hạng D sang trọng, thiết kế Pininfarina, đèn LED Matrix, mâm 20 inch.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-exterior-1.jpg',
          ],
        },
        interior: {
          title: 'Nội thất Lux SA2.0',
          description: 'Nội thất da Nappa 7 chỗ, ghế chỉnh điện, cửa sổ trời Panorama, âm thanh cao cấp.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: false,
        viewCount: 0,
      },
      {
        name: 'VinFast President',
        brand: vinfast._id,
        carType: carTypes['SUV'],
        price: 3800000000,
        priceRange: '3.8 tỷ',
        year: 2023,
        shortDescription: 'SUV đầu bảng phiên bản giới hạn chỉ 500 chiếc',
        description: 'VinFast President là mẫu SUV cao cấp nhất của VinFast với động cơ V8 6.2L 420HP. Xe được sản xuất giới hạn chỉ 500 chiếc.',
        specs: {
          engine: 'Xăng V8 6.2L',
          power: '420 HP',
          torque: '624 Nm',
          acceleration: '6.8s (0-100km/h)',
          topSpeed: '220 km/h',
          fuelConsumption: '13.5L/100km',
          seats: 7,
          transmission: '10AT',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen President', hexCode: '#0A0A0A' },
        ],
        exterior: {
          title: 'Ngoại thất President',
          description: 'SUV đầu bảng giới hạn 500 chiếc, thiết kế uy quyền, đèn LED Matrix, mâm 21 inch.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-exterior-1.jpg',
          ],
        },
        interior: {
          title: 'Nội thất President',
          description: 'Nội thất da Nappa cao cấp nhất, ghế massage, màn hình giải trí hàng ghế sau, âm thanh Harman Kardon.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-interior-1.jpg',
          ],
        },
        status: 'published',
        isFeatured: false,
        viewCount: 0,
      },
    ];

    const createdCars: { [key: string]: mongoose.Types.ObjectId } = {};
    for (const car of carsData) {
      const created = await Car.create(car);
      createdCars[car.name] = created._id;
      console.log(`✅ Created car: ${car.name}`);
    }

    // ============ 20+ Posts ============
    const now = new Date();
    const postsData = [
      // Reviews (5 posts)
      {
        title: 'Đánh giá VinFast VF 8: SUV điện đáng mua nhất 2024',
        excerpt: 'Trải nghiệm thực tế VinFast VF 8 sau 1000km - Ưu và nhược điểm chi tiết.',
        content: 'Bài đánh giá chi tiết về VinFast VF 8...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
        category: 'review',
        tags: ['VinFast', 'VF8', 'xe điện', 'đánh giá'],
        relatedCar: createdCars['VinFast VF 8'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: 'VinFast VF 9 vs VinFast VF 8: Nên chọn xe nào?',
        excerpt: 'So sánh chi tiết 2 mẫu SUV điện hot nhất của VinFast.',
        content: 'VF 8 vs VF 9...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-1.jpg',
        category: 'review',
        tags: ['VinFast', 'VF8', 'VF9', 'so sánh'],
        relatedCar: createdCars['VinFast VF 9'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast VF 3: Xe điện mini giá rẻ nhất Việt Nam',
        excerpt: 'Review chi tiết VF 3 - Xe điện chỉ từ 315 triệu đồng.',
        content: 'VF 3 review...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
        category: 'review',
        tags: ['VinFast', 'VF3', 'xe điện', 'giá rẻ'],
        relatedCar: createdCars['VinFast VF 3'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast VF 5 Plus: Lựa chọn hoàn hảo cho gia đình trẻ',
        excerpt: 'Đánh giá VF 5 Plus sau 3 tháng sử dụng thực tế.',
        content: 'VF 5 Plus review...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-1.jpg',
        category: 'review',
        tags: ['VinFast', 'VF5', 'gia đình'],
        relatedCar: createdCars['VinFast VF 5'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast VF 7: Coupe SUV điện đầu tiên tại Việt Nam',
        excerpt: 'Trải nghiệm thiết kế độc đáo và hiệu năng mạnh mẽ của VF 7.',
        content: 'VF 7 review...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-1.jpg',
        category: 'review',
        tags: ['VinFast', 'VF7', 'coupe SUV'],
        relatedCar: createdCars['VinFast VF 7'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      // News (7 posts)
      {
        title: 'VinFast công bố giá bán VF 3 chỉ từ 315 triệu đồng',
        excerpt: 'VinFast chính thức công bố giá bán mẫu xe điện mini VF 3 với mức giá cực kỳ hấp dẫn.',
        content: 'Tin tức VF 3...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
        category: 'news',
        tags: ['VinFast', 'VF3', 'tin tức', 'giá bán'],
        relatedCar: createdCars['VinFast VF 3'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000), // 12 hours ago
      },
      {
        title: 'VinFast mở rộng mạng lưới trạm sạc trên toàn quốc',
        excerpt: 'VinFast đặt mục tiêu 150.000 cổng sạc vào cuối năm 2024.',
        content: 'Tin tức trạm sạc...',
        coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
        category: 'news',
        tags: ['VinFast', 'trạm sạc', 'hạ tầng'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast VF 8 đạt chứng nhận an toàn 5 sao ASEAN NCAP',
        excerpt: 'VF 8 trở thành mẫu xe điện đầu tiên đạt 5 sao an toàn tại Đông Nam Á.',
        content: 'Tin tức an toàn...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-2.jpg',
        category: 'news',
        tags: ['VinFast', 'VF8', 'an toàn', 'ASEAN NCAP'],
        relatedCar: createdCars['VinFast VF 8'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast xuất khẩu lô xe VF 8 đầu tiên sang Mỹ',
        excerpt: 'Lô 999 xe VF 8 đầu tiên đã cập bến California, Mỹ.',
        content: 'Xuất khẩu Mỹ...',
        coverImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
        category: 'news',
        tags: ['VinFast', 'VF8', 'xuất khẩu', 'Mỹ'],
        relatedCar: createdCars['VinFast VF 8'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast VF 6 chính thức bàn giao đến khách hàng',
        excerpt: 'Những chiếc VF 6 đầu tiên đã được giao đến tay khách hàng tại Việt Nam.',
        content: 'Bàn giao VF 6...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-1.jpg',
        category: 'news',
        tags: ['VinFast', 'VF6', 'bàn giao'],
        relatedCar: createdCars['VinFast VF 6'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Top 5 xe điện VinFast bán chạy nhất tháng 1/2024',
        excerpt: 'Thống kê doanh số xe điện VinFast trong tháng đầu năm 2024.',
        content: 'Thống kê doanh số...',
        coverImage: 'https://images.unsplash.com/photo-1619976215542-c2c0fa284b27?w=800',
        category: 'news',
        tags: ['VinFast', 'doanh số', 'thống kê'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VinFast hợp tác với ĐH Bách Khoa phát triển pin thế hệ mới',
        excerpt: 'VinFast ký kết hợp tác nghiên cứu pin xe điện với các trường đại học hàng đầu.',
        content: 'Hợp tác R&D...',
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category: 'news',
        tags: ['VinFast', 'R&D', 'pin', 'công nghệ'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      },
      // Promotions (5 posts)
      {
        title: '🔥 KHUYẾN MÃI THÁNG 1: Giảm đến 100 TRIỆU cho VF 8',
        excerpt: 'Ưu đãi cực khủng đầu năm mới - Giảm ngay 100 triệu khi mua VinFast VF 8!',
        content: 'Khuyến mãi VF 8...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
        category: 'promotion',
        discountAmount: 100000000,
        discountDescription: 'Giảm 100 triệu',
        tags: ['khuyến mãi', 'VinFast', 'VF8'],
        relatedCar: createdCars['VinFast VF 8'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 0.2 * 24 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        title: 'Ưu đãi VF 5: Giảm 50 triệu + Tặng sạc tại nhà',
        excerpt: 'Mua VF 5 Plus ngay hôm nay, nhận ngay ưu đãi 50 triệu và tặng bộ sạc tại nhà.',
        content: 'Khuyến mãi VF 5...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-1.jpg',
        category: 'promotion',
        discountAmount: 50000000,
        discountDescription: 'Giảm 50tr + Sạc',
        tags: ['khuyến mãi', 'VinFast', 'VF5'],
        relatedCar: createdCars['VinFast VF 5'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Flash Sale VF 3: Giảm 20% trong 3 ngày!',
        excerpt: 'Cơ hội cuối cùng sở hữu VF 3 với mức giá siêu hấp dẫn!',
        content: 'Flash sale VF 3...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
        category: 'promotion',
        discountPercent: 20,
        discountDescription: 'Flash Sale -20%',
        tags: ['flash sale', 'VinFast', 'VF3'],
        relatedCar: createdCars['VinFast VF 3'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'VF 9 Premium: Giảm 150 triệu + Tặng gói bảo dưỡng 3 năm',
        excerpt: 'Ưu đãi đặc biệt cho khách hàng mua VF 9 phiên bản cao cấp.',
        content: 'Khuyến mãi VF 9...',
        coverImage: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-1.jpg',
        category: 'promotion',
        discountAmount: 150000000,
        discountDescription: 'Giảm 150tr + BD 3 năm',
        tags: ['khuyến mãi', 'VinFast', 'VF9'],
        relatedCar: createdCars['VinFast VF 9'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Trả góp 0% lãi suất 12 tháng cho tất cả xe VinFast',
        excerpt: 'Chương trình hỗ trợ tài chính đặc biệt áp dụng cho mọi dòng xe VinFast.',
        content: 'Trả góp 0%...',
        coverImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
        category: 'promotion',
        discountDescription: 'Trả góp 0% 12 tháng',
        tags: ['trả góp', 'VinFast', '0%'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      },
      // Events (3 posts)
      {
        title: '🚗 SỰ KIỆN LÁI THỬ VF 8 & VF 9 - Cuối tuần này!',
        excerpt: 'Trải nghiệm thực tế các mẫu xe điện VinFast hoàn toàn MIỄN PHÍ!',
        content: 'Sự kiện lái thử...',
        coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
        category: 'event',
        eventStartDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
        eventEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        tags: ['lái thử', 'VinFast', 'sự kiện'],
        relatedCar: createdCars['VinFast VF 8'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Triển lãm Ô tô Điện VinFast 2024 - Đà Nẵng',
        excerpt: 'Triển lãm quy mô lớn với đầy đủ các dòng xe điện VinFast.',
        content: 'Triển lãm...',
        coverImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800',
        category: 'event',
        eventStartDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        eventEndDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        tags: ['triển lãm', 'VinFast', 'Đà Nẵng'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Giao lưu cộng đồng VinFast Owner Club Đà Nẵng',
        excerpt: 'Buổi gặp mặt, giao lưu giữa các chủ xe VinFast tại Đà Nẵng.',
        content: 'Giao lưu cộng đồng...',
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        category: 'event',
        eventStartDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        eventEndDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        tags: ['cộng đồng', 'VinFast', 'club'],
        status: 'published',
        viewCount: 0,
        createdBy: adminId,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const post of postsData) {
      await Post.create(post);
      console.log(`✅ Created post: ${post.title.substring(0, 50)}...`);
    }

    // Create settings
    const settings = [
      { key: 'zalo_phone', value: '0934980711', description: 'Số Zalo tư vấn', group: 'contact' },
      { key: 'zalo_greeting', value: 'Xin chào! Tôi quan tâm đến xe {car_name}.', description: 'Tin nhắn Zalo', group: 'contact' },
      { key: 'site_name', value: 'VinFast Đà Nẵng', description: 'Tên website', group: 'general' },
      { key: 'site_logo', value: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/VinFast_Logo.svg/1200px-VinFast_Logo.svg.png', description: 'Logo', group: 'general' },
      { key: 'site_hotline', value: '0934 980 711', description: 'Hotline', group: 'contact' },
      { key: 'site_address_1', value: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', description: 'Địa chỉ 1', group: 'contact' },
      { key: 'site_address_2', value: '456 Điện Biên Phủ, Thanh Khê, Đà Nẵng', description: 'Địa chỉ 2', group: 'contact' },
    ];

    for (const setting of settings) {
      await Setting.create(setting);
      console.log(`✅ Created setting: ${setting.key}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Cars: ${carsData.length}`);
    console.log(`   - Posts: ${postsData.length}`);
    console.log(`   - Settings: ${settings.length}`);
    console.log('\n📋 Admin Login:');
    console.log('   Username: admin');
    console.log('   Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
