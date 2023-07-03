
window.onload = () => {

  let note = document.querySelectorAll("#note")
  let noteTitle = document.querySelectorAll("#note h1")
  let noteContent = document.querySelectorAll("#note p")
  let updateForm = document.getElementById("update-form")
  let updateFormInput = document.querySelector("#update-form input")
  let updateFormTextarea = document.querySelector("#update-form textarea")
  let updateFormBtn = document.querySelector("#update-form button")
  let main = document.getElementById("main")
  let updateBtn = document.getElementById("updateBtn")
  let deleteBtn = document.querySelectorAll("#deleteBtn")

  for (let i = 0; i < note.length; i++) {
    noteTitle[i].addEventListener("click", function () {
      updateForm.classList.remove("hidden")
      main.classList.add("blur")

      let noteTitleText = noteTitle[i].innerHTML
      let noteContentText = noteContent[i].innerHTML

      updateFormInput.value = noteTitleText
      updateFormTextarea.value = noteContentText
      updateFormBtn.value = noteTitleText
    })

  }


  updateBtn.addEventListener("click", function () {
    updateForm.classList.add("hidden")
    main.classList.remove("blur")
  })
}


