import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/error.js';
import * as XLSX from 'xlsx';
import Car from '../models/Car.js';
import Brand from '../models/Brand.js';
import CarType from '../models/CarType.js';

// Column headers for Excel template
const TEMPLATE_HEADERS = [
    'STT',
    'Tên xe',
    'Hãng xe',
    'Loại xe',
    'Giá',
    'Khoảng giá',
    'Năm',
    'Xe nổi bật',
    'Trạng thái',
    'Mô tả ngắn',
    'Mô tả chi tiết',
    'Động cơ',
    'Công suất',
    'Mô-men xoắn',
    'Tăng tốc 0-100',
    'Tốc độ tối đa',
    'Số ghế',
    'Thumbnail',
    'Gallery',
    'Ngoại thất - Mô tả',
    'Ngoại thất - Ảnh',
    'Nội thất - Mô tả',
    'Nội thất - Ảnh',
    'Màu sắc (JSON)',
];

// Sample data for template
const SAMPLE_DATA = [
    {
        'STT': 1,
        'Tên xe': 'VinFast VF 8 Plus',
        'Hãng xe': 'VinFast',
        'Loại xe': 'SUV',
        'Giá': 1200000000,
        'Khoảng giá': '1.2 - 1.5 tỷ',
        'Năm': 2024,
        'Xe nổi bật': 'TRUE',
        'Trạng thái': 'published',
        'Mô tả ngắn': 'SUV điện cao cấp với công nghệ hiện đại',
        'Mô tả chi tiết': 'VinFast VF 8 là mẫu SUV điện thông minh...',
        'Động cơ': 'Điện 2 động cơ AWD',
        'Công suất': '402 HP',
        'Mô-men xoắn': '620 Nm',
        'Tăng tốc 0-100': '5.5s',
        'Tốc độ tối đa': '200 km/h',
        'Số ghế': 5,
        'Thumbnail': 'https://example.com/vf8.jpg',
        'Gallery': 'https://img1.jpg,https://img2.jpg',
        'Ngoại thất - Mô tả': 'Thiết kế hiện đại, khí động học',
        'Ngoại thất - Ảnh': 'https://exterior1.jpg,https://exterior2.jpg',
        'Nội thất - Mô tả': 'Nội thất cao cấp với ghế da',
        'Nội thất - Ảnh': 'https://interior1.jpg,https://interior2.jpg',
        'Màu sắc (JSON)': '[{"name":"Đen","hexCode":"#000000"},{"name":"Trắng","hexCode":"#FFFFFF"}]',
    },
];

