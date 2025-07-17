// topic.js（送信処理を含む）
import { db } from './firebaseConfig.js';
import {
  doc,
  collection,
  addDoc,
  getDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const params = new URLSearchParams(window.location.search);
const topicId = params.get('id');

const topicTitle = document.getElementById('topicTitle');
const topicDeadline = document.getElementById('topicDeadline');
const answerForm = document.getElementById('answerForm');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const answersSection = document.getElementById('answers');
const answerList = document.getElementById('answerList');

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

answerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = usernameInput.value.trim() || '匿名';
  const message = messageInput.value.trim();

  if (!message) {
    alert('意見を入力してください');
    return;
  }

  const answerRef = collection(doc(db, 'topics', topicId), 'answers');

  try {
    const docRef = await addDoc(answerRef, {
      name,
      message,
      createdAt: Timestamp.fromDate(new Date())
    });
    console.log('保存成功:', docRef.id);
    usernameInput.value = '';
    messageInput.value = '';
    alert('送信されました');
  } catch (error) {
    console.error('保存エラー:', error.message);
    alert('送信に失敗しました: ' + error.message);
  }
});

loadTopic();
