const $ = require('jquery');
const select2 = require('select2');
const DatePickers = require ('./datepickers');
const Chart = require ('./chart');

const infoInit = (function () {
  const IDAPP = '31a1a9b4674714612d2e3008f28a6a3a';
  const oneCity = {name: [],date: [],temp: []};
  const infoWeather = {
    temp:{
      tempDay: 7,
      tempDate: [], //список дат
      tempCityArr: [], //список городов
      tempArr: [], //список температур
    },
    pressure:{
      tempDay: 7,
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    humidity:{
      tempDay: 7,
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
    wind:{
      tempDay: 7,
      tempDate: [], 
      tempCityArr: [], 
      tempArr: [], 
    },
  };

  //выбор городов
  const selectInfo = (select, arr) => {
    //предзагрузка
    arr.tempCityArr.push($(`.${select}`).select2('val'));
    updateCity(arr.tempCityArr, arr, select);
    //выбор
    $(`.${select}`).change(function (e) { 
      arr.tempCityArr = [];
      arr.tempArr = [];
      arr.tempCityArr.push($(`.${select}`).select2('val'));
      updateCity(arr.tempCityArr, arr, select);
    });

  };

  //обновление данных городов
  const updateCity = (arrCity, arr, grafType) => {
    arr.tempArr = [];
    let newArr = arrCity[0];

    newArr.forEach((item, i) => {
      sendCity(item, arr, grafType, arr.tempDay);
    });
    
    let chartInfo = new Chart();
    chartInfo.changeChart(arr, grafType);
  };

  //Добавление в список
  const updateList = (name, temp, arr) => {
    arr.tempArr.push([...name, ...temp]);
  };

  //Обнулить массив
  const arrClear = () => {
    oneCity.name=[];
    oneCity.date=[];
    oneCity.temp=[];
  };

  //остаток итераций до нового дня
  const countTime = (time) => {
    switch (time) {
    case '00:00:':
      return 8;
      break;
    case '03:00':
      return 7;
      break;
    case '06:00':
      return 6;
      break;
    case '09:00':
      return 5;
      break;
    case '12:00':
      return 4;
      break;
    case '15:00':
      return 3;
      break;
    case '18:00':
      return 2;
      break;
    case '21:00':
      return 1;
      break;
    default:
      return 0;
      break;
    }
  };

  // Расчет даты при условии остатка часов до нового дня
  const countTimeNewDay = (day) => {
    let currentTime = oneCity.date[0].substring(11, 16), count = countTime(currentTime);
    return day * 8 + count;
  };

  // Точное кол-во дней
  const dateRange = (name, day) => {
    (day > 0) ? typeWeatherDate(name, countTimeNewDay(day)) : typeWeatherDate(name, 5);
  }; 

  // Обновление данных - дата
  const updateInfo = (select, arr) => {
    updateCity(arr.tempCityArr, arr, select);  
  };

  //Поиск города
  const sendCity = (city='Moscow', arr, info, cnt='7') => {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${IDAPP}&cnt=${cnt}`)
      .then((res) => res.json())
      .then((data) => {
        arrClear();
        oneCity.name.push(city);
        data.list.forEach(function(item){ 
          oneCity.date.push(item.dt_txt.substring(0, 16));
          typeWeatherItem(item, info);
        });
        updateList(oneCity.name, oneCity.temp, arr);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Дата start
  const startDateInput = () => {
    let start = document.querySelectorAll('.weather__date-start'), date = new Date();
    for (const item of start) {
      item.value  = date.toLocaleDateString();
    }
  };

  // Тип данных - погода
  const typeWeatherItem = (item, name) => {
    switch (name) {
    case 'temp':
      oneCity.temp.push(item.main.temp); 
      break;
    case 'pressure':
      oneCity.temp.push(item.main.pressure); 
      break;
    case 'humidity':
      oneCity.temp.push(item.main.humidity); 
      break;
    case 'wind':
      oneCity.temp.push(item.wind.speed); 
      break;
    }
  };

  // Тип данных - дата
  const typeWeatherDate = (name, day) => {
    switch (name) {
    case 'temp':
      infoWeather.temp.tempDay = day; 
      updateInfo('temp', infoWeather.temp);
      break;
    case 'pressure':
      infoWeather.pressure.tempDay = day; 
      updateInfo('pressure', infoWeather.pressure);
      break;
    case 'humidity':
      infoWeather.humidity.tempDay = day; 
      updateInfo('humidity', infoWeather.humidity);
      break;
    case 'wind':
      infoWeather.wind.tempDay = day; 
      updateInfo('wind', infoWeather.wind);
      break;
    }
  };

  // создание графика
  const arrCitys = (item) => {
    let arrC = [];
    arrC.push(['x', ...oneCity.date]);
    item.forEach(function(element, i, arr){
      arrC.push(element);
    });
    return arrC ;
  };

  return {
    init: () => {
      $('select').select2($('select').val('Moscow'));
      selectInfo('temp', infoWeather.temp);
      selectInfo('pressure', infoWeather.pressure);
      selectInfo('humidity', infoWeather.humidity);
      selectInfo('wind', infoWeather.wind);
      startDateInput();

      const picker = new DatePickers();
      picker.start(document.querySelector('.date-temp .weather__date-end'));
      picker.start(document.querySelector('.date-pressure .weather__date-end'));
      picker.start(document.querySelector('.date-humidity .weather__date-end'));
      picker.start(document.querySelector('.date-wind .weather__date-end'));
    },
    dateRange: dateRange,
    arrCitys: arrCitys,
  };

}());

module.exports = infoInit;