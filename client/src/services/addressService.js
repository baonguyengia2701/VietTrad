// Service để xử lý dữ liệu địa chỉ Việt Nam
const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Cache để tránh gọi API nhiều lần
const cache = {
  provinces: null,
  districts: {},
  wards: {}
};

export const addressService = {
  // Lấy danh sách tỉnh thành
  async getProvinces() {
    try {
      if (cache.provinces) {
        return cache.provinces;
      }

      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách tỉnh thành');
      }

      const data = await response.json();
      cache.provinces = data.map(province => ({
        code: province.code,
        name: province.name,
        nameWithType: province.name,
        type: province.division_type
      }));

      return cache.provinces;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback data nếu API không hoạt động
      return [
        { code: 1, name: 'Hà Nội', nameWithType: 'Thành phố Hà Nội' },
        { code: 79, name: 'TP.Hồ Chí Minh', nameWithType: 'Thành phố Hồ Chí Minh' },
        { code: 48, name: 'Đà Nẵng', nameWithType: 'Thành phố Đà Nẵng' },
        { code: 31, name: 'Hải Phòng', nameWithType: 'Thành phố Hải Phòng' },
        { code: 92, name: 'Cần Thơ', nameWithType: 'Thành phố Cần Thơ' }
      ];
    }
  },

  // Lấy danh sách quận huyện theo tỉnh
  async getDistrictsByProvince(provinceCode) {
    try {
      if (!provinceCode) return [];

      // Kiểm tra cache
      if (cache.districts[provinceCode]) {
        return cache.districts[provinceCode];
      }

      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách quận huyện');
      }

      const data = await response.json();
      const districts = data.districts?.map(district => ({
        code: district.code,
        name: district.name,
        nameWithType: district.name,
        type: district.division_type,
        provinceCode: district.province_code
      })) || [];

      cache.districts[provinceCode] = districts;
      return districts;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  },

  // Lấy danh sách phường xã theo quận huyện
  async getWardsByDistrict(districtCode) {
    try {
      if (!districtCode) return [];

      // Kiểm tra cache
      if (cache.wards[districtCode]) {
        return cache.wards[districtCode];
      }

      const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách phường xã');
      }

      const data = await response.json();
      const wards = data.wards?.map(ward => ({
        code: ward.code,
        name: ward.name,
        nameWithType: ward.name,
        type: ward.division_type,
        districtCode: ward.district_code
      })) || [];

      cache.wards[districtCode] = wards;
      return wards;
    } catch (error) {
      console.error('Error fetching wards:', error);
      return [];
    }
  },

  // Tìm kiếm địa chỉ
  async searchLocation(query, type = 'all') {
    try {
      if (!query || query.length < 2) return [];

      const response = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Không thể tìm kiếm địa chỉ');
      }

      const data = await response.json();
      return data.map(item => ({
        code: item.code,
        name: item.name,
        nameWithType: item.name,
        type: item.type || 'unknown'
      }));
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    }
  },

  // Clear cache
  clearCache() {
    cache.provinces = null;
    cache.districts = {};
    cache.wards = {};
  }
};

export default addressService; 