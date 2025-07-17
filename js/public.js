// public.js
import { db } from './firebaseConfig.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where, // ✅ where をインポート
  Timestamp // ✅ Timestamp をインポート
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const container = document.getElementById('topicsContainer');

function createTopicCard(id, title, deadline) {
  const card = document.createElement('a');
  card.href = `topic.html?id=${id}`;
  card.className = 'topic-card';

  card.innerHTML = `
    <div class="topic-title">${title}</div>
    <div class="topic-deadline">募集期限: ${deadline}</div>
  `;

  return card;
}

async function loadTopics() {
  // ✅ 現在時刻以降の期限を持つ話題のみを取得するクエリに変更
  const q = query(
    collection(db, 'topics'),
    where('deadline', '>=', Timestamp.now()), // 締め切りが現在時刻以降のもの
    orderBy('deadline', 'asc') // 締め切りが近い順に並び替え
  );

  const querySnapshot = await getDocs(q);
  container.innerHTML = '';

  if (querySnapshot.empty) {
    container.innerHTML = '<p class="no-topics">現在募集中の話題はありません。</p>';
    return;
  }

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    const title = data.title;
    const deadline = data.deadline.toDate().toLocaleDateString("ja-JP");

    const card = createTopicCard(id, title, deadline);
    container.appendChild(card);
  });
}

// 初期ロード
if (container) {
  loadTopics();
}
