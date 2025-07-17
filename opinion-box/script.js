const topics = JSON.parse(localStorage.getItem("topics") || "[]");

// topic作成
const newTopicForm = document.getElementById("newTopicForm");
if (newTopicForm) {
  newTopicForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("topicTitle").value;
    const deadline = document.getElementById("deadline").value;
    const newTopic = {
      id: Date.now().toString(),
      title,
      deadline,
      posts: []
    };
    topics.push(newTopic);
    localStorage.setItem("topics", JSON.stringify(topics));
    location.reload();
  });
}

// topic一覧表示
const topicsDiv = document.getElementById("topics");
if (topicsDiv) {
  topics.forEach(t => {
    const a = document.createElement("a");
    a.href = `topic.html?tid=${t.id}`;
    a.innerText = `${t.title}（締切: ${t.deadline}）`;
    topicsDiv.appendChild(a);
    topicsDiv.appendChild(document.createElement("br"));
  });
}

// 投稿・表示
if (location.pathname.includes("topic.html")) {
  const urlParams = new URLSearchParams(location.search);
  const tid = urlParams.get("tid");
  const topic = topics.find(t => t.id === tid);

  if (!topic) {
    document.body.innerText = "話題が見つかりません";
  } else {
    document.getElementById("topicTitle").innerText = topic.title;
    const postsDiv = document.getElementById("posts");
    const postForm = document.getElementById("postForm");

    // 表示
    const updateView = () => {
      postsDiv.innerHTML = "";
      topic.posts.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${p.name || "匿名"}:</strong><br>${p.content}<hr>`;
        postsDiv.appendChild(div);
      });
    };
    updateView();

    // 投稿
    postForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const content = document.getElementById("content").value;
      topic.posts.push({ name, content, time: new Date().toISOString() });
      localStorage.setItem("topics", JSON.stringify(topics));
      updateView();
      postForm.reset();
    });

    // ポーリングで自動更新（3秒）
    setInterval(() => {
      const updated = JSON.parse(localStorage.getItem("topics"));
      const t = updated.find(t => t.id === tid);
      if (t) {
        topic.posts = t.posts;
        updateView();
      }
    }, 3000);
  }
}
