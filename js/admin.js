// admin.js
import { db } from './firebaseConfig.js';
import { logout, isLoggedInFirebase, listenForAuthChanges } from './auth.js'; // ★auth.jsからインポート★
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    Timestamp,
    deleteDoc,
    doc,
    getCountFromServer,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

// DOM要素取得
const titleInput = document.getElementById('newTopicTitle');
const deadlineInput = document.getElementById('newTopicDeadline');
const addButton = document.querySelector('.topic-create button');
const filterInput = document.getElementById('filterKeyword');
const topicsContainer = document.getElementById('topicsContainer');
const logoutBtn = document.querySelector(".logout-btn"); // ★ログアウトボタンを取得★

// ページロード時の認証状態チェックと初期化
document.addEventListener("DOMContentLoaded", async () => {
    // Firebaseの認証状態を監視し、ログインしていなければログインページへリダイレクト
    listenForAuthChanges((user) => {
        if (!user) {
            alert("ログインが必要です。");
            window.location.href = "login.html"; // 未ログインならログインページへ
        } else {
            // ログイン済みなら話題をロード
            loadTopics();
        }
    });

    // ★ログアウトボタンにイベントリスナーを設定★
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout); // auth.jsからインポートしたlogout関数を呼び出す
    } else {
        console.error("ログアウトボタンが見つかりません。");
    }

    // 話題作成ボタンのイベントリスナー（既存）
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

        loadTopics();
    });

    // フィルタリング入力のイベントリスナー（既存）
    filterInput.addEventListener('input', loadTopics);
});


// 話題一覧読み込み (既存)
// admin.js の loadTopics 関数を、以下の内容にすべて置き換える
async function loadTopics() {
    const q = query(collection(db, 'topics'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const filter = filterInput.value.trim().toLowerCase();

    topicsContainer.innerHTML = '<em>読み込み中...</em>';

    // ✅ 各トピックのデータ取得と回答数取得を並行処理するための準備
    const topicPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const title = data.title;

        // フィルタリングに一致しない場合はnullを返す
        if (filter && !title.toLowerCase().includes(filter)) {
            return null;
        }

        // 回答数を取得
        const answersRef = collection(db, 'topics', docSnap.id, 'answers');
        const countSnapshot = await getCountFromServer(answersRef);
        
        // 必要な情報をオブジェクトとして返す
        return {
            id: docSnap.id,
            title: title,
            deadline: data.deadline.toDate().toLocaleDateString("ja-JP"),
            answerCount: countSnapshot.data().count
        };
    });

    // ✅ Promise.allですべてのデータ取得処理が完了するのを待つ
    const topicsWithData = (await Promise.all(topicPromises)).filter(Boolean); // nullを取り除く

    if (topicsWithData.length === 0) {
        topicsContainer.innerHTML = filter ? '<p class="no-topics">該当する話題がありません。</p>' : '<p class="no-topics">まだ話題がありません。</p>';
        return;
    }
    
    // ✅ 取得したデータからHTMLを構築
    const displayedTopicsHTML = topicsWithData.map(topic => `
        <div class="topic-item">
            <div class="topic-info">
                <strong>${topic.title}</strong><br>
                募集期限: ${topic.deadline}
            </div>
            <div class="topic-answer-count">
                回答: ${topic.answerCount}件
            </div>
            <div class="topic-actions">
                <button data-id="${topic.id}" class="small-btn delete-btn">削除</button>
                <button data-id="${topic.id}" class="small-btn view-answers-btn">回答を見る</button>
            </div>
            <div class="answers-container" id="answers-${topic.id}" style="display:none;"></div>
        </div>
    `).join('');

    topicsContainer.innerHTML = displayedTopicsHTML;

    // --- イベントリスナーの再設定（この部分は変更なし） ---
    // 削除ボタン
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            if (confirm('この話題を削除しますか？')) {
                await deleteDoc(doc(db, 'topics', id));
                loadTopics();
            }
        });
    });
    // 回答を見るボタン（この中のロジックも変更なし）
    document.querySelectorAll('.view-answers-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const topicId = btn.dataset.id;
            const answersDiv = document.getElementById(`answers-${topicId}`);
    
            if (answersDiv.style.display === 'block') {
                answersDiv.style.display = 'none';
                answersDiv.innerHTML = '';
                return;
            }
    
            answersDiv.style.display = 'block';
            answersDiv.innerHTML = '<em>回答を読み込み中...</em>';
            
            const answerRef = collection(db, 'topics', topicId, 'answers');
            const answersSnap = await getDocs(query(answerRef, orderBy('createdAt', 'asc')));
    
            if (answersSnap.empty) {
                answersDiv.innerHTML = '<p>まだ投稿がありません。</p>';
                return;
            }
    
            let html = '<ul style="list-style: none; padding: 0;">';
            answersSnap.forEach(answerDoc => {
                const a = answerDoc.data();
                const timestamp = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().toLocaleString("ja-JP") : '日時不明';
                
                const isRead = a.isRead || false;
                html += `
                    <li class="answer-item ${isRead ? 'is-read' : ''}" data-answer-id="${answerDoc.id}">
                        <div class="answer-content">
                            <div class="answer-meta">${a.name || '匿名'} (${timestamp})</div>
                            <div class="answer-message">${a.message}</div>
                        </div>
                        <div class="answer-actions">
                            ${!isRead ? `<button class="mark-as-read-btn small-btn">既読にする</button>` : `<span class="read-status">既読</span>`}
                        </div>
                    </li>`;
            });
            html += '</ul>';
            answersDiv.innerHTML = html;
    
            answersDiv.querySelectorAll('.mark-as-read-btn').forEach(readBtn => {
                readBtn.addEventListener('click', async (event) => {
                    const answerItem = event.target.closest('.answer-item');
                    const answerId = answerItem.dataset.answerId;
    
                    const specificAnswerRef = doc(db, 'topics', topicId, 'answers', answerId);
                    await updateDoc(specificAnswerRef, {
                        isRead: true
                    });
    
                    answerItem.classList.add('is-read');
                    event.target.outerHTML = '<span class="read-status">既読</span>';
                });
            });
        });
    });
}
// 初期ロードはDOMContentLoadedイベント内でlistenForAuthChangesが呼び出す
// loadTopics(); // この行はDOMContentLoadedの外では不要になる
