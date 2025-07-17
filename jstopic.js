import { db } from './firebaseConfig.js';
import {
  doc,
  collection,
  addDoc,
  getDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// URLクエリから話題IDを取得
const params = new URLSearchParams(window.location.search);
const topicId = params.get('id');

const topicTitle = document.getElementById('topicTitle');
const topicDeadline = document.getElementById('topicDeadline');
const answerForm = document.getElementById('answerForm');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const answersSection = document.getElementById('answers');
const answerList = document.getElementById('answerList');

// 話題の情報を取得
async function loadTopic() {
  if (!topicId) {
    alert('話題IDが指定されていません');
    return;
  }

  const topicRef = doc(db, 'topics', topicId);
  const topicSnap = await getDoc(topicRef);

  if (!topicSnap.exists()) {
    topicTitle.textContent = 'この話題は存在しません';
    return;
  }

  const data = topicSnap.data();
  topicTitle.textContent = data.title;
  topicDeadline.textContent = '募集期限: ' + data.deadline.toDate().toLocaleDateString("ja-JP");

  const now = new Date();
  if (data.deadline.toDate() < now) {
    answerForm.style.display = 'none';
    topicDeadline.textContent += '（募集終了）';
  }
}

// フォーム送信処理
answerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = usernameInput.value.trim() || '匿名';
  const message = messageInput.value.trim();

  if (!message) {
    alert('意見を入力してください');
    return;
  }

  const answerRef = collection(doc(db, 'topics', topicId), 'answers');
  await addDoc(answerRef, {
    name,
    message,
    createdAt: Timestamp.fromDate(new Date())
  });

  // 投稿後、フィールドを空にして表示更新
  usernameInput.value = '';
  messageInput.value = '';
  alert('送信されました');
});

loadTopic();
