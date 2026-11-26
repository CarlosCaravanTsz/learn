/* Retroalimentación al instante. Una sola respuesta por pregunta:
   el intento es el recuerdo; el texto de abajo dice si acertó. */
const lock = (buttons) => {
  for (const button of buttons) button.disabled = true
}

for (const question of document.querySelectorAll("[data-q]")) {
  const buttons = [...question.querySelectorAll("button")]
  const feedback = question.querySelector(".feedback")
  for (const button of buttons) {
    button.addEventListener("click", () => {
      if (question.dataset.answered === "1") return
      question.dataset.answered = "1"
      const correct = button.dataset.ok === "1"
      button.classList.add(correct ? "is-correct" : "is-wrong")
      const answer = buttons.find((item) => item.dataset.ok === "1")
      if (!correct && answer) answer.classList.add("is-correct")
      lock(buttons)
      if (!feedback) return
      feedback.textContent = correct
        ? "Correcto."
        : `Incorrecto. La respuesta era: ${answer ? answer.textContent : ""}`
    })
  }
}

for (const form of document.querySelectorAll("[data-recall]")) {
  const feedback = form.querySelector(".feedback")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const input = form.querySelector("input")
    if (!input || !feedback) return
    const expected = form.dataset.answer ?? ""
    const got = input.value.trim()
    const correct = got === expected
    feedback.textContent = correct
      ? "Correcto."
      : `Incorrecto. El tag es ${expected}.`
  })
}
