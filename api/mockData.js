// 控制是否使用模拟数据的标志
export const USE_MOCK_DATA = true;

// 深圳市区域和街道数据
const shenzhenDistricts = [
  {
    name: "福田区",
    streets: ["福田街道", "南园街道", "园岭街道", "沙头街道", "香蜜湖街道", "莲花街道", "华富街道", "福保街道", "梅林街道", "华强北街道"]
  },
  {
    name: "罗湖区",
    streets: ["桂园街道", "黄贝街道", "东晓街道", "翠竹街道", "南湖街道", "笋岗街道", "东门街道", "莲塘街道", "清水河街道"]
  },
  {
    name: "南山区",
    streets: ["南山街道", "沙河街道", "蛇口街道", "招商街道", "粤海街道", "桃源街道", "西丽街道"]
  },
  {
    name: "宝安区",
    streets: ["新安街道", "西乡街道", "福永街道", "沙井街道", "松岗街道", "石岩街道"]
  },
  {
    name: "龙岗区",
    streets: ["平湖街道", "坂田街道", "布吉街道", "南湾街道", "横岗街道", "龙城街道", "龙岗街道", "坪地街道", "园山街道"]
  },
  {
    name: "龙华区",
    streets: ["观湖街道", "民治街道", "龙华街道", "大浪街道", "福城街道", "观澜街道"]
  }
];

// 辅助函数
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

// 生成深圳地区模拟数据
const generateMockData = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const district = randomElement(shenzhenDistricts);
    const street = randomElement(district.streets);
    return {
      id: index + 1,
      name: `深圳${district.name}${street}核酸检测点${index + 1}`,
      areaName: district.name,
      streetName: street,
      communityName: `${street}${randomInt(1, 10)}社区`,
      address: `${district.name}${street}${randomInt(1, 100)}号`,
      latitude: randomFloat(22.4, 22.8, 6),
      longitude: randomFloat(113.8, 114.5, 6),
      status: randomInt(1, 4),
      workerNumber: randomInt(1, 30),
      serverTime: `${randomInt(6, 9)}:00-${randomInt(18, 22)}:00`,
      serverPeople: randomElement(["所有市民", "园区员工", "居民"]),
      serverPeopleInt: randomInt(1, 3),
      distance: randomFloat(100, 10000, 2)
    };
  });
};

export const mockData = {
  checkpointList: generateMockData(1000), // 生成1000条数据
  noticeList: [
    {
      id: 1,
      title: "深圳市核酸检测通知",
      content: "为防控疫情，请深圳市民积极配合核酸检测工作。"
    },
    {
      id: 2,
      title: "检测时间调整",
      content: "自7月1日起，深圳市所有核酸检测点的服务时间延长至22:00。"
    },
    {
      id: 3,
      title: "新检测点开放",
      content: "福田区新增5个核酸检测点，请市民就近选择。"
    }
  ]
};

// 模拟API调用，支持分页和搜索
export const mockApi = (url, params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url.includes('/checkpoint/list')) {
        const { page = 1, pageSize = 10, checkpointName = '' } = params;
        let filteredData = mockData.checkpointList.filter(item => 
          item.name.toLowerCase().includes(checkpointName.toLowerCase()) ||
          item.areaName.includes(checkpointName) ||
          item.streetName.includes(checkpointName)
        );
        const total = filteredData.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        filteredData = filteredData.slice(start, end);

        resolve({
          code: 0,
          message: "success",
          data: filteredData,
          total,
          page,
          pageSize
        });
      } else if (url.includes('/tip/list')) {
        resolve({
          code: 0,
          message: "success",
          data: mockData.noticeList
        });
      } else {
        resolve({
          code: -1,
          message: "未知的API",
          data: null
        });
      }
    }, 300); // 模拟网络延迟
  });
};