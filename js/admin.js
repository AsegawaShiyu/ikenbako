// 管理画面のJavaScriptロジック

// DOMContentLoadedイベントで初期化処理を実行
document.addEventListener("DOMContentLoaded", () => {
    // ログインチェック
    if (!isLoggedIn()) { // auth.jsから取得
        alert("ログインが必要です");
        location.href = "login.html";
        return;
    }

    // イベントリスナーの設定
    // ログアウトボタン
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout); // auth.jsから取得
    }

    // 話題作成ボタン
    const createTopicBtn = document.querySelector(".topic-create button");
    if (createTopicBtn) {
        createTopicBtn.addEventListener("click", createTopic);
    }

    // 話題絞り込み入力フィールド
    const filterKeywordInput = document.getElementById("filterKeyword");
    if (filterKeywordInput) {
        filterKeywordInput.addEventListener("input", renderTopics);
    }

    // 画面初期表示
    renderTopics();
});

/**
 * 新しい話題を作成する
 */
function createTopic() {
    const titleInput = document.getElementById("newTopicTitle");
    const deadlineInput = document.getElementById("newTopicDeadline");
    const title = titleInput.value.trim();
    const deadline = deadlineInput.value;

    if (!title) {
        alert("タイトルを入力してください");
        return;
    }
    if (!deadline) {
        alert("募集期限を選択してください");
        return;
    }

    const newId = Date.now().toString();
    const topics = getAllTopics(); // data.jsから取得
    topics.push({
        id: newId,
        title: title,
        deadline: deadline,
        viewed: false // 新規作成時は未閲覧
    });
    saveAllTopics(topics); // data.jsを通じて保存

    titleInput.value = "";
    deadlineInput.value = "";
    renderTopics(); // リストを再描画
}

/**
 * 話題の閲覧済み状態を切り替える
 * @param {string} topicId - 話題のID
 * @param {boolean} checked - 閲覧済み状態 (true/false)
 */
function toggleViewed(topicId, checked) {
    const topic = getTopicById(topicId); // data.jsから取得
    if (topic) {
        updateTopic(topicId, { viewed: checked }); // data.jsを通じて更新
    }
}

/**
 * 話題と関連する全ての回答を削除する
 * @param {string} topicId - 削除する話題のID
 */
function deleteTopic(topicId) {
    if (!confirm("この話題と関連するすべての意見を削除しますか？")) return;
    removeTopic(topicId); // data.jsを通じて削除
    renderTopics(); // リストを再描画
}

/**
 * 特定の回答を削除する
 * @param {string} topicId - 回答が属する話題のID
 * @param {number} index - 削除する回答のインデックス
 */
function deleteAnswer(topicId, index) {
    if (!confirm("この回答を削除しますか？")) return;
    deleteAnswerAtIndex(topicId, index); // data.jsを通じて削除
    renderTopics(); // 回答リストも更新するために全体を再描画
}

/**
 * 話題のリストを表示する
 */
function renderTopics() {
    const container = document.getElementById("topicsContainer");
    const filter = document.getElementById("filterKeyword").value.trim().toLowerCase();

    container.innerHTML = ""; // コンテンツをクリア

    let topics = getAllTopics(); // data.jsから取得
    let filteredTopics = topics;
    if (filter) {
        filteredTopics = topics.filter(t => t.title.toLowerCase().includes(filter));
    }

    if (filteredTopics.length === 0) {
        container.innerHTML = '<p class="no-topics">該当する話題がありません。</p>';
        return;
    }

    filteredTopics.forEach(topic => {
        const div = document.createElement("div");
        div.className = "topic-item";

        const infoDiv = document.createElement("div");
        infoDiv.className = "topic-info";
        infoDiv.title = "クリックで回答一覧を表示/非表示";
        infoDiv.innerHTML = `<strong>${topic.title}</strong> <small>（締切: ${topic.deadline}）</small> <small>回答数: ${getAnswerCount(topic.id)}</small>`;
        infoDiv.style.userSelect = "none"; // テキスト選択を無効化
        infoDiv.addEventListener("click", () => {
            toggleAnswersVisibility(topic.id);
        });

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "topic-actions";

        const viewedCheckbox = document.createElement("input");
        viewedCheckbox.type = "checkbox";
        viewedCheckbox.checked = topic.viewed || false;
        viewedCheckbox.title = "閲覧済みマーク";
        viewedCheckbox.addEventListener("change", e => {
            toggleViewed(topic.id, e.target.checked);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.className = "small-btn";
        delBtn.addEventListener("click", () => {
            deleteTopic(topic.id);
        });

        actionsDiv.appendChild(viewedCheckbox);
        actionsDiv.appendChild(delBtn);

        div.appendChild(infoDiv);
        div.appendChild(actionsDiv);

        // 回答一覧エリア（最初は非表示）
        const answersDiv = document.createElement("div");
        answersDiv.id = `answers_${topic.id}`; // ユニークなID
        answersDiv.className = "answers-container";
        answersDiv.style.display = "none";

        div.appendChild(answersDiv);

        container.appendChild(div);
    });
}

/**
 * 特定の話題の回答数を取得する
 * @param {string} topicId - 話題のID
 * @returns {number} 回答数
 */
function getAnswerCount(topicId) {
    const answers = getAnswersForTopic(topicId); // data.jsから取得
    return answers.length;
}

/**
 * 特定の話題の回答一覧の表示/非表示を切り替える
 * @param {string} topicId - 話題のID
 */
function toggleAnswersVisibility(topicId) {
    const answersDiv = document.getElementById(`answers_${topicId}`);
    if (!answersDiv) return;

    if (answersDiv.style.display === "block") {
        answersDiv.style.display = "none";
        answersDiv.innerHTML = ""; // 非表示時に内容をクリアしてメモリ解放
    } else {
        renderAnswers(topicId);
        answersDiv.style.display = "block";
    }
}

/**
 * 特定の話題の回答一覧をレンダリングする
 * @param {string} topicId - 話題のID
 */
function renderAnswers(topicId) {
    const answersDiv = document.getElementById(`answers_${topicId}`);
    const answers = getAnswersForTopic(topicId); // data.jsから取得

    if (answers.length === 0) {
        answersDiv.innerHTML = "<p>まだ回答はありません。</p>";
        return;
    }

    answersDiv.innerHTML = "";
    answers.forEach((ans, i) => {
        const ansDiv = document.createElement("div");
        ansDiv.className = "answer-item";

        const metaDiv = document.createElement("div");
        metaDiv.className = "answer-meta";
        metaDiv.textContent = ans.name ? ans.name : "匿名";
        if (ans.timestamp) { // 回答にタイムスタンプがあれば表示
            const date = new Date(ans.timestamp);
            metaDiv.textContent += ` (${date.toLocaleString()})`;
        }

        const msgDiv = document.createElement("div");
        msgDiv.className = "answer-message";
        msgDiv.textContent = ans.message;

        const delBtn = document.createElement("button");
        delBtn.className = "answer-delete-btn";
        delBtn.textContent = "削除";
        delBtn.addEventListener("click", () => {
            deleteAnswer(topicId, i);
        });

        ansDiv.appendChild(delBtn);
        ansDiv.appendChild(metaDiv);
        ansDiv.appendChild(msgDiv);

        answersDiv.appendChild(ansDiv);
    });
}
