import { db } from './firebaseConfig.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  deleteDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// DOM要素取得
const titleInput = document.getElementById('newTopicTitle');
const deadlineInput = document.getElementById('newTopicDeadline');
const addButton = document.querySelector('.topic-create button');
const filterInput = document.getElementById('filterKeyword');
const topicsContainer = document.getElementById('topicsContainer');

// 話題作成
addButton.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const deadlineValue = deadlineInput.value;

  if (!title || !deadlineValue) {
    alert('タイトルと募集期限を入力してください。');
    return;
  }

  const deadline = new Date(deadlineValue);
  const createdAt = new Date();

  await addDoc(collection(db, 'topics'), {
    title,
    deadline: Timestamp.fromDate(deadline),
    createdAt: Timestamp.fromDate(createdAt)
  });

  titleInput.value = '';
  deadlineInput.value = '';

  loadTopics(); // 再描画
});

// 話題一覧読み込み
async function loadTopics() {
  const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const filter = filterInput.value.trim().toLowerCase();

  topicsContainer.innerHTML = '';

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const title = data.title;
    const deadline = data.deadline.toDate().toLocaleDateString("ja-JP");

    if (!filter || title.toLowerCase().includes(filter)) {
      const div = document.createElement('div');
      div.classList.add('topic-box');
      div.innerHTML = `
        <strong>${title}</strong><br>
        募集期限: ${deadline}
        <button data-id="${docSnap.id}" class="delete-btn">削除</button>
      `;
      topicsContainer.appendChild(div);
    }
  });

  // 削除ボタンにイベント追加
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm('この話題を削除しますか？')) {
        await deleteDoc(doc(db, 'topics', id));
        loadTopics();
      }
    });
  });
}

// 絞り込み入力
filterInput.addEventListener('input', loadTopics);

// 初期ロード
loadTopics();
