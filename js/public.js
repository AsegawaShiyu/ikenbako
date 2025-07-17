// public.js
import { db } from './firebaseConfig.js';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const topicsSection = document.getElementById('topics-list');

async function loadTopics() {
  const now = new Date();
  const topicsRef = collection(db, "topics");
  const q = query(topicsRef, orderBy("deadline", "asc"));
  const querySnapshot = await getDocs(q);

  const topics = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const deadline = data.deadline?.toDate?.() || new Date(0);

    // 締切前の話題のみ
    if (deadline >= now) {
      topics.push({ id: doc.id, ...data });
    }
  });

  renderTopics(topics);
}

function renderTopics(topics) {
  const container = document.createElement('ul');
  container.classList.add('topics-list');

  if (topics.length === 0) {
    topicsSection.innerHTML += `<p>現在、募集中の話題はありません。</p>`;
    return;
  }

  topics.forEach(topic => {
    const li = document.createElement('li');
    const deadlineText = topic.deadline?.toDate?.().toLocaleDateString("ja-JP") || '未設定';
    li.innerHTML = `
      <a href="topic.html?id=${topic.id}">
        <strong>${topic.title}</strong><br>
        募集期限: ${deadlineText}
      </a>
    `;
    container.appendChild(li);
  });

  topicsSection.appendChild(container);
}

loadTopics();
