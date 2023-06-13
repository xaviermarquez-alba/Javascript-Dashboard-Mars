const { Map, List } = Immutable
const API_GET_ROVER_DATA_URL = 'http://127.0.0.1:3000/rovers/'
let store = Map({
    apod: '',
    rovers: List([
        { name: 'Curiosity', src: './assets/images/curiosity.jpeg' },
        {
            name: 'Opportunity',
            src: './assets/images/opportunity.jpeg',
        },
        { name: 'Spirit', src: './assets/images/spirit.jpeg' },
    ]),
    roverSelected: '',
    roverData: '',
    error: '',
})

const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}

const fetchRoverData = (state, roverName) => {
    document.getElementById('loader').classList.remove('hidden')
    document.getElementById('home-image').classList.add('hidden')

    if (state.get('roverSelected') !== roverName) getRoverData(state, roverName)
}

const cleanState = () => {
    updateStore(store, {
        roverSelected: '',
        roverData: List([]),
    })
}

const PageConstructor = (state) => {
    return HomePageHeader(state) + HomePageMain(state)
}

const App = (state) => {
    //const rover_icon = document.querySelector('#root')
    //rover_icon.addEventListener('click', headerButtonsHandler)
    return PageConstructor(state)
}

window.addEventListener('load', () => {
    render(root, store)
})

const handleClick = (event) => {
    const imageName = event.target.dataset.name
    fetchRoverData(store, imageName)
}

const openModal = (name, url) => {
    document.getElementById('loader').classList.add('hidden')
    document.getElementById('home-image').classList.remove('hidden')

    const modalContent = Modal(store)

    const modalContainer = document.createElement('div')
    modalContainer.classList.add('modal-container')
    modalContainer.innerHTML = modalContent

    const modal = modalContainer.querySelector('.image-modal-popup')
    const modalTitle = modal.querySelector('h1')

    modalTitle.textContent = name

    document.body.appendChild(modalContainer)

    const closeButton = modal.querySelector('span')
    closeButton.addEventListener('click', closeModal)

    function closeModal() {
        cleanState()
        document.body.removeChild(modalContainer)
        closeButton.removeEventListener('click', closeModal)
    }
}

// ------------------------------------------------------  COMPONENTS

const Loader = () => {
    return `
    <div id="loader" class="loader hidden"></div>
    `
}
const GridColumns = (item) => {
    return `
      <a onclick="handleClick(event)" data-name="${item.name}">${item.name}</a>
  `
}

const TableInfo = (item) => {
    return `
    <table class="info-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Camera</th>
      <th>Earth Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${item.id}</td>
      <td>${item.camera.full_name}</td>
      <td>${item.earth_date}</td>
    </tr>
  </tbody>
</table>`
}

const GaleryItem = (item) => {
    return `
      ${TableInfo(item)}
      <img src="${item.img_src}" alt="${item.earth_date}">
  `
}
const Modal = (state) => {
    return `
    <div class="image-modal-popup">
        <div class="wrapper">
            <span>&times;</span>
            <div class="description">
                <h1></h1>
                     <div class="galery">
                        ${state.roverData.map(GaleryItem).join('')}
                    </div>    
            </div>
        </div>
    </div>
  `
}

const HomePageHeader = (state) => {
    const rovers = state.get('rovers')
    return `
        <header class="header">
            <div class="header-logo">
                <img src="./assets/images/nasa-logo.png" alt="mars dashboard" class="logo">
            </div>
            <nav class="header-nav">
                    ${rovers.map(GridColumns).join('')}
            </nav>
        </header>
    `
}

const HomeImage = () => {
    return `
    <div class="home-image" id="home-image">
        <img id="logo" src="assets/images/index.jpg" alt="NASA Logo">
        <h1>Welcome to Mars Rover Gallery</h1>
    </div>
    `
}

const HomePageMain = (state) =>
    `

    <main>
    ${HomeImage()}
    ${Loader()}
    </main>
    <footer></footer>
    `

// ------------------------------------------------------  API CALLS

const getRoverData = (state, roverName) => {
    fetch(`${API_GET_ROVER_DATA_URL}${roverName}`)
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            }
            throw new Error('Something went wrong on api server!')
        })
        .then((response) => {
            const newState = {
                roverSelected: roverName,
                roverData: response.photos,
            }
            updateStore(store, newState)
            openModal(roverName, newState)
        })
        .catch((error) => console.log(error))
}
