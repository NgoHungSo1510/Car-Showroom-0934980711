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
        shortDescription: 'Chiếc xe điện quốc dân đầu tiên của Việt Nam. VF 3 sở hữu thiết kế nhỏ gọn, hiện đại cùng chi phí vận hành siêu tiết kiệm, mở ra kỷ nguyên di chuyển xanh cho mọi gia đình.',
        description: `VinFast VF 3 không chỉ là một phương tiện di chuyển, mà còn là biểu tượng của cuộc cách mạng xe điện tại Việt Nam.

Với kích thước siêu nhỏ gọn chỉ 3.133 mm chiều dài, VF 3 được sinh ra để chinh phục mọi cung đường đô thị chật hẹp. Thiết kế vuông vức, cá tính với hệ thống đèn LED sắc sảo và các tùy chọn màu sắc trẻ trung như Xanh Cyan, Hồng Flamingo, Vàng Citron khiến xe trở thành điểm nhấn trên phố.

Động cơ điện 43 mã lực tuy khiêm tốn nhưng vừa đủ cho việc di chuyển hàng ngày trong thành phố với quãng đường lên đến 210 km mỗi lần sạc. Chi phí sạc điện chỉ khoảng 60.000 VNĐ cho 100 km - tiết kiệm gấp 4-5 lần so với xe xăng. Đây chính là lựa chọn thông minh cho những ai muốn bước vào thế giới xe điện với chi phí hợp lý nhất.`,
        specs: {
          engine: 'Động cơ điện đồng bộ vĩnh cửu',
          power: '43 mã lực',
          torque: '110 Nm',
          acceleration: '13 giây (0-100 km/h)',
          topSpeed: '120 km/h',
          range: '210 km (tiêu chuẩn WLTP)',
          seats: 4,
          transmission: 'Tự động 1 cấp',
          dimensions: '3.133 x 1.678 x 1.622 mm',
          weight: '910 kg',
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
          { name: 'Đen Onyx', hexCode: '#1A1A1A' },
        ],
        exterior: {
          title: 'Ngoại thất VF 3',
          description: 'Thiết kế ngoại thất của VF 3 là sự kết hợp hoàn hảo giữa tính thực dụng và phong cách trẻ trung. Thân xe vuông vức, góc cạnh tạo nên đặc trưng riêng biệt, trong khi hệ thống đèn LED Projector hiện đại mang đến khả năng chiếu sáng vượt trội. Lưới tản nhiệt dạng kín đặc trưng xe điện kết hợp cùng bộ mâm hợp kim 15 inch thiết kế năng động, giúp VF 3 nổi bật giữa đám đông với chi phí sở hữu dễ tiếp cận nhất phân khúc.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-exterior-2.jpg',
          ],
          features: [
            { icon: '💡', title: 'Đèn LED Projector', description: 'Hệ thống chiếu sáng LED tiết kiệm năng lượng, tuổi thọ cao' },
            { icon: '🔲', title: 'Lưới tản nhiệt kín', description: 'Thiết kế khí động học đặc trưng xe điện' },
            { icon: '🛞', title: 'Mâm hợp kim 15 inch', description: 'Thiết kế năng động, phù hợp với tổng thể xe' },
            { icon: '🪞', title: 'Gương chiếu hậu chỉnh/gập điện', description: 'Tích hợp đèn báo rẽ LED' },
            { icon: '📐', title: 'Kích thước nhỏ gọn', description: 'Bán kính vòng quay 4.6m, linh hoạt trong đô thị' },
          ],
        },
        interior: {
          title: 'Nội thất VF 3',
          description: 'Không gian nội thất VF 3 được tối ưu hóa tối đa với thiết kế tối giản nhưng đầy đủ tiện nghi. Màn hình giải trí trung tâm 10 inch hỗ trợ kết nối Apple CarPlay và Android Auto không dây, mang lại trải nghiệm giải trí liền mạch. Ghế bọc nỉ cao cấp kết hợp cùng hệ thống điều hòa tự động giúp hành khách luôn thoải mái trên mọi hành trình. Dù là xe cỡ nhỏ, VF 3 vẫn sở hữu cốp sau 190L đủ chứa hành lý cho các chuyến đi ngắn ngày.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-3/vf3-interior-1.jpg',
          ],
          features: [
            { icon: '📱', title: 'Màn hình cảm ứng 10 inch', description: 'Hỗ trợ Apple CarPlay & Android Auto không dây' },
            { icon: '❄️', title: 'Điều hòa tự động', description: 'Làm mát nhanh, tiết kiệm năng lượng' },
            { icon: '🪑', title: 'Ghế nỉ cao cấp', description: 'Chất liệu thoáng khí, dễ vệ sinh' },
            { icon: '🔌', title: 'Cổng sạc USB Type-C', description: '2 cổng sạc nhanh cho thiết bị di động' },
            { icon: '�', title: 'Cốp sau 190L', description: 'Không gian chứa đồ thực dụng' },
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
        shortDescription: 'Mini SUV điện 5 chỗ hoàn hảo cho gia đình trẻ. VF 5 Plus kết hợp thiết kế thời thượng, công nghệ hiện đại và chi phí vận hành tiết kiệm, định nghĩa lại phân khúc SUV cỡ nhỏ.',
        description: `VinFast VF 5 Plus là minh chứng cho cam kết của VinFast trong việc mang xe điện đến gần hơn với mọi gia đình Việt Nam.

Với chiều dài 4.000 mm cùng chiều rộng 1.760 mm, VF 5 Plus sở hữu không gian cabin rộng rãi bậc nhất phân khúc, thoải mái cho 5 hành khách. Thiết kế ngoại thất trẻ trung với đèn LED hình chữ V đặc trưng VinFast, tay nắm cửa ẩn hiện đại và bộ mâm 17 inch hai tông màu thể thao.

Động cơ điện 134 mã lực mang đến khả năng tăng tốc tự tin với thời gian 0-100 km/h trong 10.9 giây. Quãng đường di chuyển lên đến 326 km mỗi lần sạc đủ đáp ứng nhu cầu di chuyển hàng ngày và cả những chuyến đi cuối tuần.

Điểm nhấn của VF 5 Plus là cốp sau 328L có thể mở rộng lên 1.039L khi gập hàng ghế sau, cùng hệ thống cốp điện tiện lợi. Với mức giá từ 458 triệu, VF 5 Plus là lựa chọn tối ưu cho những ai đang tìm kiếm một chiếc SUV điện thực thụ với ngân sách hợp lý.`,
        specs: {
          engine: 'Động cơ điện đồng bộ vĩnh cửu',
          power: '134 mã lực',
          torque: '135 Nm',
          acceleration: '10.9 giây (0-100 km/h)',
          topSpeed: '150 km/h',
          range: '326 km (tiêu chuẩn WLTP)',
          seats: 5,
          transmission: 'Tự động 1 cấp',
          dimensions: '4.000 x 1.760 x 1.600 mm',
          weight: '1.490 kg',
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
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
        ],
        exterior: {
          title: 'Ngoại thất VF 5',
          description: 'Thiết kế ngoại thất của VF 5 Plus thể hiện ngôn ngữ thiết kế hiện đại của VinFast với đèn LED hình chữ V đặc trưng chạy xuyên suốt đầu xe. Tay nắm cửa ẩn pop-out hiện đại không chỉ tạo điểm nhấn thẩm mỹ mà còn tối ưu hệ số cản gió. Mâm hợp kim 17 inch thiết kế hai tông màu kết hợp cùng cánh gió phía sau tạo nên dáng vẻ năng động, thể thao phù hợp với phong cách sống hiện đại.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-exterior-2.jpg',
          ],
          features: [
            { icon: '💡', title: 'Đèn LED chữ V đặc trưng', description: 'Logo nhận diện VinFast với dải đèn LED chạy ngày' },
            { icon: '�', title: 'Tay nắm cửa ẩn Pop-out', description: 'Thiết kế hiện đại, tối ưu khí động học' },
            { icon: '🛞', title: 'Mâm hợp kim 17 inch', description: 'Thiết kế 2 tông màu thể thao' },
            { icon: '🌬️', title: 'Cánh gió sau tích hợp', description: 'Tăng lực ép và tính thẩm mỹ' },
            { icon: '📡', title: 'Ăng-ten vây cá mập', description: 'Tích hợp GPS, Radio và 4G' },
          ],
        },
        interior: {
          title: 'Nội thất VF 5',
          description: 'Không gian cabin VF 5 Plus được thiết kế tối ưu với triết lý lấy người dùng làm trung tâm. Màn hình trung tâm 10 inch hỗ trợ Apple CarPlay và Android Auto không dây, kết hợp cùng cụm đồng hồ kỹ thuật số 7 inch mang đến trải nghiệm công nghệ tiên tiến. Ghế bọc da tổng hợp chất lượng cao với ghế lái chỉnh điện 6 hướng, cùng hệ thống âm thanh 6 loa đảm bảo sự thoải mái trên mọi hành trình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-5/vf5-interior-1.jpg',
          ],
          features: [
            { icon: '📱', title: 'Màn hình 10 inch', description: 'Hỗ trợ Apple CarPlay & Android Auto không dây' },
            { icon: '🎛️', title: 'Đồng hồ kỹ thuật số 7 inch', description: 'Hiển thị đa thông tin, tùy chỉnh giao diện' },
            { icon: '🪑', title: 'Ghế da tổng hợp', description: 'Ghế lái chỉnh điện 6 hướng' },
            { icon: '🔊', title: 'Hệ thống âm thanh 6 loa', description: 'Âm thanh vòm sống động' },
            { icon: '�', title: 'Cốp điện 328L', description: 'Mở rộng lên 1.039L khi gập ghế' },
            { icon: '�', title: 'Smart Key & Push Start', description: 'Mở khóa và khởi động thông minh' },
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
        shortDescription: 'Crossover điện thể thao với công suất vượt trội. VF 6 mang đến trải nghiệm lái đầy phấn khích với động cơ 201 mã lực, hệ thống ADAS tiên tiến và thiết kế trẻ trung, năng động.',
        description: `VinFast VF 6 là lựa chọn hoàn hảo cho những ai yêu thích phong cách thể thao và đam mê công nghệ.

Với kích thước 4.238 x 1.820 mm, VF 6 thuộc phân khúc crossover B+ với không gian cabin rộng rãi bất ngờ. Thiết kế ngoại thất thể thao với đường nét cắt xẻ mạnh mẽ, đèn LED hình chữ V đặc trưng và mâm hợp kim 19 inch hai tông màu tạo nên diện mạo trẻ trung, cá tính.

Động cơ điện 201 mã lực mang đến khả năng tăng tốc ấn tượng 0-100 km/h chỉ trong 7.5 giây - vượt trội hơn nhiều đối thủ cùng phân khúc. Quãng đường di chuyển lên đến 399 km đủ để bạn tự tin chinh phục mọi hành trình.

Nội thất VF 6 được trang bị màn hình cảm ứng 12.9 inch, sạc không dây cho smartphone và hệ thống ADAS cấp độ 2 với khả năng hỗ trợ lái tự động một phần. Đây là mẫu xe điện dành cho những người trẻ thành đạt, yêu thích công nghệ và khao khát sự khác biệt.`,
        specs: {
          engine: 'Động cơ điện đồng bộ vĩnh cửu',
          power: '201 mã lực',
          torque: '310 Nm',
          acceleration: '7.5 giây (0-100 km/h)',
          topSpeed: '175 km/h',
          range: '399 km (tiêu chuẩn WLTP)',
          seats: 5,
          transmission: 'Tự động 1 cấp',
          dimensions: '4.238 x 1.820 x 1.594 mm',
          weight: '1.690 kg',
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
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
        ],
        exterior: {
          title: 'Ngoại thất VinFast VF 6',
          description: 'VF 6 sở hữu ngôn ngữ thiết kế thể thao với những đường nét cắt xẻ mạnh mẽ, góc cạnh đầy cá tính. Cụm đèn LED hình chữ V kết nối liền mạch tạo nên dấu ấn nhận diện thương hiệu VinFast. Mâm hợp kim 19 inch thiết kế đa chấu thể thao kết hợp cùng cánh lướt gió trên nóc tạo nên vẻ ngoài năng động, sẵn sàng cho mọi hành trình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-exterior-2.jpg',
          ],
          features: [
            { icon: '💡', title: 'Đèn LED Full chữ V', description: 'Projector LED với dải DRL liền mạch' },
            { icon: '🛞', title: 'Mâm hợp kim 19 inch', description: 'Thiết kế đa chấu hai tông màu' },
            { icon: '🌬️', title: 'Cánh lướt gió nóc xe', description: 'Tối ưu khí động học' },
            { icon: '🚪', title: 'Tay nắm cửa ẩn Pop-out', description: 'Thiết kế flush hiện đại' },
            { icon: '�', title: 'Camera 360°', description: 'Quan sát toàn cảnh khi đỗ xe' },
          ],
        },
        interior: {
          title: 'Nội thất VinFast VF 6',
          description: 'Không gian cabin được thiết kế theo triết lý tối giản nhưng đầy đủ tiện nghi cao cấp. Màn hình trung tâm 12.9 inch độ phân giải cao hỗ trợ điều khiển mọi chức năng xe. Ghế da cao cấp chỉnh điện 8 hướng kết hợp hệ thống điều hòa 2 vùng độc lập mang đến sự thoải mái tối đa. Hệ thống ADAS cấp độ 2 với các tính năng hỗ trợ lái tiên tiến đảm bảo an toàn trên mọi hành trình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-6/vf6-interior-1.jpg',
          ],
          features: [
            { icon: '📱', title: 'Màn hình 12.9 inch', description: 'Cảm ứng đa điểm, độ phân giải 2K' },
            { icon: '🪑', title: 'Ghế da cao cấp', description: 'Chỉnh điện 8 hướng, nhớ 2 vị trí' },
            { icon: '❄️', title: 'Điều hòa 2 vùng', description: 'Điều chỉnh nhiệt độ độc lập' },
            { icon: '📶', title: 'Sạc không dây 15W', description: 'Tương thích chuẩn Qi' },
            { icon: '🛡️', title: 'ADAS cấp độ 2', description: 'ACC, LKA, phanh tự động khẩn cấp' },
            { icon: '🔊', title: 'Âm thanh 8 loa', description: 'Hệ thống âm thanh vòm sống động' },
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
        shortDescription: 'Coupe SUV điện độc đáo nhất phân khúc. VF 7 sở hữu thiết kế thể thao đậm chất châu Âu, động cơ 349 mã lực mạnh mẽ cùng hệ dẫn động AWD toàn thời gian.',
        description: `VinFast VF 7 là mẫu Coupe SUV điện đầu tiên tại Việt Nam, mang đến trải nghiệm lái đỉnh cao cho những người yêu thích phong cách thể thao.

Với thiết kế đuôi xe vuốt coupé độc đáo, VF 7 nổi bật giữa đám đông các SUV truyền thống. Đèn LED dải xuyên suốt đầu xe kết hợp cùng mâm hợp kim 20 inch và hệ số cản gió Cd 0.28 tạo nên vẻ ngoài khí động học hoàn hảo.

Động cơ điện 349 mã lực kết hợp hệ dẫn động AWD 4 bánh toàn thời gian mang đến khả năng tăng tốc 0-100 km/h chỉ trong 5.8 giây - thông số đáng nể với một mẫu SUV 5 chỗ. Quãng đường di chuyển lên đến 431 km mỗi lần sạc đủ phục vụ cả những chuyến đi xa.

Nội thất VF 7 mang đậm phong cách thể thao với ghế bucket, vô lăng vát đáy và cửa sổ trời Panorama rộng lớn. Hệ thống ADAS cấp độ 2+ với nhiều tính năng hỗ trợ lái tiên tiến đảm bảo an toàn trên mọi hành trình.`,
        specs: {
          engine: 'Động cơ điện đôi AWD',
          power: '349 mã lực',
          torque: '500 Nm',
          acceleration: '5.8 giây (0-100 km/h)',
          topSpeed: '200 km/h',
          range: '431 km (tiêu chuẩn WLTP)',
          seats: 5,
          transmission: 'Tự động 1 cấp',
          dimensions: '4.545 x 1.890 x 1.636 mm',
          weight: '2.050 kg',
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
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
        ],
        exterior: {
          title: 'Ngoại thất VinFast VF 7',
          description: 'VF 7 sở hữu thiết kế Coupe SUV độc đáo với đuôi xe vuốt thể thao đầy cá tính. Dải đèn LED xuyên suốt đầu xe kết hợp cùng lưới tản nhiệt kín đặc trưng xe điện tạo nên diện mạo hiện đại. Mâm hợp kim 20 inch thiết kế khí động học và tay nắm cửa ẩn tự động bật lên giúp tối ưu hệ số cản gió Cd 0.28 - một trong những thông số tốt nhất phân khúc.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-exterior-2.jpg',
          ],
          features: [
            { icon: '🎯', title: 'Thiết kế Coupe SUV', description: 'Đuôi vuốt thể thao độc đáo' },
            { icon: '💡', title: 'Đèn LED dải xuyên suốt', description: 'Logo nhận diện VinFast nổi bật' },
            { icon: '🛞', title: 'Mâm hợp kim 20 inch', description: 'Thiết kế khí động học cao cấp' },
            { icon: '�', title: 'Hệ số cản gió 0.28', description: 'Tối ưu tiêu thụ năng lượng' },
            { icon: '🚪', title: 'Tay nắm cửa tự động', description: 'Pop-out khi tiếp cận xe' },
          ],
        },
        interior: {
          title: 'Nội thất VinFast VF 7',
          description: 'Không gian cabin VF 7 được thiết kế theo phong cách thể thao với ghế da bucket ôm sát cơ thể và vô lăng vát đáy thể thao. Cửa sổ trời Panorama toàn cảnh mang đến cảm giác thoáng đãng. Màn hình trung tâm 12.9 inch hỗ trợ cập nhật OTA, kết hợp cùng hệ thống âm thanh 11 loa cao cấp và ADAS cấp độ 2+ mang đến trải nghiệm lái đỉnh cao.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-7/vf7-interior-1.jpg',
          ],
          features: [
            { icon: '🪑', title: 'Ghế da bucket thể thao', description: 'Chỉnh điện, nhớ vị trí' },
            { icon: '🎮', title: 'Vô lăng vát đáy', description: 'Thiết kế thể thao, paddle shift' },
            { icon: '☀️', title: 'Cửa sổ trời Panorama', description: 'Kính trời toàn cảnh rộng lớn' },
            { icon: '📱', title: 'Màn hình 12.9 inch', description: 'VinFast Connect, OTA update' },
            { icon: '�', title: 'Âm thanh 11 loa', description: 'Hệ thống loa cao cấp vòm' },
            { icon: '�️', title: 'ADAS cấp độ 2+', description: 'Highway Assist, ACC, AEB' },
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
        shortDescription: 'SUV điện hạng D với công nghệ tự lái tiên tiến. VF 8 mang đến sự kết hợp hoàn hảo giữa hiệu suất mạnh mẽ với 402 mã lực và tiện nghi cao cấp hàng đầu phân khúc.',
        description: `VinFast VF 8 là mẫu SUV điện chiến lược của VinFast trên hành trình chinh phục thị trường quốc tế, đặc biệt là Mỹ và châu Âu.

Với kích thước 4.750 x 1.934 mm, VF 8 thuộc phân khúc SUV hạng D với không gian cabin rộng rãi cho 5 hành khách. Thiết kế ngoại thất hiện đại với đèn LED Matrix thích ứng thông minh và mâm hợp kim 20 inch thiết kế aero độc đáo.

Tâm điểm của VF 8 là hệ thống 2 động cơ điện AWD với công suất tổng 402 mã lực và mô-men xoắn 620 Nm, mang đến khả năng tăng tốc ấn tượng 0-100 km/h chỉ trong 5.5 giây. Quãng đường di chuyển lên đến 471 km mỗi lần sạc, đủ tự tin cho những chuyến đi dài.

Nội thất VF 8 được trang bị màn hình xoay 15.6 inch - lớn nhất phân khúc, ghế da chỉnh điện 10 hướng với tính năng sưởi/thông gió và hệ thống ADAS cấp độ 2+ với 11 camera và radar hỗ trợ lái tự động một phần.`,
        specs: {
          engine: 'Động cơ điện đôi AWD',
          power: '402 mã lực',
          torque: '620 Nm',
          acceleration: '5.5 giây (0-100 km/h)',
          topSpeed: '200 km/h',
          range: '471 km (tiêu chuẩn WLTP)',
          seats: 5,
          transmission: 'Tự động 1 cấp',
          dimensions: '4.750 x 1.934 x 1.667 mm',
          weight: '2.455 kg',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
        gallery: [
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-2.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-1.jpg',
          'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-2.jpg',
        ],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
          { name: 'Đỏ Crimson', hexCode: '#8B0000' },
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
        ],
        exterior: {
          title: 'Ngoại thất VinFast VF 8',
          description: 'VF 8 sở hữu thiết kế khí động học hoàn hảo với đèn LED Matrix Adaptive tự động điều chỉnh chùm sáng. Dải đèn hình chữ V đặc trưng kéo dài toàn bộ đầu xe tạo nên dấu ấn nhận diện mạnh mẽ. Mâm hợp kim 20 inch thiết kế aero kết hợp cùng hệ số cản gió 0.275 giúp tối ưu quãng đường di chuyển và tiêu thụ năng lượng.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-exterior-2.jpg',
          ],
          features: [
            { icon: '💡', title: 'Đèn LED Matrix Adaptive', description: 'Tự động điều chỉnh chùm sáng' },
            { icon: '🛞', title: 'Mâm hợp kim 20 inch', description: 'Thiết kế aero độc quyền' },
            { icon: '🌬️', title: 'Hệ số cản gió 0.275', description: 'Tối ưu tiêu thụ năng lượng' },
            { icon: '�', title: '11 camera & radar', description: 'Hỗ trợ ADAS toàn diện' },
            { icon: '🔒', title: 'Smart Access', description: 'Mở khóa và khởi động không chìa' },
          ],
        },
        interior: {
          title: 'Nội thất VinFast VF 8',
          description: 'Không gian cabin VF 8 được thiết kế theo triết lý sang trọng tối giản với điểm nhấn là màn hình xoay 15.6 inch - lớn nhất phân khúc. Ghế da cao cấp chỉnh điện 10 hướng với tính năng sưởi và thông gió mang đến sự thoải mái tuyệt đối. Hệ thống ADAS cấp độ 2+ với các tính năng Highway Assist, phanh khẩn cấp tự động đảm bảo an toàn trên mọi hành trình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-8/vf8-interior-2.jpg',
          ],
          features: [
            { icon: '📱', title: 'Màn hình xoay 15.6 inch', description: 'Xoay dọc/ngang, cảm ứng đa điểm' },
            { icon: '🪑', title: 'Ghế da 10 hướng', description: 'Sưởi, thông gió, nhớ vị trí' },
            { icon: '☀️', title: 'Cửa sổ trời Panorama', description: 'Kính trời toàn cảnh mở điện' },
            { icon: '❄️', title: 'Điều hòa 2 vùng', description: 'Điều chỉnh nhiệt độ độc lập' },
            { icon: '🛡️', title: 'ADAS cấp độ 2+', description: 'Highway Assist, AEB, LKA' },
            { icon: '📶', title: 'Sạc không dây 15W', description: 'Sạc nhanh Qi' },
          ],
        },
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
        shortDescription: 'Flagship SUV điện full-size 7 chỗ đẳng cấp nhất VinFast. VF 9 mang đến không gian thượng lưu với ghế da Nappa, hàng ghế thương gia và quãng đường lên đến 594 km.',
        description: `VinFast VF 9 là mẫu SUV điện đầu bảng của VinFast, đại diện cho đỉnh cao công nghệ và sự sang trọng của thương hiệu Việt.

Với kích thước 5.120 x 2.000 mm - lớn hơn cả BMW X7 và Mercedes GLS, VF 9 thuộc phân khúc SUV hạng E full-size với không gian 7 chỗ rộng rãi bậc nhất. Thiết kế ngoại thất uy nghi với đèn LED dải xuyên suốt và mâm hợp kim 21 inch tạo nên vẻ ngoài đẳng cấp, sang trọng.

Hệ thống 2 động cơ điện AWD với công suất tổng 402 mã lực mang đến khả năng vận hành mạnh mẽ với thời gian tăng tốc 0-100 km/h trong 6.5 giây. Đặc biệt, quãng đường di chuyển lên đến 594 km mỗi lần sạc - xa nhất trong dòng xe VinFast.

Nội thất VF 9 là đỉnh cao của sự sang trọng với ghế da Nappa, hàng ghế thứ 2 dạng captain seats như ghế thương gia tích hợp massage và màn hình giải trí riêng. Hệ thống âm thanh 13 loa cao cấp và điều hòa 3 vùng độc lập đảm bảo trải nghiệm thượng lưu cho mọi hành khách.`,
        specs: {
          engine: 'Động cơ điện đôi AWD',
          power: '402 mã lực',
          torque: '620 Nm',
          acceleration: '6.5 giây (0-100 km/h)',
          topSpeed: '200 km/h',
          range: '594 km (tiêu chuẩn WLTP)',
          seats: 7,
          transmission: 'Tự động 1 cấp',
          dimensions: '5.120 x 2.000 x 1.721 mm',
          weight: '2.755 kg',
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
          title: 'Ngoại thất VinFast VF 9',
          description: 'VF 9 là mẫu SUV full-size 7 chỗ với kích thước lớn nhất dòng VinFast - vượt trội cả BMW X7. Thiết kế ngoại thất uy nghi với đèn LED dải xuyên suốt đầu đuôi, mâm hợp kim 21 inch và tay nắm cửa tự động pop-out. Hệ thống 11 camera và radar hỗ trợ ADAS toàn diện đảm bảo an toàn tối đa cho cả xe và người xung quanh.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-1.jpg',
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-exterior-2.jpg',
          ],
          features: [
            { icon: '�', title: 'Full-size SUV lớn nhất', description: 'Vượt trội BMW X7, Mercedes GLS' },
            { icon: '�💡', title: 'Đèn LED dải xuyên suốt', description: 'Nhận diện thương hiệu cao cấp' },
            { icon: '🛞', title: 'Mâm hợp kim 21 inch', description: 'Kích thước lớn nhất phân khúc' },
            { icon: '', title: 'Cửa hỗ trợ điện', description: 'Đóng mở với lực đẩy nhẹ' },
            { icon: '�', title: '11 camera & radar', description: 'ADAS toàn diện 360°' },
          ],
        },
        interior: {
          title: 'Nội thất VinFast VF 9',
          description: 'Không gian nội thất VF 9 là đỉnh cao của sự sang trọng với ghế da Nappa cao cấp. Hàng ghế thứ 2 dạng captain seats như ghế thương gia máy bay với tính năng massage, sưởi và thông gió. Màn hình xoay 15.6 inch, hệ thống âm thanh 13 loa premium và điều hòa 3 vùng độc lập mang đến trải nghiệm thượng lưu cho mọi hành khách trên mọi hành trình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-9/vf9-interior-1.jpg',
          ],
          features: [
            { icon: '🪑', title: 'Ghế da Nappa captain seats', description: 'Massage, sưởi, thông gió' },
            { icon: '📱', title: 'Màn hình xoay 15.6 inch', description: 'Cảm ứng, xoay dọc/ngang' },
            { icon: '🔊', title: 'Âm thanh 13 loa premium', description: 'Hệ thống vòm cao cấp' },
            { icon: '☀️', title: 'Panorama khổng lồ', description: 'Kính trời lớn nhất phân khúc' },
            { icon: '❄️', title: 'Điều hòa 3 vùng', description: 'Độc lập từng hàng ghế' },
            { icon: '📦', title: 'Cốp điện Hands-free', description: 'Mở cốp bằng chân' },
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
        description: 'VinFast VF e34 là mẫu xe điện đầu tiên của VinFast được giao tới tay khách hàng Việt Nam vào cuối năm 2021. Xe đánh dấu bước ngoặt quan trọng trong hành trình điện hóa của VinFast.',
        specs: {
          engine: 'Động cơ điện',
          power: '148 HP',
          torque: '242 Nm',
          acceleration: '9.5s (0-100km/h)',
          topSpeed: '165 km/h',
          range: '318 km',
          seats: 5,
          transmission: 'Tự động 1 cấp',
          dimensions: '4.300 x 1.793 x 1.613 mm',
          weight: '1.490 kg',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Xanh Neptune', hexCode: '#1B4D5C' },
          { name: 'Trắng Pristine', hexCode: '#F5F5F5' },
          { name: 'Đen Brahminy', hexCode: '#1A1A1A' },
        ],
        exterior: {
          title: 'Ngoại thất VF e34 - Tiên phong xe điện',
          description: 'VF e34 là mẫu xe điện đầu tiên, mang thiết kế hiện đại với đèn LED, lưới tản nhiệt kín đặc trưng xe điện và mâm hợp kim 18 inch thể thao.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-exterior-1.jpg',
          ],
          features: [
            { icon: '💡', title: 'Đèn LED hiện đại', description: 'Cụm đèn pha LED tiết kiệm điện' },
            { icon: '🔲', title: 'Lưới tản nhiệt kín', description: 'Thiết kế đặc trưng xe điện' },
            { icon: '🛞', title: 'Mâm hợp kim 18 inch', description: 'Thiết kế thể thao' },
            { icon: '🚿', title: 'Gạt mưa tự động', description: 'Cảm biến mưa tích hợp' },
          ],
        },
        interior: {
          title: 'Nội thất VF e34 - Tiện nghi Thực dụng',
          description: 'Cabin rộng rãi với màn hình giải trí 10 inch, ghế da cao cấp, điều hòa tự động và hệ thống âm thanh 6 loa. Trang bị đầy đủ tính năng an toàn cơ bản.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/vf-e34/vfe34-interior-1.jpg',
          ],
          features: [
            { icon: '📱', title: 'Màn hình 10 inch', description: 'Tích hợp Apple CarPlay, Android Auto' },
            { icon: '🪑', title: 'Ghế da cao cấp', description: 'Ghế lái chỉnh điện 6 hướng' },
            { icon: '❄️', title: 'Điều hòa tự động', description: 'Tự động điều chỉnh nhiệt độ' },
            { icon: '🔊', title: 'Hệ thống âm thanh 6 loa', description: 'Âm thanh rõ ràng' },
            { icon: '🔑', title: 'Khởi động nút bấm', description: 'Keyless Entry' },
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
        description: 'VinFast Lux A2.0 là mẫu sedan hạng D với thiết kế do Pininfarina phát triển và nền tảng BMW. Xe trang bị động cơ 2.0L Turbo của BMW mạnh mẽ và hộp số ZF 8 cấp cao cấp.',
        specs: {
          engine: 'Xăng 2.0L Turbo',
          power: '228 HP',
          torque: '350 Nm',
          acceleration: '7.1s (0-100km/h)',
          topSpeed: '220 km/h',
          fuelConsumption: '8.5L/100km',
          seats: 5,
          transmission: '8AT ZF',
          dimensions: '4.973 x 1.900 x 1.500 mm',
          weight: '1.685 kg',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen Mystique', hexCode: '#1A1A1A' },
          { name: 'Trắng Lustrous', hexCode: '#F5F5F5' },
          { name: 'Đỏ Burgundy', hexCode: '#800020' },
          { name: 'Xám Desat', hexCode: '#6B6B6B' },
        ],
        exterior: {
          title: 'Ngoại thất Lux A2.0 - Thiết kế Pininfarina',
          description: 'Thiết kế bởi Pininfarina - studio thiết kế xe hơi huyền thoại Italia. Đường nét sang trọng, đèn LED cao cấp và mâm 18 inch tạo nên vẻ ngoài đẳng cấp châu Âu.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-exterior-1.jpg',
          ],
          features: [
            { icon: '🎨', title: 'Thiết kế Pininfarina', description: 'Studio thiết kế huyền thoại Italia' },
            { icon: '💡', title: 'Đèn LED cao cấp', description: 'Đèn pha và đèn hậu full LED' },
            { icon: '🛞', title: 'Mâm hợp kim 18 inch', description: 'Thiết kế sang trọng' },
            { icon: '⚡', title: 'Nền tảng BMW', description: 'Khung gầm và động cơ BMW' },
          ],
        },
        interior: {
          title: 'Nội thất Lux A2.0 - Sang trọng Châu Âu',
          description: 'Nội thất bọc da Nappa cao cấp, ghế chỉnh điện 12 hướng, màn hình cảm ứng 10.4 inch và hệ thống âm thanh 8 loa. Không gian sang trọng xứng tầm sedan hạng D.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-a/luxa-interior-1.jpg',
          ],
          features: [
            { icon: '🪑', title: 'Ghế da Nappa', description: 'Chỉnh điện 12 hướng, nhớ 2 vị trí' },
            { icon: '📱', title: 'Màn hình 10.4 inch', description: 'Cảm ứng trung tâm' },
            { icon: '🔊', title: 'Âm thanh 8 loa', description: 'Hệ thống loa cao cấp' },
            { icon: '❄️', title: 'Điều hòa 2 vùng', description: 'Tự động điều chỉnh' },
            { icon: '🔑', title: 'Khởi động nút bấm', description: 'Smart Key tiện lợi' },
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
        description: 'VinFast Lux SA2.0 là mẫu SUV hạng D 7 chỗ với thiết kế Pininfarina và nền tảng BMW. Xe sử dụng động cơ 2.0L Turbo mạnh mẽ với hộp số ZF 8 cấp, mang đến trải nghiệm lái đẳng cấp.',
        specs: {
          engine: 'Xăng 2.0L Turbo',
          power: '228 HP',
          torque: '350 Nm',
          acceleration: '8.9s (0-100km/h)',
          topSpeed: '200 km/h',
          fuelConsumption: '9.2L/100km',
          seats: 7,
          transmission: '8AT ZF',
          dimensions: '4.940 x 1.900 x 1.736 mm',
          weight: '1.975 kg',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen Mystique', hexCode: '#1A1A1A' },
          { name: 'Trắng Lustrous', hexCode: '#F5F5F5' },
          { name: 'Xanh Twilight', hexCode: '#1B4D5C' },
        ],
        exterior: {
          title: 'Ngoại thất Lux SA2.0 - SUV Sang trọng',
          description: 'SUV hạng D 7 chỗ với thiết kế Pininfarina sang trọng. Đèn LED Matrix, mâm 20 inch và cánh gió thể thao tạo nên vẻ ngoài đẳng cấp, uy nghi.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-exterior-1.jpg',
          ],
          features: [
            { icon: '🎨', title: 'Thiết kế Pininfarina', description: 'Đường nét sang trọng Italia' },
            { icon: '💡', title: 'Đèn LED Matrix', description: 'Tự động điều chỉnh chùm sáng' },
            { icon: '🛞', title: 'Mâm hợp kim 20 inch', description: 'Thiết kế thể thao cao cấp' },
            { icon: '⚡', title: 'Nền tảng BMW', description: 'Khung gầm và động cơ BMW' },
          ],
        },
        interior: {
          title: 'Nội thất Lux SA2.0 - 7 Chỗ Cao cấp',
          description: 'Nội thất da Nappa 7 chỗ rộng rãi với ghế chỉnh điện, cửa sổ trời Panorama và hệ thống âm thanh cao cấp. Không gian thư thái cho cả gia đình.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/lux-sa/luxsa-interior-1.jpg',
          ],
          features: [
            { icon: '🪑', title: 'Ghế da Nappa 7 chỗ', description: 'Ghế lái chỉnh điện 12 hướng' },
            { icon: '☀️', title: 'Cửa sổ trời Panorama', description: 'Kính trời toàn cảnh' },
            { icon: '🔊', title: 'Âm thanh cao cấp', description: 'Hệ thống loa premium' },
            { icon: '❄️', title: 'Điều hòa 3 vùng', description: 'Điều chỉnh riêng biệt' },
            { icon: '📦', title: 'Cốp 7 chỗ linh hoạt', description: 'Gập ghế mở rộng' },
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
        price: 4600000000,
        priceRange: 'Trên 4 tỷ',
        year: 2023,
        shortDescription: 'Biểu tượng của sự quyền uy và thành đạt. VinFast President sở hữu động cơ V8 mạnh mẽ, nội thất da Nappa sang trọng cùng số lượng giới hạn dành riêng cho giới thượng lưu.',
        description: `VinFast President không chỉ là một chiếc xe, mà là một tác phẩm nghệ thuật khẳng định vị thế của chủ nhân.

Với chiều dài cơ sở lên tới 3.133 mm, xe cung cấp một không gian rộng rãi vượt trội, đặc biệt là hàng ghế ông chủ phía sau. Thiết kế bởi Pininfarina - studio thiết kế huyền thoại Italia, President sở hữu những đường nét sang trọng, tinh tế đậm chất Ý kết hợp với sự mạnh mẽ của một SUV full-size.

Trái tim của "Chủ tịch" là khối động cơ V8 6.2L danh tiếng từ General Motors, kết hợp cùng hộp số tự động ZF 8 cấp và hệ dẫn động 4 bánh toàn thời gian AWD, giúp xe vận hành mượt mà nhưng cực kỳ uy lực khi cần bứt tốc.

Bên cạnh đó, các tính năng an toàn hàng đầu như cảnh báo lệch làn đường, camera 360 độ và hỗ trợ đổ đèo đảm bảo sự an tâm tuyệt đối trên mọi hành trình. Với số lượng giới hạn chỉ 500 chiếc, President là lựa chọn dành riêng cho những người đứng đầu.`,
        specs: {
          engine: 'V8 6.2L hút khí tự nhiên',
          power: '420 mã lực',
          torque: '624 Nm',
          acceleration: '6.8 giây (0-100 km/h)',
          topSpeed: '300 km/h',
          fuelConsumption: '13.5L/100km',
          seats: 7,
          transmission: 'Tự động ZF 8 cấp + AWD',
          dimensions: '5.146 x 1.987 x 1.760 mm',
          weight: '2.528 kg',
        },
        thumbnail: 'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-exterior-1.jpg',
        gallery: [],
        colorOptions: [
          { name: 'Đen President', hexCode: '#0A0A0A' },
          { name: 'Bạc Silver', hexCode: '#C0C0C0' },
        ],
        exterior: {
          title: 'Ngoại thất VinFast President',
          description: 'Thiết kế của VinFast President là sự kết hợp giữa sự mạnh mẽ và tinh tế đậm chất Ý từ Pininfarina. Điểm nhấn là nắp capo với hốc gió lớn, lưới tản nhiệt dạng mắt cáo sơn đen sang trọng và các chi tiết mạ đồng (Gold) hoặc bạc (Silver) tạo nên diện mạo uy nghiêm. Hệ thống đèn Full-LED sắc sảo cùng bộ mâm 20 inch đa chấu giúp xe khẳng định vị thế dẫn đầu trên mọi cung đường.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-exterior-1.jpg',
          ],
          features: [
            { icon: '👑', title: 'Giới hạn 500 chiếc', description: 'Phiên bản độc quyền dành cho giới thượng lưu' },
            { icon: '🎨', title: 'Thiết kế Pininfarina', description: 'Đường nét sang trọng từ Italia' },
            { icon: '�', title: 'Đèn Full-LED Matrix', description: 'Chiếu sáng thông minh thích ứng' },
            { icon: '🛞', title: 'Mâm 20 inch đa chấu', description: 'Thiết kế độc quyền President' },
            { icon: '🏆', title: 'Chi tiết mạ Gold/Silver', description: 'Điểm nhấn sang trọng đặc biệt' },
          ],
        },
        interior: {
          title: 'Nội thất VinFast President',
          description: 'Không gian nội thất đẳng cấp với da Nappa cao cấp kết hợp cùng gỗ Veneer thượng hạng từ Ý. Hàng ghế thứ hai được thiết kế theo tiêu chuẩn thương gia với khoảng để chân rộng rãi, tích hợp tính năng massage, sưởi và thông gió. Màn hình giải trí trung tâm 12.3 inch cùng hệ thống âm thanh vòm mang lại trải nghiệm thư giãn tuyệt đối cho chủ nhân.',
          images: [
            'https://vinfastauto.com/sites/default/files/styles/630x420/public/cars/president/president-interior-1.jpg',
          ],
          features: [
            { icon: '🪑', title: 'Da Nappa & Gỗ Veneer Ý', description: 'Vật liệu thượng hạng nhập khẩu' },
            { icon: '�', title: 'Ghế ông chủ hàng 2', description: 'Massage, sưởi, thông gió, chỉnh điện' },
            { icon: '📱', title: 'Màn hình 12.3 inch', description: 'Giải trí trung tâm cảm ứng' },
            { icon: '🔊', title: 'Âm thanh vòm cao cấp', description: 'Hệ thống loa premium' },
            { icon: '📹', title: 'Camera 360° & ADAS', description: 'An toàn chủ động toàn diện' },
            { icon: '❄️', title: 'Điều hòa 4 vùng', description: 'Độc lập từng hàng ghế' },
          ],
        },
        status: 'published',
        isFeatured: true,
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
