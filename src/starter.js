// starter.js

// 파일 입력 요소와 버튼 요소를 가져옵니다.
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');

// 버튼 클릭 시 실행할 함수
uploadButton.addEventListener('click', () => {
  // 선택된 파일 리스트 가져오기
  const files = fileInput.files;

  // 파일이 선택되지 않았을 경우
  if (files.length === 0) {
    alert('파일을 선택해 주세요!');
    return;
  }

  // 선택된 파일 정보를 출력하거나, 파일 업로드 등의 작업을 진행
  for (const file of files) {
    console.log(`파일 이름: ${file.name}`);
    console.log(`파일 크기: ${file.size} bytes`);
    console.log(`파일 타입: ${file.type}`);
  }

  // 파일이 선택되었을 때 다음 페이지로 이동
  window.location.href = 'room.html';
});