// @desc    Download car import template
// @route   GET /api/admin/import/car-template
// @access  Private
export const downloadCarTemplate = asyncHandler(async (_req: Request, res: Response) => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();

    // Create data with headers and sample
    const wsData = [TEMPLATE_HEADERS, ...SAMPLE_DATA.map(row => TEMPLATE_HEADERS.map(h => row[h as keyof typeof row] || ''))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },   // STT
        { wch: 25 },  // Tên xe
        { wch: 15 },  // Hãng xe
        { wch: 12 },  // Loại xe
        { wch: 15 },  // Giá
        { wch: 18 },  // Khoảng giá
        { wch: 8 },   // Năm
        { wch: 12 },  // Xe nổi bật
        { wch: 12 },  // Trạng thái
        { wch: 40 },  // Mô tả ngắn
        { wch: 50 },  // Mô tả chi tiết
        { wch: 20 },  // Động cơ
        { wch: 12 },  // Công suất
        { wch: 12 },  // Mô-men xoắn
        { wch: 15 },  // Tăng tốc
        { wch: 15 },  // Tốc độ tối đa
        { wch: 10 },  // Số ghế
        { wch: 40 },  // Thumbnail
        { wch: 60 },  // Gallery
        { wch: 40 },  // Ngoại thất mô tả
        { wch: 60 },  // Ngoại thất ảnh
        { wch: 40 },  // Nội thất mô tả
        { wch: 60 },  // Nội thất ảnh
        { wch: 60 },  // Màu sắc
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Cars');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Send file
    res.setHeader('Content-Disposition', 'attachment; filename=car_import_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// @desc    Import cars from Excel
// @route   POST /api/admin/import/cars
// @access  Private
export const importCarsFromExcel = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ApiError('Vui lòng upload file Excel', 400);
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

    if (data.length === 0) {
        throw new ApiError('File Excel không có dữ liệu', 400);
    }

    // Fetch all brands and car types for mapping
    const brands = await Brand.find({});
    const carTypes = await CarType.find({});

    const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b._id]));
    const carTypeMap = new Map(carTypes.map(t => [t.name.toLowerCase(), t._id]));

    // Fetch all existing cars for duplicate checking
    const existingCars = await Car.find({}).lean();
    const existingCarsByName = new Map(existingCars.map(c => [c.name.toLowerCase(), c]));

    const results: {
        success: number;
        failed: number;
        skipped: number;
        conflicts: number;
        errors: string[];
        warnings: string[];
    } = {
        success: 0,
        failed: 0,
        skipped: 0,
        conflicts: 0,
        errors: [],
        warnings: [],
    };

    // Helper function to compare values
    const compareValues = (existing: any, newVal: any, field: string): string | null => {
        const existingStr = String(existing ?? '').trim();
        const newStr = String(newVal ?? '').trim();
        if (existingStr !== newStr && newStr !== '') {
            return `${field}: "${existingStr}" → "${newStr}"`;
        }
        return null;
    };

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNum = i + 2; // Excel row number (1-indexed + header row)

        try {
            // Validate required fields
            const name = row['Tên xe'];
            const brandName = row['Hãng xe'];
            const carTypeName = row['Loại xe'];
            const price = row['Giá'];

            if (!name) {
                results.errors.push(`Dòng ${rowNum}: Thiếu tên xe`);
                results.failed++;
                continue;
            }

            if (!brandName) {
                results.errors.push(`Dòng ${rowNum}: Thiếu hãng xe`);
                results.failed++;
                continue;
            }

            if (!carTypeName) {
                results.errors.push(`Dòng ${rowNum}: Thiếu loại xe`);
                results.failed++;
                continue;
            }

            if (!price || isNaN(Number(price))) {
                results.errors.push(`Dòng ${rowNum}: Giá không hợp lệ`);
                results.failed++;
                continue;
            }

            // Find brand and car type IDs
            const brandId = brandMap.get(String(brandName).toLowerCase());
            const carTypeId = carTypeMap.get(String(carTypeName).toLowerCase());

            if (!brandId) {
                results.errors.push(`Dòng ${rowNum}: Hãng xe "${brandName}" không tồn tại`);
                results.failed++;
                continue;
            }

            if (!carTypeId) {
                results.errors.push(`Dòng ${rowNum}: Loại xe "${carTypeName}" không tồn tại`);
                results.failed++;
                continue;
            }

            // Check if car already exists
            const existingCar = existingCarsByName.get(String(name).toLowerCase());

            if (existingCar) {
                // Compare key fields to detect differences
                const differences: string[] = [];

                if (Number(existingCar.price) !== Number(price)) {
                    differences.push(`Giá: ${existingCar.price.toLocaleString()} → ${Number(price).toLocaleString()}`);
                }

                const yearDiff = compareValues(existingCar.year, row['Năm'], 'Năm');
                if (yearDiff) differences.push(yearDiff);

                const priceDiff = compareValues(existingCar.priceRange, row['Khoảng giá'], 'Khoảng giá');
                if (priceDiff) differences.push(priceDiff);

                const descDiff = compareValues(existingCar.shortDescription, row['Mô tả ngắn'], 'Mô tả ngắn');
                if (descDiff) differences.push(descDiff);

                const engineDiff = compareValues(existingCar.specs?.engine, row['Động cơ'], 'Động cơ');
                if (engineDiff) differences.push(engineDiff);

                const powerDiff = compareValues(existingCar.specs?.power, row['Công suất'], 'Công suất');
                if (powerDiff) differences.push(powerDiff);

                if (differences.length > 0) {
                    // Car exists but has different data - warn but don't update
                    results.warnings.push(`⚠️ Dòng ${rowNum} "${name}": Đã có nhưng khác:\n   - ${differences.join('\n   - ')}`);
                    results.conflicts++;
                } else {
                    // Car exists and is identical - skip silently
                    results.skipped++;
                }
                continue;
            }

            // Parse color options if provided
            let colorOptions: { name: string; hexCode: string; image?: string }[] = [];
            const colorJson = row['Màu sắc (JSON)'];
            if (colorJson) {
                try {
                    colorOptions = JSON.parse(colorJson);
                } catch {
                    // Ignore invalid JSON
                }
            }

            // Parse comma-separated URLs
            const parseUrls = (value: string | undefined): string[] => {
                if (!value) return [];
                return String(value).split(',').map(url => url.trim()).filter(Boolean);
            };

            // Create car object
            const carData = {
                name: String(name),
                brand: brandId,
                carType: carTypeId,
                price: Number(price),
                priceRange: row['Khoảng giá'] ? String(row['Khoảng giá']) : undefined,
                year: row['Năm'] ? Number(row['Năm']) : undefined,
                isFeatured: String(row['Xe nổi bật']).toUpperCase() === 'TRUE',
                status: row['Trạng thái'] === 'published' ? 'published' : 'draft',
                shortDescription: row['Mô tả ngắn'] ? String(row['Mô tả ngắn']) : undefined,
                description: row['Mô tả chi tiết'] ? String(row['Mô tả chi tiết']) : undefined,
                specs: {
                    engine: row['Động cơ'] ? String(row['Động cơ']) : undefined,
                    power: row['Công suất'] ? String(row['Công suất']) : undefined,
                    torque: row['Mô-men xoắn'] ? String(row['Mô-men xoắn']) : undefined,
                    acceleration: row['Tăng tốc 0-100'] ? String(row['Tăng tốc 0-100']) : undefined,
                    topSpeed: row['Tốc độ tối đa'] ? String(row['Tốc độ tối đa']) : undefined,
                    seats: row['Số ghế'] ? Number(row['Số ghế']) : undefined,
                },
                thumbnail: row['Thumbnail'] ? String(row['Thumbnail']) : undefined,
                gallery: parseUrls(row['Gallery']),
                exterior: {
                    description: row['Ngoại thất - Mô tả'] ? String(row['Ngoại thất - Mô tả']) : undefined,
                    images: parseUrls(row['Ngoại thất - Ảnh']),
                },
                interior: {
                    description: row['Nội thất - Mô tả'] ? String(row['Nội thất - Mô tả']) : undefined,
                    images: parseUrls(row['Nội thất - Ảnh']),
                },
                colorOptions,
            };

            await Car.create(carData);
            results.success++;
        } catch (error: any) {
            results.errors.push(`Dòng ${rowNum}: ${error.message || 'Lỗi không xác định'}`);
            results.failed++;
        }
    }

    // Build summary message
    let message = `Import: ${results.success} thêm mới`;
    if (results.skipped > 0) message += `, ${results.skipped} bỏ qua (trùng)`;
    if (results.conflicts > 0) message += `, ${results.conflicts} xe có khác biệt`;
    if (results.failed > 0) message += `, ${results.failed} lỗi`;

    res.status(200).json({
        success: true,
        data: results,
        message,
    });
});
