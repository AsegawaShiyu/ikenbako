// js/auth.js
// Firebase Authentication のインポート
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { app } from './firebaseConfig.js'; // firebaseConfig.jsからFirebaseアプリのインスタンスをインポート

const auth = getAuth(app); // Firebase Authサービスを初期化

/**
 * ユーザー名（メールアドレス）とパスワードでログインする
 * @param {string} email - ユーザーのメールアドレス
 * @param {string} password - ユーザーのパスワード
 * @returns {Promise<UserCredential>} ログイン成功時のPromise
 */
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("ログイン成功:", userCredential.user);
        // localStorageにログイン状態を保存する必要がなければ削除可
        localStorage.setItem("loggedIn", "true"); // LocalStorageはFirebaseとは独立した認証フローを想定する場合
        return userCredential;
    } catch (error) {
        console.error("ログインエラー:", error.code, error.message);
        localStorage.removeItem("loggedIn"); // エラー時は削除
        throw error; // エラーを呼び出し元に伝える
    }
}

/**
 * 現在のユーザーをログアウトさせる
 * @returns {Promise<void>} ログアウト成功時のPromise
 */
export async function logout() {
    try {
        await signOut(auth);
        console.log("ログアウト成功");
        localStorage.removeItem("loggedIn"); // LocalStorageのログイン状態を削除
        window.location.href = "index.html"; // ログアウト後、トップページへリダイレクト
    } catch (error) {
        console.error("ログアウトエラー:", error.code, error.message);
        alert("ログアウト中にエラーが発生しました。");
    }
}

/**
 * 現在の認証状態を監視する（ページロード時などに使用）
 * @param {Function} callback - 認証状態が変更されたときに呼び出される関数 (userオブジェクトを引数にとる)
 */
export function listenForAuthChanges(callback) {
    onAuthStateChanged(auth, callback);
}

/**
 * ユーザーがログインしているかチェック（Firebaseの認証状態をベースにする）
 * @returns {Promise<boolean>} ログインしていればtrue
 */
export function isLoggedInFirebase() {
    return new Promise(resolve => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // 一度だけチェックしたら監視を解除
            resolve(!!user); // userオブジェクトがあればtrue
        });
    });
}
