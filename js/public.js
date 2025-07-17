// public.js
import { db } from './firebaseConfig.js';
import {
  collection,
  getDocs,
  query,
  orderBy
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
  const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  container.innerHTML = '';

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
