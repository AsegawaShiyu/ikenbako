// localStorageとのデータやり取りを管理するモジュール
import { db } from './firebaseConfig.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

export async function loadTopics() {
  const querySnapshot = await getDocs(collection(db, "topics"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- Topics関連 ---
/**
 * 全ての話題を取得する
 * @returns {Array} 話題の配列
 */
function getAllTopics() {
    return JSON.parse(localStorage.getItem("topics") || "[]");
}

/**
 * 話題の配列を保存する
 * @param {Array} topics - 保存する話題の配列
 */
function saveAllTopics(topics) {
    localStorage.setItem("topics", JSON.stringify(topics));
}

/**
 * 特定のIDの話題を取得する
 * @param {string} topicId - 話題のID
 * @returns {Object|undefined} 該当する話題オブジェクト、またはundefined
 */
function getTopicById(topicId) {
    const topics = getAllTopics();
    return topics.find(t => t.id === topicId);
}

/**
 * 特定の話題を更新する
 * @param {string} topicId - 更新する話題のID
 * @param {Object} updatedTopicData - 更新データ
 */
function updateTopic(topicId, updatedTopicData) {
    let topics = getAllTopics();
    const index = topics.findIndex(t => t.id === topicId);
    if (index !== -1) {
        topics[index] = { ...topics[index], ...updatedTopicData };
        saveAllTopics(topics);
    }
}

/**
 * 特定の話題を削除する
 * @param {string} topicId - 削除する話題のID
 */
function removeTopic(topicId) {
    let topics = getAllTopics();
    topics = topics.filter(t => t.id !== topicId);
    saveAllTopics(topics);
    // 関連する回答も削除（キー名を `answers_for_topic_` に統一）
    localStorage.removeItem(`answers_for_topic_${topicId}`);
}


// --- Answers関連 ---
/**
 * 特定の話題の全ての回答を取得する
 * @param {string} topicId - 話題のID
 * @returns {Array} 回答の配列
 */
function getAnswersForTopic(topicId) {
    return JSON.parse(localStorage.getItem(`answers_for_topic_${topicId}`) || "[]");
}

/**
 * 特定の話題の回答を保存する
 * @param {string} topicId - 話題のID
 * @param {Array} answers - 保存する回答の配列
 */
function saveAnswersForTopic(topicId, answers) {
    localStorage.setItem(`answers_for_topic_${topicId}`, JSON.stringify(answers));
}

/**
 * 特定の話題に新しい回答を追加する
 * @param {string} topicId - 話題のID
 * @param {Object} answer - 追加する回答オブジェクト
 */
function addAnswerToTopic(topicId, answer) {
    const answers = getAnswersForTopic(topicId);
    answers.push(answer);
    saveAnswersForTopic(topicId, answers);
}

/**
 * 特定の話題から指定されたインデックスの回答を削除する
 * @param {string} topicId - 話題のID
 * @param {number} index - 削除する回答のインデックス
 */
function deleteAnswerAtIndex(topicId, index) {
    let answers = getAnswersForTopic(topicId);
    if (index >= 0 && index < answers.length) {
        answers.splice(index, 1);
        saveAnswersForTopic(topicId, answers);
    }
}
