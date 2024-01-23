const apiKey = "REPLACE_WITH_YOUR_API_KEY";
let currentQuestionIndex = 0;
let userScore = 0;
let questions;
let timer;
let secondsRemaining;
const QUIZ_DURATION = 300; // 5 minutes

const startBtn = document.getElementById("start");
startBtn.addEventListener("click", startQuiz);

function startQuiz() {
  resetQuiz();
  secondsRemaining = QUIZ_DURATION;

  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  const limit = getQuestionLimit(difficulty);

  fetchQuizQuestions(category, difficulty, limit)
    .then(data => {
      questions = data;
      displayQuestion();
      startTimer();
    })
    .catch(error => console.error("Error fetching quiz questions:", error));
}

function resetQuiz() {
  currentQuestionIndex = 0;
  userScore = 0;
}

function fetchQuizQuestions(category, difficulty, limit) {
  const url = `https://quizapi.io/api/v1/questions?apiKey=${apiKey}&category=${category}&difficulty=${difficulty}&limit=${limit}`;

  return fetch(url).then(response => response.json());
}

function displayQuestion() {
  if (currentQuestionIndex < questions.length) {
    const question = questions[currentQuestionIndex];
    const answers = Object.values(question.answers).filter(answer => answer !== null);

    const questionHtml = `
        <h2>Question ${currentQuestionIndex + 1}/${questions.length}</h2>
        <p>${question.question}</p>
        <ul>${answers.map((answer, index) => `<li><label><input type="radio" name="answer" value="${index}">${answer}</label></li>`).join("")}</ul>
        <p>Time remaining: <span id="timer">${formatTime(secondsRemaining)}</span></p>
        <button onclick="checkAnswer()">Next Question</button>
      `;

    document.getElementById("question").innerHTML = questionHtml;
    updateTimerDisplay();
  } else {
    showResults();
    clearInterval(timer);
  }
}

function checkAnswer() {
  const selectedAnswer = document.querySelector(`input[name="answer"]:checked`);

  if (selectedAnswer) {
    const selectedAnswerIndex = parseInt(selectedAnswer.value);
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.correct_answers[`answer_${String.fromCharCode(97 + selectedAnswerIndex)}_correct`] === "true") {
      userScore++;
    }

    currentQuestionIndex++;
    displayQuestion();
  }
}

function showResults() {
  const resultHtml = `
      <h2>Quiz Completed!</h2>
      <p>Your Score: ${userScore} / ${questions.length}</p>
      <button onclick="startQuiz()">Restart Quiz</button>
    `;

  document.getElementById("question").innerHTML = resultHtml;
}

function getQuestionLimit(difficulty) {
  return { "easy": 10, "medium": 15, "hard": 20 } [difficulty] || 10;
}

function startTimer() {
  timer = setInterval(() => {
    secondsRemaining--;

    if (secondsRemaining <= 0) {
      clearInterval(timer);
      showResults();
    }

    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  document.getElementById("timer").textContent = formatTime(secondsRemaining);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formatMinutes = minutes > 0 ? `${minutes} minute${minutes !== 1 ? "s" : ""}` : "";
  const formatSeconds = remainingSeconds > 0 ? `${remainingSeconds} second${remainingSeconds !== 1 ? "s" : ""}` : "";

  return `${formatMinutes}${formatMinutes && formatSeconds ? " " : ""}${formatSeconds}`;
}