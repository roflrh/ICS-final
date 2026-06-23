const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. 다운로드 대상 이미지 매핑 (신규 정교화 이미지 리스트)
const images = [
  { name: 'samgyeopsal.jpg', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60' },
  { name: 'pork_ribs.jpg', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=60' },
  { name: 'stew.jpg', url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&auto=format&fit=crop&q=60' },
  { name: 'pasta.jpg', url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&auto=format&fit=crop&q=60' },
  { name: 'basil_pasta.jpg', url: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=800&auto=format&fit=crop&q=60' },
  { name: 'pizza.jpg', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60' },
  { name: 'noodle.jpg', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=60' },
  { name: 'thai_noodle.jpg', url: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?w=800&auto=format&fit=crop&q=60' },
  { name: 'curry.jpg', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&auto=format&fit=crop&q=60' },
  { name: 'tonkatsu.jpg', url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=60' },
  { name: 'dumpling.jpg', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=60' },
  { name: 'burger.jpg', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60' },
  { name: 'chicken.jpg', url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=60' },
  { name: 'sushi.jpg', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60' },
  { name: 'brunch.jpg', url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&auto=format&fit=crop&q=60' },
  { name: 'french_fries.jpg', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop&q=60' },
  { name: 'default_food.jpg', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=60' },
  
  // 2. 추가 피드백 세부 분류 이미지
  { name: 'roast_chicken.jpg', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=60' },
  { name: 'salad.jpg', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60' },
  { name: 'maratang.jpg', url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=60' },
  { name: 'marashangyo.jpg', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=60' },
  { name: 'gguobarou.jpg', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&auto=format&fit=crop&q=60' },
  { name: 'sashimi.jpg', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop&q=60' },
  { name: 'vietnamese_pho.jpg', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=60' },
  { name: 'poo_phat_pong_curry.jpg', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=60' },
  { name: 'egg_benedict.jpg', url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&auto=format&fit=crop&q=60' },
  { name: 'american_breakfast.jpg', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=60' },
  { name: 'kimchijjim.jpg', url: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&auto=format&fit=crop&q=60' }
];

const targetDir = path.join(__dirname, '..', 'public', 'images', 'default');

// 2. 디렉토리 생성
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Directory created at: ${targetDir}`);
}

// 3. 파일 다운로드 유틸리티 함수
function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, filePath).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${res.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => reject(err));
      });
    }).on('error', reject);
  });
}

// 4. 순차 실행
async function run() {
  console.log(`Starting download of ${images.length} high-quality local food assets...`);
  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const dest = path.join(targetDir, item.name);
    
    // 이미 존재하는 파일은 건너뜀 (다운로드 부하 경감)
    if (fs.existsSync(dest)) {
      console.log(`[${i + 1}/${images.length}] Skip: ${item.name} already exists`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${images.length}] Downloading ${item.name}...`);
      await download(item.url, dest);
      console.log(`[${i + 1}/${images.length}] Successfully saved to ${item.name}`);
    } catch (err) {
      console.error(`🚨 Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All downloads finished.');
}

run();
