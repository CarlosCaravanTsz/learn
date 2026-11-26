/* quiz.js — widget de quiz reutilizable para las lecciones de Foldkit.
   Uso (desde una lección):
     <div id="quiz"></div>
     <script src="../assets/quiz.js"></script>
     <script>
       FoldkitQuiz.render(document.getElementById('quiz'), [
         {
           prompt: '…',
           answers: [ { text: '…', correct: false }, { text: '…', correct: true } ],
           why: 'Explicación mostrada tras responder.'
         }
       ])
     </script>
   Reglas didácticas que deben cumplir los datos (las impone quien escribe el quiz):
   - respuestas de la misma longitud (palabras/caracteres) para no dar pistas;
   - la posición de la correcta varía entre preguntas.
   El feedback es inmediato: un solo intento por pregunta, con explicación,
   y puntuación final con opción de reintentar.
*/

(function () {
  'use strict'

  function render(container, questions) {
    container.classList.add('quiz')

    questions.forEach(function (q, qi) {
      var fs = document.createElement('fieldset')
      var legend = document.createElement('legend')
      legend.textContent = (qi + 1) + '. ' + q.prompt
      fs.appendChild(legend)

      var inputs = []

      q.answers.forEach(function (a, ai) {
        var label = document.createElement('label')
        var input = document.createElement('input')
        input.type = 'radio'
        input.name = 'q' + qi
        input.value = String(ai)
        label.appendChild(input)
        label.appendChild(document.createTextNode(a.text))
        fs.appendChild(label)
        inputs.push({ input: input, correct: a.correct, label: label })
      })

      var verdict = document.createElement('p')
      verdict.className = 'verdict'
      verdict.style.display = 'none'
      fs.appendChild(verdict)

      var why = document.createElement('p')
      why.className = 'why'
      why.textContent = q.why
      fs.appendChild(why)

      inputs.forEach(function (entry) {
        entry.input.addEventListener('change', function () {
          inputs.forEach(function (e2) {
            e2.label.style.opacity = '1'
          })
          verdict.style.display = 'block'
          why.classList.add('shown')

          if (entry.correct) {
            verdict.textContent = '✔ Correcto.'
            verdict.className = 'verdict ok'
          } else {
            verdict.textContent = '✘ No es esa. Revisa la explicación.'
            verdict.className = 'verdict err'
          }

          // un intento por pregunta: deshabilita el resto
          inputs.forEach(function (e2) { e2.input.disabled = true })
          checkComplete()
        })
      })

      container.appendChild(fs)
    })

    var score = document.createElement('p')
    score.className = 'score'
    container.appendChild(score)

    var retry = document.createElement('button')
    retry.textContent = 'Reintentar'
    retry.style.display = 'none'
    retry.addEventListener('click', function () { render(container, questions) })
    container.appendChild(retry)

    var answeredCount = 0

    function checkComplete() {
      answeredCount++
      if (answeredCount === questions.length) {
        var fieldsets = container.querySelectorAll('fieldset')
        var correctCount = 0
        fieldsets.forEach(function (fs) {
          if (fs.querySelector('.verdict.ok')) correctCount++
        })
        score.textContent =
          'Puntuación: ' + correctCount + ' / ' + questions.length +
          (correctCount === questions.length
            ? ' — impecable.'
            : ' — relee las secciones marcadas e inténtalo de nuevo.')
        retry.style.display = 'inline-block'
      }
    }

    score.textContent = 'Responde todas las preguntas para ver tu puntuación.'
  }

  window.FoldkitQuiz = { render: render }
})()
