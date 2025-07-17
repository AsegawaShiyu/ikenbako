// 一般ユーザー向けページのJavaScriptロジック

// DOMContentLoadedイベントで初期化処理を実行
document.addEventListener("DOMContentLoaded", () => {
    // index.htmlのロジック
    const topicsSection = document.getElementById("topics-list");
    if (topicsSection) {
        renderPublicTopics();
    }

    // topic.htmlのロジック
    if (location.pathname.includes("topic.html")) {
        initializeTopicPage();
    }
});

/**
 * トップページに話題リストを表示する
 */
function renderPublicTopics() {
    const topicsSection = document.getElementById("topics-list");
    const topics = getAllTopics(); // data.jsから取得

    topicsSection.innerHTML = '<h2>現在の話題</h2>';
    if (topics.length === 0) {
        topicsSection.innerHTML += '<p>現在、意見募集中の話題はありません。</p>';
        return;
    }

    topics.forEach(t => {
        const card = document.createElement("div");
        card.className = "topic-card";
        card.innerHTML = `<a href="topic.html?tid=${t.id}">${t.title}</a><div>締切: ${t.deadline}</div>`;
        topicsSection.appendChild(card);
    });
}

/**
 * 個別話題ページを初期化し、回答の表示と投稿フォームを処理する
 */
function initializeTopicPage() {
    const urlParams = new URLSearchParams(location.search);
    const topicId = urlParams.get("tid");
    const topic = getTopicById(topicId); // data.jsから取得

    const topicTitleEl = document.getElementById("topicTitle");
    const topicDeadlineEl = document.getElementById("topicDeadline");
    const answerListEl = document.getElementById("answerList");
    const answersSection = document.getElementById("answers");
    const answerForm = document.getElementById("answerForm");

    if (!topic) {
        topicTitleEl.textContent = "話題が見つかりません。";
        if (answerForm) answerForm.style.display = "none";
        if (answersSection) answersSection.style.display = "none";
        return;
    }

    topicTitleEl.textContent = topic.title;
    topicDeadlineEl.textContent = `締切: ${topic.deadline}`;

    // 回答を表示
    function renderAnswers() {
        const answers = getAnswersForTopic(topicId); // data.jsから取得
        answerListEl.innerHTML = "";
        if (answers.length > 0) {
            answersSection.style.display = "block";
            answers.forEach(a => {
                const div = document.createElement("div");
                div.className = "bubble";
                div.innerHTML = `<strong>${a.name ? a.name : "匿名"}</strong><div>${a.message}</div>`;
                answerListEl.appendChild(div);
            });
        } else {
            answersSection.style.display = "none";
        }
    }
    renderAnswers();

    // 回答フォームの送信処理
    answerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const message = document.getElementById("message").value.trim();
        if (!message) {
            alert("意見を入力してください。");
            return;
        }

        const newAnswer = { name: username, message, timestamp: new Date().toISOString() };
        addAnswerToTopic(topicId, newAnswer); // data.jsを通じて追加
        document.getElementById("message").value = ""; // メッセージ入力欄をクリア
        document.getElementById("username").value = ""; // 名前入力欄をクリア
        renderAnswers(); // 回答リストを再描画
    });

    // ポーリングで自動更新（3秒） - 管理画面で回答が削除された場合などに反映
    // ただし、この実装ではtopicオブジェクト自体は更新されないため、
    // 画面ロード時に最新の状態を読み込むことが推奨されます。
    // ポーリングはリアルタイム性を高める場合に有効ですが、シンプルさを優先し、
    // ここでは画面ロード時のみの更新としています。
    // 必要であれば、setIntervalでdata.jsから再度トピックデータを取得し、
    // answersを更新するロジックを追加してください。
    // 例えば、以下のように書けますが、今回はコメントアウトしておきます。
    /*
    setInterval(() => {
        const updatedAnswers = getAnswersForTopic(topicId);
        const currentDisplayedAnswers = Array.from(answerListEl.children).map(el => el.querySelector('div:last-child').textContent); // 現在表示されている回答のテキストを取得
        // 回答の数が違う、または内容が違う場合に再描画
        if (updatedAnswers.length !== currentDisplayedAnswers.length ||
            !updatedAnswers.every((ans, i) => ans.message === currentDisplayedAnswers[i])) {
            renderAnswers();
        }
    }, 3000);
    */
}
