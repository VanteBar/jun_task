// 1
const list = document.querySelector("#list");

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


function listUpdate(data) {
  data.rows.forEach((element) => {
      const li = "<li>" + "<p> id:" + element.TrackId + "</p> <p>" + element.Name + "</p></li>";
      list.innerHTML += li;
  });
}

// Функция для загрузки данных
function loadData() {
  ajax("POST", "http://localhost:8081", { limit: limit, start: start }, listUpdate);
}


// Обработчик события скролла
const onScroll = () => {
  const scrollTop = list.scrollTop;
  const scrollHeight = list.scrollHeight;
  const offsetHeight = list.offsetHeight;

  // Проверяем, если мы прокрутили вниз
  if (scrollTop + offsetHeight >= scrollHeight - 10) {
      console.log('Конец списка');
      start += limit; // Увеличиваем начальную запись
      loadData();     // Загружаем новые данные
  }
};

// Добавляем обработчик события скролла
list.addEventListener('scroll', onScroll);
//---------------------------------------------------------------------------------------------------------//

ajax("POST", "http://localhost:8081", { limit: limit, start: start }, listUpdate);
