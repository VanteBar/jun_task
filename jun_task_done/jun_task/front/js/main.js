// 1
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
let limit = 100;    // <--- Количество загружаемых записей
let start = 0;      // <--- Начальная запись, с которой будут грузится остальные
let end = false; // фдаг чтобы не прогружалось лишнее
let isFetching = false; // флаг чтобы не делать множество запросов

// 2)
function listUpdate(data, append = true) {
  const fragment = document.createDocumentFragment(); //

  data.rows.forEach((element) => {
    const li = document.createElement("li");
    li.innerHTML = `<p> id:${element.TrackId}</p> <p>${element.Name}</p>`;
    fragment.appendChild(li);
  });

  if (append){
    list.appendChild(fragment); //
  } else {
    list.insertBefore(fragment, list.firstChild); //
  }

  // Ограниичение элементов до 100
  while (list.children.length > limit){
    if(append){
      list.removeChild(list.firstChild) // удаление сначала при прокрутке вниз
    } else {
      list.removeChild(list.lastChild) // удаление с конца при прокрутке вверх
    }
  }
}

// Функция для загрузки данных
function loadData(newStart, append = true) {
  if (isFetching || end) return; //
  isFetching = true; // 

  ajax("POST", "http://localhost:8081", { limit: limit, start: newStart }, (data) => { 
    if (data.rows.length < limit){
      end = true; // если данных меньше лимита
    }
    const prevHeight = list.scrollHeight;
    listUpdate(data, append);

    if(append){
      if(start === 0) {
        list.scrollTop = 0; 
      } else{
        // после того как прокрутили вниз, скролл идет наверх
        list.scrollTop = list.scrollHeight - list.clientHeight;
      }
    } else {
      // сколл идет вниз
      //const prevHeight = list.scrollHeight;
      list.scrollTop+=list.scrollHeight - prevHeight;
    }

    start = newStart;
    isFetching = false;

  });
}


// Обработчик события скролла
const onScroll = () => {
  const scrollTop = list.scrollTop;
  const scrollHeight = list.scrollHeight;
  const offsetHeight = list.offsetHeight;

  // проверяем, если мы прокрутили вниз
  if (scrollTop + offsetHeight >= scrollHeight - 15 && !isFetching) {
      console.log('Конец списка');
      loadData(start + limit, true);     // загружаем новые данные
  }

  //
  if (scrollTop <= 15 && !isFetching && start > 0) {
    console.log('Начало списка');
    loadData(start - limit, false);  
    console.log('start - limit = ', start - limit);
}

};

// Добавляем обработчик события скролла
list.addEventListener('scroll', onScroll);

//
loadData(start);
//---------------------------------------------------------------------------------------------------------//

//ajax("POST", "http://localhost:8081", { limit: limit, start: start }, listUpdate);
