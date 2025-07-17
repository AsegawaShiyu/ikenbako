// 認証関連のロジック

const ADMIN_USERS = [
    { username: "admin", password: "iken2025" },
    // 必要に応じてユーザー追加可
];

const MAX_LOGIN_ATTEMPTS = 5;
let attemptCount = 0;

/**
 * ログイン処理
 */
function login() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("error");

    const uname = usernameInput.value.trim();
    const pw = passwordInput.value;

    const matchedUser = ADMIN_USERS.find(user => user.username === uname && user.password === pw);

    if (matchedUser) {
        localStorage.setItem("loggedIn", "true");
        errorBox.textContent = "";
        window.location.href = "admin.html";
    } else {
        attemptCount++;
        errorBox.textContent = "ユーザー名またはパスワードが間違っています。";
        if (attemptCount >= MAX_LOGIN_ATTEMPTS) {
            errorBox.textContent = "ログイン試行が多すぎます。しばらくしてから再試行してください。";
            document.querySelector("button").disabled = true; // ボタンを無効化
        }
    }
}

/**
 * ログアウト処理
 */
function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html"; // トップページへリダイレクト
}

/**
 * ログイン状態をチェックする
 * @returns {boolean} ログインしていればtrue、そうでなければfalse
 */
function isLoggedIn() {
    return localStorage.getItem("loggedIn") === "true";
}
