import pandas as pd

# Dữ liệu xe VinFast
data = [
    {
        "STT": 1, "Tên xe": "VinFast Limo Green", "Hãng xe": "VinFast", "Loại xe": "Sedan/VIP", 
        "Giá": 2000000000, "Khoảng giá": "1.8 - 2.2 tỷ", "Năm": 2025, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Phiên bản vận tải cao cấp tiêu chuẩn Limo", 
        "Mô tả chi tiết": "Dòng xe thiết kế chuyên biệt cho dịch vụ vận tải hạng sang Green Limo...",
        "Động cơ": "Điện 2 động cơ", "Công suất": "402 HP", "Mô-men xoắn": "620 Nm", 
        "Tăng tốc 0-100": "5.9s", "Tốc độ tối đa": "200 km/h", "Số ghế": 4,
        "Thumbnail": "https://example.com/limo.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Sang trọng, màu xanh nhận diện thương hiệu", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Ghế thương gia, không gian rộng rãi", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Cyan Green","hexCode":"#00FFFF"},{"name":"Đen","hexCode":"#000000"}]'
    },
    {
        "STT": 2, "Tên xe": "VinFast VF 3", "Hãng xe": "VinFast", "Loại xe": "Mini SUV", 
        "Giá": 320000000, "Khoảng giá": "300 - 350 triệu", "Năm": 2024, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Mẫu xe điện quốc dân nhỏ gọn", 
        "Mô tả chi tiết": "VinFast VF 3 là mẫu xe điện mini thiết kế vuông vức cá tính...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "43 HP", "Mô-men xoắn": "110 Nm", 
        "Tăng tốc 0-100": "12s", "Tốc độ tối đa": "100 km/h", "Số ghế": 4,
        "Thumbnail": "https://example.com/vf3.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Nhỏ gọn, gầm cao, năng động", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Tối giản, hiện đại", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Vàng","hexCode":"#FFFF00"},{"name":"Trắng","hexCode":"#FFFFFF"}]'
    },
    {
        "STT": 3, "Tên xe": "VinFast VF 5 Plus", "Hãng xe": "VinFast", "Loại xe": "A-SUV", 
        "Giá": 480000000, "Khoảng giá": "450 - 500 triệu", "Năm": 2024, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "SUV hạng A linh hoạt trong đô thị", 
        "Mô tả chi tiết": "VF 5 Plus sở hữu thiết kế hiện đại và công nghệ an toàn vượt trội phân khúc...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "134 HP", "Mô-men xoắn": "135 Nm", 
        "Tăng tốc 0-100": "10.9s", "Tốc độ tối đa": "130 km/h", "Số ghế": 5,
        "Thumbnail": "https://example.com/vf5.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Phối màu nóc độc đáo, trẻ trung", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Tiện nghi, màn hình giải trí lớn", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Xanh Dương","hexCode":"#0000FF"},{"name":"Cam","hexCode":"#FFA500"}]'
    },
    {
        "STT": 4, "Tên xe": "VinFast VF 6", "Hãng xe": "VinFast", "Loại xe": "B-SUV", 
        "Giá": 675000000, "Khoảng giá": "600 - 800 triệu", "Năm": 2024, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Tâm điểm của phong cách sống", 
        "Mô tả chi tiết": "VF 6 là mẫu SUV hạng B với thiết kế tinh tế từ Pininfarina...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "174 HP", "Mô-men xoắn": "250 Nm", 
        "Tăng tốc 0-100": "8.9s", "Tốc độ tối đa": "150 km/h", "Số ghế": 5,
        "Thumbnail": "https://example.com/vf6.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Thể thao, đường nét tinh tế", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Không gian rộng rãi, hoàn thiện cao cấp", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Xám","hexCode":"#808080"},{"name":"Đỏ","hexCode":"#FF0000"}]'
    },
    {
        "STT": 5, "Tên xe": "VinFast MPV 7", "Hãng xe": "VinFast", "Loại xe": "MPV", 
        "Giá": 900000000, "Khoảng giá": "800 - 950 triệu", "Năm": 2025, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "Xe điện đa dụng 7 chỗ cho gia đình", 
        "Mô tả chi tiết": "Mẫu MPV thuần điện đầu tiên mang lại không gian tối đa cho 7 người...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "201 HP", "Mô-men xoắn": "310 Nm", 
        "Tăng tốc 0-100": "9.0s", "Tốc độ tối đa": "160 km/h", "Số ghế": 7,
        "Thumbnail": "https://example.com/mpv7.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Dáng trường xe, cửa lùa tiện lợi", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Ghế gập linh hoạt, điều hòa đa vùng", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Bạc","hexCode":"#C0C0C0"},{"name":"Xanh lá","hexCode":"#008000"}]'
    },
    {
        "STT": 6, "Tên xe": "VinFast VF 7", "Hãng xe": "VinFast", "Loại xe": "C-SUV", 
        "Giá": 850000000, "Khoảng giá": "850 - 1.2 tỷ", "Năm": 2024, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Mãnh thú đường phố", 
        "Mô tả chi tiết": "VF 7 sở hữu thiết kế vũ trụ Asymetric Aerospace đầy phá cách...",
        "Động cơ": "Điện 2 động cơ AWD", "Công suất": "348 HP", "Mô-men xoắn": "500 Nm", 
        "Tăng tốc 0-100": "5.8s", "Tốc độ tối đa": "175 km/h", "Số ghế": 5,
        "Thumbnail": "https://example.com/vf7.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Cắt xẻ táo bạo, đèn LED cánh chim", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Hướng về người lái, cửa sổ trời toàn cảnh", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Xám Wolf","hexCode":"#4A4A4A"},{"name":"Xanh Deep Ocean","hexCode":"#0047AB"}]'
    },
    {
        "STT": 7, "Tên xe": "VinFast VF 8", "Hãng xe": "VinFast", "Loại xe": "D-SUV", 
        "Giá": 1100000000, "Khoảng giá": "1.1 - 1.4 tỷ", "Năm": 2024, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Đỉnh cao công nghệ", 
        "Mô tả chi tiết": "VF 8 cân bằng giữa thiết kế sang trọng và hiệu suất vận hành mạnh mẽ...",
        "Động cơ": "Điện 2 động cơ AWD", "Công suất": "402 HP", "Mô-men xoắn": "620 Nm", 
        "Tăng tốc 0-100": "5.5s", "Tốc độ tối đa": "200 km/h", "Số ghế": 5,
        "Thumbnail": "https://example.com/vf8.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Cân đối, mạnh mẽ, phong cách Ý", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Nội thất da cao cấp, tích hợp trợ lý ảo", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Trắng","hexCode":"#FFFFFF"},{"name":"Đen","hexCode":"#000000"}]'
    },
    {
        "STT": 8, "Tên xe": "VinFast VF 9", "Hãng xe": "VinFast", "Loại xe": "E-SUV", 
        "Giá": 1500000000, "Khoảng giá": "1.5 - 2.2 tỷ", "Năm": 2024, "Xe nổi bật": True, "Trạng thái": "published",
        "Mô tả ngắn": "Lựa chọn của chủ tịch", 
        "Mô tả chi tiết": "VF 9 là mẫu SUV điện cỡ lớn nhất mang lại trải nghiệm thương gia...",
        "Động cơ": "Điện 2 động cơ AWD", "Công suất": "402 HP", "Mô-men xoắn": "620 Nm", 
        "Tăng tốc 0-100": "6.5s", "Tốc độ tối đa": "200 km/h", "Số ghế": 7,
        "Thumbnail": "https://example.com/vf9.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Bề thế, khí động học đặc trưng", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Ghế cơ trưởng, tiện nghi hàng đầu", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Đen","hexCode":"#000000"},{"name":"Xanh VinFast","hexCode":"#006400"}]'
    },
    {
        "STT": 9, "Tên xe": "VinFast EC Van", "Hãng xe": "VinFast", "Loại xe": "Van/Truck", 
        "Giá": 400000000, "Khoảng giá": "350 - 450 triệu", "Năm": 2025, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "Giải pháp vận tải xanh đô thị", 
        "Mô tả chi tiết": "Xe tải van điện nhỏ gọn tối ưu cho logistics last-mile...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "100 HP", "Mô-men xoắn": "200 Nm", 
        "Tăng tốc 0-100": "14s", "Tốc độ tối đa": "90 km/h", "Số ghế": 2,
        "Thumbnail": "https://example.com/ecvan.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Vuông vức, tối ưu thùng hàng", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Cabin thực dụng, bền bỉ", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Trắng","hexCode":"#FFFFFF"}]'
    },
    {
        "STT": 10, "Tên xe": "VinFast MinioGreen", "Hãng xe": "VinFast", "Loại xe": "Micro Car", 
        "Giá": 250000000, "Khoảng giá": "200 - 300 triệu", "Năm": 2025, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "Di chuyển cá nhân linh hoạt", 
        "Mô tả chi tiết": "Dòng xe điện siêu nhỏ 1-2 chỗ ngồi cho đô thị đông đúc...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "30 HP", "Mô-men xoắn": "90 Nm", 
        "Tăng tốc 0-100": "15s", "Tốc độ tối đa": "80 km/h", "Số ghế": 2,
        "Thumbnail": "https://example.com/minio.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Kích thước siêu nhỏ, dễ đỗ xe", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Cơ bản, màn hình nhỏ", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Xanh lá mạ","hexCode":"#32CD32"},{"name":"Hồng","hexCode":"#FFC0CB"}]'
    },
    {
        "STT": 11, "Tên xe": "VinFast HerioGreen", "Hãng xe": "VinFast", "Loại xe": "City Car", 
        "Giá": 380000000, "Khoảng giá": "350 - 400 triệu", "Năm": 2025, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "Phong cách anh hùng đường phố", 
        "Mô tả chi tiết": "Mẫu xe đô thị cỡ nhỏ với thiết kế mạnh mẽ và pin trâu...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "80 HP", "Mô-men xoắn": "120 Nm", 
        "Tăng tốc 0-100": "11s", "Tốc độ tối đa": "110 km/h", "Số ghế": 4,
        "Thumbnail": "https://example.com/herio.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Thể thao, đường gân nổi", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Ghế nỉ cao cấp, kết nối 4G", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Đỏ mận","hexCode":"#8B0000"},{"name":"Xám","hexCode":"#808080"}]'
    },
    {
        "STT": 12, "Tên xe": "VinFast NerioGreen", "Hãng xe": "VinFast", "Loại xe": "Compact Sedan", 
        "Giá": 550000000, "Khoảng giá": "500 - 600 triệu", "Năm": 2025, "Xe nổi bật": False, "Trạng thái": "published",
        "Mô tả ngắn": "Sedan điện thanh lịch", 
        "Mô tả chi tiết": "Mẫu Sedan điện hạng B dành cho gia đình trẻ và dịch vụ...",
        "Động cơ": "Điện 1 động cơ", "Công suất": "150 HP", "Mô-men xoắn": "240 Nm", 
        "Tăng tốc 0-100": "9.5s", "Tốc độ tối đa": "140 km/h", "Số ghế": 5,
        "Thumbnail": "https://example.com/nerio.jpg", "Gallery": "https://img1.jpg,https://img2.jpg",
        "Ngoại thất - Mô tả": "Dáng sedan truyền thống, hiện đại", "Ngoại thất - Ảnh": "https://ext1.jpg,https://ext2.jpg",
        "Nội thất - Mô tả": "Rộng rãi, cốp xe lớn", "Nội thất - Ảnh": "https://int1.jpg,https://int2.jpg",
        "Màu sắc (JSON)": '[{"name":"Trắng Ngọc Trai","hexCode":"#F0F8FF"},{"name":"Đen","hexCode":"#000000"}]'
    }
]

# Tạo DataFrame
df = pd.DataFrame(data)

# Xuất ra file Excel
file_name = "VinFast_Cars.xlsx"
df.to_excel(file_name, index=False)

print(f"Đã tạo file {file_name} thành công!")
