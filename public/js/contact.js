const txtArea = document.getElementById('customer-message-textarea')
const contactForm = document.getElementById('customer-message-form')
const rem = document.querySelector('.customer-message-chars-left span')



const MAX_CHARS = 250

txtArea.addEventListener('input', function(e){
    const currentText = txtArea.value
  const currentTxtLength = txtArea.value.length
  const remaining = MAX_CHARS - currentTxtLength
  
  if(currentTxtLength >= MAX_CHARS){
     const finalText = currentText.substring(0, 249)
     txtArea.value = finalText
     rem.textContent = 0
     return
      
  }
  rem.textContent = remaining

  const color = remaining < MAX_CHARS * 0.1 ? 'red' : null  //if not less than 10% of max, fallback to default
  
    rem.parentElement.style.color = color
    
})

contactForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    
    
    const newQuestion = {
        isImportant: false,
        text: contactForm.querySelector('textarea').value,
        email: contactForm.querySelector('input').value,
        date: new Date().toUTCString()
    }

    sendCustomerQuestionToServer(newQuestion)
    

    contactForm.querySelector('textarea').value = null
    contactForm.querySelector('input').value = null
    
})

async function sendCustomerQuestionToServer(newQuestion){
    const sendQuestionData = await fetch('http://localhost:5000/new-customer-question', {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newQuestion),
          })
        const responseFromServer = await sendQuestionData.json()
        console.log(responseFromServer);

}