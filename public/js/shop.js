const productTemplate = document.querySelector('#product-template')
const productsGrid = document.querySelector('.products-grid')
let uniqueCategories

class Categories{
    

    constructor(completeProductsList){
        this.categoriesRibbon = document.getElementById('products-categories-ribbon')
        this.allProducts = completeProductsList

        //get a list of all unique product categories
        this.allCategories = [...new Set(completeProductsList.map(prod => {
            return prod.category
        }))]
        //add 'universal category' to the list
        this.addAllCategoriesBtn()
        
    }
    

    addAllCategoriesBtn(){
        this.allCategories.unshift('All Categories')
        console.log(this.allCategories);
    }
    renderAllCategoriesToView(){
        this.allCategories.forEach(category => {
            const link = document.createElement('li')
            link.textContent = category
            link.dataset.category = category
          
            this.categoriesRibbon.appendChild(link)
        })
        this.displayProductsByCategory()
    }

    displayProductsByCategory(){
        this.categoriesRibbon.addEventListener('click', (e)=>{ //must be arrow!

            //delete all first
            if(e.target !== e.currentTarget){
                productsGrid.querySelectorAll('.product-card').forEach(child => child.remove())
            }
            
            const targetCategory = e.target.dataset.category

            //egde case - display ALL PRODUCTS
            if(targetCategory === "All Categories"){
               renderProducts(this.allProducts)
            }
            //display only products in selected category
            else{
                renderProducts(this.allProducts.filter(prod =>{
                    return prod.category === targetCategory
                }))

            }
            
            
            
        })
       
    }
    
}





//get products from json database
async function getProducts(){
    const fetchProducts = await fetch('http://localhost:5000/display-products')
    const products = await fetchProducts.json()

    console.log(products); 
    //set them in session storage for use with individual subpages   
    sessionStorage.setItem('products-list', JSON.stringify(products))

    renderProducts(products)

    //instantiate class for categories rendering - assign to global variable
    uniqueCategories = new Categories(products)
    uniqueCategories.renderAllCategoriesToView()
    console.log(uniqueCategories);
}
getProducts()




function renderProducts(products){
    products.forEach(product => {
        // get template
        const template = productTemplate.content.cloneNode(true)
        
        //give the id to card product
        template.querySelector('.product-card').dataset.id = `${product.id}`
        template.querySelector('.product-card').dataset.name = `${product.name}`
        template.querySelector('.product-card').dataset.priceInCents = `${product.priceInCents}`
        template.querySelector('.product-card').dataset.image = `${product.image}`
        
        //fill all data
        template.querySelector('img').setAttribute('src', `./img/img-large/${product.image}`)
        template.querySelector('img').setAttribute('alt', `${product.name}`)
        template.querySelector('.product-name').innerText = `${product.name}`
        template.querySelector('.product-category').innerText = `${product.category}`
        template.querySelector('.product-description').innerText = `${product.description}`
        template.querySelector('.product-price').innerText =  currencyFormatter.format(product.priceInCents / 100)
        
        

        //add product to all products
        productsGrid.appendChild(template)

    });
}



//open individual product page:
document.addEventListener('click', (e)=>{
    if(     
        e.target.classList.contains('product-card')
        ||
        e.target.closest('.product-card')?.classList.contains('product-card') 
        && 
        !e.target.classList.contains('product-add-to-cart-btn')
    ){
        const prodId = e.target.closest('.product-card').dataset.id
        
        openNewProductPage(prodId)
    }
    
})

async function openNewProductPage(prodId){
    const response = await fetch(`http://localhost:5000/display-products/:${prodId}`)
    console.log(response);
    
    window.location.href = response.url
    sessionStorage.setItem('current-product-id', prodId)
}