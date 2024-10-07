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
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    const fileNumber = getNextFileNumber();
    const fileExtension = path.extname(file.originalname);
    console.log(file.originalname);
    cb(null, `file-${fileNumber}${fileExtension}`);
  }
});

const upload = multer({ storage: storage });

// 정적 파일 제공 (public 폴더 내의 HTML, CSS, JS 등)
app.use(express.static('public'));

// 업로드된 파일을 정적으로 제공
app.use('/uploads', express.static('uploads'));

// 파일 업로드 처리
app.post('/gallery', upload.array('image'), (req, res) => {
  const filePaths = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ filePaths: filePaths });
});

// 업로드된 파일 목록을 제공하는 API
app.get('/uploaded-images', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Error reading uploaded files.');
    }
    const fileUrls = files.map(file => `/uploads/${file}`);
    res.json({ fileUrls: fileUrls });
  });
});

// 서버 실행
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

