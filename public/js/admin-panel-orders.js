let allOrders = []
let filteredOrders = []

const singleOrderTemplate = document.getElementById('db-order-template')
const allOrdersList = document.getElementById('db-all-orders')
const searchField = document.getElementById('search-field')
const root = document.documentElement

//currency formatter
const currencyFormatter = new Intl.NumberFormat(undefined, {style: "currency", currency: "USD"})

async function updateOrderStatusInDB(itemData){
    const csrfToken = document.querySelector('[name=_csrf]').value
    try {
        const sendData = await fetch('http://localhost:5000/update-order-status', {
            method: 'POST', 
            headers: {
                'X-CSRF-Token': csrfToken,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData) 
          
            
          })
        const responseFromServer = await sendData.json()
        console.log(responseFromServer);
        
    } catch (error) {
        console.log(error);
    }
}

async function getProducts(){

    const fetchProducts = await fetch('http://localhost:5000/getorders')
    const orders = await fetchProducts.json()

    console.log(orders);
    allOrders = orders
    
    //immidiately parse strigified object from db:
    allOrders.forEach(element => {
        element.orderData = JSON.parse(element.orderData)
        
    });
    sortAllOrdersBy()
    renderAllOrders()
}
getProducts()



function clearOrdersFromView(){
    const allRenderedOrders = document.querySelectorAll('.db-single-order')
    allRenderedOrders.forEach((order)=>{
        order.remove()
    })
}

function sortAllOrdersBy(sortQuery = 'date'){
    if (sortQuery === 'date') {
        allOrders.sort((a, b) => b.id - a.id)
    }
    if (sortQuery === 'value') {
        allOrders.sort((a, b) => (b.orderData.totalToPay).toString().localeCompare((a.orderData.totalToPay.toString())))
    }
    if (sortQuery === 'id') {
        allOrders.sort((a, b) => (b.orderData.orderId).toString().localeCompare((a.orderData.orderId.toString())))
    }
    if (sortQuery === 'surname') {
        allOrders.sort((a, b) => a.orderData.surname.localeCompare(b.orderData.surname))
    }
    if (sortQuery === 'sent') {
        filteredOrders = allOrders.filter(order => order.orderData.sent === true)
    }
    if (sortQuery === 'unsent') {
        filteredOrders = allOrders.filter(order => order.orderData.sent === false)
    }

}

function renderAllOrders(orders = allOrders){

    orders.forEach((item,index) => {
        const template = singleOrderTemplate.content.cloneNode(true)
        const checkbox = template.querySelector('.checkbox')
        checkbox.dataset.itemIndex = index
        
        //order already shipped?
        if(item.orderData.sent === true){
            checkbox.classList.add('vis')
            checkbox.dataset.sent = 'true'
        }
               
        template.querySelector('.db-order-surname').textContent = item.orderData.surname
        template.querySelector('.db-order-value').textContent =  currencyFormatter.format(item.orderData.totalToPay / 100)
        template.querySelector('.db-order-date').textContent = item.orderData.orderDate
        template.querySelector('.db-order-more-info-btn').dataset.orderDetails = JSON.stringify(item)
        allOrdersList.appendChild(template)
    })
    
}



//admin actions:
document.addEventListener('click', (e)=>{
    //sent-checkbox clicked
    if(e.target.classList.contains('checkbox')){
        const checkbox = e.target
        const index = checkbox.dataset.itemIndex

        console.log(allOrders[index]);
        if(checkbox.dataset.sent === 'false'){
            checkbox.dataset.sent = 'true'
            checkbox.classList.add('vis')
            allOrders[index].orderData.sent = true
            console.log('sent');
        }
        else if(checkbox.dataset.sent === 'true'){
            checkbox.dataset.sent = 'false'
            checkbox.classList.remove('vis')
            allOrders[index].orderData.sent = false
            console.log('notsent');
        }
        //update the db!
        updateOrderStatusInDB(allOrders[index])
    }

    //sort selection
    if(e.target.classList.contains('sort-selection')){

        clearOrdersFromView()
        const option = e.target.dataset.sortType
        console.log(option);
        if (option === 'surname') {
            sortAllOrdersBy('surname')
        }
        if (option === 'id') {
            sortAllOrdersBy('id')
            
        }
        if (option === 'value') {
            sortAllOrdersBy('value')
            
        }
        if (option === 'date') {
            sortAllOrdersBy('date')
            
        }
        if (option === 'sent') {
            sortAllOrdersBy('sent')
            renderAllOrders(filteredOrders)
            return
        }
        if (option === 'unsent') {
            sortAllOrdersBy('unsent')
            renderAllOrders(filteredOrders)
            
            return
        }
        renderAllOrders()
    }


     //more -info button logic - open details card
     if(e.target.classList.contains('db-order-more-info-btn')){
         const singleOrderData = JSON.parse(e.target.dataset.orderDetails)
         // console.log(singleOrderData);
         displaySingleOrderDetails(singleOrderData)
        }
    //close detailed order card
    if(e.target.classList.contains('single-order-window-container')){
         e.target.remove()
       
    }
})

function displaySingleOrderDetails(orderData){
    const singleOrderTemplate = document.getElementById('single-order-details-template').content.cloneNode(true)    
    const itemsTable = singleOrderTemplate.querySelector('.soic-items-table')
    //populate fields with data
    singleOrderTemplate.querySelector('.soic-order-id').textContent = '# ' + orderData.orderData.orderId
    singleOrderTemplate.querySelector('.soic-order-status').textContent = orderData.orderData.sent ? "SENT" : "NOT YET SENT"
    singleOrderTemplate.querySelector('.soic-address').children[0].textContent = `${orderData.orderData.name} ${orderData.orderData.surname}`
    singleOrderTemplate.querySelector('.soic-address').children[1].textContent = `${orderData.orderData.street} ${orderData.orderData.houseNumber}`
    singleOrderTemplate.querySelector('.soic-address').children[2].textContent = `${orderData.orderData.postalCode} ${orderData.orderData.city}`
    singleOrderTemplate.querySelector('.soic-date').textContent = orderData.orderData.orderDate
    singleOrderTemplate.querySelector('.soic-email').textContent = orderData.orderData.email
    singleOrderTemplate.querySelector('.soic-email').setAttribute('href', `mailto:${orderData.orderData.email}`)  
    singleOrderTemplate.getElementById('total-order-value-span').textContent =   currencyFormatter.format(orderData.orderData.totalToPay / 100)
    
    //populate list of ordered items
    const allOrderedItems = orderData.orderData.orderedItems    
    allOrderedItems.forEach(item => {
        const singleOrderedItemRow = document.getElementById('soic-single-ordered-item-row').content.cloneNode(true)
        singleOrderedItemRow.querySelector('.soic-name').textContent = item.name
        singleOrderedItemRow.querySelector('.soic-quantity').textContent = 'x ' + item.quantity
        singleOrderedItemRow.querySelector('.soic-price').textContent = currencyFormatter.format(item.price / 100)
        
        itemsTable.appendChild(singleOrderedItemRow)
    })

    document.body.appendChild(singleOrderTemplate)
}







//search field logic
searchField.addEventListener('input', (e)=>{    
    filterResultsBySurname()
})

function filterResultsBySurname(){
    const searchQuery = searchField.value.toLowerCase()
    console.log(searchQuery);

    filteredOrders = allOrders.filter(order => {
        if(order.orderData.surname.toLowerCase().indexOf(searchQuery) != -1){
            return order
        }
         
    })
    clearOrdersFromView()
    //render by filtered only!
    renderAllOrders(filteredOrders)
}