const list = document.querySelector("#list");
const app = document.querySelector("#app");

//TODO:
// сделать возможность подгрузки и выгрузки элементов списка на страницу

const ajax = function (method, url, data, callback) {
  const request = new XMLHttpRequest();
  request.open(method, url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.responseType = "json";
  request.onreadystatechange = function () {
    if (request.readyState == 4 && request.status == 200) {
      callback(request.response);
    }
  };
  request.send(JSON.stringify(data));
};



//------------------------------------ Основная логика ----------------------------------------------------//
let limit = 100;          // <--- количество загружаемых записей
let start = 0;            // <--- начальная запись, с которой будут грузится остальные
let isFetching = false;   // <--- флаг чтобы не делать множество запросов
let DownBuffer = [];      // <--- для хранения след элеентов
let UpBuffer = [];        // <--- для хранения предыдущих элементов



// Обновление списка элементов на странице
function listUpdate(data, prepend = false) {
  const fragment = document.createDocumentFragment(); //

  data.forEach((element) => {
    const li = document.createElement("li");
    li.innerHTML = `<p> id:${element.TrackId}</p> <p>${element.Name}</p>`;
    fragment.appendChild(li);
  });

  if (prepend){
    list.insertBefore(fragment, list.firstChild); // вставка сверху
  } else {
    list.appendChild(fragment); // вставка снизу
  }

  // Ограниичение элементов до 100
  while (list.children.length > limit){
    if(!prepend){
      list.removeChild(list.firstChild) // удаление сначала при прокрутке вниз
    } else {
      list.removeChild(list.lastChild) // удаление с конца при прокрутке вверх
    }
  }
}



// Функция для загрузки данных
function loadData(newStart, callback) {
  if (isFetching) return; //
  isFetching = true; // 

  ajax("POST", "http://localhost:8081", { limit: limit, start: newStart }, (data) => {
     isFetching=false;
    callback(data.rows); 
  });
}



// Изначальная загрузка элементов и добавление в буфер следующих 100
function loadAndBuffer(){
  loadData(start, (data) => {
    // показываем первую порцию данных
    listUpdate(data); 
    start+=limit;
    
    // след порция данных в буфер
    loadData(start, (nextData) => {
      DownBuffer = nextData; //
    })

    // предыдущая порция данных в буфер
    if(start - 2 * limit >= 0){
      loadData(start - 2 * limit, (prevData) =>{
        UpBuffer = prevData;
      });
    }
  })
}



// Обработчик события скролла
const onScroll = () => {
  const scrollTop = list.scrollTop;
  const scrollHeight = list.scrollHeight;
  const offsetHeight = list.offsetHeight;



  // проверяем, если мы прокрутили вниз
  if (scrollTop + offsetHeight >= scrollHeight - 15 && !isFetching) {
      console.log('Конец списка');

      if(DownBuffer.length > 0){
        listUpdate(DownBuffer);
        UpBuffer = DownBuffer;

        start+=limit;
        loadData(start, (nextData) => {
          DownBuffer = nextData;
        });

        list.scrollTop = 250;
      }
  }



  // проверяем, если мы прокрутили вверх
  if (scrollTop <= 10 && !isFetching && UpBuffer.length > 0 && start > 0) {
    console.log('Начало списка');

    // чтобы избежать повторного отображения текущих данных
    const previousStart = start;
    start -= limit;

    loadData(start - limit, (prevData) => {
      // если предыдущие данные отличаются от текущих
      if (start !== previousStart) {
        listUpdate(prevData, true); 
      }

      UpBuffer = prevData;

      // загрузка следующий данных для буфера вниз
      loadData(start + limit, (nextData) => {
        DownBuffer = nextData;
      });
    }); 

    list.scrollTop = list.scrollHeight - 1050;
  }
};



list.addEventListener('scroll', onScroll);
loadAndBuffer()

//---------------------------------------------------------------------------------------------------------//
