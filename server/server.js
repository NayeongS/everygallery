const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();

// 업로드된 파일 개수에 따라 파일 이름 지정
function getNextFileNumber() {
  const files = fs.readdirSync('./uploads');
  return files.length + 1; // 파일 개수에 1을 더해 다음 번호 할당
}

// Multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // 업로드된 파일이 저장될 경로
  },
  filename: function (req, file, cb) {
    const fileNumber = getNextFileNumber();
    const fileExtension = path.extname(file.originalname);
    cb(null, `file-${fileNumber}${fileExtension}`); // 파일 이름 형식
  }
});

const upload = multer({ storage: storage });
const jsonPath = path.join(__dirname, '..', 'img.json'); // img.json 파일 경로

app.use(express.json());
// 업로드된 파일을 정적으로 제공
app.use('/uploads', express.static('uploads'));

// 정적 파일 제공 (frontend/public 폴더 내의 HTML, CSS, JS 등)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 기본 경로로 index.html 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// 갤러리로 이미지 업로드 처리
app.post('/gallery', upload.array('image'), (req, res) => {
  const filePaths = req.files.map(file => `/uploads/${file.filename}`);

  // 새 img.json 항목 생성
  const newEntries = req.files.map(file => ({
    id: file.filename,
    title: `Title for ${file.filename}`, // 기본 제목 추가
    author: `Author for ${file.filename}`, // 기본 작가 이름 추가
    description: `Description for ${file.filename}` // 기본 설명 추가
  }));

  // img.json 파일 업데이트
  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // img.json 파일이 없으면 기본 구조로 생성
        const defaultData = { images: [] };
        fs.writeFile(jsonPath, JSON.stringify(defaultData, null, 2), 'utf8', (err) => {
          if (err) {
            console.error('Error creating img.json:', err);
            return res.status(500).send('Error creating img.json');
          }
          console.log('img.json created successfully.');
          const jsonData = defaultData;
          jsonData.images = [...jsonData.images, ...newEntries]; // 새 항목 추가

          fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
              return res.status(500).send('Error writing to img.json');
            }
            res.json({ filePaths });
          });
        });
      } else {
        console.error('Error reading img.json', err);
        return res.status(500).send('Error reading img.json');
      }
    } else {
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return res.status(500).send('Error parsing img.json');
      }

      jsonData.images = [...jsonData.images, ...newEntries]; // 새 항목 추가

      fs.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
        if (err) {
          return res.status(500).send('Error writing to img.json');
        }
        res.json({ filePaths });
      });
    }
  });
});

// 업로드된 파일 목록을 제공하는 API
app.get('/uploaded-images', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Error reading uploaded files.');
    }
    const fileUrls = files.map(file => `/uploads/${file}`);
    res.json({ fileUrls });
  });
});

// img.json 파일 데이터 제공
app.get('/img.json', (req, res) => {
  res.sendFile(jsonPath);
});

// room.html 파일 제공
app.get('/room.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'room.html'));
});

// 서버 실행
app.listen(3000, () => {
  console.log('Server running on port 3000');
});


