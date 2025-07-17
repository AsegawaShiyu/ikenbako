// js/login.js
import { login } from './auth.js'; // auth.jsからlogin関数をインポート

document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('loginButton');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorBox = document.getElementById('error');

  // ログインボタンにイベントリスナーを設定
  loginButton.addEventListener('click', async () => {
    const email = usernameInput.value.trim();
    const password = passwordInput.value;

    errorBox.textContent = ''; // エラーメッセージをクリア

    if (!email || !password) {
      errorBox.textContent = 'メールアドレスとパスワードを入力してください。';
      return;
    }

    try {
      await login(email, password); // auth.jsのlogin関数を呼び出す
      window.location.href = 'admin.html'; // ログイン成功したら管理ページへリダイレクト
    } catch (error) {
      // Firebaseからのエラーコードに基づいてメッセージを出し分け
      let errorMessage = 'ログインに失敗しました。';
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = '不正なメールアドレス形式です。';
          break;
        case 'auth/user-disabled':
          errorMessage = 'このユーザーは無効化されています。';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'メールアドレスまたはパスワードが間違っています。';
          break;
        case 'auth/too-many-requests':
          errorMessage = '複数回のログイン試行に失敗しました。しばらくしてから再試行してください。';
          break;
        default:
          errorMessage = 'ログイン中に不明なエラーが発生しました。';
          break;
      }
      errorBox.textContent = errorMessage;
      console.error("ログインエラーの詳細:", error.code, error.message);
    }
  });
});
